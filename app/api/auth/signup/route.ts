import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";
import { ensureDemoUser } from "@/lib/demo-user";
import User from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json().catch(() => ({}));
    const { firstName, lastName, email, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "First name, last name, email, and password are required." },
        { status: 400 }
      );
    }

    await connectDb();
    // Ensures the demo account exists before we test for duplicates, so signing
    // up with the demo email reports "already exists" rather than racing the
    // seeder into a duplicate-key error.
    await ensureDemoUser();

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({
      firstName,
      lastName,
      email: String(email).toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "tenant",
    });

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
    console.error("signup error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Signup failed." },
      { status: 500 }
    );
  }
}
