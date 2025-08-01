// public/JS/carrito.js
// Módulo que gestiona visualización y operaciones del carrito del usuario

import { getCurrentUser } from './sesion.js';

const API_BASE_URL = 'http://localhost:3000';
const carritoListContainer = document.getElementById('carrito-products-list');

document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        fetchCartItems(user._id);
    } else {
        window.location.href = 'Login.html';
    }
});

const fetchCartItems = async (userId) => {
    carritoListContainer.innerHTML = '<p class="loader">Cargando productos del carrito...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/carrito/${userId}`);
        if (!response.ok) throw new Error('No se pudo cargar el carrito.');

        const cartItems = await response.json();
        renderCartItems(cartItems);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        carritoListContainer.innerHTML = '<p>Error al cargar el carrito.</p>';
    }
};

const renderCartItems = (items) => {
    if (items.length === 0) {
        carritoListContainer.innerHTML = '<p class="empty-list-message">Tu carrito está vacío.</p>';
        return;
    }

    const itemsHtml = items.map(item => {
        const product = item.productId;
        const imageUrl = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image;

        return `
            <div class="carrito-card" data-product-id="${product._id}">
                <a href="productDetails.html?id=${product._id}">
                    <img src="${imageUrl}" alt="${product.name}" class="carrito-image">
                    <div class="carrito-card-details">
                        <h3 class="carrito-name">${product.name}</h3>
                        <p class="carrito-price">$${product.price.toFixed(2)} × ${item.quantity}</p>
                        <p class="carrito-subtotal">Subtotal: $${(product.price * item.quantity).toFixed(2)}</p>
                    </div>
                </a>
                <div class="carrito-actions">
                    <button class="remove-from-cart-btn" data-product-id="${product._id}">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    carritoListContainer.innerHTML = itemsHtml;

    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const user = getCurrentUser();
            const productId = event.target.dataset.productId;

            if (confirm('¿Eliminar este producto del carrito?')) {
                removeFromCart(user._id, productId);
            }
        });
    });
    const total = items.reduce((acc, item) => {
  const product = item.productId;
  return acc + product.price * item.quantity;
}, 0);

document.getElementById('carrito-subtotal').textContent = `Subtotal: $${total.toFixed(2)}`;
document.getElementById('carrito-envio').textContent = 'Envío estimado: $5.00'; // ajustable
document.getElementById('carrito-total').textContent = `Total: $${(total + 5).toFixed(2)}`;
};

const removeFromCart = async (userId, productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/carrito/${userId}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('No se pudo eliminar el producto.');

        fetchCartItems(userId); // Recarga carrito
    } catch (error) {
        console.error('Error eliminando del carrito:', error);
        alert('Error al eliminar el producto del carrito.');
    }
};

document.getElementById('clear-cart-btn').addEventListener('click', async () => {
    const user = getCurrentUser();
    if (confirm('¿Vaciar todo el carrito?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/carrito/${user._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            fetchCartItems(user._id);
        } catch (err) {
            alert('Error al vaciar el carrito.');
        }
    }
});

document.getElementById("btnContinuarPago").addEventListener("click", function () {
    const user = getCurrentUser();

    const datosFactura = {
        usuario: user.usuario,
        nombre: user.nombre,
        gmail: user.gmail,
        cantidadProductos: obtenerCantidadCarrito(), // debes definir esta función
        costoProductos: calcularSubtotalCarrito(),   // debes definir esta función
        costoEnvio: 3.50, // puedes hacer esto dinámico si deseas
        itbms: 0.07,
        direccion: "Calle 123, Ciudad Panamá" // también puede venir del perfil del usuario
    };

    localStorage.setItem("datosFactura", JSON.stringify(datosFactura));
    window.location.href = "Facturacion.html";
});

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'Login.html';
    return;
  }

  fetchCartItems(user._id);

  // 🎯 Listener del botón “Continuar compra”
  const continuarBtn = document.getElementById("btnContinuarPago");
  if (continuarBtn) {
    continuarBtn.addEventListener("click", function () {
      const datosFactura = {
        usuario: user.usuario,
        nombre: user.nombre,
        gmail: user.gmail,
        cantidadProductos: obtenerCantidadCarrito(),
        costoProductos: calcularSubtotalCarrito(),
        costoEnvio: 3.50,
        itbms: 0.07,
        direccion: "Calle 123, Ciudad Panamá"
      };

      console.log("📦 Datos enviados a factura:", datosFactura); // Debug visual
      localStorage.setItem("datosFactura", JSON.stringify(datosFactura));
      window.location.href = "Facturacion.html";
    });
  } else {
    console.warn("Botón 'Continuar compra' no encontrado en el DOM.");
  }
});

function obtenerCantidadCarrito() {
  return document.querySelectorAll(".carrito-card").length;
}

function calcularSubtotalCarrito() {
  let total = 0;
  document.querySelectorAll(".carrito-subtotal").forEach(el => {
    const match = el.textContent.match(/\$([\d.]+)/);
    if (match) total += parseFloat(match[1]);
  });
  return total;
}