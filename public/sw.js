const CACHE_NAME = 'waggulous-app-shell-v3'
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const requestUrl = new URL(event.request.url)
  const isSameOrigin = requestUrl.origin === self.location.origin

  if (event.request.mode === 'navigate') {
    event.respondWith(cacheFirst(event.request, './index.html'))
    event.waitUntil(refreshAppShell())
    return
  }

  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(APP_SHELL)
  await cacheLinkedAssets(cache)
}

async function cacheFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request, { ignoreVary: true })
  if (cached) return cached

  if (fallbackUrl) {
    const fallback = await cache.match(fallbackUrl, { ignoreVary: true })
    if (fallback) return fallback
  }

  return fetchAndCache(request, cache)
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await caches.match(request, { ignoreVary: true })
  const refreshed = fetchAndCache(request, cache)

  if (cached) {
    refreshed.catch(() => undefined)
    return cached
  }

  return refreshed
}

async function refreshAppShell() {
  const cache = await caches.open(CACHE_NAME)

  try {
    await Promise.all(
      APP_SHELL.map(async (url) => {
        const response = await fetch(new Request(url, { cache: 'reload' }))
        if (response.ok) {
          await cache.put(url, response.clone())
        }
      }),
    )
    await cacheLinkedAssets(cache)
  } catch {
    // The cached app shell remains the source of truth when the network is poor.
  }
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request)
  if (response.ok) {
    await cache.put(request, response.clone())
  }
  return response
}

async function cacheLinkedAssets(cache) {
  const indexResponse = await cache.match('./index.html', { ignoreVary: true })
  if (!indexResponse) return

  const html = await indexResponse.clone().text()
  const assetUrls = getSameOriginAssetUrls(html)
  if (assetUrls.length > 0) {
    await cache.addAll(assetUrls)
  }
}

function getSameOriginAssetUrls(html) {
  const assetUrls = new Set()
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/g

  for (const match of html.matchAll(attributePattern)) {
    const url = new URL(match[1], self.location.href)
    if (url.origin === self.location.origin) {
      assetUrls.add(url.href)
    }
  }

  return Array.from(assetUrls)
}
