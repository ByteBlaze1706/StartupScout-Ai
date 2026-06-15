'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Key, Shield, AlertCircle,
  CheckCircle, Loader2, LogOut, Trash2, ShieldAlert } from
'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';

const AVATARS = [
{ id: 'avatar_1', name: 'Alpha Tech', emoji: '🚀' },
{ id: 'avatar_2', name: 'Beta Founder', emoji: '💡' },
{ id: 'avatar_3', name: 'Gamma Builder', emoji: '🛠️' },
{ id: 'avatar_4', name: 'Omega Scale', emoji: '📈' }];


export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('avatar_1');
  const [projects, setProjects] = useState([]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.fullName);
    }
    const savedAvatar = localStorage.getItem('startupscout_avatar') || 'avatar_1';
    setAvatar(savedAvatar);

    // Fetch projects to compute metrics
    const loadProjects = async () => {
      const list = await db.getProjects();
      setProjects(list);
    };
    loadProjects();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Profile name cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile name.');
      }

      // Update local storage cache
      localStorage.setItem('startupscout_avatar', avatar);
      const cached = localStorage.getItem('startupscout_auth_user_cache');
      if (cached) {
        const u = JSON.parse(cached);
        u.fullName = name.trim();
        localStorage.setItem('startupscout_auth_user_cache', JSON.stringify(u));
        setUser(u);
      }

      setSuccessMsg('Profile details updated successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccessMsg('Your account password has been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect old password or password parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutEverywhere = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Force page reloading
      router.push('/login');
      router.refresh();
    } catch (err) {
      setErrorMsg('Failed to complete logout action.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deleteConfirmPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      // Clear local storage and redirect
      localStorage.clear();
      setShowDeleteModal(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations for stats
  const projectsCount = projects.length;
  const reportsGenerated = projects.reduce((acc, p) => acc + (p.exportCount || 0), 0);
  const memberSince = user?.createdAt ?
  new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) :
  'June 2026';

  const selectedAvatarEmoji = AVATARS.find((a) => a.id === avatar)?.emoji || '🚀';

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-400" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-zinc-500 font-light mt-1">Configure profile details, manage security options, and review usage metrics.</p>
      </div>

      {/* Messages */}
      {successMsg &&
      <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      }
      {errorMsg &&
      <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      }

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Forms */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Card 1: Profile Settings */}
          <div className="glass-card rounded-2xl border border-zinc-900 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              <span>Founder Profile</span>
            </h3>

            {/* Avatar Display Badge */}
            <div className="flex items-center gap-4 border-b border-zinc-900 pb-4 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-2xl">
                {selectedAvatarEmoji}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-bold">Select Icon Avatar</span>
                <div className="flex gap-2">
                  {AVATARS.map((av) =>
                  <button
                    key={av.id}
                    onClick={() => setAvatar(av.id)}
                    type="button"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border transition-all ${
                    avatar === av.id ? 'bg-violet-600/20 border-violet-500 scale-105' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'}`
                    }
                    title={av.name}>
                    
                      {av.emoji}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-500 cursor-not-allowed select-none" />
                
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15 self-start disabled:opacity-50 mt-2">
                
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="glass-card rounded-2xl border border-zinc-900 p-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-violet-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                  
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-900 focus:border-violet-600 focus:outline-none text-xs text-white" />
                  
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/15 self-start disabled:opacity-50 mt-2">
                
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Statistics & Deletions */}
        <div className="flex flex-col gap-6">
          
          {/* Card 3: Usage statistics */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4 font-mono text-[10px] text-zinc-400">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Usage Stats</span>
            </h3>

            <div className="flex flex-col gap-3.5 mt-2">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Member Since:</span>
                <span className="text-zinc-200 font-semibold">{memberSince}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Projects Created:</span>
                <span className="text-violet-400 font-semibold">{projectsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">PDF Reports Generated:</span>
                <span className="text-cyan-400 font-semibold">{reportsGenerated}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Session Control (Logout everywhere / Delete account) */}
          <div className="glass-card p-6 rounded-2xl border border-zinc-900 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Security Controls</span>
            </h3>
            
            <p className="text-[10px] text-zinc-500 leading-normal mt-1">
              Actions below will invalidate session tokens or wipe stored data models.
            </p>

            <div className="flex flex-col gap-3.5 mt-2">
              <button
                onClick={handleLogoutEverywhere}
                className="w-full py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                
                <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                <span>Log Out Everywhere</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal 1: Account Deletion confirmation modal */}
      <AnimatePresence>
        {showDeleteModal &&
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col gap-5 shadow-2xl relative">
            
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span>Confirm Account Deletion</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  This action is irreversible. All of your startup research portfolios, SWOT analysis summaries, pitch deck slide models, and report counters will be deleted permanently.
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-semibold">Enter Password to Confirm</label>
                  <input
                  type="password"
                  required
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-violet-600 focus:outline-none text-xs text-white" />
                
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-zinc-900/60 pt-4 mt-2">
                  <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmPassword('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-white transition-colors">
                  
                    Cancel
                  </button>

                  <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/10">
                  
                    <span>Permanently Delete</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}