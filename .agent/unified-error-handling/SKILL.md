---
name: unified-error-handling
description: Skill này chuẩn hóa cách xử lý lỗi và ngoại lệ trên toàn bộ hệ thống (Web & Mobile). Thay vì throw/catch bừa bãi, skill này hướng dẫn sử dụng các mẫu Failure/Result để quản lý lỗi nghiệp vụ một cách tường minh và an toàn.
risk: medium
source: community
---

# Unified Error Handling & Result Pattern

Skill này đảm bảo ứng dụng không bị crash bất ngờ và người dùng luôn nhận được thông báo lỗi dễ hiểu. Chúng ta quản lý lỗi như là một phần của luồng dữ liệu, không phải là ngoại lệ (exception).

## Khi nào sử dụng
- Khi viết các Use Cases trong lớp `application`.
- Khi gọi API hoặc truy vấn Database trong lớp `infrastructure`.
- Khi hiển thị thông báo lỗi trên giao diện (Mobile/Web).

## Nguyên tắc xử lý

1.  **Không throw bừa bãi**: Hạn chế sử dụng `throw new Error()` trong logic nghiệp vụ vì nó làm gián đoạn luồng thực thi và khó kiểm soát.
2.  **Mẫu Result/Either**: Trả về một đối tượng chứa cả dữ liệu (nếu thành công) hoặc đối tượng lỗi (nếu thất bại).
    *   Thành công: `{ success: true, data: T }`
    *   Thất bại: `{ success: false, error: Failure }`
3.  **Tách biệt loại lỗi**:
    *   `DomainFailure`: Lỗi vi phạm quy tắc nghiệp vụ (ví dụ: số dư không đủ).
    *   `InfrastructureFailure`: Lỗi kỹ thuật (ví dụ: mất kết nối, lỗi DB).
    *   `InputFailure`: Lỗi dữ liệu đầu vào không hợp lệ.

## Cấu trúc đề xuất

### 1. Định nghĩa Failure (Domain)
```typescript
export abstract class Failure {
  constructor(public readonly message: string, public readonly code?: string) {}
}

export class NetworkFailure extends Failure {}
export class ValidationFailure extends Failure {}
```

### 2. Sử dụng trong Use Case
```typescript
async execute(data): Promise<Result<User, Failure>> {
  try {
    const user = await this.repo.save(data);
    return { success: true, data: user };
  } catch (e) {
    return { success: false, error: new DatabaseFailure("Lưu thất bại") };
  }
}
```

## Checklist
- [ ] Lỗi trả về có thân thiện với người dùng không?
- [ ] Có ghi log lỗi kỹ thuật (Infrastructure) tại chỗ nhưng chỉ trả về thông báo chung cho UI không?
- [ ] Mọi trường hợp thất bại (Edge cases) đã được xử lý trong `Result` chưa?
