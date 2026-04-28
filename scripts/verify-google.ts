import dbConnect from "../src/lib/db";
import Interaction from "../src/lib/models/Interaction";
import GoogleCredential from "../src/lib/models/GoogleCredential";
import { fetchGoogleBusinessData } from "../src/lib/integrations/google";

async function verifyGoogleData() {
  await dbConnect();

  console.log("=== CHECKING SAVED INTERACTIONS IN DB ===");
  const savedGoogleInteractions = await Interaction.find({ platform: "google" }).sort({ createdAt: -1 }).limit(5);
  
  if (savedGoogleInteractions.length === 0) {
    console.log("No Google interactions found in the database.");
  } else {
    console.log(`Found ${savedGoogleInteractions.length} recent Google interactions.`);
    savedGoogleInteractions.forEach(i => {
      console.log(`- Review from ${i.customer.name} (Location: ${i.locationId})`);
      if (i.locationId === "mock_location") {
         console.log("  ⚠️  This appears to be fallback/mock data.");
      } else {
         console.log("  ✅ This appears to be real data.");
      }
    });
  }

  console.log("\n=== TESTING LIVE FETCH FROM GOOGLE API ===");
  const credential = await GoogleCredential.findOne({});
  if (!credential) {
    console.log("No Google credentials found in DB. Cannot test live fetch.");
    process.exit(0);
  }

  console.log(`Found credentials for Tenant: ${credential.tenantId}. Attempting to fetch...`);
  try {
    const data = await fetchGoogleBusinessData(credential.tokens);
    console.log(`Fetched ${data.length} reviews.`);
    if (data.length > 0) {
      const first = data[0];
      console.log(`Sample Reviewer: ${first.reviewerName}`);
      console.log(`Sample Location ID: ${first.locationId}`);
      if (first.locationId === "mock_location") {
        console.log("Result: ⚠️ MOCK DATA is being returned (likely due to quota/errors).");
      } else {
        console.log("Result: ✅ REAL DATA successfully retrieved from Google API.");
      }
    }
  } catch (err: any) {
    console.error("Live fetch failed:", err.message);
  }

  process.exit(0);
}

verifyGoogleData();
