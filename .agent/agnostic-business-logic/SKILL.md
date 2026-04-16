---
name: agnostic-business-logic
description: Skill này tập trung vào việc tách biệt logic nghiệp vụ (Core Business) khỏi Framework (Next.js, React Native) và Cơ sở dữ liệu (PostgreSQL, MongoDB, v.v.). Đảm bảo ứng dụng tuân thủ tính linh hoạt, dễ dàng thay đổi hạ tầng mà không ảnh hưởng đến logic lõi.
risk: high
source: community
---

# Agnostic Business Logic (Clean Architecture Core)

Skill này đảm bảo rằng logic nghiệp vụ của bạn là **độc lập và thuần khiết**. Chương trình sẽ được quản lý bởi các quy tắc nghiệp vụ (Business Rules) thay vì bị ràng buộc bởi các công nghệ hạ tầng (Database, Web Framework, Mobile Framework).

## Nguyên tắc Vàng: Dependency Inversion

Logic cốt lõi (Domain/Application) **KHÔNG ĐƯỢC PHỤ THUỘC** vào hạ tầng. Thay vào đó, hạ tầng phải phụ thuộc vào các interface được định nghĩa bởi logic nghiệp vụ.

- **Độc lập Database**: Hôm nay dùng PostgreSQL (Prisma), ngày mai có thể đổi sang MongoDB hoặc LocalStorage mà không cần sửa một dòng code nào trong phần logic xử lý.
- **Độc lập Framework**: Cùng một bộ logic nghiệp vụ có thể chạy trên cả Next.js (Web) và React Native (Mobile).

## Cấu trúc thực thi

### 1. Domain Layer (Lõi)
- **Entities**: Các đối tượng dữ liệu thuần túy (TypeScript Interfaces/Classes).
- **Repository Interfaces**: Định nghĩa "Tôi cần những dữ liệu gì" (ví dụ: `IUserRepository`). KHÔNG quan tâm dữ liệu đó đến từ đâu.

### 2. Application Layer (Nghiệp vụ)
- **Use Cases**: Chứa các quy tắc nghiệp vụ (ví dụ: `RegisterUser`, `ProcessOrder`).
- **Logic**: Sử dụng các Repository Interface để thao tác dữ liệu.
- **Tính độc lập**: Không có bất kỳ import nào từ `Prisma`, `React`, `Next`, hay `Native`.

### 3. Infrastructure Layer (Hạ tầng - Thứ có thể thay thế)
- **Implementations**: Nơi thực hiện chi tiết việc lưu trữ (ví dụ: `PrismaUserRepository`, `MockUserRepository`).
- **Adapters**: Kết nối với các thư viện bên thứ ba.

## Cách thức triển khai (Ví dụ)

**Bước 1: Định nghĩa Interface tại Domain**
```typescript
// src/domain/repositories/user-repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

**Bước 2: Viết Use Case tại Application**
```typescript
// src/application/use-cases/get-user-profile.ts
export class GetUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {} // Dependency Injection

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }
}
```

**Bước 3: Implement tại Infrastructure (Có thể thay thế)**
```typescript
// src/infrastructure/database/prisma-user-repository.ts
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string) { /* Prisma logic here */ }
  async save(user: User) { /* Prisma logic here */ }
}
```

## Checklist khi làm việc
- [ ] Logic này có chứa lệnh import của `prisma` hay `axios` không? (Nếu có -> Sai lớp).
- [ ] Tôi có đang sử dụng React hooks (`useState`, `useEffect`) bên trong file nghiệp vụ không? (Nếu có -> Sai lớp).
- [ ] Nếu tôi đổi Database, tôi có phải sửa file trong thư mục `application` không? (Nếu có -> Vi phạm tính Agnostic).

## Chiến lược thay thế DB
Để thay đổi cơ sở dữ liệu, bạn chỉ cần:
1. Tạo một class mới trong `infrastructure` implement cùng interface đó.
2. Thay đổi việc khởi tạo (Injection) ở tầng cao nhất (thường là trong API route hoặc Screen component).
