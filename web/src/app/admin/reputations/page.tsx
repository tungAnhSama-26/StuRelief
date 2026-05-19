'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Filter,
  Sliders,
  X,
  User,
  ShieldCheck,
  AlertTriangle,
  History,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, APP_ROUTES } from '@shared';

interface StudentReputation {
  id: string;
  fullName: string;
  email: string;
  studentCode: string;
  reputationScore: number;
  status: string;
  avatarUrl?: string | null;
}

interface ActivityLog {
  id: string;
  userId: string;
  studentName: string;
  studentCode: string;
  delta: number;
  actionType: string;
  note: string;
  createdAt: string;
}

interface FeedbackReview {
  id: string;
  orderId: string;
  rating: number;
  body: string;
  reviewerName: string;
  reviewerAvatar?: string | null;
  reviewedName: string;
  reviewedAvatar?: string | null;
  productName: string;
  createdAt: string;
}

export default function ReputationsPage() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuthGuard(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState<'students' | 'feedbacks' | 'activities'>('students');
  
  // Data States
  const [students, setStudents] = useState<StudentReputation[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Adjustment Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentReputation | null>(null);
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(10);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reputations');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setActivities(data.activities || []);
        setFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu danh tiếng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchReputationData();
    }
  }, [authLoading, currentUser]);

  const handleAdjustReputation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !adjustmentNote) return;

    try {
      setActionLoading(true);
      const deltaValue = adjustmentType === 'increase' ? Math.abs(adjustmentDelta) : -Math.abs(adjustmentDelta);
      
      const res = await fetch('/api/admin/reputations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent.id,
          delta: deltaValue,
          note: adjustmentNote
        })
      });

      if (res.ok) {
        // Clear state & close modal
        setSelectedStudent(null);
        setAdjustmentNote('');
        setAdjustmentDelta(10);
        
        // Refresh data list
        await fetchReputationData();
      }
    } catch (err) {
      console.error('Lỗi khi điều chỉnh điểm uy tín:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations
  const averageReputation = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.reputationScore, 0) / students.length)
    : 100;

  const positiveFeedbackRate = feedbacks.length > 0
    ? Math.round((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100)
    : 100;

  const lowReputationCount = students.filter(s => s.reputationScore < 85).length;

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(a => 
    a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeedbacks = feedbacks.filter(f => 
    f.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.reviewedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Award className="w-12 h-12 text-blue-600 animate-bounce mb-4" />
        <span className="text-zinc-500 font-medium text-sm">Đang tải phân hệ uy tín & đánh giá...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="reputations" pageTitle="Uy Tín & Đánh Giá Sinh Viên">
      <div className="space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push(APP_ROUTES.ADMIN.DASHBOARD)} 
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Dashboard Tổng Quan</span>
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Avg score */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Uy tín trung bình</span>
              <span className="text-2xl font-black tracking-tight">{averageReputation}</span>
              <span className="text-[10px] text-emerald-500 font-bold block">Đạt chuẩn an toàn</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Feedback rate */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Tỷ lệ hài lòng</span>
              <span className="text-2xl font-black tracking-tight">{positiveFeedbackRate}%</span>
              <span className="text-[10px] text-emerald-500 font-bold block">Phản hồi 4★ - 5★</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>
          </div>

          {/* Card 3: Total reviews */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Tổng đánh giá</span>
              <span className="text-2xl font-black tracking-tight">{feedbacks.length}</span>
              <span className="text-[10px] text-zinc-400 block">Được ghi nhận từ DB</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Low reputation */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Cần lưu ý</span>
              <span className="text-2xl font-black tracking-tight text-rose-500">{lowReputationCount}</span>
              <span className="text-[10px] text-rose-500/80 font-medium block">Điểm dưới 85 (Cảnh báo)</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Controls & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl w-fit self-start">
            <button
              onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'students' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}
            >
              Bảng điểm Uy tín
            </button>
            <button
              onClick={() => { setActiveTab('feedbacks'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'feedbacks' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}
            >
              Phản hồi & Feedback
            </button>
            <button
              onClick={() => { setActiveTab('activities'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'activities' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'}`}
            >
              Biến động & Nhật ký
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={activeTab === 'students' ? "Tìm theo mã SV, họ tên..." : activeTab === 'feedbacks' ? "Tìm phản hồi..." : "Tìm nhật ký..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Tab 1: Students Reputation Score Table */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/40">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Danh sách Điểm Uy tín Sinh viên</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Quản lý, theo dõi và thủ công điều chỉnh điểm uy tín của sinh viên vi phạm/tích cực.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/50">
                    <th className="p-4 pl-6">Sinh viên</th>
                    <th className="p-4">Mã số SV</th>
                    <th className="p-4">Trạng thái xác thực</th>
                    <th className="p-4 text-center">Điểm Uy tín</th>
                    <th className="p-4 text-right pr-6">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40 text-xs font-medium">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{student.fullName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-white font-bold">{student.fullName}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">{student.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">{student.studentCode}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          student.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {student.status === 'VERIFIED' ? 'Đã Xác thực' : 'Chưa Xác thực'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-extrabold px-3 py-1 rounded-xl ${
                          student.reputationScore >= 110 ? 'text-emerald-500 bg-emerald-500/5' :
                          student.reputationScore >= 95 ? 'text-blue-500 bg-blue-500/5' :
                          student.reputationScore >= 85 ? 'text-amber-500 bg-amber-500/5' : 'text-rose-500 bg-rose-500/5'
                        }`}>
                          {student.reputationScore}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Điều chỉnh điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-400">
                        Không tìm thấy sinh viên nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Feedback & Reviews Feed */}
        {activeTab === 'feedbacks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {filteredFeedbacks.map((review) => (
              <div key={review.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/50 p-5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
                
                {/* Header review details */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {review.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-950 dark:text-white font-bold text-xs">{review.reviewerName}</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Người mua đánh giá</span>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 bg-amber-500/5 px-2 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-600">{review.rating}</span>
                  </div>
                </div>

                {/* Review Body */}
                <div className="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-2xl text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed italic">
                  "{review.body}"
                </div>

                {/* Target Information */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/40 pt-3 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-zinc-400">Người bán nhận: <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{review.reviewedName}</strong></span>
                    <span className="text-zinc-400 mt-0.5">Sản phẩm: <strong className="text-zinc-500 dark:text-zinc-400">{review.productName}</strong></span>
                  </div>
                  <span className="text-zinc-400 font-medium font-mono">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

              </div>
            ))}
            {filteredFeedbacks.length === 0 && (
              <div className="col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-xs text-zinc-400 shadow-sm">
                Không tìm thấy đánh giá phản hồi nào.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Activity Fluctuations logs */}
        {activeTab === 'activities' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/40">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Lịch sử Biến động Uy tín Hệ thống</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Theo dõi lịch sử tăng điểm (+), giảm điểm (-) tự động từ giao dịch hoặc thủ công từ ban quản trị.</p>
            </div>
            
            <div className="p-4 space-y-3">
              {filteredActivities.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3.5 border border-zinc-100 dark:border-zinc-800/50 hover:border-blue-500/20 bg-zinc-50/40 dark:bg-zinc-900/30 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      log.delta > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {log.delta > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{log.studentName}</span>
                        <span className="text-[9px] font-mono text-zinc-400">({log.studentCode})</span>
                      </div>
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">{log.note}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      log.delta > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {log.delta > 0 ? `+${log.delta}` : log.delta} điểm
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium font-mono">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
              {filteredActivities.length === 0 && (
                <div className="py-12 text-center text-xs text-zinc-400">
                  Không tìm thấy biến động nào phù hợp.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ADJUST REPUTATION SCORE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up">
            
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Điều chỉnh Điểm Uy tín</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustReputation} className="p-6 space-y-5">
              
              {/* Profile Overview */}
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedStudent.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{selectedStudent.fullName}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">{selectedStudent.studentCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-400 block uppercase">Hiện tại</span>
                  <span className="text-xs font-black text-blue-600">{selectedStudent.reputationScore}đ</span>
                </div>
              </div>

              {/* Increase / Decrease Toggle */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Loại điều chỉnh</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('increase')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      adjustmentType === 'increase'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    Cộng thêm điểm (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('decrease')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      adjustmentType === 'decrease'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    Trừ bớt điểm (-)
                  </button>
                </div>
              </div>

              {/* Delta Value */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Số điểm thay đổi</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={adjustmentDelta}
                  onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Note / Justification */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Lý do điều chỉnh</span>
                <textarea
                  required
                  rows={3}
                  placeholder="Ghi rõ lý do (ví dụ: Vi phạm quy định giao dịch, Phản hồi tiêu cực từ người mua, Tích cực tham gia sàn...)"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-normal focus:outline-none focus:border-blue-600 transition-colors leading-relaxed resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`py-2.5 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-md ${
                    adjustmentType === 'increase'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                  }`}
                >
                  {actionLoading ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
