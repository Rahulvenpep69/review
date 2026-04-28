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

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;

    // 1. Exchange code for long-lived access token
    const longAccessToken = await exchangeCodeForFacebookToken(code, config.metaAppId, config.metaAppSecret, redirectUri);
    
    // 2. Fetch available pages and their Instagram links
    const pages = await fetchFacebookPages(longAccessToken);
    
    // 3. Save or Update Credential
    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { 
        accessToken: longAccessToken,
        brandId: "brand_1",
        pages,
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
