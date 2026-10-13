"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("creator@creatorflow.io");
  const [password, setPassword] = useState("Password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("creator@creatorflow.io");
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen bg-[#FFFFF0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <BrandLogo collapsed={false} logoWidth={200} logoHeight={72} />
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Smart Automation Platform for Modern Content Creators
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[#E8E6DF] shadow-elevated p-6 bg-white">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Sign in to your workspace</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Access your 7 automation modules and approvals
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to CreatorFlow
            </Button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">Test Creator Account:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#71A832] font-bold hover:underline"
            >
              Fill Demo Credentials
            </button>
          </div>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Don't have an account yet?{" "}
          <Link href="/register" className="text-[#71A832] font-bold hover:underline">
            Create creator workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
