document.getElementById("btnGuardar").addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const descuento = parseFloat(document.getElementById("descuento").value);
  const puntos = parseInt(document.getElementById("puntos").value);
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;
  const imagenBase64 = document.getElementById("imagenBase64").src;

  fetch("/api/productos/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, precio, descuento, puntos, categoria, descripcion, imagenBase64 }),
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Producto guardado:", data);
    // Aquí puedes limpiar el formulario o redirigir
  })
  .catch(err => console.error("❌ Error al guardar producto:", err));
});