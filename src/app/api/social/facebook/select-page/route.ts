import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MetaCredential from "@/lib/models/MetaCredential";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId, pageId } = await req.json();

    if (!tenantId || !pageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const credential = await MetaCredential.findOne({ tenantId });
    if (!credential || !credential.facebookPages) {
      return NextResponse.json({ error: "No Facebook Pages found. Please reconnect." }, { status: 404 });
    }

    // Match pageId from saved facebookPages[]
    const selectedPage = credential.facebookPages.find((p: any) => p.id === pageId);
    if (!selectedPage) {
      return NextResponse.json({ error: "Selected Facebook Page not found in saved list." }, { status: 404 });
    }

    console.log("Selected Page ID:", selectedPage.id);
    console.log("Selected Page Token:", selectedPage.accessToken.substring(0, 10) + "...");

    // Update MongoDB user record permanently
    const result = await MetaCredential.findOneAndUpdate(
      { tenantId },
      {
        facebookConnected: true,
        facebookPageId: selectedPage.id,
        facebookPageName: selectedPage.name,
        facebookPageToken: selectedPage.accessToken,
        selectedPageId: selectedPage.id,
        connectedAt: new Date()
      },
      { new: true }
    );

    console.log("Mongo Save Result: Success");

    return NextResponse.json({ 
      success: true, 
      message: "Page selection persisted successfully",
      pageName: selectedPage.name
    });

  } catch (error: any) {
    console.error("Select Page Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
