# Excel AutoFill (APK)

1. Tạo repo GitHub **Public**, đẩy toàn bộ project lên nhánh main.
2. Tab Actions: đợi "Build APK" xanh. APK nằm ở mục Releases (ExcelAutoFill.apk).
3. Cài APK, mở mục Drive trong app và làm theo "Cách kết nối" (dán mã Apps Script 1 lần).
4. Mỗi lần push code mới, Actions tự build và tạo bản phát hành mới; app tự báo "Có bản mới" khi mở.

Khóa ký nằm trong signing/debug.keystore nên cài đè bản mới không mất dữ liệu.
