import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Map } from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';

export default function MeetingPointsPage() {
  return (
    <DashboardLayout activeItemId="meeting-points" pageTitle="Điểm Hẹn An Toàn">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="relative mb-6">
          {/* Decorative glowing background */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse scale-125" />
          
          <div className="relative w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md">
            <Map className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          </div>
          
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white border-2 border-white dark:border-[#0b0f13] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-2xl font-medium tracking-tight text-zinc-950 dark:text-white mb-2">
          Tính Năng Đang Phát Triển
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm leading-relaxed mb-8">
          Chúng tôi đang tích cực xây dựng phân hệ <span className="font-medium text-zinc-800 dark:text-zinc-200">Quản lý các điểm hẹn an toàn</span> này. Trải nghiệm tuyệt vời sẽ sớm ra mắt!
        </p>

        <Link 
          href="/admin" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-5 py-2.5 rounded-xl text-xs font-medium shadow-md shadow-blue-500/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Dashboard</span>
        </Link>
      </div>
    </DashboardLayout>
  );
}
