import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant_1";

    const credential = await MetaCredential.findOne({ tenantId });
    if (!credential) {
      return NextResponse.json({ connected: false, pages: [] });
    }

    return NextResponse.json({ 
      connected: true,
      pages: credential.pages,
      selectedPageId: credential.selectedPageId,
      selectedInstagramId: credential.selectedInstagramId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId, pageId, instagramId } = await req.json();

    if (!tenantId || !pageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await MetaCredential.findOneAndUpdate(
      { tenantId },
      { selectedPageId: pageId, selectedInstagramId: instagramId },
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Selection updated" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
