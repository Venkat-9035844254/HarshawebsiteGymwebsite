"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Missing Fields", "Please enter your email and password.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);

    if (result.success && result.user) {
      showToast("Welcome Back!", `Logged in as ${result.user.name}`, "success");
      
      const targetRole = result.user.role;
      if (targetRole === "ADMIN" || targetRole === "STAFF") {
        router.push("/dashboard/admin");
      } else if (targetRole === "TRAINER") {
        router.push("/dashboard/trainer");
      } else {
        router.push("/dashboard/member");
      }
    } else {
      setIsSubmitting(false);
      showToast("Authentication Failed", result.message || "Invalid credentials provided.", "error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit mx-auto">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">Fitness Drive Portal</h2>
          <p className="text-xs text-slate-400">Sign in with your registered account to access your personal dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email Address</label>
            <div className="flex items-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-400 transition-colors">
              <Mail className="w-4 h-4 text-slate-500 shrink-0 mr-2.5" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Password</label>
            <div className="flex items-center px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-400 transition-colors">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Sign In & Access Dashboard"}
          </button>
        </form>

        {/* Quick Demo Sign-In Chips */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="block text-[10px] uppercase font-bold text-slate-500 text-center">Quick Demo Login Presets</span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setEmail("chetan@fitnessdrive.com");
                setPassword("password123");
              }}
              className="px-2 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-bold transition-all text-center flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("venki@fitnessdrive.com");
                setPassword("password123");
              }}
              className="px-2 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold transition-all text-center flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Trainer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("rahul@example.com");
                setPassword("password123");
              }}
              className="px-2 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 font-bold transition-all text-center flex items-center justify-center gap-1"
            >
              <Dumbbell className="w-3.5 h-3.5" /> Member
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-cyan-400 font-bold hover:underline">
            Register Member Account
          </Link>
        </div>
      </div>
    </div>
  );
}
