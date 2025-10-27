const CACHE_NAME = "matrifacil-v1";
const ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/_next/static/css/app.css",
  "/_next/static/css/layout.css",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker instalando...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Cache aberto");
        return cache.addAll(ASSETS);
      })
      .catch((error) => {
        console.error("❌ Erro ao instalar cache:", error);
      })
  );

  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker ativado");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("🗑️ Removendo cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache first para assets estáticos
  if (ASSETS.some((asset) => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // Network first para API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache respostas bem-sucedidas
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(request);
        })
    );
    return;
  }

  // Network first com fallback para cache
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Monitor de status de rede
let isOnline = navigator.onLine;

function checkConnection() {
  return fetch("/api/health", {
    method: "HEAD",
    mode: "no-cors",
    cache: "no-store",
  })
    .then(() => true)
    .catch(() => false);
}

// Ping periódico ao servidor (a cada 30s)
setInterval(async () => {
  try {
    const connected = await checkConnection();

    if (connected && !isOnline) {
      isOnline = true;
      // Notificar aplicação de reconexão
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "CONNECTION_RESTORED",
            message: "Conexão detectada - iniciando sincronização...",
          });
        });
      });
    } else if (!connected && isOnline) {
      isOnline = false;
    }
  } catch (error) {
    isOnline = false;
  }
}, 30000);

// Listener de eventos de rede
self.addEventListener("online", () => {
  isOnline = true;
  console.log("🌐 Conexão detectada");

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "NETWORK_STATUS",
        status: "online",
      });
    });
  });
});

self.addEventListener("offline", () => {
  isOnline = false;
  console.log("📡 Sem conexão");

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "NETWORK_STATUS",
        status: "offline",
      });
    });
  });
});

// Background Sync (quando suportado)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    console.log("🔄 Background sync iniciado");
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Lógica de sincronização em background
    // Será implementado quando necessário
    console.log("✅ Background sync concluído");
  } catch (error) {
    console.error("❌ Erro no background sync:", error);
  }
}

console.log("✅ Service Worker carregado");
