# Excel AutoFill (APK)

Đăng nhập giống Sổ học tập: nhập email, nhận mã 6 số qua email, nhập mã là vào. Không cần Google Cloud hay Client ID.
Dữ liệu và việc đọc/ghi bảng đi qua một máy chủ nhỏ (Google Apps Script) chạy bằng tài khoản Google của mày.

## Bước 1. Tạo máy chủ (Apps Script)
1. Vào https://script.google.com, tạo **Dự án mới**, xóa code mẫu, dán toàn bộ `apps-script/Code.gs`.
2. Đổi dòng `const SECRET = 'DOI_MA_NAY'` thành chuỗi bí mật dài tự nghĩ. Nhớ chuỗi này.
3. (Tùy chọn) Muốn chỉ mình mày đăng nhập được: sửa `const ALLOWED = ['email-cua-may@gmail.com']`.
4. Chọn hàm **setup**, bấm **Chạy**, cấp quyền (Drive, Sheets, gửi email).
5. **Triển khai > Tùy chọn triển khai mới > Ứng dụng web**: Thực thi bằng = **Tôi**, Ai có quyền truy cập = **Bất kỳ ai**. Chép URL `/exec`.
6. Mở thử URL đó trên trình duyệt, thấy chữ `Excel AutoFill server` là đúng.

Sau này sửa `Code.gs` phải **Triển khai > Quản lý bản triển khai > Chỉnh sửa > Phiên bản mới**, nếu không máy chủ vẫn chạy code cũ.

## Bước 2. Đưa lên GitHub và build
1. Tạo repo **Public**, đẩy toàn bộ project lên nhánh main.
2. Repo > **Settings > Secrets and variables > Actions > New repository secret**, thêm:
   - `GAS_URL` = URL `/exec` ở bước 1
   - `GAS_SECRET` = chuỗi bí mật ở bước 1.2 (phải giống hệt trong `Code.gs`)
3. Tab Actions: chạy **Build APK** (push code cũng tự chạy). APK nằm ở Releases (`ExcelAutoFill.apk`).

## Bước 3. Dùng
Cài APK, mở mục **Drive**, nhập email, nhập mã 6 số nhận được. Từ giờ app tự nhớ đăng nhập. Đổi máy: đăng nhập lại bằng cùng email rồi bấm **Tải từ Drive**.

## Cần biết
- Việc ghi vào bảng chạy bằng tài khoản Google của mày (người triển khai), nên bảng cần chia sẻ quyền **Chỉnh sửa** cho tài khoản đó. Bảng mở "Bất kỳ ai có link" thì đọc được mà không cần đăng nhập.
- `GAS_SECRET` nằm trong APK nên chỉ chặn được người lạ vô tình. Đừng đăng URL máy chủ công khai.
- Gmail thường chỉ cho gửi khoảng 100 email mỗi ngày.
- Mỗi lần push code mới, Actions tự build và app tự báo "Có bản mới" khi mở.

Package name: com.mihtam.excelautofill
SHA-1 khóa ký: 30:0E:6B:2B:32:37:98:5E:F1:FB:ED:77:76:49:75:D0:D5:82:1F:1E
