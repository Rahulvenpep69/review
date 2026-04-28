import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PlatformConfig from "@/lib/models/PlatformConfig";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant_1";

    const config = await PlatformConfig.findOne({ tenantId });
    return NextResponse.json(config || { tenantId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { tenantId, metaAppId, metaAppSecret } = body;

    const config = await PlatformConfig.findOneAndUpdate(
      { tenantId },
      { metaAppId, metaAppSecret },
      { upsert: true, new: true }
    );

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
