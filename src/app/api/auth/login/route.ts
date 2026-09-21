import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserInStore } from "@/lib/userStore";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log(`[AUTH] Login request received for email: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[AUTH] Looking up user in database for email: ${normalizedEmail}`);
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          memberProfile: true,
          trainerProfile: true,
        },
      });
    } catch (dbErr) {
      console.warn("[AUTH] Database lookup warning during login:", dbErr);
    }

    if (!user) {
      console.log(`[AUTH] User not found in primary DB, checking userStore for: ${normalizedEmail}`);
      const storeUser = findUserInStore(normalizedEmail);
      if (storeUser) {
        user = storeUser;
      }
    }

    if (!user) {
      console.log(`[AUTH] Login failed: No user found for email ${normalizedEmail}`);
      return NextResponse.json(
        { success: false, message: "No registered account found with that email address." },
        { status: 400 }
      );
    }

    console.log(`[AUTH] Password verification starting for user ID: ${user.id}`);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    console.log(`[AUTH] Password verification result: ${isPasswordValid ? "SUCCESS" : "FAILED"}`);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 400 }
      );
    }

    console.log(`[AUTH] Authentication successful for user: ${user.email} (${user.role})`);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const sanitizeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role as any,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: sanitizeUser,
      memberProfile: user.memberProfile || null,
      trainerProfile: user.trainerProfile || null,
      token,
    });

    response.cookies.set("apex_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[AUTH] Login error:", error);
    const rawMsg = String(error?.message || "");
    const isDbConnError = rawMsg.includes("prisma") || rawMsg.includes("Can't reach") || rawMsg.includes("database server") || rawMsg.includes("P1001") || rawMsg.includes("ENOTFOUND");
    
    const userFacingMessage = isDbConnError
      ? "Unable to connect to the database server. Please verify your internet connection or database configuration."
      : error?.message || "Internal server error during login.";

    return NextResponse.json(
      { success: false, message: userFacingMessage },
      { status: 500 }
    );
  }
}
