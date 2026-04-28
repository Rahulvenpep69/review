import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Interaction from "../src/lib/models/Interaction";

dotenv.config();

async function ingest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB.");

    const tenantId = "tenant_1";
    
    const sampleInteractions = [
      {
        tenantId,
        brandId: "brand_1",
        locationId: "loc_chennai_01",
        platform: "google",
        externalId: "g_" + Date.now(),
        customer: { name: "Sarah Jenkins", profilePhoto: "" },
        content: { text: "The service at the Chennai branch was exceptional! The staff was very attentive and the ambiance was perfect.", rating: 5, mediaType: "text" },
        aiMetadata: { sentimentScore: 95, sentimentLabel: "positive", urgencyScore: 2, intent: "praise", issueCategory: "Customer Service", riskFlag: false },
        workflow: { approvalStatus: "approved", postedStatus: "pending" },
        replies: { aiSuggested: "Thank you Sarah! We are thrilled you enjoyed your visit to our Chennai branch. We look forward to seeing you again soon!", existingReply: "" },
        createdAt: new Date()
      },
      {
        tenantId,
        brandId: "brand_1",
        locationId: "loc_chennai_01",
        platform: "google",
        externalId: "g_" + (Date.now() + 1),
        customer: { name: "Mike Ross", profilePhoto: "" },
        content: { text: "Disappointed with the long wait time yesterday. I had an appointment but still waited 45 minutes.", rating: 2, mediaType: "text" },
        aiMetadata: { sentimentScore: 15, sentimentLabel: "negative", urgencyScore: 8, intent: "complaint", issueCategory: "Wait Time", riskFlag: true },
        workflow: { approvalStatus: "pending", postedStatus: "pending" },
        replies: { aiSuggested: "Hi Mike, we sincerely apologize for the delay. This is not the experience we strive for. Our manager will reach out to resolve this.", existingReply: "" },
        createdAt: new Date()
      },
      {
        tenantId,
        brandId: "brand_1",
        locationId: "loc_social_01",
        platform: "instagram",
        externalId: "ig_" + (Date.now() + 2),
        customer: { name: "vogue_traveler", profilePhoto: "" },
        content: { text: "Love the new summer collection! 💖✨ The colors are so vibrant and the fabric is top quality.", mediaType: "text" },
        aiMetadata: { sentimentScore: 88, sentimentLabel: "positive", urgencyScore: 1, intent: "engagement", issueCategory: "Product", riskFlag: false },
        workflow: { approvalStatus: "approved", postedStatus: "pending" },
        replies: { aiSuggested: "So glad you like it! Which piece is your favorite? 😍", existingReply: "" },
        createdAt: new Date()
      },
      {
        tenantId,
        brandId: "brand_1",
        locationId: "loc_social_01",
        platform: "tiktok",
        externalId: "tt_" + (Date.now() + 3),
        customer: { name: "tech_guru", profilePhoto: "" },
        content: { text: "The app integration is slightly buggy when trying to upload media.", mediaType: "text" },
        aiMetadata: { sentimentScore: 40, sentimentLabel: "neutral", urgencyScore: 5, intent: "feedback", issueCategory: "Technical", riskFlag: false },
        workflow: { approvalStatus: "pending", postedStatus: "pending" },
        replies: { aiSuggested: "Thanks for the feedback! Our team is looking into the media upload issues as we speak.", existingReply: "" },
        createdAt: new Date()
      }
    ];

    await Interaction.insertMany(sampleInteractions);
    console.log(`✅ Successfully ingested ${sampleInteractions.length} interactions.`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Ingestion Failed:", error.message);
    process.exit(1);
  }
}

ingest();
