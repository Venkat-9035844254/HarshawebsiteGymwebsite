import {
  FoodPreference,
  DietGoal,
  DietBudgetPeriod,
  GeneratedDietPlan,
  DietDayPlan,
  DietMealItem,
} from "@/types";

interface Biometrics {
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  workoutDays?: number;
}

interface MealOption {
  name: string;
  items: string[];
  quantity: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  costInr: number;
  tags: ("VEG" | "EGG" | "NON_VEG")[];
  goalCategory: "FAT_LOSS" | "MUSCLE_GAIN" | "ANY";
}

const BREAKFAST_OPTIONS: MealOption[] = [
  {
    name: "Classic Anabolic Oats & Peanut Butter",
    items: ["Rolled Oats (60g)", "Skimmed Milk (250ml)", "Peanut Butter (1 tbsp)", "Banana (1)"],
    quantity: "1 Large Bowl",
    calories: 480,
    proteinGrams: 22,
    carbsGrams: 68,
    fatsGrams: 14,
    costInr: 35,
    tags: ["VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
  {
    name: "High Protein Boiled Eggs & Whole Wheat Toast",
    items: ["Boiled Whole Eggs (2)", "Egg Whites (2)", "Whole Wheat Bread (2 Slices)", "Green Chutney"],
    quantity: "4 Eggs + 2 Toast",
    calories: 420,
    proteinGrams: 30,
    carbsGrams: 32,
    fatsGrams: 16,
    costInr: 32,
    tags: ["EGG"],
    goalCategory: "ANY",
  },
  {
    name: "Lean Egg White Omelette & Avocado Toast",
    items: ["Egg Whites (4)", "Whole Wheat Toast (1 Slice)", "Sliced Tomatoes & Spinach", "Black Pepper"],
    quantity: "4 Egg Whites + 1 Toast",
    calories: 260,
    proteinGrams: 26,
    carbsGrams: 18,
    fatsGrams: 6,
    costInr: 28,
    tags: ["EGG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Paneer & Vegetable Stuffed Paratha",
    items: ["Grating Fresh Paneer (80g)", "Whole Wheat Paratha (2)", "Fresh Curd (100g)"],
    quantity: "2 Parathas + Curd",
    calories: 520,
    proteinGrams: 24,
    carbsGrams: 58,
    fatsGrams: 20,
    costInr: 45,
    tags: ["VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
  {
    name: "South Indian Idli & Sambhar Protein Bowl",
    items: ["Steamed Idli (3)", "Protein Sambhar (1 Bowl)", "Sprouted Moong Salad (50g)"],
    quantity: "3 Idlis + Sprouts",
    calories: 390,
    proteinGrams: 18,
    carbsGrams: 68,
    fatsGrams: 5,
    costInr: 30,
    tags: ["VEG"],
    goalCategory: "FAT_LOSS",
  },
];

const MID_MORNING_OPTIONS: MealOption[] = [
  {
    name: "Roasted Chana & Fresh Fruit",
    items: ["Roasted Black Chana (50g)", "Apple or Guava (1)"],
    quantity: "1 Bowl + 1 Fruit",
    calories: 220,
    proteinGrams: 11,
    carbsGrams: 38,
    fatsGrams: 3,
    costInr: 18,
    tags: ["VEG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Egg White Bhurji Snack",
    items: ["Egg Whites (3)", "Onions & Tomatoes", "Brown Toast (1)"],
    quantity: "3 Egg Whites",
    calories: 180,
    proteinGrams: 20,
    carbsGrams: 15,
    fatsGrams: 2,
    costInr: 22,
    tags: ["EGG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Greek Yogurt & Almond Bowl",
    items: ["Fresh Curd / Greek Yogurt (150g)", "Soaked Almonds (8)", "Honey (1 tsp)"],
    quantity: "1 Bowl",
    calories: 210,
    proteinGrams: 14,
    carbsGrams: 22,
    fatsGrams: 8,
    costInr: 30,
    tags: ["VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
];

const LUNCH_OPTIONS: MealOption[] = [
  {
    name: "Grilled Chicken Breast & Basmati Rice",
    items: ["Skinless Grilled Chicken Breast (160g)", "Steamed Basmati Rice (150g)", "Dal Tadka (1 Bowl)", "Green Salad"],
    quantity: "Full Plate Meal",
    calories: 650,
    proteinGrams: 48,
    carbsGrams: 70,
    fatsGrams: 12,
    costInr: 65,
    tags: ["NON_VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
  {
    name: "Lean Chicken Breast Salad with Olive Oil",
    items: ["Grilled Chicken Breast (180g)", "Cucumber, Tomato & Lettuce Salad", "Olive Oil Dressing (1 tsp)"],
    quantity: "1 High Protein Salad Bowl",
    calories: 380,
    proteinGrams: 52,
    carbsGrams: 14,
    fatsGrams: 10,
    costInr: 70,
    tags: ["NON_VEG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Protein Rich Soya Chunk & Rice Bowl",
    items: ["Nutri Soya Chunks (60g)", "Jeera Rice (150g)", "Panchratan Dal (1 Bowl)", "Cucumber Salad"],
    quantity: "Full Plate Meal",
    calories: 580,
    proteinGrams: 42,
    carbsGrams: 78,
    fatsGrams: 8,
    costInr: 35,
    tags: ["VEG"],
    goalCategory: "ANY",
  },
  {
    name: "Egg Curry & Multigrain Chapati Meal",
    items: ["Boiled Egg Curry (3 Eggs)", "Multigrain Chapati (3)", "Mixed Veg Salad"],
    quantity: "3 Eggs + 3 Roti",
    calories: 560,
    proteinGrams: 32,
    carbsGrams: 60,
    fatsGrams: 16,
    costInr: 40,
    tags: ["EGG"],
    goalCategory: "ANY",
  },
  {
    name: "Desi Paneer Bhurji & Roti",
    items: ["Low-fat Paneer (120g)", "Multigrain Roti (3)", "Yellow Arhar Dal (1 Bowl)", "Curd (100g)"],
    quantity: "Full Plate Meal",
    calories: 640,
    proteinGrams: 36,
    carbsGrams: 64,
    fatsGrams: 20,
    costInr: 60,
    tags: ["VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
];

const EVENING_SNACK_OPTIONS: MealOption[] = [
  {
    name: "Sprouted Moong & Peanut Chaat",
    items: ["Steamed Sprouted Moong (80g)", "Roasted Peanuts (25g)", "Lemon & Chaat Masala"],
    quantity: "1 Large Bowl",
    calories: 240,
    proteinGrams: 15,
    carbsGrams: 30,
    fatsGrams: 8,
    costInr: 20,
    tags: ["VEG"],
    goalCategory: "ANY",
  },
  {
    name: "Whey Protein Shake / Buttermilk Bowl",
    items: ["Whey Protein Isolate (1 Scoop) OR Masala Chaas (300ml)", "Apple (1)"],
    quantity: "1 Shake + Fruit",
    calories: 220,
    proteinGrams: 26,
    carbsGrams: 24,
    fatsGrams: 2,
    costInr: 45,
    tags: ["VEG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Omelette Roll",
    items: ["Whole Eggs (2)", "Roti (1)", "Sliced Capsicum & Onion"],
    quantity: "1 Roll",
    calories: 300,
    proteinGrams: 18,
    carbsGrams: 26,
    fatsGrams: 12,
    costInr: 25,
    tags: ["EGG"],
    goalCategory: "MUSCLE_GAIN",
  },
];

const DINNER_OPTIONS: MealOption[] = [
  {
    name: "Steamed Fish Curry & Roti / Vegetables",
    items: ["White Fish / Rohu Fillet (160g)", "Steamed Rice or 2 Roti", "Sautéed Broccoli & Beans"],
    quantity: "Full Dinner Plate",
    calories: 480,
    proteinGrams: 42,
    carbsGrams: 46,
    fatsGrams: 8,
    costInr: 70,
    tags: ["NON_VEG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "High Protein Rajma & Brown Rice",
    items: ["Slow Cooked Rajma (1.5 Bowls)", "Brown Rice (140g)", "Mix Green Salad"],
    quantity: "1 Plate",
    calories: 540,
    proteinGrams: 26,
    carbsGrams: 84,
    fatsGrams: 7,
    costInr: 32,
    tags: ["VEG"],
    goalCategory: "ANY",
  },
  {
    name: "Grilled Tofu / Paneer Tikka & Sautéed Veggies",
    items: ["Grilled Tofu or Low-fat Paneer (140g)", "Steamed Broccoli, Bell Peppers & Zucchini", "Mint Chutney"],
    quantity: "Full Plate Meal",
    calories: 420,
    proteinGrams: 34,
    carbsGrams: 24,
    fatsGrams: 14,
    costInr: 55,
    tags: ["VEG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Clear Chicken Soup & Boiled Egg Plate",
    items: ["Clear Chicken Soup with Veggies (350ml)", "Boiled Eggs (2)", "Whole Wheat Toast (1)"],
    quantity: "Bowl + Toast",
    calories: 440,
    proteinGrams: 38,
    carbsGrams: 24,
    fatsGrams: 12,
    costInr: 50,
    tags: ["NON_VEG"],
    goalCategory: "FAT_LOSS",
  },
];

const POST_WORKOUT_OPTIONS: MealOption[] = [
  {
    name: "Post-Workout Whey & Banana Shake",
    items: ["Whey Protein (1 Scoop)", "Skimmed Milk (250ml)", "Banana (1 Large)", "Honey (1 tsp)"],
    quantity: "1 Shaker Bottle (400ml)",
    calories: 320,
    proteinGrams: 30,
    carbsGrams: 42,
    fatsGrams: 4,
    costInr: 50,
    tags: ["VEG"],
    goalCategory: "MUSCLE_GAIN",
  },
  {
    name: "Post-Workout Egg Whites & Fruit Bowl",
    items: ["Boiled Egg Whites (4)", "Fresh Papaya or Watermelon (150g)"],
    quantity: "4 Egg Whites + Fruit",
    calories: 210,
    proteinGrams: 24,
    carbsGrams: 20,
    fatsGrams: 1,
    costInr: 30,
    tags: ["EGG"],
    goalCategory: "FAT_LOSS",
  },
  {
    name: "Post-Workout Paneer / Tofu & Sprouts Bowl",
    items: ["Low-fat Paneer / Tofu (100g)", "Steamed Moong Sprouts (80g)", "Lemon Juice"],
    quantity: "1 Bowl",
    calories: 270,
    proteinGrams: 22,
    carbsGrams: 24,
    fatsGrams: 9,
    costInr: 40,
    tags: ["VEG"],
    goalCategory: "ANY",
  },
];

function filterOptions(
  options: MealOption[],
  pref: FoodPreference | string,
  goal: DietGoal | string
): MealOption[] {
  const normPref = (pref || "").toString().toLowerCase().trim();
  const normGoal = (goal || "").toString().toLowerCase().trim();
  const isFatLossGoal = normGoal.includes("loss") || normGoal.includes("fat") || normGoal.includes("cut");

  let allowed: MealOption[] = [];

  // 1. Food preference filter
  if (normPref === "vegetarian" || normPref === "veg") {
    allowed = options.filter((opt) => opt.tags.includes("VEG"));
  } else if (normPref === "vegetarian + eggs" || normPref.includes("egg") || normPref === "eggetarian") {
    allowed = options.filter((opt) => opt.tags.includes("VEG") || opt.tags.includes("EGG"));
  } else {
    allowed = options;
  }

  // 2. Goal-specific priority filter
  if (isFatLossGoal) {
    const goalMatches = allowed.filter((opt) => opt.goalCategory === "FAT_LOSS" || opt.goalCategory === "ANY");
    if (goalMatches.length > 0) return goalMatches;
  } else {
    const goalMatches = allowed.filter((opt) => opt.goalCategory === "MUSCLE_GAIN" || opt.goalCategory === "ANY");
    if (goalMatches.length > 0) return goalMatches;
  }

  return allowed.length > 0 ? allowed : options;
}

function selectMeal(
  options: MealOption[],
  pref: FoodPreference | string,
  goal: DietGoal | string,
  dayIndex: number
): MealOption {
  const allowed = filterOptions(options, pref, goal);
  if (allowed.length === 0) return options[0];
  return allowed[dayIndex % allowed.length];
}

export function generateDietPlan(
  biometrics: Biometrics,
  foodPreference: FoodPreference,
  dietGoal: DietGoal,
  dietBudget: number,
  dietBudgetPeriod: DietBudgetPeriod
): GeneratedDietPlan {
  const age = biometrics.age && biometrics.age > 0 ? biometrics.age : 25;
  const heightCm = biometrics.heightCm && biometrics.heightCm > 0 ? biometrics.heightCm : 175;
  const weightKg = biometrics.weightKg && biometrics.weightKg > 0 ? biometrics.weightKg : 70;
  const gender = (biometrics.gender || "Male").toLowerCase();
  const workoutDays = biometrics.workoutDays || 4;

  // 1. Calculate BMR (Mifflin-St Jeor formula)
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender.startsWith("f") ? bmr - 161 : bmr + 5;

  // 2. Activity Multiplier
  let activityMult = 1.4;
  if (workoutDays >= 6) activityMult = 1.65;
  else if (workoutDays === 5) activityMult = 1.55;
  else if (workoutDays === 4) activityMult = 1.45;
  else activityMult = 1.35;

  const tdee = Math.round(bmr * activityMult);

  // 3. Goal Calorie Target
  const normGoal = (dietGoal || "").toString().toLowerCase();
  let dailyCalorieTarget = tdee;
  let proteinRatio = 1.8;

  if (normGoal.includes("loss") || normGoal.includes("fat") || normGoal.includes("cut")) {
    dailyCalorieTarget = Math.max(1300, Math.round(tdee - 500));
    proteinRatio = 2.2; // 2.2g per kg for fat loss sparing lean muscle
  } else if (normGoal.includes("gain") || normGoal.includes("muscle") || normGoal.includes("bulk")) {
    dailyCalorieTarget = Math.round(tdee + 450);
    proteinRatio = 2.0; // 2.0g per kg for muscle hypertrophy
  } else {
    dailyCalorieTarget = tdee;
    proteinRatio = 1.8;
  }

  // 4. Macro Targets
  const dailyProteinTarget = Math.round(weightKg * proteinRatio);
  const dailyFatsTarget = Math.round((dailyCalorieTarget * 0.25) / 9);
  const dailyCarbsTarget = Math.max(50, Math.round((dailyCalorieTarget - dailyProteinTarget * 4 - dailyFatsTarget * 9) / 4));

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeklyPlan: DietDayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const bf = selectMeal(BREAKFAST_OPTIONS, foodPreference, dietGoal, i);
    const mm = selectMeal(MID_MORNING_OPTIONS, foodPreference, dietGoal, i);
    const lu = selectMeal(LUNCH_OPTIONS, foodPreference, dietGoal, i);
    const es = selectMeal(EVENING_SNACK_OPTIONS, foodPreference, dietGoal, i);
    const dn = selectMeal(DINNER_OPTIONS, foodPreference, dietGoal, i);
    const pw = selectMeal(POST_WORKOUT_OPTIONS, foodPreference, dietGoal, i);

    const unscaledMeals = [
      { mealType: "Breakfast" as const, option: bf },
      { mealType: "Mid-Morning Snack" as const, option: mm },
      { mealType: "Lunch" as const, option: lu },
      { mealType: "Evening Snack" as const, option: es },
      { mealType: "Dinner" as const, option: dn },
      { mealType: "Post-Workout Meal/Snack" as const, option: pw },
    ];

    const unscaledTotalCals = unscaledMeals.reduce((sum, m) => sum + m.option.calories, 0);
    const scaleFactor = Math.min(Math.max(dailyCalorieTarget / unscaledTotalCals, 0.7), 1.6);

    const meals: DietMealItem[] = unscaledMeals.map(({ mealType, option }) => {
      const scaledCals = Math.round(option.calories * scaleFactor);
      const scaledProt = Math.round(option.proteinGrams * scaleFactor);
      const scaledCarbs = Math.round(option.carbsGrams * scaleFactor);
      const scaledFats = Math.round(option.fatsGrams * scaleFactor);
      const scaledCost = Math.round(option.costInr * scaleFactor);

      // Scale item portions text
      const scaledItems = option.items.map((item) => {
        return item.replace(/(\d+)\s*(g|ml|tbsp|tsp|Slices|Eggs?)/gi, (_, numStr, unit) => {
          const num = parseInt(numStr, 10);
          const scaledNum = Math.round(num * scaleFactor);
          return `${scaledNum}${unit}`;
        });
      });

      return {
        mealType: mealType as any,
        name: option.name,
        items: scaledItems,
        quantity: `${option.quantity} (Tailored Portion)`,
        calories: scaledCals,
        proteinGrams: scaledProt,
        carbsGrams: scaledCarbs,
        fatsGrams: scaledFats,
        approxCostInr: scaledCost,
      };
    });

    const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProt = meals.reduce((sum, m) => sum + m.proteinGrams, 0);
    const totalCost = meals.reduce((sum, m) => sum + m.approxCostInr, 0);

    weeklyPlan.push({
      dayName: dayNames[i],
      dayNumber: i + 1,
      meals,
      totalCalories: totalCals,
      totalProtein: totalProt,
      totalCostInr: totalCost,
    });
  }

  // Generate 30-day monthly plan
  const monthlyPlan: DietDayPlan[] = [];
  for (let d = 0; d < 30; d++) {
    const dayRef = weeklyPlan[d % 7];
    monthlyPlan.push({
      ...dayRef,
      dayName: `Day ${d + 1} (${dayNames[d % 7]})`,
      dayNumber: d + 1,
    });
  }

  const weeklyEstimatedCost = weeklyPlan.reduce((sum, d) => sum + d.totalCostInr, 0);
  const monthlyEstimatedCost = Math.round(weeklyEstimatedCost * 4.33);

  return {
    id: `dp-${Date.now()}`,
    userId: "",
    foodPreference,
    dietGoal,
    dietBudget,
    dietBudgetPeriod,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    weeklyEstimatedCost,
    monthlyEstimatedCost,
    weeklyPlan,
    monthlyPlan,
    generatedAt: new Date().toISOString(),
  };
}
