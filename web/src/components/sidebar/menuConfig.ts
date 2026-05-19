import {
  Compass,
  FileBadge,
  Tags,
  BookmarkCheck,
  MapPin,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  Activity,
  Scale,
  History,
  Map,
  LucideIcon
} from 'lucide-react';

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

export const getMenuGroups = (role: 'STUDENT' | 'ADMIN'): MenuGroup[] => {
  const userGroups: MenuGroup[] = [
    {
      title: 'Mua Bán & Trao Đổi',
      items: [
        {
          id: 'catalog',
          label: 'Chợ Đồ Cũ Sinh Viên',
          icon: Compass,
          desc: 'Duyệt đồ dùng học tập (BL-CT-02)',
          path: '/',
        },
        {
          id: 'verification',
          label: 'Xác Thực Sinh Viên',
          icon: FileBadge,
          desc: 'Xác thực thẻ & email trường (BL-ID-01)',
          path: '/verification',
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
          path: '/admin',
        },
        {
          id: 'approvals',
          label: 'Xác Thực Thẻ SV',
          icon: UserCheck,
          desc: 'Phê duyệt thẻ sinh viên (BL-ID-01)',
          path: '/admin/approvals',
        },
        {
          id: 'disputes',
          label: 'Xử Lý Tranh Chấp',
          icon: Scale,
          desc: 'Giải quyết khiếu nại (ST-10/11)',
          path: '/admin/disputes',
        },
        {
          id: 'audit-logs',
          label: 'Lịch Sử Hoạt Động',
          icon: History,
          desc: 'Xem Activity Log hệ thống (BL-AD-12)',
          path: '/admin/logs',
        },
        {
          id: 'meeting-points',
          label: 'Điểm Hẹn An Toàn',
          icon: Map,
          desc: 'Thiết lập Hub an toàn (ST-07)',
          path: '/admin/meeting-points',
        },
      ],
    },
  ];

  return role === 'ADMIN' ? [...userGroups, ...adminGroups] : userGroups;
};
