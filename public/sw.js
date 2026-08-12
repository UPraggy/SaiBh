/* sw.js — service worker do SaiBH.
 * Objetivo: tornar o app instalavel (PWA) e dar um basico offline, SEM atrapalhar
 * as APIs de terceiros (clima Open-Meteo etc.).
 * Estrategia:
 *  - navegacoes (HTML): network-first (sempre fresco com rede; cai pro cache offline);
 *  - assets do proprio dominio (hasheados pelo Vite -> imutaveis): cache-first;
 *  - qualquer requisicao cross-origin: passa direto (nao intercepta).
 */
const VERSAO = 'saibh-v1'
const APP_SHELL = ['/', '/index.html', '/favicon.svg', '/manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSAO)
      .then((c) => c.addAll(APP_SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // clima/terceiros: nao mexe

  // documentos (navegacao): rede primeiro, cache como rede de seguranca
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone()
          caches.open(VERSAO).then((c) => c.put(req, copia)).catch(() => {})
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/index.html'))),
    )
    return
  }

  // assets estaticos do dominio: cache primeiro
  e.respondWith(
    caches.match(req).then((emCache) =>
      emCache
      || fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copia = res.clone()
            caches.open(VERSAO).then((c) => c.put(req, copia)).catch(() => {})
          }
          return res
        })
        .catch(() => emCache),
    ),
  )
})
