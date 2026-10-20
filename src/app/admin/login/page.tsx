"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [email, setEmail] = useState("admin@getlead.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        loginAs({
          name: data.user.name,
          email: data.user.email,
          role: "admin",
          status: "approved",
        });
        toast.success("Welcome back, Administrator");
        router.push("/admin");
      } else {
        toast.error(data.error || "Invalid email or password");
      }
    } catch {
      toast.error("Failed to connect to authentication server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">GetLead Admin Portal</h1>
          <p className="text-xs text-muted-foreground">
            Sign in with verified administrator credentials
          </p>
        </div>

        <Card className="border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Administrator Login</CardTitle>
            <CardDescription className="text-xs">
              Restricted management console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    placeholder="admin@getlead.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    placeholder="Enter password"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-9 text-xs gap-1.5">
                {isLoading ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to GetLead</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
