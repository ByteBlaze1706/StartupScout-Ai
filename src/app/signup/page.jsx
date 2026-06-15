'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (auth.getUser()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await auth.signUp(email, fullName, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
          className="glass-card border border-zinc-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {error &&
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Create Founder Account</h2>
              <p className="text-xs text-zinc-500 mt-1 font-light">
                Start analyzing startup opportunities in seconds.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10">
              
              {loading ? 'Creating Account...' : 'Sign Up'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-3">
              <Link
                href="/login"
                className="text-xs text-zinc-400 hover:text-white transition-colors">
                
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>);

}