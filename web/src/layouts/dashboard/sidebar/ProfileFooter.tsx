'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  fullName: string;
  avatarUrl?: string | null;
}

interface ProfileFooterProps {
  currentUser: UserSession | null;
  isCollapsed: boolean;
  onLogout: () => void;
}

export default function ProfileFooter({ currentUser, isCollapsed, onLogout }: ProfileFooterProps) {
  if (currentUser) {
    return (
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-[#101419]/40">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between'} gap-2.5`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2.5 min-w-0'}`}>
            <div className={`w-8.5 h-8.5 rounded-full overflow-hidden shadow-sm border flex items-center justify-center font-black text-xs shrink-0 select-none ${currentUser.role === 'ADMIN' ? 'border-red-200 dark:border-red-900/40 bg-red-600 text-white' : 'border-zinc-200 dark:border-zinc-800 bg-blue-600 text-white'}`}>
              {currentUser.role === 'ADMIN' ? (
                <span>AD</span>
              ) : currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.fullName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-extrabold text-zinc-900 dark:text-white truncate">
                    {currentUser.fullName}
                  </span>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-black tracking-wider uppercase ${currentUser.role === 'ADMIN' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                    {currentUser.role === 'ADMIN' ? 'Admin' : 'User'}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{currentUser.email}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50/50 dark:bg-[#101419]/40">
      <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2.5'}`}>
        <div className="w-8.5 h-8.5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
          <User className="w-4.5 h-4.5" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 animate-fade-in">
            <Link href="/login" className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline block truncate">
              Đăng nhập Google
            </Link>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-0.5 truncate">Chưa đăng nhập</span>
          </div>
        )}
      </div>
    </div>
  );
}
