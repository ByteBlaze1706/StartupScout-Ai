'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'signup' || modeParam === 'login' || modeParam === 'forgot') {
      setMode(modeParam as any);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await auth.signIn(email, password);
        if (res.success) {
          router.push('/dashboard');
        } else {
          setError(res.error || 'Login failed');
        }
      } else if (mode === 'signup') {
        const res = await auth.signUp(email, fullName, password);
        if (res.success) {
          router.push('/dashboard');
        } else {
          setError(res.error || 'Signup failed');
        }
      } else {
        const res = await auth.resetPassword(email);
        if (res.success) {
          setSuccess(true);
        } else {
          setError(res.error || 'Reset request failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await auth.signIn('judge@startupscout.ai', 'demo1234');
      if (res.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030307] text-[#f4f4f5] flex items-center justify-center px-4 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[60%] aspect-square rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand logo header */}
        <div className="text-center mb-8">
          <div onClick={() => router.push('/')} className="inline-flex items-center gap-2 mb-4 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              StartupScout<span className="text-violet-500 font-medium">.AI</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-light">
            Validate startup viability using agentic web research
          </p>
        </div>

        {/* Card panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-zinc-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Password reset link sent! Check your inbox.</span>
            </div>
          )}

          {mode === 'forgot' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Reset Password</h2>
                <p className="text-xs text-zinc-500 mt-1 font-light">We will email you a link to reset your password.</p>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-xs text-zinc-500 hover:text-white transition-colors text-center mt-2"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Founder Account'}
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-light">
                  {mode === 'login' ? 'Sign in to access your validation portfolio.' : 'Start analyzing startup opportunities in seconds.'}
                </p>
              </div>

              {mode === 'signup' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-light"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900" /></div>
                <span className="relative px-3 text-[10px] text-zinc-500 uppercase bg-[#0d0d17] font-mono">For Hackathon Judges</span>
              </div>

              {/* High-visibility demo log-in */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl border border-dashed border-violet-500/30 hover:border-violet-400 bg-violet-950/10 hover:bg-violet-950/20 text-xs font-bold text-violet-400 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 animate-bounce" />
                <span>Instant YC-Grade Demo Access</span>
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
