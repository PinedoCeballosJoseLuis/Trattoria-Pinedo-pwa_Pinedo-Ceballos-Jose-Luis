// Notificaciones del navegador para Trattoria Pinedo
const btnNotificar = document.getElementById('btn-notificar');
const msgNotificaciones = document.getElementById('notificaciones-mensaje');

function mostrarMensajeNotif(texto) {
  if (msgNotificaciones) msgNotificaciones.textContent = texto;
}

// Muestra una notificación si el usuario ya dio permiso
function mostrarNotificacion(titulo, cuerpo) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(titulo, {
      body: cuerpo,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png'
    });
  }
}

if (btnNotificar) btnNotificar.addEventListener('click', async () => {
  // Primero comprobamos que el navegador soporte notificaciones
  if (!('Notification' in window)) {
    mostrarMensajeNotif('Tu navegador no soporta notificaciones.');
    return;
  }
  const permiso = await Notification.requestPermission();
  if (permiso === 'granted') {
    mostrarMensajeNotif('Notificaciones activadas.');
    mostrarNotificacion('Trattoria Pinedo', '¡Listo! Los avisos de Trattoria Pinedo están activados.');
  } else {
    mostrarMensajeNotif('Sin permiso de notificaciones: no te avisaremos de tus pedidos.');
  }
});
