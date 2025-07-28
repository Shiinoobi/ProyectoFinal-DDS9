document.addEventListener("DOMContentLoaded", () => {
  const datos = localStorage.getItem("producto-seleccionado");
  const container = document.getElementById("datos-producto");

  if (!datos || !container) return;

  const producto = JSON.parse(datos);

  container.innerHTML = `
    ${producto.imgURL ? `<img src="${producto.imgURL}" alt="Imagen del producto" />` : ""}
    <h3>${producto.nombre}</h3>
    <p><strong>Precio:</strong> $${producto.precio}</p>
    ${producto.descuento ? `<p><strong>Descuento:</strong> ${producto.descuento}%</p>` : ""}
    <p><strong>Puntos:</strong> ${producto.puntos}</p>
    <p><strong>Categoría:</strong> ${producto.categoria}</p>
    <p>${producto.descripcion}</p>
  `;
});