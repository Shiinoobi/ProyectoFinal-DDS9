document.addEventListener("DOMContentLoaded", function () {
  const datos = JSON.parse(localStorage.getItem("datosFactura"));
  if (!datos) return;

  const totalITBMS = datos.costoProductos * datos.itbms;
  const total = datos.costoProductos + totalITBMS + datos.costoEnvio;
  const nuevaDireccion = document.getElementById("direccionEnvioInput").value;
const datosFactura = JSON.parse(localStorage.getItem("datosFactura"));
datosFactura.direccion = nuevaDireccion;
localStorage.setItem("datosFactura", JSON.stringify(datosFactura));

  document.getElementById("usuario").textContent = datos.usuario;
  document.getElementById("nombreReal").textContent = datos.nombre;
  document.getElementById("gmail").textContent = datos.gmail;
  document.getElementById("cantidadProductos").textContent = datos.cantidadProductos;
  document.getElementById("costoProductos").textContent = `$${datos.costoProductos.toFixed(2)}`;
  document.getElementById("itbms").textContent = `$${totalITBMS.toFixed(2)}`;
  document.getElementById("direccionEnvioInput").value = datos.direccion;
  document.getElementById("costoEnvio").textContent = `$${datos.costoEnvio.toFixed(2)}`;
  document.getElementById("totalFactura").textContent = `$${total.toFixed(2)}`;

  // ✨ Animación suave para visualización
  document.querySelectorAll(".factura-item").forEach(el => {
    el.classList.add("visible");
  });
});
