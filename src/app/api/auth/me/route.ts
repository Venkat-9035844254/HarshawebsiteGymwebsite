import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { findUserInStore } from "@/lib/userStore";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    let token = "";

    const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cur) => {
      const [k, v] = cur.trim().split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    token = cookies["apex_token"];

    if (!token) {
      const authHeader = req.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          memberProfile: true,
          trainerProfile: true,
        },
      });
    } catch (dbErr) {
      // Ignore DB error
    }

    if (!user && decoded.email) {
      const storeUser = findUserInStore(decoded.email);
      if (storeUser) {
        user = storeUser;
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const sanitizeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role as any,
      avatar: user.avatar || undefined,
      createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt?.toISOString ? user.createdAt.toISOString() : new Date(user.createdAt || Date.now()).toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: sanitizeUser,
      memberProfile: user.memberProfile || null,
      trainerProfile: user.trainerProfile || null,
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}
