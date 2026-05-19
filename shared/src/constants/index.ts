import { UserRole, VerificationStatus, OrderStatus, ProductStatus } from '../enums';

export * from './routes';

/**
 * Human-readable labels for User Roles (Vietnamese translation)
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Sinh viên',
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.MODERATOR]: 'Kiểm duyệt viên',
};

/**
 * Human-readable labels for Verification Statuses (Vietnamese translation)
 */
export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.PENDING]: 'Chờ duyệt',
  [VerificationStatus.REVIEWING]: 'Đang xem xét',
  [VerificationStatus.APPROVED]: 'Đã duyệt',
  [VerificationStatus.REJECTED]: 'Bị từ chối',
};

/**
 * Human-readable colors or status styling mappings (Vietnamese / UI design)
 * Ensures consistent badge rendering and styling across both mobile and web.
 */
export const VERIFICATION_STATUS_CLASSES: Record<VerificationStatus, string> = {
  [VerificationStatus.PENDING]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  [VerificationStatus.REVIEWING]: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  [VerificationStatus.APPROVED]: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  [VerificationStatus.REJECTED]: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

/**
 * Human-readable labels for Product Statuses (Vietnamese translation)
 */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: 'Nháp',
  [ProductStatus.AVAILABLE]: 'Đang hiển thị',
  [ProductStatus.RESERVED]: 'Đã đặt chỗ',
  [ProductStatus.DEAL_PENDING]: 'Đang giao dịch',
  [ProductStatus.SOLD]: 'Đã bán',
  [ProductStatus.HIDDEN]: 'Đã ẩn',
  [ProductStatus.DELETED]: 'Đã xóa',
};

/**
 * Human-readable labels for Order Statuses (Vietnamese translation)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_CONFIRM]: 'Chờ xác nhận',
  [OrderStatus.PAYMENT_PENDING]: 'Chờ thanh toán',
  [OrderStatus.MEETING]: 'Đang gặp mặt',
  [OrderStatus.DELIVERING]: 'Đang vận chuyển',
  [OrderStatus.SUCCESS]: 'Thành công',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.DISPUTED]: 'Tranh chấp',
};

/**
 * Generic Application metadata
 */
export const APP_METADATA = {
  NAME: 'StuRelief',
  SUBTITLE: 'Student Exchange Platform',
  DEVELOPER: 'Google Deepmind Team',
  VERSION: '1.0.0',
} as const;
