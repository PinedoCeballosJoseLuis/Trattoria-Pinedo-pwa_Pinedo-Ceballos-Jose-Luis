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
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
};
