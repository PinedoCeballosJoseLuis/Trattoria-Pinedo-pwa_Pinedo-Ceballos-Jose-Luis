// Efectos visuales de la interfaz. No depende de los demás scripts:
// solo observa el DOM y agrega/quita clases CSS.
(function () {
  const raiz = document.documentElement;

  // --- Intro: se cierra sola (CSS), al tocarla o al terminar la cascada ---
  const intro = document.getElementById('intro');
  function terminarIntro() {
    try { sessionStorage.setItem('intro-vista', '1'); } catch (e) {}
    raiz.classList.remove('intro-activa');
  }
  if (raiz.classList.contains('intro-activa')) {
    if (intro) intro.addEventListener('click', terminarIntro);
    setTimeout(terminarIntro, 2400);
  }

  // --- Píldora de conexión ---
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

  // --- Contador del carrito, barra inferior y pulso del total ---
  const lista = document.getElementById('lista-carrito');
  const total = document.getElementById('total-carrito');
  const contador = document.getElementById('contador-carrito');
  const barraTotal = document.getElementById('barra-total');
  let totalAnterior = total ? total.textContent : '';

  function pulsar(el) {
    if (!el) return;
    el.classList.remove('pulso');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('pulso');
  }

  function actualizarCarrito() {
    if (!lista) return;
    let articulos = 0;
    lista.querySelectorAll('.item-controles > span').forEach(s => {
      articulos += parseInt(s.textContent, 10) || 0;
    });
    if (contador) contador.textContent = articulos;
    if (contador) contador.classList.toggle('vacio-contador', articulos === 0);
    if (barraTotal && total) barraTotal.textContent = total.textContent;
    if (total && total.textContent !== totalAnterior) {
      totalAnterior = total.textContent;
      pulsar(total);
      pulsar(barraTotal);
      pulsar(contador);
    }
  }
  if (lista) new MutationObserver(actualizarCarrito).observe(lista, { childList: true, subtree: true });
  if (total) new MutationObserver(actualizarCarrito).observe(total, { childList: true, characterData: true, subtree: true });
  actualizarCarrito();

  // --- Mensajes de estado: tipo (info / éxito / error) según el texto ---
  const mensajes = ['carrito-mensaje', 'notificaciones-mensaje']
    .map(id => document.getElementById(id)).filter(Boolean);
  function clasificar(m) {
    const t = m.textContent.toLowerCase();
    m.classList.remove('exito', 'error', 'aviso');
    if (!t) return;
    if (/no soporta|no se pudo|error|denegad|sin permiso|no disponible/.test(t)) m.classList.add('error');
    else if (/sin conexi/.test(t)) m.classList.add('aviso');
    else if (/sincroniz|envi|activad|listo|recuperada|guardado/.test(t)) m.classList.add('exito');
  }
  mensajes.forEach(m => {
    new MutationObserver(() => clasificar(m)).observe(m, { childList: true, characterData: true, subtree: true });
    clasificar(m);
  });

  // --- Sección activa en la navegación ---
  const enlaces = document.querySelectorAll('.nav-secciones a');
  if ('IntersectionObserver' in window && enlaces.length) {
    const visibles = {};
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => { visibles[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      const activa = Object.keys(visibles).sort((a, b) => visibles[b] - visibles[a])[0];
      if (!activa || !visibles[activa]) return;
      enlaces.forEach(a => {
        const es = a.dataset.seccion === activa;
        a.classList.toggle('activo', es);
        if (es) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] });
    enlaces.forEach(a => {
      const s = document.getElementById(a.dataset.seccion);
      if (s) io.observe(s);
    });
  }

  // --- Efecto de brillo (ripple) al pulsar botones ---
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn-agregar, .btn-filtro, .btn-hero, .btn-ver');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const tam = Math.max(r.width, r.height);
    const onda = document.createElement('span');
    onda.className = 'ripple';
    onda.style.width = onda.style.height = tam + 'px';
    onda.style.left = (e.clientX - r.left - tam / 2) + 'px';
    onda.style.top = (e.clientY - r.top - tam / 2) + 'px';
    b.appendChild(onda);
    onda.addEventListener('animationend', () => onda.remove());
  });
})();
