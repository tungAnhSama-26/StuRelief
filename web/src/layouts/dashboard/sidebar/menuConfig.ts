import {
  Compass,
  FileBadge,
  Activity,
  Scale,
  History,
  Map,
  UserCheck,
  Award,
  LucideIcon,
} from 'lucide-react';
import { APP_ROUTES, UserRole } from '@shared';

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

export const getMenuGroups = (role: UserRole): MenuGroup[] => {
  const userGroups: MenuGroup[] = [
    {
      title: 'Mua Bán & Trao Đổi',
      items: [
        { id: 'catalog', label: 'Chợ Đồ Cũ Sinh Viên', icon: Compass, path: APP_ROUTES.HOME },
        { id: 'verification', label: 'Xác Thực Sinh Viên', icon: FileBadge, path: APP_ROUTES.VERIFICATION },
      ],
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: 'Hệ Thống Quản Trị',
      items: [
        { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: Activity, path: APP_ROUTES.ADMIN.DASHBOARD },
        { id: 'approvals', label: 'Xác Thực Thẻ SV', icon: UserCheck, path: APP_ROUTES.ADMIN.APPROVALS },
        { id: 'disputes', label: 'Xử Lý Tranh Chấp', icon: Scale, path: APP_ROUTES.ADMIN.DISPUTES },
        { id: 'reputations', label: 'Uy Tín & Đánh Giá', icon: Award, path: APP_ROUTES.ADMIN.REPUTATION },
        { id: 'audit-logs', label: 'Lịch Sử Hoạt Động', icon: History, path: APP_ROUTES.ADMIN.LOGS },
        { id: 'meeting-points', label: 'Điểm Hẹn An Toàn', icon: Map, path: APP_ROUTES.ADMIN.MEETING_POINTS },
      ],
    },
  ];

  return role === UserRole.ADMIN ? [...userGroups, ...adminGroups] : userGroups;
};
