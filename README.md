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

## Cập nhật ngay trong app
Khi có bản mới, app hiện thanh "Có bản mới". Bấm **Cập nhật**: app tải APK ngay trong app (có thanh tiến độ), tải xong tự mở trình cài đặt, bấm **Cài đặt** là xong, không cần ra trình duyệt.
- Lần đầu Android sẽ hỏi cho phép app này cài ứng dụng. Bật công tắc ở màn hình vừa mở, quay lại bấm Cập nhật lần nữa.
- Bản APK đang cài trên máy chưa có tính năng này, nên phải cài tay bản mới một lần. Từ bản sau đó mới cập nhật trong app được.
- Repo phải để Public để app đọc được Releases.

## Link đã lưu và tự cập nhật
- Mỗi link Google Sheets mày dán rồi bấm **Lấy** hoặc **Điền** sẽ được lưu ở mục **Lấy**, phần "Link đã lưu".
- Mỗi lần mở app (và khi quay lại app sau hơn 10 phút), app đọc lại **chỉ những link đã lưu và đang bật "Tự cập nhật"** để lấy thông tin của người điền sau. App không ghi gì vào bảng trong bước này.
- Có nút **Cập nhật** từng link, **Cập nhật tất cả ngay**, tắt/bật tự cập nhật từng link, và **Xóa** link.
- Danh sách link cũng được lưu lên Drive cùng dữ liệu.

## Bảng có tiêu đề 2-3 tầng
Bảng kiểu "Giáo dục thể chất / Y tế học đường" ở trên, "Cân nặng / Chiều cao" ở dưới (ô gộp) được đọc theo tiêu đề dưới cùng. Nếu hai nhóm có cột trùng tên, app ghi thêm tên nhóm phía trước.

## Cần biết
- Việc ghi vào bảng chạy bằng tài khoản Google của mày (người triển khai), nên bảng cần chia sẻ quyền **Chỉnh sửa** cho tài khoản đó. Bảng mở "Bất kỳ ai có link" thì đọc được mà không cần đăng nhập.
- `GAS_SECRET` nằm trong APK nên chỉ chặn được người lạ vô tình. Đừng đăng URL máy chủ công khai.
- Gmail thường chỉ cho gửi khoảng 100 email mỗi ngày.
- Mỗi lần push code mới, Actions tự build và app tự báo "Có bản mới" khi mở.

Package name: com.mihtam.excelautofill
SHA-1 khóa ký: 30:0E:6B:2B:32:37:98:5E:F1:FB:ED:77:76:49:75:D0:D5:82:1F:1E
