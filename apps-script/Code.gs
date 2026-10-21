/**
 * Máy chủ nhỏ cho app "Excel AutoFill" (Google Apps Script), đăng nhập giống Sổ học tập.
 * - Đăng nhập bằng email: gửi mã 6 số qua Gmail của người triển khai, nhập mã là vào.
 * - Đọc/ghi Google Sheets và lưu dữ liệu vào thư mục "ExcelAutoFill-DuLieu" trong Drive của người triển khai.
 */
const SECRET = 'DOI_MA_NAY';   // đổi thành chuỗi bí mật dài, phải trùng secret GAS_SECRET trên GitHub
const ALLOWED = [];            // để trống = ai nhập email cũng đăng nhập được. Muốn khóa: ['ban@gmail.com']
const FOLDER_NAME = 'ExcelAutoFill-DuLieu';
const MAX_BYTES = 5 * 1024 * 1024;

function setup() {             // Chạy 1 lần trong trình soạn thảo để cấp quyền Drive, Sheets và gửi email
  folder_();
  Logger.log('Hạn mức gửi email còn: ' + MailApp.getRemainingDailyQuota());
  Logger.log('OK. Drive còn trống: ' + ((DriveApp.getStorageLimit() - DriveApp.getStorageUsed()) / Math.pow(1024, 3)).toFixed(2) + ' GB');
}
function folder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function hex_(bytes) { return bytes.map(function (b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join(''); }
function sha_(s) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s)); }
function quota_() { return { limit: DriveApp.getStorageLimit(), used: DriveApp.getStorageUsed() }; }
function doGet() { return out_({ ok: true, msg: 'Excel AutoFill server' }); }

// Đăng nhập bằng email: gửi mã 6 số (lstart), kiểm mã và trả khóa tài khoản (lverify)
function login_(q, k) {
  const email = String(q.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out_({ ok: false, code: 400 });
  if (ALLOWED.length && ALLOWED.map(function (x) { return String(x).trim().toLowerCase(); }).indexOf(email) < 0) return out_({ ok: false, code: 451 });
  const eh = sha_(email), cache = CacheService.getScriptCache();
  if (q.a === 'lstart') {
    const code = String(100000 + (parseInt(sha_(Utilities.getUuid()).slice(0, 8), 16) % 900000));
    cache.put('lc_' + eh, JSON.stringify({ h: sha_(code + ':' + eh + ':' + SECRET), n: 0, exp: Date.now() + 600000 }), 600);
    const plain = 'Mã đăng nhập Excel AutoFill của bạn là: ' + code + '\n\nMã có hiệu lực trong 10 phút. Hãy nhập mã này vào ứng dụng Excel AutoFill.\n\nNếu không phải bạn yêu cầu, hãy bỏ qua email này.';
    const html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:20px;color:#222">'
      + '<h2 style="margin:0 0 14px;font-size:18px">Excel AutoFill</h2>'
      + '<p style="margin:0 0 10px;font-size:15px">Mã đăng nhập của bạn là:</p>'
      + '<p style="margin:0 0 16px;font-size:32px;letter-spacing:6px;font-weight:bold">' + code + '</p>'
      + '<p style="margin:0 0 14px;font-size:14px;color:#444">Mã có hiệu lực trong 10 phút. Hãy nhập mã này vào ứng dụng Excel AutoFill.</p>'
      + '<p style="margin:0;font-size:12px;color:#888">Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>'
      + '</div>';
    try { MailApp.sendEmail({ to: email, name: 'Excel AutoFill', subject: 'Mã đăng nhập Excel AutoFill: ' + code, body: plain, htmlBody: html }); }
    catch (er) { return out_({ ok: false, code: 503 }); }   // Google từ chối gửi (hết hạn mức ngày)
    return out_({ ok: true });
  }
  const raw = cache.get('lc_' + eh);
  if (!raw) return out_({ ok: false, code: 410 });                           // mã hết hạn hoặc chưa gửi
  const st = JSON.parse(raw), code = String(q.code || '').replace(/\D/g, ''), now = Date.now();
  if (now > st.exp) { cache.remove('lc_' + eh); return out_({ ok: false, code: 410 }); }
  if (st.n >= 100) { cache.remove('lc_' + eh); return out_({ ok: false, code: 429 }); }   // chống dò mã tự động
  if (sha_(code + ':' + eh + ':' + SECRET) !== st.h) {
    st.n++;
    cache.put('lc_' + eh, JSON.stringify(st), Math.max(1, Math.ceil((st.exp - now) / 1000)));
    return out_({ ok: false, code: 401 });
  }
  cache.remove('lc_' + eh);
  const props = PropertiesService.getScriptProperties(), lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let key = props.getProperty('e_' + eh);
    if (!key) {   // email mới: gắn với khóa của máy đang đăng nhập (nếu khóa đó đã thuộc email khác thì cấp khóa mới)
      key = props.getProperty('r_' + k) ? Utilities.getUuid().replace(/-/g, '') : k;
      props.setProperty('e_' + eh, key);
      props.setProperty('r_' + key, email);
    }
    return out_({ ok: true, key: key });
  } finally { lock.releaseLock(); }
}

function sheetOf_(q) {
  const id = String(q.id || '');
  if (!/^[\w-]{10,100}$/.test(id)) throw new Error('Mã bảng không hợp lệ');
  const ss = SpreadsheetApp.openById(id), g = q.gid === '' || q.gid == null ? null : Number(q.gid);
  return (g === null ? null : ss.getSheets().filter(function (s) { return s.getSheetId() === g; })[0]) || ss.getSheets()[0];
}
function dataFile_(k, create) {
  const fo = folder_(), name = 'd_' + sha_(k).slice(0, 24) + '.json', it = fo.getFilesByName(name);
  while (it.hasNext()) { const f = it.next(); if (!f.isTrashed()) return f; }
  return create ? fo.createFile(name, '{}', MimeType.PLAIN_TEXT) : null;
}

function doPost(e) {
  let lock = null;
  try {
    const q = JSON.parse(e.postData.contents);
    if (q.s !== SECRET) return out_({ ok: false, code: 403 });
    const k = String(q.k || '');
    if (!/^[A-Za-z0-9]{20,64}$/.test(k)) return out_({ ok: false, code: 400 });
    if (q.a === 'lstart' || q.a === 'lverify') return login_(q, k);
    const mail = PropertiesService.getScriptProperties().getProperty('r_' + k);
    if (!mail) return out_({ ok: false, code: 401 });          // chưa đăng nhập
    if (q.a === 'ping') return out_({ ok: true, user: mail, quota: quota_() });
    if (q.a === 'read') {
      const s = sheetOf_(q);
      return out_({ ok: true, values: s.getDataRange().getDisplayValues(), title: s.getParent().getName() + ' / ' + s.getName() });
    }
    if (q.a === 'load') {
      const f = dataFile_(k, false);
      if (!f) return out_({ ok: true, data: null, quota: quota_() });
      return out_({ ok: true, data: JSON.parse(f.getBlob().getDataAsString()), size: f.getSize(), updated: f.getLastUpdated().getTime(), quota: quota_() });
    }
    if (q.a === 'write' || q.a === 'save') {
      lock = LockService.getScriptLock(); lock.waitLock(20000);
      if (q.a === 'write') {
        if (!Array.isArray(q.cells) || q.cells.length > 5000) return out_({ ok: false, code: 400 });
        const s = sheetOf_(q);
        q.cells.forEach(function (c) { s.getRange(c.r, c.c).setNumberFormat('@').setValue(String(c.v)); });
        SpreadsheetApp.flush();
        return out_({ ok: true, n: q.cells.length });
      }
      const content = JSON.stringify(q.data);
      if (content.length > MAX_BYTES) return out_({ ok: false, code: 413 });
      const f = dataFile_(k, true);
      f.setContent(content);
      return out_({ ok: true, size: f.getSize(), updated: f.getLastUpdated().getTime(), quota: quota_() });
    }
    return out_({ ok: false, code: 400 });
  } catch (err) {
    return out_({ ok: false, code: 500, msg: String(err && err.message || err) });
  } finally {
    if (lock) lock.releaseLock();
  }
}
