import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Interaction from "../src/lib/models/Interaction";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

const mockData = [
  {
    tenantId: "tenant_1",
    brandId: "brand_1",
    locationId: "loc_1",
    platform: "google",
    externalId: "ext_101",
    customer: { name: "Aditya Verma", username: "aditya_v" },
    content: { text: "The service at the Chennai location was extremely slow. I waited 45 minutes for my order. Not coming back.", rating: 2, mediaType: "text" },
    aiMetadata: { sentimentScore: 15, sentimentLabel: "negative", urgencyScore: 9, intent: "Complaint", riskFlag: false, issueCategory: "Service" },
    workflow: { approvalStatus: "pending", postedStatus: "pending" },
    replies: { aiSuggested: "Hi Aditya, I am truly sorry to hear about your experience in Chennai. We'd like to make this right." }
  },
  {
    tenantId: "tenant_1",
    brandId: "brand_1",
    locationId: "loc_2",
    platform: "instagram",
    externalId: "ext_102",
    customer: { name: "Neha Styles", username: "neha_styles" },
    content: { text: "Love the new summer collection! 😍 The quality is amazing.", mediaType: "text" },
    aiMetadata: { sentimentScore: 95, sentimentLabel: "positive", urgencyScore: 2, intent: "Praise", riskFlag: false, issueCategory: "Product" },
    workflow: { approvalStatus: "approved", postedStatus: "posted" },
    replies: { aiSuggested: "Thank you Neha! We're so glad you love it." }
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Cleaning up old data...");
    await Interaction.deleteMany({});

    console.log("Seeding new data...");
    await Interaction.insertMany(mockData);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
}

seed();
