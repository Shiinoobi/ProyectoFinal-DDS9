// public/JS/deseos.js
// Archivo actualizado para usar la sesión del usuario para gestionar los deseos.

import { getCurrentUser } from './sesion.js';

const API_BASE_URL = 'http://localhost:3000';
const wishlistProductsList = document.getElementById('wishlist-products-list');

document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    if (user) {
        fetchWishlistProducts(user._id);
    } else {
        // Redirige al login si no hay un usuario logueado
        window.location.href = 'Login.html';
    }
});

const fetchWishlistProducts = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/deseos/${userId}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData.message);
            throw new Error('Error al obtener la lista de deseos.');
        }

        const products = await response.json();
        renderWishlistProducts(products);
    } catch (error) {
        console.error('Error fetching wishlist products:', error);
        wishlistProductsList.innerHTML = '<p>Error al cargar la lista de deseos.</p>';
    }
};

const renderWishlistProducts = (products) => {
    if (products.length === 0) {
        wishlistProductsList.innerHTML = '<p class="empty-list-message">Tu lista de deseos está vacía.</p>';
        return;
    }

const productsHtml = products.map(product => {
    const imageUrl = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image;
    return `
        <div class="wishlist-card" data-product-id="${product._id}">
            <a href="productDetails.html?id=${product._id}">
                <img src="${imageUrl}" alt="${product.name}" class="wishlist-image">
                <div class="wishlist-card-details">
                    <h3 class="wishlist-name">${product.name}</h3>
                    <p class="wishlist-price">$${product.price.toFixed(2)}</p>
                </div>
            </a>
            <div class="wishlist-actions">
                <button onclick="addToCart('${product._id}')" class="add-to-cart-btn">Añadir al carrito</button>
                <button class="remove-from-wishlist-btn" data-product-id="${product._id}">Borrar</button>
            </div>
        </div>
    `;
}).join('');

    wishlistProductsList.innerHTML = productsHtml;


    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
        const user = getCurrentUser();
        if (!user || !user._id) return;

        const productId = event.target.closest('.wishlist-card').dataset.productId;

        try {
            const response = await fetch(`${API_BASE_URL}/carrito`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, productId })
            });

            const data = await response.json();
            const message = response.ok ? data.message : data.message || 'Error al añadir al carrito';

            alert(message); // Si prefieres, podemos usar popup visual como el de productDetails.js

        } catch (error) {
            console.error('Error al añadir al carrito desde deseos:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });
});

    document.querySelectorAll('.remove-from-wishlist-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const user = getCurrentUser();
            if (!user) {
                // Doble comprobación, aunque el DOMContentLoaded ya lo gestiona
                window.location.href = 'Login.html';
                return;
            }
            const productId = event.target.dataset.productId;
            if (confirm('¿Estás seguro de que quieres eliminar este producto de tu lista de deseos?')) {
                removeProductFromWishlist(user._id, productId);
            }
        });
    });
};

const removeProductFromWishlist = async (userId, productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/deseos/${userId}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto.');
        }

        fetchWishlistProducts(userId);
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        alert('Hubo un error al eliminar el producto. Por favor, inténtalo de nuevo.');
    }
};
