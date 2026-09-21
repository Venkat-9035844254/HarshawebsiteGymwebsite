import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWorkoutPlan } from "@/lib/workoutGenerator";
import { generateDietPlan } from "@/lib/dietGenerator";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "fitness_drive_stable_jwt_secret_key_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let {
      userId,
      workoutDays,
      foodPreference,
      dietGoal,
      dietBudget,
      dietBudgetPeriod,
      age,
      gender,
      heightCm,
      weightKg,
    } = body;

    // Fallback: extract userId from JWT cookie if missing from body
    if (!userId) {
      try {
        const cookieHeader = req.headers.get("cookie") || "";
        const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cur) => {
          const [k, v] = cur.trim().split("=");
          if (k && v) acc[k] = v;
          return acc;
        }, {});
        const token = cookies["apex_token"];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          if (decoded?.userId) userId = decoded.userId;
        }
      } catch (tokenErr) {
        // Ignore token decoding error
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "User session or User ID is required." }, { status: 400 });
    }

    let memberProfile: any = null;
    try {
      memberProfile = await prisma.memberProfile.findUnique({
        where: { userId },
      });
    } catch (dbErr: any) {
      console.warn("[API] Database warning during memberProfile lookup:", dbErr);
    }

    // Auto-create memberProfile in DB if user exists but profile was missing
    if (!memberProfile) {
      try {
        const userRecord = await prisma.user.findUnique({ where: { id: userId } });
        if (userRecord && userRecord.role === "MEMBER") {
          const newMemberProfileId = `mem-${Date.now()}`;
          const qrCodeVal = `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`;
          memberProfile = await prisma.memberProfile.create({
            data: {
              id: newMemberProfileId,
              userId: userRecord.id,
              qrCode: qrCodeVal,
              membershipStatus: "ACTIVE",
              age: age ? parseInt(age, 10) : 25,
              gender: gender || "Male",
              heightCm: heightCm ? parseFloat(heightCm) : 175,
              weightKg: weightKg ? parseFloat(weightKg) : 70,
              workoutDays: workoutDays ? parseInt(workoutDays, 10) : 4,
              foodPreference: foodPreference || "Non-Vegetarian",
              dietGoal: dietGoal || "Muscle Gain",
              dietBudget: dietBudget ? parseFloat(dietBudget) : 7000,
              dietBudgetPeriod: dietBudgetPeriod || "MONTHLY",
            },
          });
        }
      } catch (createErr) {
        console.warn("[API] Could not create member profile in DB, using fallback memory object:", createErr);
      }
    }

    // Fallback memory profile if not in DB
    if (!memberProfile) {
      memberProfile = {
        id: `mem-${userId}`,
        userId,
        membershipStatus: "ACTIVE",
        workoutDays: workoutDays ? parseInt(workoutDays, 10) : 4,
        foodPreference: foodPreference || "Non-Vegetarian",
        dietGoal: dietGoal || "Muscle Gain",
        dietBudget: dietBudget ? parseFloat(dietBudget) : 7000,
        dietBudgetPeriod: dietBudgetPeriod || "MONTHLY",
        age: age ? parseInt(age, 10) : 25,
        heightCm: heightCm ? parseFloat(heightCm) : 175,
        weightKg: weightKg ? parseFloat(weightKg) : 70,
        gender: gender || "Male",
      };
    }

    const parsedDays = workoutDays ? parseInt(workoutDays, 10) : memberProfile.workoutDays || 4;
    const parsedFoodPref = foodPreference || memberProfile.foodPreference || "Non-Vegetarian";
    const parsedDietGoal = dietGoal || memberProfile.dietGoal || "Muscle Gain";
    const parsedBudget = dietBudget ? parseFloat(dietBudget) : memberProfile.dietBudget || 7000;
    const parsedBudgetPeriod = dietBudgetPeriod || memberProfile.dietBudgetPeriod || "MONTHLY";
    const parsedAge = age ? parseInt(age, 10) : memberProfile.age || 25;
    const parsedHeight = heightCm ? parseFloat(heightCm) : memberProfile.heightCm || 175;
    const parsedWeight = weightKg ? parseFloat(weightKg) : memberProfile.weightKg || 70;
    const parsedGender = gender || memberProfile.gender || "Male";

    // Generate new Workout & Diet Plans dynamically
    const newWorkoutPlan = generateWorkoutPlan(userId, parsedDays, {
      age: parsedAge,
      gender: parsedGender,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      fitnessGoal: parsedDietGoal,
      workoutExperience: body.workoutExperience,
      equipment: body.equipment,
      workoutType: body.workoutType,
      limitations: body.limitations,
    });

    const newDietPlan = generateDietPlan(
      {
        age: parsedAge,
        gender: parsedGender,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        workoutDays: parsedDays,
      },
      parsedFoodPref as any,
      parsedDietGoal as any,
      parsedBudget,
      parsedBudgetPeriod as any
    );

    newWorkoutPlan.userId = userId;
    newDietPlan.userId = userId;

    // Update DB asynchronously if available
    let updatedProfile = {
      ...memberProfile,
      workoutDays: parsedDays,
      foodPreference: parsedFoodPref,
      dietGoal: parsedDietGoal,
      dietBudget: parsedBudget,
      dietBudgetPeriod: parsedBudgetPeriod,
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      gender: parsedGender,
      workoutPlanJson: JSON.stringify(newWorkoutPlan),
      dietPlanJson: JSON.stringify(newDietPlan),
    };

    try {
      updatedProfile = await prisma.memberProfile.update({
        where: { userId },
        data: {
          workoutDays: parsedDays,
          foodPreference: parsedFoodPref,
          dietGoal: parsedDietGoal,
          dietBudget: parsedBudget,
          dietBudgetPeriod: parsedBudgetPeriod,
          age: parsedAge,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          gender: parsedGender,
          workoutPlanJson: JSON.stringify(newWorkoutPlan),
          dietPlanJson: JSON.stringify(newDietPlan),
        },
      });
    } catch (updateErr: any) {
      console.warn("[API] Database profile update skipped/failed, returning generated plans directly:", updateErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Workout and Diet plans regenerated successfully!",
      memberProfile: updatedProfile,
      workoutPlan: newWorkoutPlan,
      dietPlan: newDietPlan,
    });
  } catch (error: any) {
    console.error("[API] Plan regeneration error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "An unexpected error occurred while regenerating plans." },
      { status: 500 }
    );
  }
}

