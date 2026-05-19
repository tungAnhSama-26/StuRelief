'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, Search, Sun, Moon, LogIn } from 'lucide-react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeItemId?: string;
  pageTitle?: string;
}

type SessionUser = {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  fullName: string;
  avatarUrl?: string | null;
};

export default function DashboardLayout({
  children,
  activeItemId,
  pageTitle = 'StuRelief Dashboard',
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCurrentUser(data.user || null);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setAuthLoaded(true);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleToggleCollapse = () => setIsCollapsed(!isCollapsed);
  const showSidebar = authLoaded && Boolean(currentUser);

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0b0f13] text-zinc-900 dark:text-zinc-100 flex transition-colors duration-300">
      {showSidebar && (
        <div className="hidden lg:block">
          <Sidebar activeItem={activeItemId} isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
        </div>
      )}

      {showSidebar && isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative flex flex-col w-72 h-full bg-white dark:bg-[#12161b] animate-slide-right">
            <div className="absolute top-3.5 right-4 z-50">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-white border border-zinc-200/50 dark:border-zinc-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <Sidebar activeItem={activeItemId} isCollapsed={false} onCloseMobile={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#12161b]/80 backdrop-blur-md sticky top-0 z-40 shrink-0 flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {showSidebar && (
              <>
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  onClick={handleToggleCollapse}
                  className="hidden lg:flex p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                  title={isCollapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="flex items-center gap-2">
              <h2 className="text-[16px] md:text-[18px] font-bold text-zinc-950 dark:text-white tracking-tight">
                {pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showSidebar ? (
              <>
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm giao dịch, tranh chấp..."
                    className="w-56 pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium text-zinc-700 dark:text-zinc-300"
                  />
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                  title={theme === 'light' ? 'Chuyển tối' : 'Chuyển sáng'}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                <button className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer relative transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          <div className="max-w-[1400px] mx-auto animate-page-transition">{children}</div>
        </main>
      </div>
    </div>
  );
}
