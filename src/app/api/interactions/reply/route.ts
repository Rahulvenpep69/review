import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Interaction from "@/lib/models/Interaction";
import MetaCredential from "@/lib/models/MetaCredential";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId, interactionId, text } = await req.json();

    const interaction = await Interaction.findById(interactionId);
    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    // 1. Post to External Platform
    if (interaction.platform === "facebook" || interaction.platform === "instagram") {
      const cred = await MetaCredential.findOne({ tenantId });
      if (!cred) throw new Error("Meta credentials not found");

      // Find the page that this interaction belongs to (use locationId)
      const page = cred.pages.find((p: any) => p.id === interaction.locationId);
      
      // Fallback: If it's Instagram, the locationId is the Instagram account ID, 
      // but we need the Page Token of the linked Facebook Page to post.
      let accessToken = page?.accessToken;
      
      if (interaction.platform === "instagram") {
         const linkedPage = cred.pages.find((p: any) => p.id === cred.selectedPageId);
         accessToken = linkedPage?.accessToken;
      }

      if (!accessToken) throw new Error("Page access token missing for this platform");

      // Post comment reply
      await axios.post(`https://graph.facebook.com/v16.0/${interaction.externalId}/comments`, {
        message: text,
        access_token: accessToken
      });
    } else if (interaction.platform === "google") {
      // TODO: Google Business Profile reply logic
    }

    // 2. Save reply to our DB
    await Interaction.create({
      tenantId,
      brandId: interaction.brandId,
      platform: interaction.platform,
      pageId: interaction.pageId,
      parentId: interaction.externalId, // Nested under the item we replied to
      externalId: `reply_${Date.now()}`,
      content: { text },
      customer: { name: "Media360 Admin", username: "admin" },
      createdAt: new Date(),
      isReply: true,
      aiMetadata: { sentimentLabel: "neutral", urgencyScore: 0 }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Reply Error:", error.response?.data || error.message);
    return NextResponse.json({ 
      error: error.response?.data?.error?.message || error.message 
    }, { status: 500 });
  }
}
