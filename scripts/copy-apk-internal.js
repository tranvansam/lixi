/**
 * Sau khi build:apk, copy APK vào dist-apk với tên cố định
 * và tạo trang index.html để deploy lên Vercel/Netlify làm link tải nội bộ.
 */
const fs = require('fs');
const path = require('path');

const src = path.join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const destDir = path.join(process.cwd(), 'dist-apk');
const apkName = 'LiXiCungYen.apk';
const destApk = path.join(destDir, apkName);

if (!fs.existsSync(src)) {
  console.error('APK chưa có. Chạy: npm run build:apk');
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, destApk);

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tải app Lì Xì Cùng Yến</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); }
    .card { text-align: center; padding: 2rem; max-width: 360px; }
    h1 { color: #be185d; margin-bottom: 0.5rem; }
    p { color: #6b7280; margin-bottom: 1.5rem; }
    a.download { display: inline-block; padding: 14px 28px; background: #db2777; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; }
    a.download:hover { background: #be185d; }
    .hint { font-size: 0.875rem; color: #9ca3af; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Lì Xì Cùng Yến</h1>
    <p>Tải ứng dụng cài đặt trên điện thoại Android (dùng nội bộ).</p>
    <a class="download" href="./${apkName}" download="${apkName}">Tải file cài đặt (.apk)</a>
    <p class="hint">Mở link này trên điện thoại Android, tải xong mở file và cài đặt. Cần bật &quot;Cho phép cài từ nguồn không xác định&quot; nếu được hỏi.</p>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(destDir, 'index.html'), html, 'utf8');
console.log('OK: dist-apk/ đã có LiXiCungYen.apk và index.html');
console.log('→ Deploy thư mục dist-apk lên Vercel/Netlify (hoặc host tĩnh) rồi gửi link cho mọi người.');
process.exit(0);
