"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Key,
  Sparkles,
  Brain,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { auth, signInWithGoogle, logoutUser } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

interface AuthGateProps {
  children: React.ReactNode;
}

const features = [
  { icon: Brain, label: "Genius AI Co-Pilot", desc: "Answers any question, creates plans and tasks instantly" },
  { icon: Target, label: "Smart Goal Tracking", desc: "Financial goals, habit streaks and deadline countdowns" },
  { icon: Zap, label: "Flow State Engine", desc: "Real-time productivity scoring and Pomodoro sprints" },
  { icon: TrendingUp, label: "Cloud-Synced Data", desc: "Your data saved securely across all your devices" },
];

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null | "loading">("loading");
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check guest state or Firebase user on mount
  useEffect(() => {
    const savedGuest = localStorage.getItem("neoflow-guest-session");
    if (savedGuest === "true") {
      setIsGuest(true);
    }

    if (!auth) {
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsGuest(false);
        localStorage.removeItem("neoflow-guest-session");
      }
    });
    return () => unsubscribe();
  }, []);

  const parseAuthError = (err: any) => {
    const code = err?.code || "";
    const msg = err?.message || "";
    if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
      return "Domain unauthorized in Firebase. Enable this domain in Firebase Console -> Auth -> Settings -> Authorized Domains, or click 'Continue as Guest' below.";
    }
    if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
      return "This Sign-In provider is disabled in your Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method to enable it.";
    }
    if (code === "auth/email-already-in-use") return "This email is already registered. Try signing in.";
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") return "Incorrect email or password.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/popup-closed-by-user") return "Sign-in popup closed before completing.";
    if (msg.includes("popup")) return "Popup blocked — please allow popups for this site in your browser.";
    return msg || "Authentication failed. Please check your connection or continue as guest.";
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) { setErrorMsg("Email and password are required."); return; }
    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail(""); setPassword(""); setDisplayName("");
    } catch (err: any) {
      setErrorMsg(parseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem("neoflow-guest-session", "true");
    setIsGuest(true);
  };

  const handleGuestSignOut = () => {
    localStorage.removeItem("neoflow-guest-session");
    setIsGuest(false);
    logoutUser();
  };

  // Loading state
  if (user === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading Neo Flow...</p>
        </div>
      </div>
    );
  }

  // Authenticated (Firebase User OR Guest Mode) — show app + top pill
  if (user || isGuest) {
    const activeDisplayName = user?.displayName || user?.email?.split("@")[0] || (isGuest ? "Guest User" : "User");
    return (
      <>
        {/* Top User Status Bar */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-border/50 shadow-lg">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
              <UserIcon className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
          <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
            {activeDisplayName}
          </span>
          {isGuest && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
              Guest
            </span>
          )}
          <button
            onClick={handleGuestSignOut}
            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        {children}
      </>
    );
  }

  // Not authenticated — show full-screen auth gate
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left — Marketing panel */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative bg-gradient-to-br from-background via-primary/5 to-accent/10 p-12 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold gradient-text">Neo Flow</span>
        </div>

        {/* Hero */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 text-xs text-primary font-semibold">
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            Your Personal AI Productivity OS
          </div>
          <h1 className="text-5xl font-black leading-tight text-foreground">
            Live at your{" "}
            <span className="gradient-text">highest level.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Neo Flow is an AI-powered life operating system that helps you track goals, build habits, master finances, and execute daily with unbreakable focus.
          </p>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.label} className="flex items-start gap-3 glass p-3 rounded-xl border border-border/40">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{feat.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {["A", "M", "S", "J"].map((initial, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 border-2 border-background flex items-center justify-center text-[11px] font-bold text-white">
                {initial}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">Join thousands</span> building their best life
          </p>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold gradient-text">Neo Flow</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              {isRegistering ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRegistering ? "Start your productivity journey today" : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Social auth buttons */}
          <div className="space-y-3">
            {/* Google */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-11 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 font-semibold flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>


          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 bg-muted/40 border-border/60"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 pl-10 bg-muted/40 border-border/60"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10 bg-muted/40 border-border/60"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Authentication Note</span>
                </div>
                <p className="leading-relaxed text-[11px] opacity-90">{errorMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Create Account" : "Sign In"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle register/login */}
          <div className="space-y-3 pt-2 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
                className="text-primary font-semibold hover:underline"
              >
                {isRegistering ? "Sign In" : "Sign Up Free"}
              </button>
            </p>

            <div className="pt-2 border-t border-border/40">
              <Button
                variant="outline"
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground border-border/60"
              >
                Continue as Guest (Instant Access)
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
