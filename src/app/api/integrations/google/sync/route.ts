import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GoogleCredential from "@/lib/models/GoogleCredential";
import Interaction from "@/lib/models/Interaction";
import { fetchGoogleBusinessData } from "@/lib/integrations/google";
import { analyzeInteraction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const credential = await GoogleCredential.findOne({ tenantId });
    if (!credential) {
      return NextResponse.json({ error: "Google not connected" }, { status: 404 });
    }

    const normalizedReviews = await fetchGoogleBusinessData(
      credential.tokens,
      credential.accountId,
      credential.locationId
    );

    const savedInteractions = [];

    for (const review of normalizedReviews) {
      // Check if interaction already exists
      const existing = await Interaction.findOne({ externalId: review.reviewId });
      
      if (!existing) {
        // AI Analysis with Error Handling
        let aiResult = {
          sentiment: "neutral",
          urgency: 5,
          intent: "feedback",
          category: "General",
          riskFlag: false,
          suggestedReply: ""
        };

        try {
          aiResult = await analyzeInteraction(
            review.comment,
            "google",
            "Professional",
            review.rating
          );
        } catch (aiError) {
          console.warn("Gemini AI Analysis failed, using fallback defaults.");
        }

        const newInteraction = new Interaction({
          tenantId,
          brandId: credential.brandId,
          locationId: review.locationId,
          platform: "google",
          externalId: review.reviewId,
          customer: {
            name: review.reviewerName,
            profilePhoto: review.reviewerPhoto
          },
          content: {
            text: review.comment,
            rating: review.rating,
            mediaType: "text"
          },
          aiMetadata: {
            sentimentScore: aiResult.sentiment === "positive" ? 90 : aiResult.sentiment === "negative" ? 15 : 50,
            sentimentLabel: aiResult.sentiment,
            urgencyScore: aiResult.urgency,
            intent: aiResult.intent,
            issueCategory: aiResult.category,
            riskFlag: aiResult.riskFlag
          },
          workflow: {
            approvalStatus: "pending",
            postedStatus: "pending"
          },
          replies: {
            aiSuggested: aiResult.suggestedReply,
            existingReply: review.existingReply
          }
        });

        await newInteraction.save();
        savedInteractions.push(newInteraction);
      }
    }

    credential.lastSyncAt = new Date();
    await credential.save();

    return NextResponse.json({ 
      success: true, 
      syncedCount: savedInteractions.length,
      totalCount: normalizedReviews.length 
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
