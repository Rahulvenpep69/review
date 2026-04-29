import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import PlatformConfig from "@/lib/models/PlatformConfig";
import { exchangeCodeForFacebookToken, fetchFacebookPages } from "@/lib/integrations/facebook";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const tenantId = "tenant_1"; 
  try {
    await dbConnect();
    
    const config = await PlatformConfig.findOne({ tenantId });
    if (!config?.metaAppId || !config?.metaAppSecret) {
      throw new Error("Meta App ID/Secret missing during callback");
    }

    const manualToken = searchParams.get("manual_token");
    let longAccessToken = "";

    if (manualToken) {
      longAccessToken = manualToken;
    } else if (code) {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;
      // 1. Exchange code for long-lived access token
      longAccessToken = await exchangeCodeForFacebookToken(code, config.metaAppId, config.metaAppSecret, redirectUri);
    } else {
       return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
    }
    
    // 2. Fetch available pages and their Instagram links
    const pages = await fetchFacebookPages(longAccessToken);
    
    // 3. Save or Update Credential (Merge Pages)
    const existing = await MetaCredential.findOne({ tenantId });
    
    let updatedPages = pages;
    if (existing) {
      // Create a map of existing pages by ID
      const pageMap = new Map(existing.pages.map((p: any) => [p.id, p]));
      // Add or Update with new pages
      pages.forEach((p: any) => pageMap.set(p.id, p));
      updatedPages = Array.from(pageMap.values());
    }

    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { 
        accessToken: longAccessToken, // Keep the latest user token as primary
        brandId: "brand_1",
        pages: updatedPages,
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.redirect(new URL("/settings?connected=facebook", req.url));

  } catch (error: any) {
    console.error("Facebook Callback Error:", error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
