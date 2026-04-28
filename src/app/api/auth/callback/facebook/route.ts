import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import { exchangeCodeForFacebookToken, fetchFacebookPages } from "@/lib/integrations/facebook";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const tenantId = "tenant_1"; // In production, this would come from session or state

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
  }

  try {
    await dbConnect();
    
    // 1. Exchange code for long-lived access token
    const longAccessToken = await exchangeCodeForFacebookToken(code);
    
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
