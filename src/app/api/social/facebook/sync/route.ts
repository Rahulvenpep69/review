import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import Interaction from "@/lib/models/Interaction";
import { fetchFacebookComments } from "@/lib/integrations/facebook";
import { analyzeInteraction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();

    const credential = await MetaCredential.findOne({ tenantId });
    
    // 1. Check Configuration
    if (!credential || !credential.facebookPageToken || !credential.facebookPageId) {
      return NextResponse.json({ 
        error: "No Facebook Pages found. Ensure the connected account is a Page admin and pages_show_list permission is granted." 
      }, { status: 400 });
    }

    const pageId = credential.facebookPageId;
    const pageToken = credential.facebookPageToken;

    console.log("SYNC START for Page ID:", pageId);

    // 2. Fetch Page Feed/Posts using PAGE_ACCESS_TOKEN
    let fbData = [];
    try {
      fbData = await fetchFacebookComments(pageId, pageToken);
    } catch (error: any) {
      console.error("Fetch Error:", error.response?.data || error.message);
      return NextResponse.json({ 
        error: "Missing pages_read_engagement or Page token invalid.",
        status: "Error",
        fbFound: 0
      }, { status: 500 });
    }

    // 3. Process and Save
    let savedCount = 0;
    for (const item of fbData) {
      const existing = await Interaction.findOne({ externalId: item.id });
      if (!existing) {
        const aiResult = await analyzeInteraction(item.message || "[Post]", "facebook", "Friendly");
        await Interaction.create({
          tenantId,
          brandId: credential.brandId,
          platform: "facebook",
          pageId: pageId,
          externalId: item.id,
          customer: { name: item.from?.name || "FB User" },
          content: { 
            text: item.message || "[Post]", 
            mediaType: "text",
            permalink: item.permalink_url 
          },
          createdAt: item.created_time,
          isPost: item.isPost || false,
          parentId: item.parentId,
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
      fbFound: fbData.length,
      saved: savedCount,
      status: "Success",
      pageName: credential.facebookPageName
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
