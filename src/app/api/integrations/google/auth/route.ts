import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/integrations/google";
import dbConnect from "@/lib/db";
import GoogleCredential from "@/lib/models/GoogleCredential";

export async function GET() {
  try {
    const url = getGoogleAuthUrl();
    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId } = await req.json();
    await GoogleCredential.findOneAndDelete({ tenantId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
