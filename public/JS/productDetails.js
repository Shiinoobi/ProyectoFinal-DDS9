// Importamos la función para obtener el usuario de la sesión
import { getCurrentUser } from './sesion.js';

const API_BASE_URL = 'http://localhost:3000';
const productDetailsContainer = document.getElementById('product-details');
const relatedProductsGrid = document.getElementById('related-products-grid');
const wishlistPopup = document.getElementById('wishlist-popup');
const closePopupBtn = document.querySelector('.close-popup-btn');
const popupMessage = document.getElementById('popup-message');

// 🔐 Listener para cerrar popup de deseos
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductDetails(productId);
        fetchAndRenderRelatedProducts(productId);
    } else {
        productDetailsContainer.innerHTML = '<h2>Producto no encontrado.</h2><p>Vuelve a la <a href="Productos.html">página de productos</a>.</p>';
    }

    // Eventos para cerrar el popup
    closePopupBtn.addEventListener('click', () => wishlistPopup.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === wishlistPopup) {
            wishlistPopup.style.display = 'none';
        }
    });
});

// 🛒 Vincula botón de carrito dinámico
const bindCartButton = (productId) => {
    const cartBtn = document.querySelector('.add-to-cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', async () => {
            const user = getCurrentUser();
            if (!user || !user._id) return;

            try {
                const response = await fetch(`${API_BASE_URL}/carrito`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id, productId })
                });

                const data = await response.json();
                const message = response.ok ? data.message : data.message || 'Error al añadir al carrito';
                showCartPopup(message);
            } catch (error) {
                console.error('Error en carrito:', error);
                showCartPopup('Hubo un problema al conectar con el servidor.');
            }
        });
    }
};

// 💖 Vincula botón de deseos dinámico
const bindWishlistButton = (productId) => {
    const wishlistBtn = document.querySelector('.add-to-wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', async () => {
            const user = getCurrentUser();
            if (!user || !user._id) {
                showPopup('Debes iniciar sesión para agregar productos a tu lista de deseos.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/deseos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id, productId })
                });

                const data = await response.json();
                showPopup(data.message, response.ok ? 'success' : 'error');
            } catch (error) {
                console.error('Error en deseos:', error);
                showPopup('Hubo un error al agregar a deseos.', 'error');
            }
        });
    }
};

// 🧲 Renderiza producto y asigna eventos dinámicos
const fetchProductDetails = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');

        const product = await response.json();
        renderProductDetails(product);
        bindCartButton(product._id);
        bindWishlistButton(product._id);

    } catch (error) {
        console.error('Error al cargar detalles:', error);
        productDetailsContainer.innerHTML = '<h2>Error al cargar los detalles del producto.</h2><p>Intenta más tarde.</p>';
    }
};

const renderProductDetails = (product) => {
    const imageUrl = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image;

    const productHtml = `
        <div class="product-image-container">
            <img src="${imageUrl}" alt="${product.name}" class="product-details-image">
        </div>
        <div class="product-info">
            <h1>${product.name}</h1>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="description">${product.description}</p>
            <div class="action-buttons">
                <button class="add-to-cart-btn">Añadir al carrito</button>
                <button class="add-to-wishlist-btn">Añadir a deseos</button>
            </div>
        </div>
    `;

    productDetailsContainer.innerHTML = productHtml;
};

// 🔄 Productos relacionados (sin cambios mayores)
const fetchAndRenderRelatedProducts = async (currentProductId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/random?limit=4`);
        if (!response.ok) throw new Error('Error al obtener productos relacionados');

        const products = await response.json();
        const filtered = products.filter(p => p._id !== currentProductId);

        relatedProductsGrid.innerHTML = filtered.length > 0
            ? filtered.map(product => {
                const img = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image;
                return `
                    <a href="productDetails.html?id=${product._id}" class="related-product-card">
                        <img src="${img}" alt="${product.name}" class="related-product-image">
                        <h3 class="related-product-name">${product.name}</h3>
                        <p class="related-product-price">$${product.price.toFixed(2)}</p>
                    </a>
                `;
            }).join('')
            : '<p>No hay productos relacionados disponibles.</p>';
    } catch (error) {
        console.error('Error productos relacionados:', error);
        relatedProductsGrid.innerHTML = '<p>Error al cargar productos relacionados.</p>';
    }
};

// 🎯 Funciones visuales
const showPopup = (message, type) => {
    popupMessage.textContent = message;
    wishlistPopup.style.backgroundColor = type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)';
    wishlistPopup.style.display = 'flex';
};

const showCartPopup = (message) => {
    showPopup(message, 'success');
};