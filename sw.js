/* เก็บไฟล์ของแอปไว้ในเครื่อง ให้เปิดได้แม้ไม่มีอินเทอร์เน็ต */
var CACHE = 'pricecheck-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'lib/html5-qrcode.min.js', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // ข้อมูลราคาจาก Apps Script ไม่ผ่านแคชนี้
  // หน้าเว็บ: ลองโหลดใหม่ก่อน ถ้าไม่มีเน็ตใช้ของที่เก็บไว้ (แก้ไฟล์แล้วเห็นผลทันทีเมื่อออนไลน์)
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); })
  );
});
