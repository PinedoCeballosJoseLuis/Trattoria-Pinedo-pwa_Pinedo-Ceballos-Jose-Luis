// Carrito de pedido persistido en localStorage (clave propia de Trattoria Pinedo)
const CLAVE = 'trattoria-pinedo-carrito';
let carrito = [];

try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { carrito = []; }

function guardar() {
  localStorage.setItem(CLAVE, JSON.stringify(carrito));
  pintarCarrito();
}

function agregar(producto) {
  const item = carrito.find(i => i.id === producto.id);
  if (item) item.cantidad++;
  else carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagen, cantidad: 1 });
  guardar();
  avisarSiSinConexion();
}

function sumar(id) {
  const item = carrito.find(i => i.id === id);
  if (item) { item.cantidad++; guardar(); }
}

function restar(id) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  if (item.cantidad > 1) { item.cantidad--; guardar(); }
  else quitar(id);
}

function quitar(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardar();
}

function calcularTotal() {
  return carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);
}

function pintarCarrito() {
  const lista = document.getElementById('lista-carrito');
  lista.innerHTML = '';
  if (!carrito.length) {
    lista.innerHTML = '<li class="vacio">Tu pedido está vacío.</li>';
  }
  carrito.forEach(i => {
    const li = document.createElement('li');
    li.className = 'item-carrito';
    // Foto del platillo (los pedidos guardados antes no la traen: se busca en el catálogo)
    const prod = typeof catalogo !== 'undefined' ? catalogo.find(x => x.id === i.id) : null;
    const foto = i.imagen || (prod && prod.imagen) || '';
    li.innerHTML =
      (foto ? '<img class="item-foto" src="' + foto + '" alt="' + i.nombre + '">' : '') +
      '<span class="item-nombre">' + i.nombre + '</span>' +
      '<span class="item-controles">' +
        '<button type="button" data-accion="restar" data-id="' + i.id + '" aria-label="Restar">−</button>' +
        '<span>' + i.cantidad + '</span>' +
        '<button type="button" data-accion="sumar" data-id="' + i.id + '" aria-label="Sumar">+</button>' +
      '</span>' +
      '<span class="item-subtotal">$' + (i.precio * i.cantidad).toFixed(2) + '</span>' +
      '<button type="button" data-accion="quitar" data-id="' + i.id + '" aria-label="Quitar">✕</button>';
    lista.appendChild(li);
  });
  document.getElementById('total-carrito').textContent = '$' + calcularTotal().toFixed(2) + ' MXN';
}

// Recarga el carrito desde localStorage (sincroniza pestañas/vistas)
function sincronizar(mensaje) {
  try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { carrito = []; }
  pintarCarrito();
  const m = document.getElementById('carrito-mensaje');
  if (m && mensaje) m.textContent = mensaje + ' (' + new Date().toLocaleTimeString() + ')';
}

window.addEventListener('storage', e => {
  if (e.key === CLAVE || e.key === null) sincronizar();
});

// Sin conexión: el carrito queda en localStorage y se envía al volver el internet
function avisarSiSinConexion() {
  const m = document.getElementById('carrito-mensaje');
  if (m && !navigator.onLine) {
    m.textContent = 'Sin conexión: tu pedido se sincronizará cuando vuelva el internet.';
  }
}

// Envío simulado del carrito al servidor
function enviarCarrito() {
  // Aquí iría el envío real al servidor:
  // fetch('/api/pedidos', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(carrito)
  // });
  localStorage.setItem(CLAVE, JSON.stringify(carrito));
  sincronizar('Conexión recuperada: tu pedido se envió a Trattoria Pinedo');
}

const btnSync = document.getElementById('btn-sincronizar');
if (btnSync) btnSync.addEventListener('click', () => {
  if (!carrito.length) {
    const m = document.getElementById('carrito-mensaje');
    if (m) m.textContent = 'Tu pedido está vacío: agrega al menos un platillo para sincronizar.';
    return;
  }
  if (!navigator.onLine) { avisarSiSinConexion(); return; }
  enviarCarrito();
});

// Al volver la conexión, se envía el carrito guardado (si hay productos)
window.addEventListener('online', () => {
  if (carrito.length) enviarCarrito();
});
window.addEventListener('offline', avisarSiSinConexion);

document.getElementById('productos').addEventListener('click', e => {
  const b = e.target.closest('.btn-agregar');
  if (!b) return;
  const p = catalogo.find(x => x.id === Number(b.dataset.id));
  if (p) agregar(p);
});

document.getElementById('lista-carrito').addEventListener('click', e => {
  const b = e.target.closest('button[data-accion]');
  if (!b) return;
  const id = Number(b.dataset.id);
  ({ sumar, restar, quitar })[b.dataset.accion](id);
});

pintarCarrito();


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

  // --- Botón de tema claro/oscuro (sin elección guardada, sigue al sistema) ---
  const botonTema = document.getElementById('boton-tema');
  const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)');
  function pintarTema() {
    const elegido = raiz.getAttribute('data-tema');
    const oscuro = elegido ? elegido === 'oscuro' : sistemaOscuro.matches;
    raiz.classList.toggle('tema-oscuro', oscuro);
    if (botonTema) botonTema.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }
  if (botonTema) botonTema.addEventListener('click', () => {
    const nuevo = raiz.classList.contains('tema-oscuro') ? 'claro' : 'oscuro';
    raiz.setAttribute('data-tema', nuevo);
    try { localStorage.setItem('tema', nuevo); } catch (e) {}
    pintarTema();
  });
  sistemaOscuro.addEventListener('change', pintarTema);
  pintarTema();

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
    if (/no soporta|no se pudo|error|denegad|sin permiso|no disponible|está vacío/.test(t)) m.classList.add('error');
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
