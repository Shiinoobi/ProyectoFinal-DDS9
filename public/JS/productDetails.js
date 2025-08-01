// public/JS/productDetails.js

// Importamos la función para obtener el usuario de la sesión
import { getCurrentUser } from './sesion.js'; // Asegúrate de que esta ruta sea correcta

const API_BASE_URL = 'http://localhost:3000';
const productDetailsContainer = document.getElementById('product-details');
const relatedProductsGrid = document.getElementById('related-products-grid');
const wishlistPopup = document.getElementById('wishlist-popup');
const closePopupBtn = document.querySelector('.close-popup-btn');
const popupMessage = document.getElementById('popup-message');

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductDetails(productId);
        fetchAndRenderRelatedProducts(productId);
    } else {
        productDetailsContainer.innerHTML = '<h2>Producto no encontrado.</h2><p>Vuelve a la <a href="Productos.html">página de productos</a>.</p>';
    }

    // Event listener para cerrar el popup
    closePopupBtn.addEventListener('click', () => {
        wishlistPopup.style.display = 'none';
    });

    // Cerrar el popup haciendo clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === wishlistPopup) {
            wishlistPopup.style.display = 'none';
        }
    });
});

const fetchProductDetails = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        const product = await response.json();
        renderProductDetails(product);

        // Lógica para el botón de deseos
        const addToWishlistBtn = document.querySelector('.add-to-wishlist-btn');
        if (addToWishlistBtn) {
            addToWishlistBtn.addEventListener('click', () => {
                // Obtenemos el usuario de la sesión
                const user = getCurrentUser();

                if (user && user._id) {
                    addProductToWishlist(user._id, product._id);
                } else {
                    showPopup('Debes iniciar sesión para agregar productos a tu lista de deseos.', 'error');
                }
            });
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        productDetailsContainer.innerHTML = '<h2>Error al cargar los detalles del producto.</h2><p>Por favor, intenta de nuevo más tarde.</p>';
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

const fetchAndRenderRelatedProducts = async (currentProductId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/random?limit=4`);
        if (!response.ok) {
            throw new Error('Error al obtener productos relacionados');
        }
        const products = await response.json();

        const filteredProducts = products.filter(p => p._id !== currentProductId);

        if (filteredProducts.length > 0) {
            const relatedProductsHtml = filteredProducts.map(product => {
                const imageUrl = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image;
                return `
                    <a href="productDetails.html?id=${product._id}" class="related-product-card">
                        <img src="${imageUrl}" alt="${product.name}" class="related-product-image">
                        <h3 class="related-product-name">${product.name}</h3>
                        <p class="related-product-price">$${product.price.toFixed(2)}</p>
                    </a>
                `;
            }).join('');
            relatedProductsGrid.innerHTML = relatedProductsHtml;
        } else {
            relatedProductsGrid.innerHTML = '<p>No hay productos relacionados disponibles.</p>';
        }
    } catch (error) {
        console.error('Error fetching related products:', error);
        relatedProductsGrid.innerHTML = '<p>Error al cargar productos relacionados.</p>';
    }
};

// Lógica para añadir a la lista de deseos
const addProductToWishlist = async (userId, productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/deseos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, productId }),
        });

        const data = await response.json();

        if (response.ok) {
            showPopup(data.message, 'success');
        } else {
            showPopup(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showPopup('Hubo un error al agregar el producto a la lista de deseos.', 'error');
    }
};

// Mostrar el popup de notificación
const showPopup = (message, type) => {
    popupMessage.textContent = message;
    if (type === 'success') {
        wishlistPopup.style.backgroundColor = 'rgba(40, 167, 69, 0.9)'; // Verde
    } else {
        wishlistPopup.style.backgroundColor = 'rgba(220, 53, 69, 0.9)'; // Rojo
    }
    wishlistPopup.style.display = 'flex';
};