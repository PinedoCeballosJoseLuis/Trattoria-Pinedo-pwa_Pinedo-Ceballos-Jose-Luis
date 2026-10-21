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
