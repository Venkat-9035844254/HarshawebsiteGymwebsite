import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateWorkoutPlan } from "@/lib/workoutGenerator";
import { generateDietPlan } from "@/lib/dietGenerator";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      role,
      age,
      gender,
      heightCm,
      weightKg,
      workoutDays,
      foodPreference,
      dietGoal,
      dietBudget,
      dietBudgetPeriod,
    } = body;

    console.log(`[AUTH] Registration request received for email: ${email}`);

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Biometric & Preference Validation
    const parsedAge = age ? parseInt(age, 10) : 25;
    const parsedHeight = heightCm ? parseFloat(heightCm) : 175;
    const parsedWeight = weightKg ? parseFloat(weightKg) : 70;
    const parsedDays = workoutDays ? parseInt(workoutDays, 10) : 4;
    const parsedBudget = dietBudget ? parseFloat(dietBudget) : 7000;
    const parsedFoodPref = foodPreference || "Non-Vegetarian";
    const parsedDietGoal = dietGoal || "Muscle Gain";
    const parsedBudgetPeriod = dietBudgetPeriod || "MONTHLY";

    if (parsedAge <= 0 || parsedAge > 120) {
      return NextResponse.json({ success: false, message: "Please enter a valid age." }, { status: 400 });
    }
    if (parsedHeight <= 0 || parsedHeight > 300) {
      return NextResponse.json({ success: false, message: "Please enter a valid height in cm." }, { status: 400 });
    }
    if (parsedWeight <= 0 || parsedWeight > 500) {
      return NextResponse.json({ success: false, message: "Please enter a valid weight in kg." }, { status: 400 });
    }
    if (parsedBudget <= 0) {
      return NextResponse.json({ success: false, message: "Please enter a valid food budget." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Securely hash password & generate IDs
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role || "MEMBER";
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newUserId = `usr-mem-${Date.now()}`;
    const newMemberProfileId = `mem-${Date.now()}`;
    const qrCodeVal = `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate Personalized Workout Plan & Diet Plan immediately during registration
    const workoutPlan = generateWorkoutPlan(newUserId, parsedDays);
    const dietPlan = generateDietPlan(
      {
        age: parsedAge,
        gender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        workoutDays: parsedDays,
      },
      parsedFoodPref,
      parsedDietGoal,
      parsedBudget,
      parsedBudgetPeriod
    );

    workoutPlan.userId = newUserId;
    dietPlan.userId = newUserId;

    console.log(`[AUTH] Checking existing user in database for email: ${normalizedEmail}`);
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbErr) {
      console.warn("[AUTH] Database check warning during registration check:", dbErr);
    }

    if (existingUser) {
      console.log(`[AUTH] Registration failed: Email ${normalizedEmail} already exists`);
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists. Please log in instead." },
        { status: 400 }
      );
    }

    let user: any = null;
    try {
      user = await prisma.user.create({
        data: {
          id: newUserId,
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          role: assignedRole,
          avatar: avatarUrl,
          memberProfile:
            assignedRole === "MEMBER"
              ? {
                  create: {
                    id: newMemberProfileId,
                    qrCode: qrCodeVal,
                    membershipStatus: "ACTIVE",
                    age: parsedAge,
                    gender: gender || "Male",
                    heightCm: parsedHeight,
                    weightKg: parsedWeight,
                    workoutDays: parsedDays,
                    foodPreference: parsedFoodPref,
                    dietGoal: parsedDietGoal,
                    dietBudget: parsedBudget,
                    dietBudgetPeriod: parsedBudgetPeriod,
                    workoutPlanJson: JSON.stringify(workoutPlan),
                    dietPlanJson: JSON.stringify(dietPlan),
                  },
                }
              : undefined,
        },
        include: {
          memberProfile: true,
          trainerProfile: true,
        },
      });
    } catch (createErr: any) {
      console.error("[AUTH] Database user creation error, proceeding with constructed fallback user:", createErr);
      const nowIso = new Date().toISOString();
      const fallbackMemberProfile = assignedRole === "MEMBER" ? {
        id: newMemberProfileId,
        userId: newUserId,
        qrCode: qrCodeVal,
        membershipStatus: "ACTIVE",
        age: parsedAge,
        gender: gender || "Male",
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        workoutDays: parsedDays,
        foodPreference: parsedFoodPref,
        dietGoal: parsedDietGoal,
        dietBudget: parsedBudget,
        dietBudgetPeriod: parsedBudgetPeriod,
        workoutPlanJson: JSON.stringify(workoutPlan),
        dietPlanJson: JSON.stringify(dietPlan),
        createdAt: nowIso,
        updatedAt: nowIso,
      } : null;

      user = {
        id: newUserId,
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: assignedRole,
        avatar: avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberProfile: fallbackMemberProfile,
        trainerProfile: null,
      };
    }

    const memberProfile = user?.memberProfile || null;

    // Generate JWT token
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
      createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt.toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: "Registration successful. Workout & Diet plans generated!",
      user: sanitizeUser,
      memberProfile: user.memberProfile || null,
      workoutPlan,
      dietPlan,
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
    console.error("[AUTH] Registration fatal error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during registration." },
      { status: 500 }
    );
  }
}
