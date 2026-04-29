import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import PlatformConfig from "@/lib/models/PlatformConfig";
import { exchangeCodeForFacebookToken, fetchFacebookPages } from "@/lib/integrations/facebook";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const tenantId = "tenant_1"; 

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
  }

  try {
    await dbConnect();
    
    const config = await PlatformConfig.findOne({ tenantId });
    if (!config?.metaAppId || !config?.metaAppSecret) {
      throw new Error("Meta App ID/Secret missing during callback");
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

    let userAccessToken = searchParams.get("manual_token");

    if (!userAccessToken) {
      // 1. Exchange code for USER_ACCESS_TOKEN
      console.log("Exchanging code for user token...");
      userAccessToken = await exchangeCodeForFacebookToken(code, config.metaAppId, config.metaAppSecret, redirectUri);
    }
    
    if (!userAccessToken) {
      throw new Error("Failed to obtain Facebook Access Token");
    }
    
    console.log("USER_TOKEN:", userAccessToken.substring(0, 10) + "...");

    // 2. Fetch /me/accounts to get Page Tokens
    console.log("Fetching pages and page tokens...");
    const pages = await fetchFacebookPages(userAccessToken);
    console.log("PAGES RESPONSE:", JSON.stringify(pages.map((p: any) => ({ name: p.name, id: p.id }))));

    if (pages.length === 0) {
       return NextResponse.redirect(new URL("/settings?error=no_pages", req.url));
    }

    // 3. Save to MongoDB
    const firstPage = pages[0];
    console.log("PAGE TOKEN:", firstPage.accessToken.substring(0, 10) + "...");
    console.log("PAGE ID:", firstPage.id);

    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { 
        accessToken: userAccessToken,
        facebookUserToken: userAccessToken,
        facebookPageId: firstPage.id,
        facebookPageName: firstPage.name,
        facebookPageToken: firstPage.accessToken,
        facebookConnected: true,
        pages: pages,
        selectedPageId: firstPage.id,
        brandId: "brand_1",
        connectedAt: new Date(),
        lastSyncAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.redirect(new URL("/settings?connected=true", req.url));

  } catch (error: any) {
    console.error("Facebook Callback Error:", error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
