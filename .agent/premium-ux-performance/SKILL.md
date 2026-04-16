---
name: premium-ux-performance
description: Skill này đảm bảo mọi giao diện và tính năng được tạo ra đều đạt tiêu chuẩn thẩm mỹ cao (Premium) và hiệu năng tối ưu. Tập trung vào micro-animations, mượt mà trong chuyển cảnh, và các kỹ thuật tối ưu hóa React/React Native.
risk: low
source: community
---

# Premium UX & Performance Standard

Skill này biến ứng dụng của bạn từ "chạy được" thành "trải nghiệm tuyệt vời". Một ứng dụng chất lượng cao phải vừa nhanh vừa đẹp.

## Tiêu chuẩn Thẩm mỹ (Aesthetic)

1.  **Tính sống động**: Sử dụng micro-animations cho các tương tác nhỏ (hover, tap, switch).
2.  **Chuyển cảnh mượt mà**: Sử dụng `Framer Motion` (Web) hoặc `React Native Reanimated` (Mobile) để xử lý các chuyển động.
3.  **Rich Aesthetics**: Sử dụng gradient tinh tế, đổ bóng (shadow) đa lớp, và hiệu ứng Glassmorphism ở những nơi phù hợp.
4.  **Typography**: Sử dụng đúng phân cấp (hierarchy) font chữ, đảm bảo tính đọc tốt.

## Tiêu chuẩn Hiệu năng (Performance)

1.  **Tối ưu Render**:
    *   Sử dụng `memo`, `useMemo`, `useCallback` để tránh re-render không cần thiết.
    *   Với Mobile: Luôn ưu tiên `FlashList` thay vì `FlatList` cho danh sách dài.
2.  **Tối ưu Tài nguyên**:
    *   Lazy load hình ảnh và các thành phần nặng.
    *   Sử dụng thư viện hình ảnh hiệu suất cao (ví dụ: `expo-image`).
3.  **Phản hồi tức thì (Optimistic UI)**: Cập nhật giao diện ngay lập tức trước khi nhận được phản hồi từ Server để tạo cảm giác ứng dụng "siêu nhanh".

## Checklist "WOW"
- [ ] Thành phần này có hiệu ứng phản hồi khi chạm/di chuột không?
- [ ] Danh sách có bị lag khi cuộn không?
- [ ] Hình ảnh có được tối ưu dung lượng và có hiệu ứng loading đẹp không?
- [ ] Màu sắc có hài hòa và hỗ trợ cả Dark Mode không?
