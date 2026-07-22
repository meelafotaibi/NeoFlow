"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, LogIn, LogOut, ShieldCheck, Mail, Key, Sparkles } from "lucide-react";
import { auth, signInWithGoogle, logoutUser } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

export function FirebaseAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen to real Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsOpen(false);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-accent/40 text-xs font-semibold text-accent">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
            ) : (
              <UserIcon className="h-3.5 w-3.5" />
            )}
            <span>{user.displayName || user.email?.split("@")[0]}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSignOut}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
            title="Sign Out of Firebase"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/20 text-xs font-semibold h-8 glow-blue"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" /> Firebase Login
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="gradient-text text-xl flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                NeoFlow Firebase Cloud Sync
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs h-10 border flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-border/40 w-full" />
                <span className="bg-background px-2 text-[10px] uppercase text-muted-foreground font-mono">
                  Or Email
                </span>
                <div className="border-t border-border/40 w-full" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@neoflow.io"
                      className="pl-9 bg-muted/50 border-border/50 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pass" className="text-xs">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 bg-muted/50 border-border/50 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-destructive bg-destructive/10 p-2 rounded border border-destructive/20 leading-tight">
                    {errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-semibold text-xs h-9"
                >
                  {isLoading ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : isRegistering ? (
                    "Create Firebase Account"
                  ) : (
                    "Sign In with Firebase"
                  )}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline"
                  >
                    {isRegistering
                      ? "Already have an account? Sign In"
                      : "Need an account? Register"}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
