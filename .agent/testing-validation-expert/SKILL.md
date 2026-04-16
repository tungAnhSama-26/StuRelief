---
name: testing-validation-expert
description: Skill này đảm bảo tính ổn định của hệ thống thông qua việc kiểm thử (Testing) và xác thực dữ liệu (Validation) chặt chẽ. Hướng dẫn viết Unit Test cho logic nghiệp vụ và sử dụng Zod/Valibot để đảm bảo dữ liệu luôn sạch.
risk: low
source: community
---

# Testing & Validation Expert

Logic nghiệp vụ mà không có test là logic "nguy hiểm". Skill này đảm bảo mọi thay đổi của bạn đều an toàn và dữ liệu đầu vào luôn đúng chuẩn.

## Chiến lược Kiểm thử (Testing)

1.  **Ưu tiên Unit Test cho Domain/Application**: Vì các lớp này không phụ thuộc framework, việc viết test với `Jest` cực kỳ nhanh và đơn giản.
2.  **Mocking Infrastructure**: Khi test nghiệp vụ, luôn mock các Repository để không phụ thuộc vào Database thật.
3.  **Độ bao phủ (Coverage)**: Tập trung test các luồng xử lý chính (Happy path) và các trường hợp lỗi (Sad path).

## Chiến lược Xác thực (Validation)

1.  **Dữ liệu luôn sạch**: Sử dụng `Zod` để định nghĩa schema và xác thực dữ liệu tại "cửa ngõ" của ứng dụng (API Request, Form Input).
2.  **Xác thực tại lớp Domain**: Đảm bảo các Entity không bao giờ ở trạng thái không hợp lệ (ví dụ: tuổi không thể âm).

## Cách triển khai mẫu

```typescript
// Validation với Zod
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

// Unit Test mẫu
test('nên đăng ký người dùng thành công khi dữ liệu hợp lệ', async () => {
  const mockRepo = new MockUserRepository();
  const useCase = new RegisterUserUseCase(mockRepo);
  const result = await useCase.execute(validData);
  expect(result.success).toBe(true);
});
```

## Checklist an toàn
- [ ] Dữ liệu đầu vào đã được xác thực qua Schema chưa?
- [ ] Logic nghiệp vụ này đã có ít nhất một Unit Test chưa?
- [ ] Khi sửa code cũ, các test case cũ có còn pass không?
