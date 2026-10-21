#!/usr/bin/env bash
# Chạy sau "npx cap add android": thay icon, splash, màu thanh trạng thái, khóa ký, versionCode, plugin cài APK trong app
set -e
R=android/app/src/main/res
for d in mdpi:48:108 hdpi:72:162 xhdpi:96:216 xxhdpi:144:324 xxxhdpi:192:432; do
  IFS=: read n a f <<<"$d"
  cp icons/legacy-$a.png $R/mipmap-$n/ic_launcher.png
  cp icons/round-$a.png  $R/mipmap-$n/ic_launcher_round.png
  cp icons/fg-$f.png     $R/mipmap-$n/ic_launcher_foreground.png
done
sed -i 's/#FFFFFF/#3A3FB0/I' $R/values/ic_launcher_background.xml
find $R -name 'splash*.png' -exec cp icons/splash.png {} \;
sed -i 's|</style>|<item name="android:statusBarColor">#0B1020</item><item name="android:navigationBarColor">#0B1020</item><item name="android:windowLightStatusBar">false</item></style>|' $R/values/styles.xml
mkdir -p ~/.android && cp signing/debug.keystore ~/.android/debug.keystore
sed -i "s/versionCode 1/versionCode ${GITHUB_RUN_NUMBER:-1}/" android/app/build.gradle
# Plugin cài APK ngay trong app (tải bản mới xong mở trình cài đặt, không cần ra trình duyệt)
D=android/app/src/main/java/com/mihtam/excelautofill
mkdir -p "$D"
cp native/ApkInstallerPlugin.java native/MainActivity.java "$D/"
sed -i 's#</manifest>#    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />\n</manifest>#' android/app/src/main/AndroidManifest.xml
