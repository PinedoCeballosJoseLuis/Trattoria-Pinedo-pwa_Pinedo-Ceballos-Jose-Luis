// Renderizado del lado del cliente (CSR): carga catalogo.json y pinta las tarjetas
const contenedor = document.getElementById('productos');

fetch('catalogo.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(items => {
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
  })
  .catch(() => { contenedor.textContent = 'No se pudo cargar el catálogo.'; });
