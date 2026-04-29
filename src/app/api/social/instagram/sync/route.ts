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
    
    if (!credential || !credential.facebookUserToken || !credential.selectedInstagramId) {
      return NextResponse.json({ 
        error: "Instagram Account not linked. Please select an account in Settings." 
      }, { status: 400 });
    }

    const instagramId = credential.selectedInstagramId;
    const userToken = credential.facebookUserToken;

    console.log("SYNC START for Instagram ID:", instagramId);

    // 1. Fetch Instagram Media & Comments
    let igData = [];
    try {
      const mediaRes = await axios.get(`https://graph.facebook.com/v20.0/${instagramId}/media`, {
        params: {
          access_token: userToken,
          fields: "id,caption,media_type,media_url,permalink,timestamp,comments{id,text,timestamp,from}"
        }
      });
      igData = mediaRes.data.data || [];
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      return NextResponse.json({ error: `Instagram Error: ${msg}` }, { status: 401 });
    }

    // 2. Process and Save
    let savedCount = 0;
    for (const item of igData) {
      const existing = await Interaction.findOne({ externalId: item.id });
      if (!existing) {
        const text = item.caption || "[Media]";
        const aiResult = await analyzeInteraction(text, "instagram", "Friendly");
        
        await Interaction.create({
          tenantId,
          brandId: credential.brandId,
          platform: "instagram",
          pageId: instagramId,
          externalId: item.id,
          customer: { name: "IG User" },
          content: { 
            text: text, 
            mediaType: item.media_type.toLowerCase(),
            mediaUrl: item.media_url,
            permalink: item.permalink 
          },
          createdAt: new Date(item.timestamp),
          isPost: true,
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

    return NextResponse.json({ 
      success: true, 
      igFound: igData.length,
      saved: savedCount,
      status: "Success"
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
