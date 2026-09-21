import { INITIAL_EXERCISES } from "./seedData";
import { GeneratedWorkoutPlan, WorkoutDayPlan, WorkoutExercisePlanItem } from "@/types";

function getRandomId(): string {
  return `wex-${Math.random().toString(36).substring(2, 9)}`;
}

export interface WorkoutBiometricsAndPreferences {
  age?: number;
  gender?: string;
  weightKg?: number;
  heightCm?: number;
  dietGoal?: string;
  fitnessGoal?: string;
  workoutExperience?: string;
  equipment?: string;
  workoutType?: string;
  limitations?: string | string[];
  activityLevel?: string;
}

function findExercises(
  categoryKeywords: string[],
  count: number,
  usedIds: Set<string>,
  params: WorkoutBiometricsAndPreferences = {}
): WorkoutExercisePlanItem[] {
  const goal = params.fitnessGoal || params.dietGoal || "Muscle Gain";
  const experience = (params.workoutExperience || "Intermediate").toLowerCase();
  const equipmentPref = (params.equipment || "Full Gym").toLowerCase();
  const limitationsStr = (
    Array.isArray(params.limitations)
      ? params.limitations.join(" ")
      : params.limitations || ""
  ).toLowerCase();

  const isTricepsSearch = categoryKeywords.some((k) => k.toLowerCase().includes("tricep"));
  const isBicepsSearch = categoryKeywords.some((k) => k.toLowerCase().includes("bicep"));
  const isForearmsSearch = categoryKeywords.some((k) => k.toLowerCase().includes("forearm") || k.toLowerCase().includes("wrist"));

  const matches = INITIAL_EXERCISES.filter((ex) => {
    const mg = (ex.muscleGroup || "").toLowerCase();
    const pb = (ex.primaryBodyPart || "").toLowerCase();
    const nm = (ex.name || "").toLowerCase();
    const eq = (ex.equipment || "").toLowerCase();

    // 1. Strict muscle group category matching
    if (isTricepsSearch) {
      if (!pb.includes("triceps") && !nm.includes("tricep") && !nm.includes("skull") && !nm.includes("pushdown") && !nm.includes("dip")) {
        return false;
      }
    } else if (isBicepsSearch) {
      if (!pb.includes("biceps") && !nm.includes("bicep") && !nm.includes("curl")) {
        return false;
      }
    } else if (isForearmsSearch) {
      if (!pb.includes("forearms") && !nm.includes("wrist") && !nm.includes("reverse curl")) {
        return false;
      }
    } else {
      const categoryMatch = categoryKeywords.some(
        (kw) => mg.includes(kw) || pb.includes(kw) || nm.includes(kw)
      );
      if (!categoryMatch) return false;
    }

    // 2. Equipment filter
    if (equipmentPref.includes("bodyweight") || equipmentPref.includes("home")) {
      if (!eq.includes("bodyweight") && !eq.includes("dumbbell")) return false;
    } else if (equipmentPref.includes("dumbbell")) {
      if (!eq.includes("dumbbell") && !eq.includes("bodyweight")) return false;
    }

    // 3. Limitations filter (e.g. knee, shoulder, back)
    if (limitationsStr.includes("knee") && (nm.includes("squat") || nm.includes("lunge"))) {
      return false;
    }
    if (limitationsStr.includes("shoulder") && nm.includes("overhead")) {
      return false;
    }
    if (limitationsStr.includes("back") && (nm.includes("deadlift") || nm.includes("row"))) {
      return false;
    }

    return true;
  });

  // Fallback if filter is too restrictive
  let available = matches.filter((m) => !usedIds.has(m.id));
  if (available.length < count) {
    available = matches.length > 0 ? matches : INITIAL_EXERCISES.filter((ex) => {
      const pb = (ex.primaryBodyPart || "").toLowerCase();
      const nm = (ex.name || "").toLowerCase();
      if (isTricepsSearch) return pb.includes("triceps") || nm.includes("tricep");
      if (isBicepsSearch) return pb.includes("biceps") || nm.includes("bicep");
      return true;
    });
  }

  const selected = available.slice(0, count);

  // Dynamic sets, reps, rest time based on experience & goal
  let defaultSets = experience.includes("beginner") ? 3 : experience.includes("advanced") ? 5 : 4;
  let defaultReps = "8-12";
  let defaultRest = 60;
  let defaultInstructionPrefix = "Maintain strict posture, peak contraction, and controlled eccentric movement.";

  const normalizedGoal = goal.toLowerCase();
  if (normalizedGoal.includes("loss") || normalizedGoal.includes("fat") || normalizedGoal.includes("hiit")) {
    defaultSets = experience.includes("beginner") ? 3 : 4;
    defaultReps = "12-15";
    defaultRest = 45;
    defaultInstructionPrefix = "High-tempo execution with 45s rest to maximize metabolic calorie burn & heart rate.";
  } else if (normalizedGoal.includes("strength") || normalizedGoal.includes("power")) {
    defaultSets = experience.includes("beginner") ? 3 : 5;
    defaultReps = "5-8";
    defaultRest = 90;
    defaultInstructionPrefix = "Heavy compound movement. Rest 90s fully between sets and push weight with explosive power.";
  } else if (normalizedGoal.includes("endurance") || normalizedGoal.includes("fitness")) {
    defaultSets = 3;
    defaultReps = "12-15";
    defaultRest = 45;
    defaultInstructionPrefix = "Focus on aerobic stamina, continuous muscular tension, and high work capacity.";
  }

  // Personalization details
  const ageStr = params.age ? `${params.age}y/o` : "";
  const genderStr = params.gender || "";
  const weightStr = params.weightKg ? `${params.weightKg}kg` : "";
  const bioSummary = [ageStr, genderStr, weightStr].filter(Boolean).join(" ");
  if (bioSummary) {
    defaultInstructionPrefix = `[Personalized for ${bioSummary} - Goal: ${goal}] ${defaultInstructionPrefix}`;
  }

  if (limitationsStr.trim()) {
    defaultInstructionPrefix += ` Safety Notice: Adjusted for "${params.limitations}".`;
  }

  return selected.map((ex) => {
    usedIds.add(ex.id);
    const existingInstructions = Array.isArray(ex.instructions)
      ? ex.instructions.join(" ")
      : typeof ex.instructions === "string"
      ? ex.instructions
      : "";

    const instructionsStr = existingInstructions
      ? `${defaultInstructionPrefix} ${existingInstructions}`
      : defaultInstructionPrefix;

    return {
      id: getRandomId(),
      exerciseId: ex.id,
      name: ex.name,
      targetMuscle: ex.primaryBodyPart || ex.muscleGroup,
      imageUrl: ex.imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
      sets: defaultSets,
      reps: defaultReps,
      restSeconds: defaultRest,
      instructions: instructionsStr,
      completed: false,
    };
  });
}

export function generateWorkoutPlan(
  userId: string,
  workoutDaysCount: number,
  params: WorkoutBiometricsAndPreferences = {}
): GeneratedWorkoutPlan {
  const days: WorkoutDayPlan[] = [];
  const daysCount = [3, 4, 5, 6].includes(workoutDaysCount) ? workoutDaysCount : 4;
  const goal = params.fitnessGoal || params.dietGoal || "Muscle Gain";
  const equipment = params.equipment ? ` (${params.equipment})` : "";
  const isFatLoss = goal.toLowerCase().includes("loss") || goal.toLowerCase().includes("fat") || goal.toLowerCase().includes("hiit");
  const isStrength = goal.toLowerCase().includes("strength") || goal.toLowerCase().includes("power");

  let splitTitle = "";

  if (daysCount === 6) {
    splitTitle = isFatLoss
      ? `6-Day High-Intensity Fat Shred Circuit${equipment}`
      : isStrength
      ? `6-Day Heavy Strength & Powerlifting Split${equipment}`
      : `6-Day Push/Pull/Legs Hypertrophy Split${equipment}`;

    const usedMon = new Set<string>();
    const usedTue = new Set<string>();
    const usedWed = new Set<string>();

    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: isFatLoss ? "Chest + Triceps Fat Burn Circuit" : isStrength ? "Heavy Bench & Push Strength" : "Chest + Triceps Hypertrophy",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, params),
        ...findExercises(["tricep"], 4, usedMon, params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: isFatLoss ? "Back + Biceps Calorie Torch" : isStrength ? "Heavy Deadlift & Pull Density" : "Back + Biceps Density",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue, params),
        ...findExercises(["bicep"], 4, usedTue, params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: isFatLoss ? "Legs + Shoulders + Abs Shred" : isStrength ? "Squat Power & Core Stability" : "Legs + Shoulders + Core",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring", "calf"], 3, usedWed, params),
        ...findExercises(["shoulder", "deltoid"], 3, usedWed, params),
        ...findExercises(["ab", "core"], 3, usedWed, params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: isFatLoss ? "Upper Body High Tempo Push" : isStrength ? "Overhead Press & Push Power" : "Upper Body Push Focus",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, new Set(), params),
        ...findExercises(["tricep"], 4, new Set(), params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: isFatLoss ? "Upper Body Pull & Core Torch" : isStrength ? "Rowing & Lat Heavy Power" : "Upper Body Pull Focus",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, new Set(), params),
        ...findExercises(["bicep"], 4, new Set(), params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Saturday",
      dayNumber: 6,
      title: isFatLoss ? "Metabolic Full Body Burn" : isStrength ? "Lower Body Heavy Power" : "Lower Body + Delts Conditioning",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring", "calf"], 3, new Set(), params),
        ...findExercises(["shoulder", "deltoid"], 3, new Set(), params),
        ...findExercises(["ab", "core"], 3, new Set(), params),
      ],
      isRestDay: false,
    });

    days.push({
      dayName: "Sunday",
      dayNumber: 7,
      title: "REST DAY",
      muscleGroups: ["Recovery"],
      exercises: [],
      isRestDay: true,
    });
  } else if (daysCount === 5) {
    splitTitle = isFatLoss
      ? `5-Day Fat Loss & Calorie Burn Split${equipment}`
      : isStrength
      ? `5-Day Compound Strength & Power Split${equipment}`
      : `5-Day Advanced Hypertrophy Split${equipment}`;

    const usedMon = new Set<string>();
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: isFatLoss ? "Chest + Triceps Fat Torch" : isStrength ? "Heavy Chest Press Power" : "Chest + Triceps Power",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, params),
        ...findExercises(["tricep"], 4, usedMon, params),
      ],
      isRestDay: false,
    });

    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: isFatLoss ? "Back + Biceps Calorie Burn" : isStrength ? "Heavy Back & Pull Strength" : "Back + Biceps Thickness",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue, params),
        ...findExercises(["bicep"], 4, usedTue, params),
      ],
      isRestDay: false,
    });

    const usedWed = new Set<string>();
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: isFatLoss ? "Legs + Delts Metabolic Conditioning" : isStrength ? "Squat & Lower Body Power" : "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedWed, params),
        ...findExercises(["shoulder", "deltoid"], 3, usedWed, params),
        ...findExercises(["ab", "core"], 3, usedWed, params),
      ],
      isRestDay: false,
    });

    const usedThu = new Set<string>();
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: isFatLoss ? "Arm & Core High Tempo Circuit" : isStrength ? "Arm Strength & Stability" : "Arms & Forearms Specialization",
      muscleGroups: ["Triceps", "Biceps", "Forearms"],
      exercises: [
        ...findExercises(["tricep"], 3, usedThu, params),
        ...findExercises(["bicep"], 3, usedThu, params),
        ...findExercises(["forearm", "wrist"], 3, usedThu, params),
      ],
      isRestDay: false,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: isFatLoss ? "Full Body Calorie Torch & Abs" : isStrength ? "Full Body Heavy Compound Finish" : "Full Body Conditioning & Core",
      muscleGroups: ["Chest", "Back", "Core", "Full Body"],
      exercises: [
        ...findExercises(["chest"], 2, usedFri, params),
        ...findExercises(["back"], 2, usedFri, params),
        ...findExercises(["tricep"], 2, usedFri, params),
        ...findExercises(["ab", "core"], 2, usedFri, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Saturday", dayNumber: 6, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
    days.push({ dayName: "Sunday", dayNumber: 7, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
  } else if (daysCount === 4) {
    splitTitle = isFatLoss
      ? `4-Day Fat Shred & Metabolic Circuit Split${equipment}`
      : isStrength
      ? `4-Day Heavy Compound Strength Split${equipment}`
      : `4-Day Muscle Gain & Hypertrophy Split${equipment}`;

    const usedMon = new Set<string>();
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: isFatLoss ? "Chest & Triceps Calorie Torch" : isStrength ? "Heavy Bench & Push Focus" : "Chest + Triceps Focus",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, params),
        ...findExercises(["tricep"], 4, usedMon, params),
      ],
      isRestDay: false,
    });

    const usedTue = new Set<string>();
    days.push({
      dayName: "Tuesday",
      dayNumber: 2,
      title: isFatLoss ? "Back & Biceps Fat Burn" : isStrength ? "Heavy Pull & Lats Density" : "Back + Biceps Focus",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedTue, params),
        ...findExercises(["bicep"], 4, usedTue, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Wednesday", dayNumber: 3, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });

    const usedThu = new Set<string>();
    days.push({
      dayName: "Thursday",
      dayNumber: 4,
      title: isFatLoss ? "Legs & Shoulders HIIT Circuit" : isStrength ? "Squat & Shoulder Overhead Power" : "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedThu, params),
        ...findExercises(["shoulder", "deltoid"], 3, usedThu, params),
        ...findExercises(["ab", "core"], 3, usedThu, params),
      ],
      isRestDay: false,
    });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: isFatLoss ? "Full Body Shred & Core Blast" : isStrength ? "Arm & Core Strength Finish" : "Arms & Core Conditioning",
      muscleGroups: ["Triceps", "Biceps", "Abs"],
      exercises: [
        ...findExercises(["tricep"], 3, usedFri, params),
        ...findExercises(["bicep"], 3, usedFri, params),
        ...findExercises(["ab", "core"], 3, usedFri, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Saturday", dayNumber: 6, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
    days.push({ dayName: "Sunday", dayNumber: 7, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
  } else {
    // 3-Day Split
    splitTitle = isFatLoss
      ? `3-Day Full Body Fat-Loss Foundation Split${equipment}`
      : isStrength
      ? `3-Day Heavy Power & Compound Foundation Split${equipment}`
      : `3-Day Muscle Building Foundation Split${equipment}`;

    const usedMon = new Set<string>();
    days.push({
      dayName: "Monday",
      dayNumber: 1,
      title: isFatLoss ? "Full Body Push & Cardio Circuit" : "Chest + Triceps Routine",
      muscleGroups: ["Chest", "Triceps"],
      exercises: [
        ...findExercises(["chest"], 4, usedMon, params),
        ...findExercises(["tricep"], 4, usedMon, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Tuesday", dayNumber: 2, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });

    const usedWed = new Set<string>();
    days.push({
      dayName: "Wednesday",
      dayNumber: 3,
      title: isFatLoss ? "Full Body Pull & Core Torch" : "Back + Biceps Routine",
      muscleGroups: ["Back", "Biceps"],
      exercises: [
        ...findExercises(["back", "lats"], 4, usedWed, params),
        ...findExercises(["bicep"], 4, usedWed, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Thursday", dayNumber: 4, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });

    const usedFri = new Set<string>();
    days.push({
      dayName: "Friday",
      dayNumber: 5,
      title: isFatLoss ? "Lower Body & Metabolic HIIT" : "Legs + Shoulders + Abs",
      muscleGroups: ["Legs", "Shoulders", "Abs"],
      exercises: [
        ...findExercises(["leg", "quad", "hamstring"], 3, usedFri, params),
        ...findExercises(["shoulder", "deltoid"], 3, usedFri, params),
        ...findExercises(["ab", "core"], 3, usedFri, params),
      ],
      isRestDay: false,
    });

    days.push({ dayName: "Saturday", dayNumber: 6, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
    days.push({ dayName: "Sunday", dayNumber: 7, title: "REST DAY", muscleGroups: ["Recovery"], exercises: [], isRestDay: true });
  }

  return {
    id: `wp-${Date.now()}`,
    userId,
    workoutDays: daysCount,
    splitTitle,
    days,
    generatedAt: new Date().toISOString(),
  };
}
