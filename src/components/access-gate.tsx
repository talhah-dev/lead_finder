"use client";

import { useState } from "react";
import { Lock, Mail, User, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, loginAs } = useAuth();

  const [mode, setMode] = useState<"register" | "signin">("register");
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && user.status === "approved") {
    return <>{children}</>;
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reqName.trim(),
          email: reqEmail.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.request?.status === "approved") {
          loginAs({
            name: data.request.name,
            email: data.request.email,
            role: data.request.role || "member",
            status: "approved",
          });
          toast.success("Access approved! Welcome to GetLead.");
        } else {
          setIsPopupOpen(true);
        }
      } else {
        toast.error(data.error || "Failed to submit access request");
      }
    } catch {
      toast.error("Network error while submitting request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setIsLoggingIn(true);
    try {
      const res = await fetch(
        `/api/auth/request-access?email=${encodeURIComponent(loginEmail.trim())}`
      );
      const data = await res.json();

      if (data.success && data.exists) {
        if (data.status === "approved") {
          loginAs({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || "member",
            status: "approved",
          });
          toast.success(`Welcome back, ${data.user.name}`);
        } else if (data.status === "pending") {
          toast.info("Your membership request is currently pending review within 24 hours.");
        } else {
          toast.error("Your access request was declined. Contact an administrator.");
        }
      } else {
        toast.error("No member account found with this email. Please request access first.");
      }
    } catch {
      toast.error("Failed to verify membership status");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Lock className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Private Access Portal</h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {mode === "register"
              ? "First time user? Enter your details below to request platform access."
              : "Welcome back! Enter your approved email to sign in."}
          </p>
        </div>

        <Card className="border shadow-xs">
          <CardContent className="pt-6">
            {mode === "register" ? (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      required
                      placeholder="e.g. Salman Khan"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      className="pl-9 h-9 text-xs"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 text-xs gap-1.5 mt-2"
                >
                  <span>{isSubmitting ? "Submitting..." : "Send Access Request"}</span>
                  <ArrowRight className="size-3.5" />
                </Button>

                <div className="pt-3 text-center border-t text-xs text-muted-foreground">
                  Already have access?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-medium text-primary hover:underline"
                  >
                    Member Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Approved Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      placeholder="e.g. khurram@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9 h-9 text-xs"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-9 text-xs gap-1.5 mt-2"
                >
                  <span>{isLoggingIn ? "Verifying..." : "Unlock GetLead"}</span>
                  <ArrowRight className="size-3.5" />
                </Button>

                <div className="pt-3 text-center border-t text-xs text-muted-foreground">
                  First time user?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="font-medium text-primary hover:underline"
                  >
                    Request Access
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center justify-center pt-3 pb-1">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Request Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 max-w-sm">
              Your request has been delivered to the administrator. All membership applications are verified and approved within 24 hours. Once approved, you will be able to access the lead search tool.
            </DialogDescription>
          </div>
          <DialogFooter className="sm:justify-center mt-2">
            <Button
              size="sm"
              onClick={() => {
                setIsPopupOpen(false);
                setReqName("");
                setReqEmail("");
              }}
              className="h-8 text-xs px-6"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
