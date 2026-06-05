'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, LayoutDashboard, PlusCircle, History, LogOut, Menu, X, Settings 
} from 'lucide-react';
import { auth, User } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Hydrate state from client cache immediately on mount to avoid spinner flicker
    const cached = auth.getUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }

    const checkUserSession = async () => {
      // Validate session with the backend database
      const currentUser = await auth.checkSession();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    };
    checkUserSession();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Analyze Idea', href: '/dashboard/analyze', icon: <PlusCircle className="w-4 h-4" /> },
    { name: 'Project History', href: '/dashboard/projects', icon: <History className="w-4 h-4" /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030307] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030307] text-[#f4f4f5] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden h-14 border-b border-zinc-900 bg-[#06060c]/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40 w-full">
        <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">StartupScout</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 border-r border-zinc-900 bg-[#06060c] p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <div onClick={() => router.push('/')} className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shadow-violet-600/10">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              StartupScout<span className="text-violet-500 font-medium">.AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
                    ${isActive 
                      ? 'bg-violet-950/20 border-violet-900/50 text-violet-400 font-bold' 
                      : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white hover:border-zinc-900'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="flex flex-col gap-4 border-t border-zinc-900/80 pt-6">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=Founder`} 
              alt={user?.fullName || 'User Avatar'} 
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user?.fullName}</h4>
              <span className="text-[10px] text-zinc-500 font-mono truncate block">{user?.email}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-400 hover:bg-rose-950/10 hover:border-rose-950/20 transition-all border border-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen p-4 sm:p-8 lg:p-10 z-10">
        {children}
      </main>

      {/* Background glow in main container */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </div>
  );
}
