import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import PlatformConfig from "@/lib/models/PlatformConfig";
import { exchangeCodeForFacebookToken, fetchFacebookPages } from "@/lib/integrations/facebook";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const manualToken = searchParams.get("manual_token");
  const tenantId = "tenant_1"; 

  if (!code && !manualToken) {
    return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
  }

  try {
    await dbConnect();
    
    const config = await PlatformConfig.findOne({ tenantId });
    if (!config?.metaAppId || !config?.metaAppSecret) {
      throw new Error("Meta App ID/Secret missing during callback");
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

    let userAccessToken = manualToken;

    if (!userAccessToken && code) {
      // 1. Exchange code for USER_ACCESS_TOKEN
      userAccessToken = await exchangeCodeForFacebookToken(code, config.metaAppId, config.metaAppSecret, redirectUri);
    }
    
    if (!userAccessToken) {
      throw new Error("Failed to obtain Facebook Access Token");
    }

    // 2. Fetch all Facebook Pages
    const pages = await fetchFacebookPages(userAccessToken);
    console.log("Saved Pages List:", pages.length);

    // 3. Save User Token and Pages List (Do NOT assume page selected yet)
    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { 
        accessToken: userAccessToken,
        facebookUserToken: userAccessToken,
        facebookPages: pages,
        brandId: "brand_1",
        facebookConnected: false // Not fully connected until a page is selected
      },
      { upsert: true, new: true }
    );

    return NextResponse.redirect(new URL("/settings?connected=facebook_oauth_success", req.url));

  } catch (error: any) {
    console.error("Facebook Callback Error:", error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
