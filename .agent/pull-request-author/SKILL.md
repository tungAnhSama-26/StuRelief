---
name: pull-request-author
description: Skill này hỗ trợ tạo Pull Request (PR) tự động và chuyên nghiệp bằng TIẾNG VIỆT. Tóm tắt các thay đổi, nêu rõ mục tiêu, danh sách thay đổi và các lưu ý quan trọng.
risk: low
source: community
---

# Pull Request Author (Tiếng Việt)

Skill này giúp bạn viết mô tả Pull Request một cách rõ ràng, súc tích và chuyên nghiệp theo phong cách kỹ thuật hiện đại.

## Khi nào sử dụng
- Khi bạn đã hoàn thành một tính năng, sửa lỗi hoặc refactor và sẵn sàng đẩy code.
- Khi cần tóm tắt các thay đổi từ nhiều commit thành một báo cáo tổng quan.

## Cấu trúc PR chuẩn

Mô tả PR nên bao gồm các phần sau:

1.  **Tổng quan (Overview)**: Mục tiêu của PR này là gì?
2.  **Danh sách thay đổi (Changes)**: Liệt kê chi tiết các tệp/logic đã chỉnh sửa.
3.  **Video/Hình ảnh (Media)**: (Nếu có) Ảnh chụp màn hình hoặc GIF minh họa UI.
4.  **Hướng dẫn kiểm thử (Testing)**: Cách để reviewer kiểm tra tính năng này.
5.  **Lưu ý (Notes)**: Các vấn đề tồn đọng hoặc rủi ro cần chú ý.

## Hướng dẫn sử dụng

1.  Sử dụng lệnh `git diff --stat` hoặc xem lịch sử commit gần đây để nắm bắt thay đổi.
2.  Yêu cầu tôi: "Viết mô tả PR cho các thay đổi vừa rồi".
3.  Tôi sẽ tạo bản nháp PR bằng **Tiếng Việt**.

## Ví dụ bản nháp PR

```markdown
## 📝 Tổng quan
PR này thực hiện sắp xếp lại cấu trúc thư mục của dự án Mobile theo chuẩn Clean Architecture để cải thiện khả năng bảo trì và mở rộng.

## 🛠 Danh sách thay đổi
- Chuyển `components`, `hooks`, `constants`, `assets` vào `src/presentation`.
- Chuyển thư mục `app` vào `src/app`.
- Đổi tên `use-cases` thành `application` để đúng thuật ngữ.
- Cập nhật `tsconfig.json` và `app.json` với các đường dẫn mới.

## 🧪 Hướng dẫn kiểm thử
1. Chạy `npm install` để cập nhật các package (nếu có).
2. Chạy `npx expo start` và kiểm tra ứng dụng có hoạt động bình thường không.
3. Xác nhận các import `@/components/...` vẫn hoạt động tốt.

## 📌 Lưu ý
- Đã kiểm tra trên cả iOS và Android (giả lập).
- Cần dọn dẹp các thư mục cũ nếu còn sót lại thủ công.
```
