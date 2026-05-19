import {
  Compass,
  FileBadge,
  AlertTriangle,
  Activity,
  Scale,
  History,
  Map,
  UserCheck,
  LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const getMenuGroups = (role: 'STUDENT' | 'ADMIN'): MenuGroup[] => {
  const userGroups: MenuGroup[] = [
    {
      title: 'Mua Bán & Trao Đổi',
      items: [
        { id: 'catalog', label: 'Chợ Đồ Cũ Sinh Viên', icon: Compass, path: '/' },
        { id: 'verification', label: 'Xác Thực Sinh Viên', icon: FileBadge, path: '/verification' },
      ],
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: 'Hệ Thống Quản Trị',
      items: [
        { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: Activity, path: '/admin' },
        { id: 'approvals', label: 'Xác Thực Thẻ SV', icon: UserCheck, path: '/admin/approvals' },
        { id: 'disputes', label: 'Xử Lý Tranh Chấp', icon: Scale, path: '/admin/disputes' },
        { id: 'audit-logs', label: 'Lịch Sử Hoạt Động', icon: History, path: '/admin/logs' },
        { id: 'meeting-points', label: 'Điểm Hẹn An Toàn', icon: Map, path: '/admin/meeting-points' },
      ],
    },
  ];

  return role === 'ADMIN' ? [...userGroups, ...adminGroups] : userGroups;
};
