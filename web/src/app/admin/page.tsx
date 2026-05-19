'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartHandshake, 
  LayoutDashboard, 
  UserCheck, 
  Package, 
  CalendarCheck2, 
  MapPin, 
  DollarSign, 
  Camera, 
  AlertTriangle, 
  Activity, 
  SlidersHorizontal,
  ChevronRight, 
  Search, 
  Check, 
  X, 
  ChevronLeft,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Eye,
  MessageSquare
} from 'lucide-react';
// Types for Admin Dashboard
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

interface ProductSnapshot {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    condition: string;
  };
  image: string;
  version: number;
  updatedAt: string;
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
  currentSnapshot: ProductSnapshot;
  disputeSnapshot: ProductSnapshot; // The snapshot at order time to verify if the seller edited the details (BL-02, BL-SS-09)
  date: string;
}

interface SafeHub {
  id: string;
  name: string;
  campus: string;
  locationDetails: string;
  securityRating: 'EXCELLENT' | 'GOOD' | 'FAIR';
  hasCamera: boolean;
  activeReservationsCount: number;
}

interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Search & Filters in various tabs
  const [verifySearch, setVerifySearch] = useState('');
  const [disputeSearch, setDisputeSearch] = useState('');
  const [hubSearch, setHubSearch] = useState('');

  // Selected entities for detail popups
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [showSnapshotComparison, setShowSnapshotComparison] = useState(false);

  // Interactive Mock States
  const [verifications, setVerifications] = useState<VerificationRequest[]>([
    {
      id: 'v-1',
      fullName: 'Trần Minh Quân',
      email: 'quan.tm2245@sis.hust.edu.vn',
      mssv: '20224512',
      campus: 'Bách Khoa Hà Nội',
      cardImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
      status: 'PENDING',
      date: '10 phút trước'
    },
    {
      id: 'v-2',
      fullName: 'Nguyễn Thị Hương',
      email: 'huong.nt2389@ftu.edu.vn',
      mssv: '23114589',
      campus: 'Ngoại Thương HN',
      cardImage: 'https://images.unsplash.com/photo-1544717302-de2938b81486?q=80&w=400&auto=format&fit=crop',
      status: 'PENDING',
      date: '1 giờ trước'
    },
    {
      id: 'v-3',
      fullName: 'Lê Hoàng Nam',
      email: 'nam.lh2190@rmit.edu.vn',
      mssv: 'S3972190',
      campus: 'RMIT Sài Gòn',
      cardImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      status: 'APPROVED',
      date: ' Hôm qua'
    }
  ]);

  const [disputes, setDisputes] = useState<DisputeCase[]>([
    {
      id: 'dsp-102',
      orderId: 'ord-8832',
      buyerName: 'Lê Quốc Anh',
      sellerName: 'Phạm Đức Huy',
      productName: 'Laptop Dell XPS 13 9310',
      reason: 'Người bán thay đổi RAM từ 16GB xuống 8GB sau khi tôi đặt cọc giữ chỗ và tráo đồ khi bàn giao.',
      status: 'PENDING',
      evidenceImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=400&auto=format&fit=crop',
      date: '2 giờ trước',
      currentSnapshot: {
        id: 'p-1',
        name: 'Laptop Dell XPS 13 9310',
        price: 12500000,
        category: 'Đồ công nghệ',
        description: 'Máy mỏng nhẹ, pin tốt, RAM 8GB. Thích hợp văn phòng.',
        specs: { cpu: 'Intel Core i5', ram: '8GB', storage: '256GB SSD', condition: '90%' },
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop',
        version: 2,
        updatedAt: '2 giờ trước (Ngay sau khi giao dịch thành lập)'
      },
      disputeSnapshot: {
        id: 'p-1',
        name: 'Laptop Dell XPS 13 9310 (Mô tả gốc lúc mua)',
        price: 12500000,
        category: 'Đồ công nghệ',
        description: 'Dell XPS cấu hình cực mạnh, RAM 16GB thoải mái code và thiết kế đồ họa.',
        specs: { cpu: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', condition: '95%' },
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop',
        version: 1,
        updatedAt: '1 ngày trước (Lúc người mua nhấn giữ chỗ)'
      }
    },
    {
      id: 'dsp-103',
      orderId: 'ord-7741',
      buyerName: 'Hoàng Mai Chi',
      sellerName: 'Nguyễn Văn Đạt',
      productName: 'iPad Air 4 Wifi 64GB',
      reason: 'Sản phẩm nhận được bị nứt góc màn hình lớn nhưng mô tả ghi không trầy xước.',
      status: 'INVESTIGATING',
      evidenceImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
      date: '5 giờ trước',
      currentSnapshot: {
        id: 'p-2',
        name: 'iPad Air 4 Wifi 64GB',
        price: 7900000,
        category: 'Đồ công nghệ',
        description: 'Máy dùng tốt mượt mà.',
        specs: { condition: '80% (Có nứt nhẹ kính góc)' },
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
        version: 3,
        updatedAt: '3 giờ trước'
      },
      disputeSnapshot: {
        id: 'p-2',
        name: 'iPad Air 4 Wifi 64GB',
        price: 7900000,
        category: 'Đồ công nghệ',
        description: 'iPad đẹp keng 99%, không xước sát, không cấn móp, đầy đủ sạc cáp zin.',
        specs: { condition: '99% Like New' },
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
        version: 1,
        updatedAt: 'Hôm qua'
      }
    }
  ]);

  const [hubs, setHubs] = useState<SafeHub[]>([
    {
      id: 'hub-1',
      name: 'Thư viện Tạ Quang Bửu - Sảnh Tầng 1',
      campus: 'Đại Học Bách Khoa HN',
      locationDetails: 'Khu vực bàn ghế tự học, có bảo vệ trực 24/7 và hệ thống camera an ninh.',
      securityRating: 'EXCELLENT',
      hasCamera: true,
      activeReservationsCount: 4
    },
    {
      id: 'hub-2',
      name: 'Căng tin C2 - Góc thảo luận',
      campus: 'Đại Học Kinh Tế Quốc Dân',
      locationDetails: 'Bàn ngồi gần lối vào chính, đông người qua lại, bảo vệ túc trực sảnh.',
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

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      userEmail: 'dat.nv2199@sis.hust.edu.vn',
      action: 'THAY ĐỔI GIÁ ĐỘT NGỘT',
      details: 'Sản phẩm "Sách Giải Tích 1" giảm giá đột ngột 95% từ 100k còn 5k (Dấu hiệu giao dịch ảo nhằm tăng điểm uy tín)',
      type: 'WARNING',
      timestamp: '3 phút trước'
    },
    {
      id: 'log-2',
      userEmail: 'quan.tm2245@sis.hust.edu.vn',
      action: 'XÁC THỰC THÀNH VIÊN',
      details: 'Tải lên ảnh thẻ sinh viên và nhập email trường yêu cầu duyệt quyền.',
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

  // Auth Protection Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role === 'ADMIN') {
            setCurrentUser(data.user);
          } else {
            router.push('/login'); // Redirect standard users
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Lỗi phân quyền admin:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Handle Verification Actions
  const handleVerifyRequest = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setVerifications(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    
    // Add to activity logs
    const req = verifications.find(r => r.id === id);
    if (req) {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userEmail: req.email,
        action: action === 'APPROVED' ? 'XÁC THỰC THÀNH CÔNG' : 'TỪ CHỐI XÁC THỰC',
        details: action === 'APPROVED' 
          ? `Admin đã phê duyệt tài khoản sinh viên MSSV ${req.mssv}.` 
          : `Admin từ chối xác thực thẻ sinh viên của ${req.fullName}.`,
        type: action === 'APPROVED' ? 'INFO' : 'WARNING',
        timestamp: 'Vừa xong'
      };
      setActivityLogs([newLog, ...activityLogs]);
    }
    
    setSelectedVerification(null);
  };

  // Handle Dispute Resolution
  const handleResolveDispute = (id: string, action: 'RESOLVED') => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
    
    const dsp = disputes.find(d => d.id === id);
    if (dsp) {
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userEmail: 'admin@sturelief.vn',
        action: 'GIẢI QUYẾT TRANH CHẤP',
        details: `Tranh chấp dsp-${dsp.id} đã giải quyết. Khôi phục mô tả sản phẩm gốc của người bán và phạt trừ 20 điểm uy tín đối phương.`,
        type: 'INFO',
        timestamp: 'Vừa xong'
      };
      setActivityLogs([newLog, ...activityLogs]);
    }
    setSelectedDispute(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Activity className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <span className="text-zinc-500 font-medium animate-pulse text-sm">Đang tải bảng điều khiển quản trị viên...</span>
      </div>
    );
  }

  // Filter lists based on tab & search
  const filteredVerifications = verifications.filter(v => 
    v.fullName.toLowerCase().includes(verifySearch.toLowerCase()) ||
    v.mssv.includes(verifySearch) ||
    v.email.toLowerCase().includes(verifySearch.toLowerCase())
  );

  const filteredDisputes = disputes.filter(d => 
    d.buyerName.toLowerCase().includes(disputeSearch.toLowerCase()) ||
    d.productName.toLowerCase().includes(disputeSearch.toLowerCase()) ||
    d.id.includes(disputeSearch)
  );

  const filteredHubs = hubs.filter(h => 
    h.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
    h.campus.toLowerCase().includes(hubSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-white flex font-sans transition-colors duration-300">
      
      {/* ========================================== */}
      {/* LEFT SIDEBAR - Pixel Perfect Reference Match */}
      {/* ========================================== */}
      <aside 
        className={`bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        
        {/* Brand Logo & Collapse Panel */}
        <div className={`h-20 flex items-center border-b border-zinc-100 dark:border-zinc-800/60 relative ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-6'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden shrink-0">
            <div className="w-10 h-10 min-w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-medium text-lg tracking-wide uppercase leading-none">StuRelief</span>
                <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-1">Hệ Thống Admin</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl border border-zinc-200/60 dark:border-zinc-800 transition-all duration-200 flex items-center justify-center cursor-pointer ${
              sidebarCollapsed 
                ? 'absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-zinc-900 shadow-md z-50 p-0 border border-zinc-200 dark:border-zinc-800' 
                : 'p-1.5'
            }`}
            title={sidebarCollapsed ? "Mở rộng menu" : "Thu nhỏ menu"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Navigation Items (BL Menu structure matching Edaca image sidebar) */}
        <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto transition-all ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          
          {/* Section Indicator */}
          {!sidebarCollapsed && (
            <div className="px-3 mb-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Điều khiển cốt lõi
            </div>
          )}

          {/* Menu Button Maker */}
          {[
            { id: 'dashboard', label: 'Tổng quan (Dashboard)', icon: LayoutDashboard },
            { id: 'verification', label: 'Xác thực sinh viên', icon: UserCheck, badge: verifications.filter(v => v.status === 'PENDING').length },
            { id: 'disputes', label: 'Giải quyết tranh chấp', icon: ShieldAlert, badge: disputes.filter(d => d.status === 'PENDING').length },
            { id: 'hubs', label: 'Điểm hẹn an toàn', icon: MapPin },
            { id: 'logs', label: 'Nhật ký an ninh', icon: Activity, badge: activityLogs.filter(l => l.type === 'CRITICAL' || l.type === 'WARNING').length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center transition-all duration-200 group cursor-pointer ${
                  sidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'justify-between px-3.5 py-3 rounded-2xl'
                } ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                  )}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {item.badge && item.badge > 0 ? (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white text-blue-600' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-zinc-300 dark:text-zinc-600'}`} />
                  </div>
                )}
              </button>
            );
          })}

          {!sidebarCollapsed && (
            <div className="px-3 pt-6 mb-3 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-t border-zinc-100 dark:border-zinc-800/40">
              Kiểm duyệt Backlog
            </div>
          )}

          {[
            { id: 'products', label: 'Danh mục & Cấu hình', icon: Package },
            { id: 'reservations', label: 'Lịch hẹn (Reservation)', icon: CalendarCheck2 },
            { id: 'negotiations', label: 'Mặc cả & Lời đề nghị', icon: DollarSign },
            { id: 'evidence', label: 'Bàn giao & Evidence', icon: Camera },
            { id: 'reputation', label: 'Điểm uy tín sinh viên', icon: Award },
            { id: 'chats', label: 'Thanh tra Tin nhắn', icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center transition-all duration-200 group cursor-pointer ${
                  sidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'justify-between px-3.5 py-3 rounded-2xl'
                } ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white' : 'text-zinc-300 dark:text-zinc-600'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/30 p-2.5 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-medium text-xs shadow-md">
              AD
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-zinc-900 dark:text-white truncate">Administrator</span>
                <span className="text-[10px] font-normal text-zinc-400 truncate">admin@sturelief.vn</span>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* ========================================== */}
      {/* RIGHT CONTENT WORKSPACE */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Section */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/60 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-white/95 dark:bg-zinc-900/95">
          <div className="flex flex-col">
            <h2 className="text-[16px] md:text-[18px] font-bold text-zinc-950 dark:text-white tracking-tight capitalize">
              {activeMenu === 'dashboard' ? 'Bảng Điều Khiển Tổng Quan' : activeMenu.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Máy chủ: Hoạt động</span>
            </div>
            
            {/* System Config Indicator */}
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Về Trang Chủ
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 animate-page-transition">
          
          {/* ========================================================================= */}
          {/* MENU VIEW: OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Stat Cards - Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Sinh viên đã xác minh', value: '184', change: '+14% tuần này', color: 'blue', icon: UserCheck },
                  { title: 'Tổng tin đăng hiện tại', value: '3,842', change: '+8% từ hôm qua', color: 'indigo', icon: Package },
                  { title: 'Tranh chấp cần xử lý', value: disputes.filter(d => d.status === 'PENDING').length.toString(), change: 'Ưu tiên khẩn cấp', color: 'rose', icon: ShieldAlert },
                  { title: 'Điểm hẹn Safe Hub', value: '8 địa điểm', change: '100% có Camera', color: 'emerald', icon: MapPin }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300">
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.title}</span>
                        <h3 className="text-3xl font-normal tracking-tight">{stat.value}</h3>
                        <p className={`text-xs font-medium ${stat.color === 'rose' ? 'text-rose-500' : 'text-emerald-500'}`}>{stat.change}</p>
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
                    <h3 className="text-lg font-medium leading-none">Hoạt Động Trao Đổi Hệ Thống</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-600 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl">Tháng này</span>
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[11px] font-medium px-3 py-1.5 rounded-xl">Tháng trước</span>
                  </div>
                </div>

                {/* SVG Chart */}
                <div className="w-full h-72 relative">
                  <svg className="w-full h-full" viewBox="0 0 800 240" fill="none" preserveAspectRatio="none">
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-axis gridlines */}
                    <line x1="50" y1="30" x2="780" y2="30" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
                    <line x1="50" y1="90" x2="780" y2="90" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
                    <line x1="50" y1="150" x2="780" y2="150" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />
                    <line x1="50" y1="210" x2="780" y2="210" stroke="#f4f4f5" strokeWidth="1" className="dark:stroke-zinc-800/50" />

                    {/* Gradient Area under line */}
                    <path 
                       d="M 50 210 L 150 150 L 250 180 L 350 90 L 450 130 L 550 50 L 650 110 L 780 40 L 780 210 Z" 
                      fill="url(#chartGrad)" 
                    />

                    {/* Premium Line Chart */}
                    <path 
                      d="M 50 210 L 150 150 L 250 180 L 350 90 L 450 130 L 550 50 L 650 110 L 780 40" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Hover Nodes */}
                    <circle cx="350" cy="90" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="3" className="shadow-lg" />
                    <circle cx="550" cy="50" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="3" className="shadow-lg" />
                    <circle cx="780" cy="40" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="3" className="shadow-lg" />
                  </svg>
                  
                  {/* Custom Tooltip Mockup on the node */}
                  <div className="absolute top-[50px] left-[325px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3 py-1.5 rounded-xl shadow-xl flex flex-col text-[10px] font-medium z-10 border border-zinc-800/10 dark:border-zinc-200">
                    <span>Đại học BK HN</span>
                    <span className="text-blue-500 font-medium">240 Tin xác thực</span>
                  </div>
                </div>

                <div className="flex justify-between px-12 text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-4">
                  <span>Tuần 1</span>
                  <span>Tuần 2</span>
                  <span>Tuần 3</span>
                  <span>Tuần 4</span>
                </div>
              </div>

              {/* Split Panels: Dynamic Tables & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Panel: Verification Queue */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-medium">Hồ Sơ Chờ Phê Duyệt</h3>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('verification')} 
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {verifications.filter(v => v.status === 'PENDING').slice(0, 3).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/35 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:scale-[1.01] transition-transform">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium text-sm">
                            {req.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate">{req.fullName}</span>
                            <span className="text-[10px] text-zinc-400 truncate">{req.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedVerification(req)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded-lg cursor-pointer"
                          >
                            Duyệt hồ sơ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel: Dispute List */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-medium">Tranh Chấp Trực Tuyến</h3>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('disputes')} 
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {disputes.map((caseItem) => (
                      <div key={caseItem.id} className="flex items-start justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl border border-rose-500/10 transition-colors">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium bg-rose-500 text-white px-2 py-0.5 rounded-md uppercase">{caseItem.id}</span>
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{caseItem.productName}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Bởi: {caseItem.buyerName} tố cáo {caseItem.sellerName}</span>
                        </div>
                        <button
                          onClick={() => setSelectedDispute(caseItem)}
                          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* MENU VIEW: STUDENT VERIFICATION MODULE (BL-01, BL-ID-01) */}
          {/* ========================================================================= */}
          {activeMenu === 'verification' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Xét duyệt thẻ sinh viên & Email trường</h3>
                </div>
                
                {/* Search box */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên, MSSV, Email..."
                    value={verifySearch}
                    onChange={(e) => setVerifySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Verifications list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
                      <th className="py-3 px-4">Sinh viên</th>
                      <th className="py-3 px-4">Mã số sinh viên (MSSV)</th>
                      <th className="py-3 px-4">Cơ sở trường</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVerifications.map((req) => (
                      <tr key={req.id} className="border-b border-zinc-100 dark:border-zinc-800/40 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-white">{req.fullName}</span>
                            <span className="text-[10px] text-zinc-400 mt-0.5">{req.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium">{req.mssv}</td>
                        <td className="py-4 px-4 font-medium text-zinc-500 dark:text-zinc-400">{req.campus}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase ${
                            req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            req.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {req.status === 'APPROVED' ? 'Đã duyệt' :
                             req.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedVerification(req)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[11px] cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU VIEW: DISPUTE & SNAPSHOT ROLLBACK MODULE (BL-02, BL-SS-09) */}
          {/* ========================================================================= */}
          {activeMenu === 'disputes' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Đối soát & Xử lý Tranh chấp</h3>
                </div>
                
                {/* Search Box */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tìm mã dsp, người mua..."
                    value={disputeSearch}
                    onChange={(e) => setDisputeSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Disputes list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDisputes.map((caseItem) => (
                  <div key={caseItem.id} className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium bg-rose-500 text-white px-2 py-0.5 rounded uppercase">{caseItem.id}</span>
                        <span className="text-xs text-zinc-400 font-medium">Đơn hàng: {caseItem.orderId}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-medium uppercase ${
                        caseItem.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        caseItem.status === 'INVESTIGATING' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {caseItem.status === 'RESOLVED' ? 'Đã phân xử' :
                         caseItem.status === 'INVESTIGATING' ? 'Đang điều tra' : 'Mới tiếp nhận'}
                      </span>
                    </div>

                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">{caseItem.productName}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                      <strong>Lý do khiếu nại:</strong> {caseItem.reason}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
                      <div className="flex flex-col text-[10px] font-medium text-zinc-400 uppercase">
                        <span>Người tố cáo: {caseItem.buyerName}</span>
                        <span className="mt-0.5">Người bị tố: {caseItem.sellerName}</span>
                      </div>
                      
                      <button
                        onClick={() => setSelectedDispute(caseItem)}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Kiểm tra Snapshot</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ========================================================================= */}
          {/* MENU VIEW: MEETING POINTS (SAFE HUBS) MODULE (BL-04, ST-07, BL-OR-07) */}
          {/* ========================================================================= */}
          {activeMenu === 'hubs' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Điểm Hẹn Giao Dịch An Toàn (Meeting Hubs)</h3>
                </div>
                
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Tìm cơ sở, tên điểm hẹn..."
                    value={hubSearch}
                    onChange={(e) => setHubSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Hub grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredHubs.map((hub) => (
                  <div key={hub.id} className="border border-zinc-200/80 dark:border-zinc-800/85 rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded uppercase">{hub.campus}</span>
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full uppercase ${
                          hub.securityRating === 'EXCELLENT' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {hub.securityRating === 'EXCELLENT' ? 'An toàn tối đa' : 'An toàn tốt'}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">{hub.name}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">{hub.locationDetails}</p>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 flex items-center justify-between text-[11px] font-medium">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        Camera bảo vệ: {hub.hasCamera ? 'Đầy đủ' : 'Ngoại cảnh'}
                      </span>
                      <span className="text-zinc-900 dark:text-white font-medium">{hub.activeReservationsCount} Lịch hẹn hôm nay</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU VIEW: ANOMALY & SECURITY LOGS MODULE (BL-AD-12) */}
          {/* ========================================================================= */}
          {activeMenu === 'logs' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Nhật Ký An Ninh & Cảnh Báo Hệ Thống</h3>
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
                          <span className="text-xs font-medium uppercase tracking-wider">{log.action}</span>
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
          )}

          {/* ========================================================================= */}
          {/* FALLBACK FOR UNIMPLEMENTED BACKLOG MENUS */}
          {/* ========================================================================= */}
          {['products', 'reservations', 'negotiations', 'evidence', 'reputation', 'chats'].includes(activeMenu) && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-12 text-center shadow-sm">
              <SlidersHorizontal className="w-12 h-12 text-zinc-400 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-1">Mục Đang Thiết Lập</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Bảng quản lý phân mục <strong>{activeMenu.toUpperCase()}</strong> đang hoạt động tự động trong backend. Vui lòng quay lại sau!
              </p>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. STUDENT CARD VERIFICATION MODAL POPUP */}
      {/* ========================================================================= */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Chi tiết Thẻ Sinh Viên</h3>
              </div>
              <button 
                onClick={() => setSelectedVerification(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Photo Display Card */}
              <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700">
                <img
                  src={selectedVerification.cardImage}
                  alt="Thẻ sinh viên"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Data fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider">Họ và tên</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.fullName}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider">Mã số sinh viên (MSSV)</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.mssv}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider">Email trường cấp</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5 truncate">{selectedVerification.email}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-medium tracking-wider">Cơ sở (Campus)</span>
                  <p className="font-medium text-zinc-950 dark:text-white mt-0.5">{selectedVerification.campus}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedVerification.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
                  <button
                    onClick={() => handleVerifyRequest(selectedVerification.id, 'REJECTED')}
                    className="py-3 border border-rose-500/20 hover:bg-rose-500/5 text-rose-500 text-xs font-medium rounded-2xl cursor-pointer"
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => handleVerifyRequest(selectedVerification.id, 'APPROVED')}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-2xl cursor-pointer"
                  >
                    Duyệt hoạt động
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DISPUTE & HIGH-FIDELITY SNAPSHOT COMPARISON MODAL (BL-02, BL-SS-09) */}
      {/* ========================================================================= */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Chi tiết đối chất Tranh Chấp</h3>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Dispute facts */}
              <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-medium uppercase text-rose-500">Lý do khiếu nại của người mua:</span>
                  <p className="mt-1 font-normal text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedDispute.reason}</p>
                </div>
              </div>

              {/* Toggle to Snapshot Compare (The magical highlight!) */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Xem vết thay đổi sản phẩm:</span>
                <button
                  onClick={() => setShowSnapshotComparison(!showSnapshotComparison)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  {showSnapshotComparison ? 'Xem bằng chứng bàn giao' : 'So sánh Snapshot Tin đăng'}
                </button>
              </div>

              {/* Dynamic View panels */}
              {showSnapshotComparison ? (
                /* High Fidelity Snapshot Side-by-Side Comparison */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Original Snapshot at purchase */}
                  <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium bg-emerald-500 text-white px-2 py-0.5 rounded">BẢN MÔ TẢ GỐC</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{selectedDispute.disputeSnapshot.updatedAt}</span>
                    </div>

                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white">{selectedDispute.disputeSnapshot.name}</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">Giá niêm yết:</span>
                        <span className="font-medium text-emerald-500">{(selectedDispute.disputeSnapshot.price).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">Tình trạng:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedDispute.disputeSnapshot.specs.condition}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">RAM:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{selectedDispute.disputeSnapshot.specs.ram}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-zinc-400 font-normal">CPU:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedDispute.disputeSnapshot.specs.cpu}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl text-xs font-normal leading-relaxed text-zinc-500 dark:text-zinc-400">
                      <strong>Chi tiết mô tả:</strong> {selectedDispute.disputeSnapshot.description}
                    </div>
                  </div>

                  {/* Right Column: Edited Snapshot after purchase */}
                  <div className="border border-rose-500/20 bg-rose-500/[0.02] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium bg-rose-500 text-white px-2 py-0.5 rounded">MÔ TẢ HIỆN TẠI (ĐÃ SỬA)</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{selectedDispute.currentSnapshot.updatedAt}</span>
                    </div>

                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white">{selectedDispute.currentSnapshot.name}</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">Giá niêm yết:</span>
                        <span className="font-medium text-rose-500">{(selectedDispute.currentSnapshot.price).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">Tình trạng:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedDispute.currentSnapshot.specs.condition}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/40 pb-2">
                        <span className="text-zinc-400 font-normal">RAM:</span>
                        <span className="font-medium text-rose-600 dark:text-rose-400 underline">{selectedDispute.currentSnapshot.specs.ram} (Đã giảm)</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-zinc-400 font-normal">CPU:</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{selectedDispute.currentSnapshot.specs.cpu}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl text-xs font-normal leading-relaxed text-zinc-500 dark:text-zinc-400">
                      <strong>Chi tiết mô tả:</strong> {selectedDispute.currentSnapshot.description}
                    </div>
                  </div>

                </div>
              ) : (
                /* Delivery Evidence Photos Panel */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-zinc-400 uppercase">Ảnh bằng chứng bàn giao của bên bán:</span>
                    <div className="relative h-60 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <img
                        src={selectedDispute.evidenceImage}
                        alt="Ảnh bàn giao"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/45 p-6 rounded-2xl flex flex-col justify-center space-y-4">
                    <h5 className="text-xs font-medium uppercase text-zinc-400">Kết luận kiểm duyệt sơ bộ:</h5>
                    <p className="text-xs font-normal text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      Phát hiện hành động chỉnh sửa thuộc tính tin đăng (RAM 16GB xuống 8GB) do người bán thực hiện vào lúc <strong>{selectedDispute.currentSnapshot.updatedAt}</strong>. Lời khiếu nại tranh chấp của người mua là <strong>chính xác</strong>.
                    </p>
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-medium">
                      Khuyến nghị: Áp dụng khôi phục phiên bản snapshot 1 và phạt trừ uy tín bên bán.
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {selectedDispute.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-6">
                  <button
                    onClick={() => handleResolveDispute(selectedDispute.id, 'RESOLVED')}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-2xl cursor-pointer"
                  >
                    Xử lý & Cảnh cáo người bán
                  </button>
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-300 text-xs font-medium rounded-2xl cursor-pointer"
                  >
                    Xem xét thêm chứng cứ
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
