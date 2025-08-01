// public/JS/displayProducts.js

const API_BASE_URL = 'http://localhost:3000';
const productListContainer = document.getElementById('product-list');
const sortSelect = document.getElementById('sort-select');
const categoryFilterSelect = document.getElementById('category-filter');
const paginationContainer = document.getElementById('pagination');

// Variables para la paginación y filtros
const productsPerPage = 8;
let currentPage = 1;
let totalProducts = 0;
let currentSortOption = 'default';
let currentCategoryFilter = '';

// Función para crear el HTML de un solo producto
const createProductCard = (product) => {
    const imageUrl = product.image.startsWith('/') ? `${API_BASE_URL}${product.image}` : product.image

    // Se cambia el div principal por un enlace <a>
    return `
        <a href="productDetails.html?id=${product._id}" class="product-card">
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
        </a>
    `
}

// Función para renderizar los botones de paginación
const renderPagination = (totalItems) => {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / productsPerPage);

    if (totalPages <= 1) {
        return;
    }

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('page-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            fetchAndDisplayProducts();
        });
        paginationContainer.appendChild(button);
    }
};

// Función para cargar las categorías y poblar el selector
const fetchAndPopulateCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        if (!response.ok) {
            throw new Error('Error al obtener las categorías');
        }
        const categories = await response.json();

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilterSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

// Función para cargar y mostrar los productos desde la API
const fetchAndDisplayProducts = async () => {
    productListContainer.innerHTML = '<h2>Cargando productos...</h2>';
    
    // Construir la URL con los parámetros de ordenación, filtro y paginación
    const url = new URL(`${API_BASE_URL}/products`);
    url.searchParams.append('sort', currentSortOption);
    url.searchParams.append('page', currentPage);
    url.searchParams.append('limit', productsPerPage);

    if (currentCategoryFilter) {
        url.searchParams.append('category', currentCategoryFilter);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const data = await response.json();
        
        const products = data.products;
        totalProducts = data.totalProducts;

        if (products.length === 0) {
            productListContainer.innerHTML = '<h2>No hay productos disponibles.</h2>';
            paginationContainer.innerHTML = '';
            return;
        }

        // Antes de actualizar el contenido, eliminamos la clase de animación para que se pueda reiniciar
        productListContainer.classList.remove('fade-in');

        // Usamos requestAnimationFrame para asegurar que el DOM ha procesado el cambio
        window.requestAnimationFrame(() => {
            const productsHtml = products.map(createProductCard).join('');
            productListContainer.innerHTML = productsHtml;
            
            renderPagination(totalProducts);

            // Después de añadir el nuevo contenido, agregamos la clase para iniciar la animación
            productListContainer.classList.add('fade-in');
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productListContainer.innerHTML = '<h2>Error al cargar los productos. Por favor, intenta de nuevo más tarde.</h2>';
        paginationContainer.innerHTML = '';
    }
};

// Event listeners para los selectores de ordenación y filtro
if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
        currentSortOption = event.target.value;
        currentPage = 1; // Volver a la primera página con cada cambio
        fetchAndDisplayProducts();
    });
}

if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener('change', (event) => {
        currentCategoryFilter = event.target.value;
        currentPage = 1; // Volver a la primera página con cada cambio
        fetchAndDisplayProducts();
    });
}

// Cargar las categorías y los productos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchAndPopulateCategories();
    fetchAndDisplayProducts();
});