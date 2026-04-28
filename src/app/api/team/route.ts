import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { sendInviteEmail } from "@/lib/mail";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant_1";
    
    const users = await User.find({ tenantId }).sort({ createdAt: -1 });
    return NextResponse.json({ data: users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    if (!body.email || !body.name) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const newUser = await User.create({
      ...body,
      tenantId: body.tenantId || "tenant_1"
    });

    // Send Invite Email
    await sendInviteEmail(newUser.email, newUser.name, newUser.role);

    return NextResponse.json({ data: newUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
