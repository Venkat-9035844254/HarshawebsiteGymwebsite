import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        branchId: true,
        createdAt: true,
      },
    });

    const formattedUsers = users.map((u) => ({
      ...u,
      createdAt: typeof u.createdAt === "string" ? u.createdAt : (u.createdAt as any)?.toISOString ? (u.createdAt as Date).toISOString() : new Date((u.createdAt as any) || Date.now()).toISOString(),
      phone: u.phone || undefined,
      avatar: u.avatar || undefined,
      branchId: u.branchId || undefined,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error("[API] Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
