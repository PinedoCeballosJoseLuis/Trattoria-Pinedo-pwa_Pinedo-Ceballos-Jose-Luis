// Renderizado del lado del cliente (CSR): carga catalogo.json, pinta filtros y tarjetas
const contenedor = document.getElementById('productos');
const filtros = document.getElementById('filtros');
let catalogo = [];

function pintar(items) {
  contenedor.innerHTML = '';
  items.forEach(p => {
    const art = document.createElement('article');
    art.className = 'tarjeta';
    art.innerHTML =
      '<img src="' + p.imagen + '" alt="' + p.nombre + '" loading="lazy">' +
      '<span class="categoria">' + p.categoria + '</span>' +
      '<h3>' + p.nombre + '</h3>' +
      '<p class="descripcion">' + p.descripcion + '</p>' +
      '<p class="precio">$' + p.precio.toFixed(2) + ' MXN</p>' +
      '<p class="stock">Stock: ' + p.stock + '</p>' +
      '<button type="button" class="btn-agregar" data-id="' + p.id + '">Agregar</button>';
    contenedor.appendChild(art);
  });
}

function pintarFiltros(categorias) {
  ['Todos'].concat(categorias).forEach((cat, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-filtro' + (i === 0 ? ' activo' : '');
    b.dataset.categoria = cat;
    b.textContent = cat;
    filtros.appendChild(b);
  });
}

filtros.addEventListener('click', e => {
  const b = e.target.closest('.btn-filtro');
  if (!b) return;
  filtros.querySelectorAll('.btn-filtro').forEach(x => x.classList.toggle('activo', x === b));
  const cat = b.dataset.categoria;
  pintar(cat === 'Todos' ? catalogo : catalogo.filter(p => p.categoria === cat));
});

fetch('catalogo.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(items => {
    catalogo = items;
    pintarFiltros([...new Set(items.map(p => p.categoria))]);
    pintar(catalogo);
  })
  .catch(() => { contenedor.textContent = 'No se pudo cargar el catálogo.'; });
