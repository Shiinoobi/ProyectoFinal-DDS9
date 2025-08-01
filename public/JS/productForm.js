// public/JS/productForm.js

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3000'; 

// Elementos del DOM
const productForm = document.getElementById('formulario-producto');
const responseMessageDiv = document.getElementById('mensaje-formulario');

// NUEVOS ELEMENTOS DEL MODAL
const openModalBtn = document.getElementById('open-modal-btn');
const modal = document.getElementById('add-product-modal');
const closeBtn = document.querySelector('.close-btn');

// Función para manejar errores de red
const handleNetworkError = (error) => {
    console.error('Error de red:', error);
    return new Error('Error de conexión. Verifica tu conexión a internet.');
};

// Función para procesar respuestas del servidor
const processResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la solicitud. Intenta nuevamente.');
    }
    return response.json();
};

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para el modal
    if (openModalBtn && modal && closeBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Lógica del formulario para agregar productos
    if (productForm) {
        productForm.addEventListener('submit', async function(event) {
            event.preventDefault(); 

            const form = event.target;
            const formData = new FormData(form);

            responseMessageDiv.textContent = '';
            responseMessageDiv.className = '';
            responseMessageDiv.style.display = 'none';

            try {
                const result = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    body: formData, 
                    mode: 'cors'
                })
                .then(processResponse)
                .catch(handleNetworkError);

                responseMessageDiv.className = 'success';
                responseMessageDiv.textContent = result.message || 'Producto añadido con éxito.';
                form.reset(); 

            } catch (error) {
                console.error('Error al añadir producto:', error);
                responseMessageDiv.className = 'error';
                responseMessageDiv.textContent = error.message || 'Error desconocido al añadir el producto.';
            }
            responseMessageDiv.style.display = 'block';
        });
    } else {
        console.error('El formulario con ID "formulario-producto" no fue encontrado.');
    }
});