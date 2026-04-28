import dbConnect from "../src/lib/db";
import Interaction from "../src/lib/models/Interaction";
import { analyzeInteraction } from "../src/lib/ai-engine";

/**
 * PASTE YOUR REAL REVIEWS HERE
 * ----------------------------
 * Copy the text from your Google Maps reviews and replace the samples below.
 */
const REVIEWS_TO_INGEST = [
  {
    name: "John Doe",
    text: "The service here was fantastic. I loved the attention to detail and the staff was very friendly!",
    rating: 5,
    date: "2024-04-20T10:00:00Z"
  },
  {
    name: "Sarah Jenkins",
    text: "I was a bit disappointed with the wait times. I had an appointment but still had to wait 30 minutes.",
    rating: 2,
    date: "2024-04-22T14:30:00Z"
  },
  {
    name: "Michael Smith",
    text: "Decent place, but a bit pricey for what you get. The food was good though.",
    rating: 3,
    date: "2024-04-25T19:15:00Z"
  }
];

const TENANT_ID = "tenant_1";
const BRAND_ID = "brand_1";
const LOCATION_ID = "manual_import_1";

async function runManualIngest() {
  console.log("Connecting to database...");
  await dbConnect();

  console.log(`Starting manual ingestion of ${REVIEWS_TO_INGEST.length} reviews...`);

  for (const item of REVIEWS_TO_INGEST) {
    const externalId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    console.log(`- Analyzing review from ${item.name}...`);
    
    // Use the real AI engine to analyze the manually pasted text!
    const aiResult = await analyzeInteraction(
      item.text,
      "google",
      "Professional",
      item.rating
    );

    const interaction = new Interaction({
      tenantId: TENANT_ID,
      brandId: BRAND_ID,
      locationId: LOCATION_ID,
      platform: "google",
      externalId,
      customer: {
        name: item.name
      },
      content: {
        text: item.text,
        rating: item.rating,
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
        aiSuggested: aiResult.suggestedReply
      },
      createdAt: new Date(item.date)
    });

    await interaction.save();
    console.log(`  ✅ Saved!`);
  }

  console.log("\nFINISHED! You can now refresh your dashboard to see your data.");
  process.exit(0);
}

runManualIngest();
