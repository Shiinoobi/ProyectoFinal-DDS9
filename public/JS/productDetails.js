// public/JS/productDetails.js

const API_BASE_URL = 'http://localhost:3000';
const productDetailsContainer = document.getElementById('product-details');
const relatedProductsGrid = document.getElementById('related-products-grid');

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductDetails(productId);
        fetchAndRenderRelatedProducts(productId); // Llama a la nueva función
    } else {
        productDetailsContainer.innerHTML = '<h2>Producto no encontrado.</h2><p>Vuelve a la <a href="Productos.html">página de productos</a>.</p>';
    }
});

const fetchProductDetails = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        const product = await response.json();
        renderProductDetails(product);
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

// NUEVA FUNCIÓN: Obtener y renderizar productos aleatorios
const fetchAndRenderRelatedProducts = async (currentProductId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/random?limit=4`);
        if (!response.ok) {
            throw new Error('Error al obtener productos relacionados');
        }
        const products = await response.json();

        // Filtra el producto actual de la lista de productos aleatorios
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