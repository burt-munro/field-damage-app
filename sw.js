// 앱을 고칠 때마다 VERSION 숫자를 올리면 태블릿이 새 파일을 받습니다.
const VERSION = 'v1';
const CACHE = 'field-damage-' + VERSION;
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js',
  'vendor/jszip.min.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 저장된 파일을 먼저 보여주고(오프라인 작동), 인터넷이 되면 뒤에서 새 파일로 갱신합니다.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, {ignoreSearch: true});
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  }));
});
