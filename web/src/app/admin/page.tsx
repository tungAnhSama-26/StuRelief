'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  ShieldAlert,
  MapPin,
  Package,
  Activity,
  ArrowRight,
  Eye,
  BarChart3,
  CheckCircle2,
  CalendarDays,
  Clock3,
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, APP_ROUTES } from '@shared';
import type { MonthlyActivitySeries } from '@/lib/adminInsights';

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
  createdAt: string;
}

interface DashboardStatsResponse {
  verifiedStudents: number;
  totalProducts: number;
  pendingDisputes: number;
  safeHubs: number;
  pendingProductPosts: number;
  chart?: {
    current: MonthlyActivitySeries;
    previous: MonthlyActivitySeries;
  };
}

type ChartTab = 'current' | 'previous';

const CHART_WIDTH = 800;
const CHART_HEIGHT = 260;
const CHART_PADDING_X = 56;
const CHART_PADDING_Y = 34;

const buildLinePath = (
  points: Array<{ x: number; y: number }>,
) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

export default function AdminDashboardOverview() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuthGuard(UserRole.ADMIN);
  const [stats, setStats] = useState<DashboardStatsResponse>({
    verifiedStudents: 0,
    totalProducts: 0,
    pendingDisputes: 0,
    safeHubs: 0,
    pendingProductPosts: 0,
  });
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [chartTab, setChartTab] = useState<ChartTab>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, verRes, disputeRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/verifications?status=PENDING'),
          fetch('/api/admin/disputes'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (verRes.ok) {
          const verData = await verRes.json();
          setVerifications(verData);
        }

        if (disputeRes.ok) {
          const disputeData = await disputeRes.json();
          setDisputes(disputeData);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Activity className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <span className="text-zinc-500 font-medium animate-pulse text-sm">Đang tải bảng điều khiển quản trị viên...</span>
      </div>
    );
  }

  const activeSeries = stats.chart?.[chartTab];
  const weeks = activeSeries?.weeks ?? [];
  const maxValue = Math.max(1, ...weeks.map((week) => Math.max(week.successfulTransactions, week.approvedPosts)));
  const chartWidth = CHART_WIDTH;
  const chartHeight = CHART_HEIGHT;
  const innerWidth = chartWidth - CHART_PADDING_X * 2;
  const innerHeight = chartHeight - CHART_PADDING_Y * 2;
  const xStep = weeks.length > 1 ? innerWidth / (weeks.length - 1) : innerWidth;
  const xFor = (index: number) => CHART_PADDING_X + index * xStep;
  const yFor = (value: number) => chartHeight - CHART_PADDING_Y - (value / maxValue) * innerHeight;

  const transactionPoints = weeks.map((week, index) => ({
    x: xFor(index),
    y: yFor(week.successfulTransactions),
  }));

  const approvedPoints = weeks.map((week, index) => ({
    x: xFor(index),
    y: yFor(week.approvedPosts),
  }));

  const transactionPath = buildLinePath(transactionPoints);
  const approvedPath = buildLinePath(approvedPoints);

  return (
    <DashboardLayout activeItemId="dashboard" pageTitle="Bảng Điều Khiển Tổng Quan">
      <div className="space-y-8 animate-page-transition">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Sinh viên đã xác minh', value: stats.verifiedStudents.toLocaleString(), color: 'blue', icon: UserCheck },
            { title: 'Tổng tin đăng hiện tại', value: stats.totalProducts.toLocaleString(), color: 'indigo', icon: Package },
            { title: 'Tranh chấp cần xử lý', value: stats.pendingDisputes.toLocaleString(), color: 'rose', icon: ShieldAlert },
            { title: 'Điểm hẹn Safe Hub', value: `${stats.safeHubs} địa điểm`, color: 'emerald', icon: MapPin },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.title}</span>
                  <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{stat.value}</h3>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                    stat.color === 'blue'
                      ? 'bg-blue-600 shadow-blue-500/10'
                      : stat.color === 'indigo'
                        ? 'bg-indigo-600 shadow-indigo-500/10'
                        : stat.color === 'rose'
                          ? 'bg-rose-500 shadow-rose-500/10'
                          : 'bg-emerald-600 shadow-emerald-500/10'
                  } group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold leading-none">Hoạt Động Trao Đổi Hệ Thống</h3>
                <p className="text-xs text-zinc-400 font-medium mt-2">Dữ liệu thật theo tháng từ giao dịch thành công và tin đăng được duyệt.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChartTab('current')}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-xl transition-colors ${
                    chartTab === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  {stats.chart?.current.label ?? 'Tháng này'}
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab('previous')}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-xl transition-colors ${
                    chartTab === 'previous'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  {stats.chart?.previous.label ?? 'Tháng trước'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {activeSeries?.totals.successfulTransactions ?? 0} giao dịch thành công
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                <BarChart3 className="w-3.5 h-3.5" />
                {activeSeries?.totals.approvedPosts ?? 0} tin đăng được duyệt
              </div>
            </div>
          </div>

          <div className="w-full h-72 relative">
            <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="transactionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="postsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((row) => {
                const y = CHART_PADDING_Y + (innerHeight / 3) * row;
                return (
                  <line
                    key={row}
                    x1={CHART_PADDING_X}
                    y1={y}
                    x2={chartWidth - CHART_PADDING_X}
                    y2={y}
                    stroke="#f4f4f5"
                    strokeWidth="1"
                    className="dark:stroke-zinc-800/50"
                  />
                );
              })}

              {transactionPoints.length > 1 && (
                <path
                  d={`${transactionPath} L ${transactionPoints[transactionPoints.length - 1].x} ${chartHeight - CHART_PADDING_Y} L ${transactionPoints[0].x} ${chartHeight - CHART_PADDING_Y} Z`}
                  fill="url(#transactionsFill)"
                />
              )}

              {approvedPoints.length > 1 && (
                <path
                  d={`${approvedPath} L ${approvedPoints[approvedPoints.length - 1].x} ${chartHeight - CHART_PADDING_Y} L ${approvedPoints[0].x} ${chartHeight - CHART_PADDING_Y} Z`}
                  fill="url(#postsFill)"
                />
              )}

              <path
                d={transactionPath}
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={approvedPath}
                stroke="#059669"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {transactionPoints.map((point, index) => (
                <circle key={`tx-${index}`} cx={point.x} cy={point.y} r="6.5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
              ))}
              {approvedPoints.map((point, index) => (
                <circle key={`post-${index}`} cx={point.x} cy={point.y} r="5.5" fill="#ffffff" stroke="#059669" strokeWidth="3" />
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-3 px-4 sm:px-12 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-4">
            {weeks.map((week) => (
              <div key={week.week} className="flex flex-col items-center gap-1">
                <span>{week.label}</span>
                <span className="text-[9px] normal-case tracking-normal text-zinc-300 dark:text-zinc-500">
                  {week.successfulTransactions + week.approvedPosts}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold">Hồ Sơ Chờ Phê Duyệt</h3>
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
              {verifications.filter((verification) => verification.status === 'PENDING').slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/35 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:scale-[1.01] transition-transform"
                >
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

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold">Tranh Chấp Mới Tiếp Nhận</h3>
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
                <div
                  key={caseItem.id}
                  className="flex items-start justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl border border-rose-500/10 transition-colors"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold bg-rose-500 text-white px-2 py-0.5 rounded uppercase">{caseItem.orderId}</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{caseItem.productName}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Bởi: {caseItem.buyerName} tố cáo {caseItem.sellerName}
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{caseItem.reason}</p>
                  </div>
                  <button
                    onClick={() => router.push(APP_ROUTES.ADMIN.DISPUTES)}
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 rounded-lg cursor-pointer transition-colors"
                    aria-label="Xem chi tiết tranh chấp"
                    title="Xem chi tiết"
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
