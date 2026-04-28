import { NextRequest, NextResponse } from "next/server";
import { getFacebookAuthUrl } from "@/lib/integrations/facebook";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";

export async function GET() {
  try {
    const url = getFacebookAuthUrl();
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
