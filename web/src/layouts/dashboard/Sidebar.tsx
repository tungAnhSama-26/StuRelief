'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { HeartHandshake, ChevronLeft } from 'lucide-react';
import { getMenuGroups } from './sidebar/menuConfig';
import ProfileFooter from './sidebar/ProfileFooter';
import { UserRole } from '@shared';

interface SidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({ activeItem, isCollapsed = false, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: UserRole; fullName: string; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng trong Sidebar:', err);
      }
    };
    fetchUser();
  }, []);

  const activeRole = currentUser?.role || UserRole.STUDENT;
  const menuItems = getMenuGroups(activeRole).flatMap((group) => group.items);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('sturelief_user');
        router.push('/');
        window.location.reload();
      }
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  return (
    <aside className={`h-screen flex flex-col justify-between border-r border-[#dfe3ea] dark:border-[#3a3b3c] bg-white dark:bg-[#242526] text-zinc-800 dark:text-zinc-200 transition-all duration-300 z-50 sticky top-0 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`p-4 flex items-center border-b border-[#dfe3ea] dark:border-[#3a3b3c] h-16 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden select-none`}>
          <div className="w-9 h-9 rounded-xl bg-[#0084ff] dark:bg-[#2d88ff] flex items-center justify-center text-white shadow-md shadow-[#0084ff]/20 shrink-0">
            <HeartHandshake className="w-5.5 h-5.5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-semibold text-sm tracking-wider uppercase text-zinc-950 dark:text-white leading-none">StuRelief</span>
            </div>
          )}
        </Link>

        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hidden lg:block cursor-pointer transition-all duration-200 active:scale-95 transform-gpu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {menuItems.map((item) => {
          const isItemActive = activeItem === item.id || pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={`flex items-center transition-all duration-200 group relative rounded-xl transform-gpu active:scale-95 ${
                isCollapsed ? 'justify-center mx-auto w-12 h-12 p-0 rounded-2xl' : 'gap-3.5 px-3 py-2.5 w-full'
              } ${
                isItemActive
                  ? `bg-[#0084ff] text-white shadow-md shadow-[#0084ff]/10 ${isCollapsed ? '' : 'scale-102'}`
                  : 'hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${isItemActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors'}`} />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 animate-fade-in">
                  <span className="text-[13px] font-medium truncate leading-snug">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <ProfileFooter currentUser={currentUser} isCollapsed={isCollapsed} onLogout={handleLogout} />
    </aside>
  );
}
