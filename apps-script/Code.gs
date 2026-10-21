// Excel AutoFill - cầu nối Google Sheets + Drive. Đổi SECRET trước khi triển khai.
const SECRET = 'DOI_MA_NAY';
const FOLDER = 'ExcelAutoFill', FILE = 'autofill-data.json';

function doGet() { return ContentService.createTextOutput('OK'); }

function doPost(e) {
  let out;
  try {
    const q = JSON.parse(e.postData.contents);
    if (q.secret !== SECRET) throw new Error('Sai mã bí mật (SECRET)');
    const fn = { ping: ping, read: read, write: write, save: save, load: load }[q.action];
    if (!fn) throw new Error('Hành động không hợp lệ');
    out = fn(q); out.ok = true;
  } catch (err) { out = { ok: false, error: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function quota() { return { limit: DriveApp.getStorageLimit(), used: DriveApp.getStorageUsed() }; }
function ping() { return { quota: quota(), user: Session.getEffectiveUser().getEmail() }; }

function sheetOf(q) {
  const ss = SpreadsheetApp.openById(q.id), g = q.gid === '' || q.gid == null ? null : Number(q.gid);
  return (g === null ? null : ss.getSheets().filter(s => s.getSheetId() === g)[0]) || ss.getSheets()[0];
}
function read(q) {
  const s = sheetOf(q);
  return { values: s.getDataRange().getDisplayValues(), title: s.getParent().getName() + ' / ' + s.getName() };
}
function write(q) {
  const s = sheetOf(q);
  q.cells.forEach(c => s.getRange(c.r, c.c).setNumberFormat('@').setValue(String(c.v)));
  SpreadsheetApp.flush();
  return { n: q.cells.length };
}

function dataFile(create) {
  const it = DriveApp.getFoldersByName(FOLDER);
  const dir = it.hasNext() ? it.next() : (create ? DriveApp.createFolder(FOLDER) : null);
  if (!dir) return null;
  const f = dir.getFilesByName(FILE);
  return f.hasNext() ? f.next() : (create ? dir.createFile(FILE, '{}', 'application/json') : null);
}
function save(q) {
  const f = dataFile(true);
  f.setContent(JSON.stringify(q.data));
  return { id: f.getId(), size: f.getSize(), updated: f.getLastUpdated().getTime(), quota: quota() };
}
function load() {
  const f = dataFile(false);
  if (!f) return { data: null, quota: quota() };
  return { data: JSON.parse(f.getBlob().getDataAsString()), size: f.getSize(), updated: f.getLastUpdated().getTime(), quota: quota() };
}
