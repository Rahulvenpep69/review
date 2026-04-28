import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/integrations/google";
import dbConnect from "@/lib/db";
import GoogleCredential from "@/lib/models/GoogleCredential";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code missing" }, { status: 400 });
  }

  try {
    await dbConnect();
    const tokens = await exchangeCodeForTokens(code);

    // In a real app, you'd get tenantId from the session
    const tenantId = "tenant_1"; 
    const brandId = "brand_1";

    await GoogleCredential.findOneAndUpdate(
      { tenantId },
      { 
        tenantId,
        brandId,
        tokens,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    // Trigger Initial Sync (Non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId })
    }).catch(err => console.error("Initial Sync Error:", err));

    // Redirect to settings with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=google_connected`);
  } catch (error: any) {
    console.error("Callback Error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_failed`);
  }
}
