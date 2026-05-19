'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, 
  ShieldAlert, 
  MapPin, 
  Package, 
  Activity, 
  ArrowRight,
  Eye,
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, APP_ROUTES } from '@shared';

interface VerificationRequest {
  id: string;
  fullName: string;
  email: string;
  mssv: string;
  campus: string;
  cardImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}

interface DisputeCase {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  productName: string;
  reason: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  evidenceImage: string;
  date: string;
}

export default function AdminDashboardOverview() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuthGuard(UserRole.ADMIN);
  const [stats, setStats] = useState({
    verifiedStudents: 0,
    totalProducts: 0,
    pendingDisputes: 0,
    safeHubs: 0
  });
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, verRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/verifications?status=PENDING')
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        
        if (verRes.ok) {
          const verData = await verRes.json();
          setVerifications(verData);
        }
      } catch (err) {
        console.error('Lỗi khi fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Mock data for disputes if needed (or replace with real if available)
  const [disputes] = useState<DisputeCase[]>([]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Activity className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <span className="text-zinc-500 font-medium animate-pulse text-sm">Đang tải bảng điều khiển quản trị viên...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="dashboard" pageTitle="Bảng Điều Khiển Tổng Quan">
      <div className="space-y-8 animate-page-transition">
        
        {/* Stat Cards - Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Sinh viên đã xác minh', value: stats.verifiedStudents.toLocaleString(), change: '+14% tuần này', color: 'blue', icon: UserCheck },
            { title: 'Tổng tin đăng hiện tại', value: stats.totalProducts.toLocaleString(), change: '+8% từ hôm qua', color: 'indigo', icon: Package },
            { title: 'Tranh chấp cần xử lý', value: stats.pendingDisputes.toLocaleString(), change: 'Ưu tiên khẩn cấp', color: 'rose', icon: ShieldAlert },
            { title: 'Điểm hẹn Safe Hub', value: `${stats.safeHubs} địa điểm`, change: '100% có Camera', color: 'emerald', icon: MapPin }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.title}</span>
                  <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{stat.value}</h3>
                  <p className={`text-xs font-semibold ${stat.color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  stat.color === 'blue' ? 'bg-blue-600 shadow-blue-500/10' :
                  stat.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-500/10' :
                  stat.color === 'rose' ? 'bg-rose-500 shadow-rose-500/10' :
                  'bg-emerald-600 shadow-emerald-500/10'
                } group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic activity SVG Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold leading-none">Hoạt Động Trao Đổi Hệ Thống</h3>
              <p className="text-xs text-zinc-400 mt-1.5">Biểu đồ thể hiện lượt giao dịch thành công và tin đăng được duyệt trên tuần.</p>
            </div>
            <div className="flex gap-2">
              <span className="bg-blue-600 text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-xl">Tháng này</span>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[11px] font-semibold px-3.5 py-1.5 rounded-xl">Tháng trước</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-72 relative">
            <svg className="w-full h-full" viewBox="0 0 800 240" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="50" y1="30" x2="780" y2="30" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
              <line x1="50" y1="90" x2="780" y2="90" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
              <line x1="50" y1="150" x2="780" y2="150" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
              <line x1="50" y1="210" x2="780" y2="210" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />

              <path 
                d="M 50 210 L 150 150 L 250 180 L 350 90 L 450 130 L 550 50 L 650 110 L 780 40 L 780 210 Z" 
                fill="url(#chartGrad)" 
              />

              <path 
                d="M 50 210 L 150 150 L 250 180 L 350 90 L 450 130 L 550 50 L 650 110 L 780 40" 
                stroke="#2563eb" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              <circle cx="350" cy="90" r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
              <circle cx="550" cy="50" r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
              <circle cx="780" cy="40" r="6" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
            </svg>
            
            <div className="absolute top-[50px] left-[325px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3 py-1.5 rounded-xl shadow-xl flex flex-col text-[10px] font-bold z-10 border border-zinc-800/10">
              <span>Đại học Bách Khoa HN</span>
              <span className="text-blue-500 font-semibold">240 Tin xác thực</span>
            </div>
          </div>

          <div className="flex justify-between px-12 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-4">
            <span>Tuần 1</span>
            <span>Tuần 2</span>
            <span>Tuần 3</span>
            <span>Tuần 4</span>
          </div>
        </div>

        {/* Split Panels: Queue Snippets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Verification Queue */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold">Hồ Sơ Chờ Phê Duyệt</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Các yêu cầu xác minh thẻ sinh viên mới gửi lên.</p>
              </div>
              <button 
                onClick={() => router.push(APP_ROUTES.ADMIN.APPROVALS)} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {verifications.filter(v => v.status === 'PENDING').slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/35 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                      {req.fullName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate text-zinc-900 dark:text-white">{req.fullName}</span>
                      <span className="text-[10px] text-zinc-400 truncate">{req.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(APP_ROUTES.ADMIN.APPROVALS)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors shadow-sm"
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Dispute List */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold">Tranh Chấp Mới Tiếp Nhận</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Các khiếu nại chưa được phân xử giải quyết.</p>
              </div>
              <button 
                onClick={() => router.push(APP_ROUTES.ADMIN.DISPUTES)} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {disputes.slice(0, 3).map((caseItem) => (
                <div key={caseItem.id} className="flex items-start justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl border border-rose-500/10 transition-colors">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold bg-rose-500 text-white px-2 py-0.5 rounded uppercase">{caseItem.id}</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{caseItem.productName}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">Bởi: {caseItem.buyerName} tố cáo {caseItem.sellerName}</span>
                  </div>
                  <button
                    onClick={() => router.push(APP_ROUTES.ADMIN.DISPUTES)}
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
