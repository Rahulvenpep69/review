import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    // This is a simple implementation that acknowledges the deletion request.
    // In a real production app, you would verify the signature and delete the user from the DB.
    
    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      confirmation_code: `del_${Date.now()}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
