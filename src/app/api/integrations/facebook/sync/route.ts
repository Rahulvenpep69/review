import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import Interaction from "@/lib/models/Interaction";
import { fetchFacebookComments, fetchInstagramComments } from "@/lib/integrations/facebook";
import { analyzeInteraction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();

    const credential = await MetaCredential.findOne({ tenantId });
    if (!credential || !credential.selectedPageId) {
      return NextResponse.json({ error: "Meta not fully configured" }, { status: 400 });
    }

    const selectedPage = credential.pages.find((p: any) => p.id === credential.selectedPageId);
    if (!selectedPage) return NextResponse.json({ error: "Selected page not found" }, { status: 404 });

    const allNormalizedInteractions: any[] = [];
    let fbError = null;
    let igError = null;

    // 1. Fetch Facebook Posts and Comments
    try {
      // fetchFacebookComments now returns an expanded list including the posts themselves
      const fbData = await fetchFacebookComments(selectedPage.id, selectedPage.accessToken);
      allNormalizedInteractions.push(...fbData.map((item: any) => ({
        platform: "facebook",
        externalId: item.id,
        customer: { name: item.from?.name || "FB User" },
        content: { 
          text: item.message || "[Media Post]", 
          mediaType: "text" as const,
          permalink: item.permalink_url 
        },
        createdAt: item.created_time
      })));
    } catch (e: any) {
      fbError = e.response?.data?.error?.message || e.message;
      console.error("FB Sync Partial Failure:", fbError);
    }

    // 2. Fetch Instagram Media and Comments
    if (credential.selectedInstagramId) {
      try {
        const igData = await fetchInstagramComments(credential.selectedInstagramId, selectedPage.accessToken);
        allNormalizedInteractions.push(...igData.map((item: any) => ({
          platform: "instagram",
          externalId: item.id,
          customer: { name: item.username || "IG User" },
          content: { 
            text: item.text || item.caption || "[Instagram Post]", 
            mediaType: "text" as const,
            permalink: item.permalink 
          },
          createdAt: item.timestamp
        })));
      } catch (e: any) {
        igError = e.response?.data?.error?.message || e.message;
        console.error("IG Sync Partial Failure:", igError);
      }
    }

    // 3. Process and Save
    let savedCount = 0;
    for (const item of allNormalizedInteractions) {
      const existing = await Interaction.findOne({ externalId: item.externalId });
      if (!existing) {
        const aiResult = await analyzeInteraction(item.content.text, item.platform as any, "Friendly");
        const newInteraction = new Interaction({
          ...item,
          tenantId,
          brandId: credential.brandId,
          locationId: "meta_default",
          aiMetadata: {
            sentimentScore: aiResult.sentiment === "positive" ? 90 : aiResult.sentiment === "negative" ? 15 : 50,
            sentimentLabel: aiResult.sentiment,
            urgencyScore: aiResult.urgency,
            intent: aiResult.intent,
            issueCategory: aiResult.category,
            riskFlag: aiResult.riskFlag
          },
          workflow: { approvalStatus: "pending", postedStatus: "pending" },
          replies: { aiSuggested: aiResult.suggestedReply }
        });
        await newInteraction.save();
        savedCount++;
      }
    }

    credential.lastSyncAt = new Date();
    await credential.save();

    return NextResponse.json({ 
      success: true, 
      count: allNormalizedInteractions.length,
      saved: savedCount,
      fbStatus: fbError ? `Error: ${fbError}` : "Success",
      igStatus: igError ? `Error: ${igError}` : "Success"
    });

  } catch (error: any) {
    const metaError = error.response?.data?.error?.message || error.message;
    console.error("Meta Sync Critical Error:", metaError);
    return NextResponse.json({ error: metaError }, { status: 500 });
  }
}
