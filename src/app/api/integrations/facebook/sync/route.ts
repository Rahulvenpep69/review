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

    // 1. Fetch Facebook Comments
    const fbComments = await fetchFacebookComments(selectedPage.id, selectedPage.accessToken);
    allNormalizedInteractions.push(...fbComments.map((c: any) => ({
      platform: "facebook",
      externalId: c.id,
      customer: { name: c.from?.name || "FB User" },
      content: { text: c.message, mediaType: "text" as const },
      createdAt: c.created_time
    })));

    // 2. Fetch Instagram Comments (if linked)
    if (credential.selectedInstagramId) {
      const igComments = await fetchInstagramComments(credential.selectedInstagramId, selectedPage.accessToken);
      allNormalizedInteractions.push(...igComments.map((c: any) => ({
        platform: "instagram",
        externalId: c.id,
        customer: { name: c.username || "IG User" },
        content: { text: c.text, mediaType: "text" as const },
        createdAt: c.timestamp
      })));
    }

    const savedCount = 0;
    // 3. Process and Save
    for (const item of allNormalizedInteractions) {
      const existing = await Interaction.findOne({ externalId: item.externalId });
      if (!existing) {
        // Run AI Analysis
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
      }
    }

    credential.lastSyncAt = new Date();
    await credential.save();

    return NextResponse.json({ success: true, count: allNormalizedInteractions.length });

  } catch (error: any) {
    const metaError = error.response?.data?.error?.message || error.message;
    console.error("Meta Sync Error:", metaError);
    return NextResponse.json({ error: metaError }, { status: 500 });
  }
}
