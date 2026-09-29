import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { readSession } from "@/lib/session";

export async function GET() {
  const userId = readSession();
  if (!userId) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  try {
    await connectDb();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }
    return NextResponse.json({
      ok: true,
      user: {
        id: String(user._id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err) {
    console.error("me error", err);
    return NextResponse.json({ ok: false, user: null }, { status: 500 });
  }
}
