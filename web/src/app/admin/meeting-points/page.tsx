'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Camera, 
  ArrowLeft,
  Sparkles,
  Map
} from 'lucide-react';
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import { UserRole, APP_ROUTES } from '@shared';

interface SafeHub {
  id: string;
  name: string;
  campus: string;
  locationDetails: string;
  securityRating: 'EXCELLENT' | 'GOOD' | 'FAIR';
  hasCamera: boolean;
  activeReservationsCount: number;
}

export default function MeetingPointsPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuthGuard(UserRole.ADMIN);
  const [hubSearch, setHubSearch] = useState('');

  // Mock data for Safe Hubs
  const [hubs, setHubs] = useState<SafeHub[]>([
    {
      id: 'hub-1',
      name: 'Thư viện Tạ Quang Bửu - Sảnh Tầng 1',
      campus: 'Đại Học Bách Khoa HN',
      locationDetails: 'Khu vực bàn ghế tự học, có bảo vệ trực 24/7 và hệ thống camera an ninh trường.',
      securityRating: 'EXCELLENT',
      hasCamera: true,
      activeReservationsCount: 4
    },
    {
      id: 'hub-2',
      name: 'Căng tin C2 - Góc thảo luận',
      campus: 'Đại Học Kinh Tế Quốc Dân',
      locationDetails: 'Bàn ngồi gần lối vào chính, đông người qua lại, bảo vệ túc trực sảnh tòa nhà.',
      securityRating: 'GOOD',
      hasCamera: true,
      activeReservationsCount: 2
    },
    {
      id: 'hub-3',
      name: 'Nhà thi đấu đa năng A3',
      campus: 'Đại Học Quốc Gia HN',
      locationDetails: 'Ghế chờ ngoài hành lang sân bóng rổ, có camera trường ghi hình trực tiếp.',
      securityRating: 'GOOD',
      hasCamera: true,
      activeReservationsCount: 0
    }
  ]);

  const filteredHubs = hubs.filter(h => 
    h.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
    h.campus.toLowerCase().includes(hubSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Map className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
        <span className="text-zinc-500 font-medium text-sm">Đang tải danh sách điểm hẹn an toàn...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeItemId="meeting-points" pageTitle="Điểm Hẹn An Toàn (Safe Hubs)">
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
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Tổng số Safe Hub: {hubs.length}</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-semibold">Điểm Hẹn Giao Dịch An Toàn (Meeting Hubs)</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Các địa điểm công cộng thuộc khuôn viên trường có lắp đặt camera bảo vệ và nhiều người qua lại để sinh viên giao dịch trực tiếp.</p>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm cơ sở, tên điểm hẹn..."
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Hub grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHubs.map((hub) => (
              <div key={hub.id} className="border border-zinc-200/80 dark:border-zinc-800/85 rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-500/10 dark:text-blue-400 px-2.5 py-0.5 rounded-lg uppercase">{hub.campus}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      hub.securityRating === 'EXCELLENT' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {hub.securityRating === 'EXCELLENT' ? 'An toàn tối đa' : 'An toàn tốt'}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{hub.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{hub.locationDetails}</p>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 flex items-center justify-between text-[11px] font-semibold mt-4">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    Camera: {hub.hasCamera ? 'Đầy đủ' : 'Ngoại cảnh'}
                  </span>
                  <span className="text-zinc-900 dark:text-white font-medium">{hub.activeReservationsCount} Lịch hẹn hôm nay</span>
                </div>
              </div>
            ))}
            {filteredHubs.length === 0 && (
              <div className="col-span-3 py-12 text-center text-xs text-zinc-400">
                Không tìm thấy điểm hẹn an toàn nào phù hợp.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
