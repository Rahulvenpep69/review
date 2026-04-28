import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Interaction from "@/lib/models/Interaction";
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

    const interactions = await Interaction.find({ tenantId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: interactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
