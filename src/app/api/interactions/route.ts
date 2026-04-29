import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Interaction from "@/lib/models/Interaction";
import MetaCredential from "@/lib/models/MetaCredential";
import GoogleCredential from "@/lib/models/GoogleCredential";
import { analyzeInteraction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { 
      tenantId, 
      brandId, 
      locationId, 
      platform, 
      externalId, 
      customer, 
      content 
    } = body;

    // 1. Analyze with AI
    const aiResult = await analyzeInteraction(
      content.text, 
      platform, 
      "Professional", 
      content.rating
    );

    // 2. Create or Update Interaction
    const interaction = await Interaction.findOneAndUpdate(
      { externalId },
      {
        tenantId,
        brandId,
        locationId,
        platform,
        customer,
        content,
        aiMetadata: {
          sentimentScore: aiResult.sentiment === "positive" ? 100 : aiResult.sentiment === "negative" ? 0 : 50,
          sentimentLabel: aiResult.sentiment,
          urgencyScore: aiResult.urgency,
          intent: aiResult.intent,
          category: aiResult.category,
          riskFlag: aiResult.riskFlag
        },
        replies: {
          aiSuggested: aiResult.suggestedReply
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: interaction });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ success: false, error: "tenantId is required" }, { status: 400 });
    }

    const activeLocationIds: string[] = [];

    // Get Meta active accounts
    const metaCred = await MetaCredential.findOne({ tenantId });
    if (metaCred) {
      if (metaCred.selectedPageId) activeLocationIds.push(metaCred.selectedPageId);
      if (metaCred.selectedInstagramId) activeLocationIds.push(metaCred.selectedInstagramId);
    }

    // Get Google active locations
    const googleCred = await GoogleCredential.findOne({ tenantId });
    if (googleCred && googleCred.locationId) {
      activeLocationIds.push(googleCred.locationId);
    }

    // Include interactions that either match an active locationId, or are legacy 'meta_default'
    // To ensure we don't accidentally hide old interactions that haven't been re-synced yet,
    // we could also include "meta_default" if we want, but the user EXPLICITLY requested:
    // "don't show the previous account comments". This strict filter accomplishes exactly that.
    
    let query: any = { tenantId };
    
    // If we found any configured credentials, restrict the query.
    // If they have no credentials configured at all, maybe return nothing or everything?
    // Let's restrict it to active locations if any exist, otherwise return nothing.
    if (activeLocationIds.length > 0) {
      query.locationId = { $in: activeLocationIds };
    } else {
      // If no credentials have selected accounts, we shouldn't show old phantom data
      query.locationId = { $in: [] }; 
    }

    const interactions = await Interaction.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: interactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
