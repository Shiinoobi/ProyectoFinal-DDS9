document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-producto");
  if (!formulario) return;

  const contenedorProductos = document.createElement("div");
  contenedorProductos.id = "vista-productos";
  formulario.parentNode.appendChild(contenedorProductos);

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descuento = document.getElementById("descuento").value;
    const puntos = document.getElementById("puntos").value;
    const categoria = document.getElementById("categoria").value;
    const imagenInput = document.getElementById("imagen");
    const descripcion = document.getElementById("descripcion").value;
    const imagen = imagenInput.files[0];

    if (!nombre || !precio || !puntos || !categoria || !descripcion) {
      document.getElementById("mensaje-formulario").textContent = "Todos los campos son obligatorios.";
      return;
    }

    const card = document.createElement("div");
    card.classList.add("card-producto");

    let precioHTML = `<p><strong>Precio:</strong> $${precio}</p>`;
    if (descuento) {
      const descuentoNum = parseFloat(descuento);
      const precioFinal = (precio - (precio * descuentoNum / 100)).toFixed(2);
      precioHTML = `<p><strong>Precio:</strong> <del>$${precio}</del> → $${precioFinal} (-${descuentoNum}%)</p>`;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const imgURL = reader.result;

      card.innerHTML = `
        ${imagen ? `<img src="${imgURL}" alt="Imagen del producto" />` : ""}
        <h3>${nombre}</h3>
        ${precioHTML}
        <p><strong>Puntos:</strong> ${puntos}</p>
        <p><strong>Categoría:</strong> ${categoria}</p>
        <p>${descripcion}</p>
      `;

      const editarBtn = document.createElement("button");
      editarBtn.textContent = "Editar";
      editarBtn.classList.add("editar-btn");

      editarBtn.addEventListener("click", () => {
        const formEdicion = document.createElement("form");
        formEdicion.classList.add("form-edicion");

        formEdicion.innerHTML = `
          <input type="text" value="${nombre}" class="edit-nombre" required />
          <input type="number" value="${precio}" class="edit-precio" required />
          <input type="number" value="${descuento}" class="edit-descuento" min="0" max="100" />
          <input type="number" value="${puntos}" class="edit-puntos" min="0" required />
          <select class="edit-categoria" required>
            <option value="digital" ${categoria === "digital" ? "selected" : ""}>Productos Digitales</option>
            <option value="fisico" ${categoria === "fisico" ? "selected" : ""}>Productos Físicos</option>
          </select>
          <input type="file" class="edit-imagen" accept="image/*" />
          <textarea class="edit-descripcion" required>${descripcion}</textarea>
          <button type="submit">Guardar cambios</button>
        `;

        card.appendChild(formEdicion);

        formEdicion.addEventListener("submit", (e) => {
          e.preventDefault();

          const nuevoNombre = formEdicion.querySelector(".edit-nombre").value;
          const nuevoPrecio = formEdicion.querySelector(".edit-precio").value;
          const nuevoDescuento = formEdicion.querySelector(".edit-descuento").value;
          const nuevosPuntos = formEdicion.querySelector(".edit-puntos").value;
          const nuevaCategoria = formEdicion.querySelector(".edit-categoria").value;
          const nuevaImagen = formEdicion.querySelector(".edit-imagen").files[0];
          const nuevaDescripcion = formEdicion.querySelector(".edit-descripcion").value;

          card.querySelector("h3").textContent = nuevoNombre;

          const precioNum = parseFloat(nuevoPrecio);
          const descuentoNum = parseFloat(nuevoDescuento);
          let precioFinal = precioNum;
          let precioHTML = `<strong>Precio:</strong> $${precioNum}`;
          if (!isNaN(descuentoNum) && descuentoNum > 0) {
            precioFinal = (precioNum - (precioNum * descuentoNum / 100)).toFixed(2);
            precioHTML = `<strong>Precio:</strong> <del>$${precioNum}</del> → $${precioFinal} (-${descuentoNum}%)`;
          }

          card.querySelector("p:nth-of-type(1)").innerHTML = precioHTML;
          card.querySelector("p:nth-of-type(2)").innerHTML = `<strong>Puntos:</strong> ${nuevosPuntos}`;
          card.querySelector("p:nth-of-type(3)").innerHTML = `<strong>Categoría:</strong> ${nuevaCategoria}`;
          card.querySelector("p:nth-of-type(4)").textContent = nuevaDescripcion;

          if (nuevaImagen) {
            const nuevaReader = new FileReader();
            nuevaReader.onload = function () {
              const nuevaURL = nuevaReader.result;
              const img = card.querySelector("img");
              if (img) {
                img.src = nuevaURL;
              } else {
                const nuevaImg = document.createElement("img");
                nuevaImg.src = nuevaURL;
                nuevaImg.alt = "Imagen del producto";
                card.insertBefore(nuevaImg, card.firstChild);
              }
            };
            nuevaReader.readAsDataURL(nuevaImagen);
          }

          formEdicion.remove();
        });
      });

      const eliminarBtn = document.createElement("button");
      eliminarBtn.textContent = "Eliminar";
      eliminarBtn.classList.add("eliminar-btn");
      eliminarBtn.addEventListener("click", () => {
        card.remove();
      });

      card.appendChild(editarBtn);
      card.appendChild(eliminarBtn);

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" || e.target.closest("form")) return;

        const datosProducto = {
          nombre,
          precio,
          descuento,
          puntos,
          categoria,
          descripcion,
          imgURL,
        };
        localStorage.setItem("producto-seleccionado", JSON.stringify(datosProducto));
        window.location.href = "../views/DatosProducto.html";
      });

      contenedorProductos.appendChild(card);
      formulario.reset();
      document.getElementById("mensaje-formulario").textContent = "¡Producto creado y mostrado!";
    };

    reader.readAsDataURL(imagen);
  });
});