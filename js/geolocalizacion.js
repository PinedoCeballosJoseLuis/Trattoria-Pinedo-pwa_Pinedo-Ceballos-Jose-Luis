// Geolocalización y ruta a la sucursal de Trattoria Pinedo
// Coordenadas de referencia (Hermosillo, Sonora): cámbialas por las reales si es necesario
const SUCURSAL = {
  nombre: 'Trattoria Pinedo',
  lat: 29.0729,
  lng: -110.9559
};

const btnUbicacion = document.getElementById('btn-ubicacion');
const msgUbicacion = document.getElementById('ubicacion-mensaje');
const contenedorMapa = document.getElementById('mapa-ruta');

let mapa = null;
let capas = null; // grupo donde viven marcadores y ruta, para limpiarlos en cada intento

function mostrarMensajeUbicacion(texto, tipo) {
  if (!msgUbicacion) return;
  msgUbicacion.textContent = texto;
  msgUbicacion.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

// Fórmula de Haversine: distancia en km en línea recta entre dos puntos de la Tierra
function distanciaHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // radio de la Tierra en km
  const rad = (grados) => grados * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Pide la ruta por calles a OSRM; devuelve { puntos, km } o lanza error
async function rutaOSRM(usuario) {
  const url = 'https://router.project-osrm.org/route/v1/driving/' +
    usuario.lng + ',' + usuario.lat + ';' + SUCURSAL.lng + ',' + SUCURSAL.lat +
    '?overview=full&geometries=geojson';
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('OSRM respondió ' + resp.status);
  const datos = await resp.json();
  if (!datos.routes || !datos.routes.length) throw new Error('Sin ruta');
  const ruta = datos.routes[0];
  // GeoJSON viene como [lng, lat]; Leaflet usa [lat, lng]
  return {
    puntos: ruta.geometry.coordinates.map((c) => [c[1], c[0]]),
    km: ruta.distance / 1000
  };
}

// Crea el mapa (una sola vez) para mostrar de referencia dónde está la sucursal
function iniciarMapa() {
  if (mapa || typeof L === 'undefined' || !contenedorMapa) return;
  mapa = L.map(contenedorMapa).setView([SUCURSAL.lat, SUCURSAL.lng], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; Colaboradores de OpenStreetMap'
  }).addTo(mapa);
  capas = L.layerGroup().addTo(mapa);
  marcarSucursal();
}

function marcarSucursal() {
  L.marker([SUCURSAL.lat, SUCURSAL.lng]).addTo(capas).bindPopup(SUCURSAL.nombre + '<br>Aquí nos encontramos');
}

// Dibuja el mapa con los dos marcadores y la ruta
async function dibujarMapa(usuario) {
  if (typeof L === 'undefined') {
    mostrarMensajeUbicacion('No se pudo cargar el mapa. Revisa tu conexión.', 'error');
    return;
  }
  iniciarMapa();
  capas.clearLayers();
  L.marker([usuario.lat, usuario.lng]).addTo(capas).bindPopup('Tu ubicación');
  marcarSucursal();

  let puntos;
  let km;
  let porCalles = true;
  try {
    ({ puntos, km } = await rutaOSRM(usuario));
    L.polyline(puntos, { color: '#14532D', weight: 5 }).addTo(capas);
  } catch (e) {
    // Respaldo: línea recta punteada y distancia con Haversine
    porCalles = false;
    puntos = [[usuario.lat, usuario.lng], [SUCURSAL.lat, SUCURSAL.lng]];
    km = distanciaHaversine(usuario.lat, usuario.lng, SUCURSAL.lat, SUCURSAL.lng);
    L.polyline(puntos, { color: '#b45309', weight: 4, dashArray: '8 8' }).addTo(capas);
  }

  mapa.fitBounds(L.latLngBounds(puntos), { padding: [30, 30] });
  mostrarMensajeUbicacion(
    porCalles
      ? 'Estás a ' + km.toFixed(1) + ' km de ' + SUCURSAL.nombre + ' por calles.'
      : 'Estás a unos ' + km.toFixed(1) + ' km en línea recta de ' + SUCURSAL.nombre + ' (ruta por calles no disponible).',
    porCalles ? 'exito' : 'aviso'
  );
}

if (btnUbicacion) btnUbicacion.addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    mostrarMensajeUbicacion('Tu navegador no soporta geolocalización.', 'error');
    return;
  }
  if (!navigator.onLine) {
    mostrarMensajeUbicacion('Necesitas conexión a internet para ver la ruta.', 'aviso');
    return;
  }
  mostrarMensajeUbicacion('Obteniendo tu ubicación…');
  navigator.geolocation.getCurrentPosition(
    (pos) => dibujarMapa({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => mostrarMensajeUbicacion('No pudimos obtener tu ubicación. Revisa el permiso del navegador.', 'error'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// Al cargar la página, el mapa ya muestra la sucursal como referencia.
// Sin conexión no se crea, porque los mosaicos de OpenStreetMap no están en caché y llenarían la consola de errores.
if (navigator.onLine) iniciarMapa();
else mostrarMensajeUbicacion('Sin conexión: el mapa se mostrará cuando vuelva el internet.', 'aviso');

window.addEventListener('online', () => {
  iniciarMapa();
  if (mapa) mapa.invalidateSize();
  mostrarMensajeUbicacion('');
});
