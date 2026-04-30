import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import Interaction from "@/lib/models/Interaction";
import axios from "axios";
import { analyzeInteraction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();

    const credential = await MetaCredential.findOne({ tenantId });
    
    // 1. Validate Connection - DIRECTLY from MongoDB (with fallback for legacy)
    if (!credential || !credential.facebookConnected) {
      // Fallback: Check if we have pages and a selection from the old system
      if (credential && credential.pages?.length && credential.selectedPageId) {
        const legacyPage = credential.pages.find((p: any) => p.id === credential.selectedPageId);
        if (legacyPage) {
          credential.facebookPageId = legacyPage.id;
          credential.facebookPageName = legacyPage.name;
          credential.facebookPageToken = legacyPage.accessToken;
          credential.facebookConnected = true;
          await credential.save();
        }
      }
    }

    if (!credential || !credential.facebookConnected || !credential.facebookPageToken) {
      return NextResponse.json({ 
        error: "Facebook Page not connected. Please reconnect." 
      }, { status: 400 });
    }

    const pageId = credential.facebookPageId;
    const pageToken = credential.facebookPageToken;

    console.log("SYNC START for Page ID:", pageId);
    console.log("Using Saved Page Token:", pageToken.substring(0, 10) + "...");

    // 2. Fetch Data from Facebook using saved PAGE_ACCESS_TOKEN
    let allInteractions: any[] = [];
    
    try {
      // Fetch Posts instead of Feed
      const feedRes = await axios.get(`https://graph.facebook.com/v20.0/${pageId}/posts`, {
        params: {
          access_token: pageToken,
          fields: "id,message,created_time,permalink_url,from,comments{id,message,created_time,from}"
        }
      });
      console.log("feedResponse received");
      allInteractions.push(...(feedRes.data.data || []));

      // Fetch Ratings/Reviews
      const ratingsRes = await axios.get(`https://graph.facebook.com/v20.0/${pageId}/ratings`, {
        params: {
          access_token: pageToken,
          fields: "open_graph_story,rating,review_text,created_time,reviewer"
        }
      });
      console.log("ratingsResponse received");
      allInteractions.push(...(ratingsRes.data.data || []).map((r: any) => ({
        id: r.open_graph_story?.id || `rating_${r.created_time}`,
        message: r.review_text,
        created_time: r.created_time,
        from: r.reviewer,
        isReview: true,
        rating: r.rating
      })));

    } catch (error: any) {
      const metaError = error.response?.data?.error?.message || error.message;
      console.error("Meta API Error:", metaError);
      return NextResponse.json({ 
        error: `Facebook Error: ${metaError}. Please try reconnecting.`,
        status: "Error"
      }, { status: 401 });
    }

    if (allInteractions.length === 0) {
      return NextResponse.json({ 
        success: true,
        fbFound: 0,
        status: "Facebook connected successfully, but no posts found."
      });
    }

    // 3. Process and Save
    let savedCount = 0;
    for (const item of allInteractions) {
      const externalId = item.id;
      const existing = await Interaction.findOne({ externalId });
      
      if (!existing) {
        const text = item.message || item.review_text || (item.isReview ? "Review without text" : "[Post]");
        const aiResult = await analyzeInteraction(text, "facebook", "Friendly");
        
        await Interaction.create({
          tenantId,
          brandId: credential.brandId,
          platform: "facebook",
          pageId: pageId,
          externalId: externalId,
          customer: { 
            name: item.from?.name || item.reviewer?.name || "FB User",
            username: item.from?.id || item.reviewer?.id 
          },
          content: { 
            text: text, 
            mediaType: "text",
            permalink: item.permalink_url,
            rating: item.rating
          },
          createdAt: new Date(item.created_time),
          isPost: !item.isReview,
          aiMetadata: {
            sentimentLabel: aiResult.sentiment,
            urgencyScore: aiResult.urgency,
            issueCategory: aiResult.category,
          },
          replies: { aiSuggested: aiResult.suggestedReply }
        });
        savedCount++;
      }
    }

    credential.lastSyncAt = new Date();
    await credential.save();

    return NextResponse.json({ 
      success: true, 
      fbFound: allInteractions.length,
      saved: savedCount,
      status: "Success",
      pageName: credential.facebookPageName
    });

  } catch (error: any) {
    console.error("Global Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
