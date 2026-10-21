// Điền địa chỉ máy chủ, secret, số bản build và tên repo vào www/index.html (chạy trong GitHub Actions).
const fs = require('fs');
let h = fs.readFileSync('www/index.html', 'utf8');
const url = process.env.GAS_URL || '', sec = process.env.GAS_SECRET || '', build = process.env.BUILD_NUM || '', repo = process.env.REPO_NAME || '';
if (url) h = h.split('__GAS_URL__').join(url);
if (sec) h = h.split('__GAS_SECRET__').join(sec);
if (build) h = h.split('__BUILD__').join(build);
if (repo) h = h.split('__REPO__').join(repo);
fs.writeFileSync('www/index.html', h);
console.log('máy chủ:', url ? 'đã điền' : 'CHƯA có GAS_URL', '| secret:', sec ? 'đã điền' : 'CHƯA có GAS_SECRET', '| build:', build || '-', '| repo:', repo || '-');
