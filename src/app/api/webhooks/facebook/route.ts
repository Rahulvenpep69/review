import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // This is the secret token you will enter in the Meta Dashboard
  const VERIFY_TOKEN = "media360_webhook_secret";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("WEBHOOK_RECEIVED:", JSON.stringify(body, null, 2));

  // TODO: Logic to process the incoming comment/message
  
  return NextResponse.json({ status: "success" });
}
