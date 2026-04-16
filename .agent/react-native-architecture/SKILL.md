---
name: react-native-clean-architecture
description: Skill này áp dụng các nguyên tắc Clean Architecture vào phát triển React Native (Expo). Đảm bảo tách biệt rõ ràng giữa Domain, Application (Use Cases), Infrastructure và Presentation layers. Hỗ trợ tổ chức code, quản lý state và điều hướng (navigation).
risk: medium
source: community
---

# React Native Clean Architecture (Expo Router)

Skill này giúp bạn xây dựng ứng dụng React Native với cấu trúc **Clean Architecture**, giúp code dễ bảo trì, dễ test và mở rộng. Toàn bộ logic nghiệp vụ được tách biệt khỏi các chi tiết kỹ thuật như React Native hay API.

## Khi nào sử dụng
- Khi bắt đầu một module mới hoặc refactor mã nguồn trong thư mục `mobile`.
- Khi cần tổ chức code theo các lớp Domain, Application, Infrastructure và Presentation.
- Khi làm việc với Expo Router và cần quản lý cấu trúc file hợp lý.

## Cấu trúc thư mục chuẩn (Clean Architecture)

Dự án được tổ chức trong thư mục `src` như sau:

```text
src/
├── domain/         # Enterprise rules: Entities, Interface định nghĩa Repository
├── application/    # Application rules: Use cases, Business logic xử lý flow
├── infrastructure/ # Frameworks & Drivers: API clients, Repository implementations
├── presentation/   # UI Layer: Components, Hooks, Constants, Assets
└── app/            # Expo Router entry & Screens (Định tuyến)
```

## Các nguyên tắc cốt lõi

1.  **Quy tắc phụ thuộc (Dependency Rule)**: Sự phụ thuộc chỉ được hướng vào bên trong (Càng vào lõi Domain càng ít phụ thuộc vào bên ngoài).
2.  **Domain Layer**: Là trung tâm của ứng dụng. Không phụ thuộc vào bất kỳ thư viện hay framework nào. Chứa các Entities và Interface.
3.  **Application Layer**: Chứa các Use Cases ( logic nghiệp vụ cụ thể của ứng dụng). Sử dụng các interface từ Domain để thực hiện logic.
4.  **Infrastructure Layer**: Chứa các code cụ thể cho platform (API, Storage, External Services). Phải implement các interface từ Domain.
5.  **Presentation Layer**: Chứa UI components, hooks, và assets. Sử dụng Use Cases từ Application layer để hiển thị dữ liệu.

## Hướng dẫn triển khai

### 1. Tạo Domain Entity
Luôn bắt đầu từ Domain. Định nghĩa dữ liệu và interface.

### 2. Tạo Application Use Case
Viết logic xử lý dữ liệu.

### 3. Triển khai Infrastructure
Xây dựng API client hoặc Repository cụ thể để lấy/lưu dữ liệu.

### 4. Xây dựng Presentation
Tạo UI và sử dụng Hooks để kết nối với Use Cases.

## Kiểm tra danh sách (Checklist)
- [ ] Logic nghiệp vụ có nằm trong `application` không?
- [ ] `domain` có bị phụ thuộc vào thư viện bên ngoài (ngoại trừ types) không?
- [ ] Các thành phần UI có nằm hoàn toàn trong `presentation` hoặc `app` không?
- [ ] Các path mapping (`@/*`) trong `tsconfig` có được sử dụng đúng không?

## Ví dụ về Path Alias
- `@/domain/*`: `./src/domain/*`
- `@/application/*`: `./src/application/*`
- `@/infrastructure/*`: `./src/infrastructure/*`
- `@/presentation/*`: `./src/presentation/*`
- `@/app/*`: `./src/app/*`
- `@/components/*`: `@/presentation/components/*`
- `@/hooks/*`: `@/presentation/hooks/*`
- `@/constants/*`: `@/presentation/constants/*`
