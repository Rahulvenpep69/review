import dbConnect from "../src/lib/db";
import MetaCredential from "../src/lib/models/MetaCredential";
import { fetchFacebookPages } from "../src/lib/integrations/facebook";

async function forceUpdateToken() {
  const token = "EAAZAZA0M1IliQBRW27ZBvHwErfWvFxFVhR2QZAQU35bZAzETJYJin9J99X39bBnIQWleZAWhxBhtPWtUicmBPL5CaEKTd3iqffIOOvTCZABC5TqlJHdJgK0RISp3nRGgXanopUhM79r0yqT54fzw51fPIe8TZA664enZCWrJXtDjIUdULmH2SVVZA1URwW63HcqSD22ZBUKZBPxOpdjxOZCVs4BTFwfDNNgask67k0zij40wfY9WRGuD0mdYKeIrKtSCgUI5uZAHym8G5tjhkZD";
  const tenantId = "tenant_1";

  try {
    await dbConnect();
    console.log("Connected to DB");

    console.log("Fetching pages for token...");
    const pages = await fetchFacebookPages(token);
    console.log(`Found ${pages.length} pages.`);

    const existing = await MetaCredential.findOne({ tenantId });
    
    let updatedPages = pages;
    if (existing) {
      const pageMap = new Map(existing.pages.map((p: any) => [p.id, p]));
      pages.forEach((p: any) => pageMap.set(p.id, p));
      updatedPages = Array.from(pageMap.values());
    }

    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { 
        accessToken: token,
        brandId: "brand_1",
        pages: updatedPages,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log("Database updated successfully with the new token and pages!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating token:", error);
    process.exit(1);
  }
}

forceUpdateToken();
