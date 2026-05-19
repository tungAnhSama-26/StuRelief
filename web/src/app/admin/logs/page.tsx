'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, APP_ROUTES } from '@shared';

interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export default function SecurityLogsPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuthGuard(UserRole.ADMIN);

  // Mock data for Security Anomaly Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      userEmail: 'dat.nv2199@sis.hust.edu.vn',
      action: 'THAY ĐỔI GIÁ ĐỘT NGỘT',
      details: 'Sản phẩm "Sách Giải Tích 1" giảm giá đột ngột 95% từ 100k còn 5k (Dấu hiệu giao dịch ảo nhằm tăng điểm uy tín sinh viên)',
      type: 'WARNING',
      timestamp: '3 phút trước'
    },
    {
      id: 'log-2',
      userEmail: 'quan.tm2245@sis.hust.edu.vn',
      action: 'XÁC THỰC THÀNH VIÊN',
      details: 'Tải lên ảnh thẻ sinh viên và nhập email trường yêu cầu duyệt quyền truy cập.',
      type: 'INFO',
      timestamp: '10 phút trước'
    },
    {
      id: 'log-3',
      userEmail: 'huy.pd2011@sis.hust.edu.vn',
      action: 'SỬA TIN MÔ TẢ ĐANG GIAO DỊCH',
      details: 'Chỉnh sửa RAM từ 16GB xuống 8GB của sản phẩm "Dell XPS" trong khi đơn hàng ord-8832 đang ở trạng thái Giữ Chỗ.',
      type: 'CRITICAL',
      timestamp: '1 giờ trước'
    }
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Activity className="w-12 h-12 text-rose-600 animate-pulse mb-4" />
        <span className="text-zinc-500 font-medium text-sm">Đang tải nhật ký an ninh hệ thống...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="audit-logs" pageTitle="Nhật Ký An Ninh & Cảnh Báo">
      <div className="space-y-6">
        
        {/* Breadcrumb back to dashboard */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push(APP_ROUTES.ADMIN.DASHBOARD)} 
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard Tổng Quan</span>
          </button>
          
          <div className="text-[11px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-500" />
            <span>Cảnh báo khẩn cấp: {activityLogs.filter(l => l.type === 'CRITICAL' || l.type === 'WARNING').length}</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold">Nhật Ký An Ninh & Cảnh Báo Hệ Thống</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Các hành vi bất thường, thay đổi giá đột ngột, sửa tin mô tả trong giao dịch giữ chỗ...</p>
          </div>

          {/* Warning Log Feed */}
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className={`p-5 rounded-2xl border flex items-start gap-4 transition-colors ${
                log.type === 'CRITICAL' ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                log.type === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                'bg-zinc-50 dark:bg-zinc-800/35 border-zinc-200 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-300'
              }`}>
                <div className={`p-2 rounded-xl text-white ${
                  log.type === 'CRITICAL' ? 'bg-rose-500' :
                  log.type === 'WARNING' ? 'bg-amber-500' :
                  'bg-blue-600'
                }`}>
                  {log.type === 'CRITICAL' ? <ShieldAlert className="w-5 h-5" /> :
                   log.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                   <Activity className="w-5 h-5" />}
                </div>

                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider">{log.action}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{log.userEmail}</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{log.details}</p>
                  </div>
                  
                  <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
