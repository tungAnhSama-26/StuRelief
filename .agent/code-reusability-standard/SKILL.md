---
name: code-reusability-standard
description: Skill này tập trung vào việc tối ưu hóa tái sử dụng mã nguồn (DRY - Don't Repeat Yourself). Tự động phát hiện code trùng lặp hoặc các file quá lớn để tách nhỏ thành các Shared Components, Custom Hooks hoặc Utility functions dùng chung cho cả Web và Mobile.
risk: medium
source: community
---

# Code Reusability & DRY Standard

Skill này đảm bảo hệ thống luôn gọn gàng bằng cách triệt tiêu sự trùng lặp code và quản lý các thành phần dùng chung một cách khoa học. 

## Khi nào sử dụng
- Khi phát hiện một đoạn logic hoặc UI xuất hiện ở >= 2 nơi (Mobile-Mobile, Web-Web, hoặc Web-Mobile).
- Khi một tệp tin (file) trở nên quá lớn (thường > 150 dòng) và chứa nhiều thành phần con có thể tách rời.
- Khi cần tạo các thành phần nền tảng (Base/Atom components).

## Chiến lược "Chia để trị"

### 1. Tách logic nghiệp vụ (Shared Logic)
Vì chúng ta dùng chuẩn **Clean Architecture**, phần lớn logic trong `domain` và `application` của Mobile có thể dùng chung cho Web.
- **Hành động**: Đưa các interface, types, và business logic vào một nơi dùng chung (Ví dụ: Dự án monorepo có thư mục `packages/shared` hoặc `src/core`).

### 2. Tách UI Components (Shared UI)
- **Atoms**: Các thành phần nhỏ nhất (Button, Input, Badge, Typography).
- **Molecules**: Tổ hợp các atoms (SearchField, FormItem).
- **Hành động**: Nếu một UI component có cấu trúc na ná nhau, hãy tạo một Component có `props` linh hoạt thay vì copy-paste và sửa một vài chỗ.

### 3. Custom Hooks (Shared Behavior)
- Nếu nhiều màn hình cùng thực hiện việc gọi API, phân trang, hoặc xử lý form giống nhau.
- **Hành động**: Tách logic đó vào một Custom Hook (ví dụ: `usePagination`, `useAuth`).

## Quy trình thực hiện

1.  **Phát hiện**: Khi code, nếu thấy "hình bóng" của một đoạn mã đã viết trước đó.
2.  **Trích xuất (Extract)**: Di chuyển đoạn mã đó vào:
    *   `src/presentation/components/ui/` (Nếu là linh kiện UI).
    *   `src/presentation/hooks/` (Nếu là logic UI).
    *   `src/application/use-cases/` (Nếu là logic nghiệp vụ).
    *   `src/core/utils/` (Nếu là hàm xử lý dữ liệu thuần).
3.  **Tái cấu trúc (Refactor)**: Thay thế đoạn mã cũ bằng lệnh `import`.

## Checklist tái sử dụng
- [ ] File này có vượt quá 200 dòng không? (Nếu có -> Cần tách nhỏ).
- [ ] Thành phần này có thể dùng ở màn hình khác không? (Nếu có -> Đưa vào `ui` components).
- [ ] Logic này có lặp lại ở Web không? (Nếu có -> Đưa vào lớp lõi Agnostic).
- [ ] Các hằng số (Constants) và Types có được tập trung tại một nơi không?

## Ví dụ về tinh gọn code
**Trước (Lặp lại):**
Gõ lại toàn bộ style và logic xử lý Button ở mỗi file.

**Sau (Tái sử dụng):**
```typescript
import { Button } from '@/components/ui/button';
// Sử dụng props để thay đổi variant, size, loading state
```
