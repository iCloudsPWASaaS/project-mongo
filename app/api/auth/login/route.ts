import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";
import User from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { email, password } = (await req.json().catch(() => ({}))) as any;
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDb();

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password || "");
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    createSession(String(user._id));

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
    console.error("login error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Login failed." },
      { status: 500 }
    );
  }
}
