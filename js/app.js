// Estado de conexión: muestra "Conectado" o "Sin conexión" en la píldora del encabezado.
(function () {
  const pildora = document.getElementById('estado-conexion');
  function pintarConexion() {
    if (!pildora) return;
    const en = navigator.onLine;
    pildora.classList.toggle('sin-conexion', !en);
    pildora.textContent = en ? 'Conectado' : 'Sin conexión';
  }
  window.addEventListener('online', pintarConexion);
  window.addEventListener('offline', pintarConexion);
  pintarConexion();
})();
