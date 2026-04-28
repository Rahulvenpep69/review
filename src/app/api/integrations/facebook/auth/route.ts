import { NextRequest, NextResponse } from "next/server";
import { getFacebookAuthUrl } from "@/lib/integrations/facebook";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";
import PlatformConfig from "@/lib/models/PlatformConfig";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant_1";

    const config = await PlatformConfig.findOne({ tenantId });
    if (!config?.metaAppId) {
      return NextResponse.json({ error: "Meta App ID not configured in settings." }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/facebook`;
    const url = getFacebookAuthUrl(config.metaAppId, redirectUri);
    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();
    await MetaCredential.findOneAndDelete({ tenantId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
