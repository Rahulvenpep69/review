"use client";

/** Login Page - Unified AI CX Intelligence */

import { useState } from "react";
import { signIn } from "next-auth/react";
import { 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Search,
  Sparkles,
  Lock
} from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("credentials", { email, callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl shadow-black">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="mb-6">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-outfit text-white">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm max-w-[280px]">
              Access your Unified AI Customer Experience Intelligence dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-white/20 uppercase tracking-widest">or email</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="email" 
                    placeholder="Work Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : (
                  <>
                    Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Enterprise-grade security by MEDIA360
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6">
          <a href="#" className="text-xs font-medium text-white/30 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs font-medium text-white/30 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-xs font-medium text-white/30 hover:text-white transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
