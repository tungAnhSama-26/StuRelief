import {
  Compass,
  FileBadge,
  Activity,
  Scale,
  History,
  Map,
  UserCheck,
  Award,
  ClipboardCheck,
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
  const userItems = [
    { id: 'catalog', label: 'Chợ Đồ Cũ Sinh Viên', icon: Compass, path: APP_ROUTES.HOME },
    ...(role === UserRole.ADMIN
      ? []
      : [{ id: 'verification', label: 'Xác Thực Sinh Viên', icon: FileBadge, path: APP_ROUTES.VERIFICATION }]),
  ];

  const userGroups: MenuGroup[] = [
    {
      title: 'Mua Bán & Trao Đổi',
      items: userItems,
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: 'Hệ Thống Quản Trị',
      items: [
        { id: 'dashboard', label: 'Dashboard Tổng Quan', icon: Activity, path: APP_ROUTES.ADMIN.DASHBOARD },
        { id: 'approvals', label: 'Xác Thực Thẻ SV', icon: UserCheck, path: APP_ROUTES.ADMIN.APPROVALS },
        { id: 'posts', label: 'Duyệt Bài Đăng', icon: ClipboardCheck, path: APP_ROUTES.ADMIN.POSTS },
        { id: 'disputes', label: 'Xử Lý Tranh Chấp', icon: Scale, path: APP_ROUTES.ADMIN.DISPUTES },
        { id: 'reputations', label: 'Uy Tín & Đánh Giá', icon: Award, path: APP_ROUTES.ADMIN.REPUTATION },
        { id: 'audit-logs', label: 'Lịch Sử Hoạt Động', icon: History, path: APP_ROUTES.ADMIN.LOGS },
        { id: 'meeting-points', label: 'Điểm Hẹn An Toàn', icon: Map, path: APP_ROUTES.ADMIN.MEETING_POINTS },
      ],
    },
  ];

  return role === UserRole.ADMIN ? [...userGroups, ...adminGroups] : userGroups;
};
