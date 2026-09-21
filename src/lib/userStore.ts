import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string | null;
  role: string;
  avatar?: string | null;
  createdAt: string;
  memberProfile?: any;
  trainerProfile?: any;
}

const TMP_FILE_PATH = path.join("/tmp", "apex_registered_users.json");

// Maintain global in-memory cache across hot reloads / lambdas in warm containers
const globalStore = globalThis as unknown as {
  __registeredUsers?: Map<string, StoredUser>;
};

if (!globalStore.__registeredUsers) {
  globalStore.__registeredUsers = new Map<string, StoredUser>();
  initializeDefaultUsers();
}

function initializeDefaultUsers() {
  const defaultPasswordHash = bcrypt.hashSync("password123", 10);

  const demoUsers: StoredUser[] = [
    {
      id: "usr-admin-1",
      email: "chetan@fitnessdrive.com",
      passwordHash: defaultPasswordHash,
      name: "Chetan (Owner)",
      phone: "+91 88800 77188",
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chetan",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-trainer-1",
      email: "venki@fitnessdrive.com",
      passwordHash: defaultPasswordHash,
      name: "Venkatesh (Head Trainer)",
      phone: "+91 99000 11223",
      role: "TRAINER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Venkatesh",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr-member-1",
      email: "rahul@example.com",
      passwordHash: defaultPasswordHash,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      role: "MEMBER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      createdAt: new Date().toISOString(),
      memberProfile: {
        id: "mem-profile-1",
        userId: "usr-member-1",
        qrCode: "APEX-MEM-1001",
        membershipStatus: "ACTIVE",
        age: 26,
        gender: "Male",
        heightCm: 178,
        weightKg: 75,
        workoutDays: 4,
        foodPreference: "Non-Vegetarian",
        dietGoal: "Muscle Gain",
        dietBudget: 8000,
        dietBudgetPeriod: "MONTHLY",
      },
    },
  ];

  demoUsers.forEach((u) => {
    globalStore.__registeredUsers!.set(u.email.toLowerCase(), u);
  });

  // Try reading persisted /tmp users
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const data = fs.readFileSync(TMP_FILE_PATH, "utf-8");
      const parsed: StoredUser[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u.email) {
            globalStore.__registeredUsers!.set(u.email.toLowerCase(), u);
          }
        });
      }
    }
  } catch (err) {
    console.warn("[USER_STORE] Failed reading /tmp user file:", err);
  }
}

export function saveUserToStore(user: StoredUser): void {
  const emailKey = user.email.toLowerCase();
  globalStore.__registeredUsers!.set(emailKey, user);

  try {
    const allUsers = Array.from(globalStore.__registeredUsers!.values());
    fs.writeFileSync(TMP_FILE_PATH, JSON.stringify(allUsers, null, 2), "utf-8");
  } catch (err) {
    console.warn("[USER_STORE] Failed persisting to /tmp file:", err);
  }
}

export function findUserInStore(email: string): StoredUser | null {
  const emailKey = email.trim().toLowerCase();

  // 1. Check in-memory map
  if (globalStore.__registeredUsers!.has(emailKey)) {
    return globalStore.__registeredUsers!.get(emailKey)!;
  }

  // 2. Re-read /tmp file if available
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const data = fs.readFileSync(TMP_FILE_PATH, "utf-8");
      const parsed: StoredUser[] = JSON.parse(data);
      const found = parsed.find((u) => u.email.toLowerCase() === emailKey);
      if (found) {
        globalStore.__registeredUsers!.set(emailKey, found);
        return found;
      }
    }
  } catch (err) {
    // Ignore error
  }

  return null;
}

export function getAllStoreUsers(): StoredUser[] {
  return Array.from(globalStore.__registeredUsers!.values());
}
