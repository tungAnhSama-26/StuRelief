import {
  Compass,
  FileBadge,
  UserCheck,
  Activity,
  Scale,
  History,
  Map,
  LucideIcon
} from 'lucide-react';
import { APP_ROUTES, UserRole } from '@shared';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
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
        {
          id: 'catalog',
          label: 'Chợ Đồ Cũ Sinh Viên',
          icon: Compass,
          desc: 'Duyệt đồ dùng học tập (BL-CT-02)',
          path: APP_ROUTES.HOME,
        },
        {
          id: 'verification',
          label: 'Xác Thực Sinh Viên',
          icon: FileBadge,
          desc: 'Xác thực thẻ & email trường (BL-ID-01)',
          path: APP_ROUTES.VERIFICATION,
        },
      ],
    },
  ];

  const adminGroups: MenuGroup[] = [
    {
      title: 'Hệ Thống Quản Trị',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Tổng Quan',
          icon: Activity,
          desc: 'Chỉ số sức khỏe hệ thống',
          path: APP_ROUTES.ADMIN.DASHBOARD,
        },
        {
          id: 'approvals',
          label: 'Xác Thực Thẻ SV',
          icon: UserCheck,
          desc: 'Phê duyệt thẻ sinh viên (BL-ID-01)',
          path: APP_ROUTES.ADMIN.APPROVALS,
        },
        {
          id: 'handovers',
          label: 'Bàn Giao & Bằng Chứng',
          icon: FileBadge,
          desc: 'Quản lý bằng chứng giao nhận (ST-09)',
          path: '/admin/handovers',
        },
        {
          id: 'disputes',
          label: 'Xử Lý Tranh Chấp',
          icon: Scale,
          desc: 'Giải quyết khiếu nại (ST-10/11)',
          path: APP_ROUTES.ADMIN.DISPUTES,
        },
        {
          id: 'audit-logs',
          label: 'Lịch Sử Hoạt Động',
          icon: History,
          desc: 'Xem Activity Log hệ thống (BL-AD-12)',
          path: APP_ROUTES.ADMIN.LOGS,
        },
        {
          id: 'meeting-points',
          label: 'Điểm Hẹn An Toàn',
          icon: Map,
          desc: 'Thiết lập Hub an toàn (ST-07)',
          path: APP_ROUTES.ADMIN.MEETING_POINTS,
        },
      ],
    },
  ];

  return role === UserRole.ADMIN ? [...userGroups, ...adminGroups] : userGroups;
};
