module.exports = {
  globDirectory: '.',
  globPatterns: ['**/*.{js,html,json,svg,png,jpg,jpeg,webp,css}'],
  globIgnores: [
    '**/node_modules/**/*',
    'servidor-ssr*/**/*',
    'docs/**/*',
    '**/*.report.html',
    'reporte-lighthouse*.html',
    'workbox-config.js'
  ],
  swDest: 'sw.js',
  skipWaiting: true,
  clientsClaim: true,
  // Leaflet viene de unpkg: se guarda en caché la primera vez que se abre con conexión
  runtimeCaching: [{
    urlPattern: /^https:\/\/unpkg\.com\/leaflet@1\.9\.4\//,
    handler: 'CacheFirst',
    options: {
      cacheName: 'leaflet',
      cacheableResponse: { statuses: [0, 200] }
    }
  }],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
};
