// public/JS/productForm.js

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3000'; // Asegúrate de que este sea el puerto de tu Fastify

// Elementos del DOM
const productForm = document.getElementById('formulario-producto');
const responseMessageDiv = document.getElementById('mensaje-formulario');

// Función para manejar errores de red
const handleNetworkError = (error) => {
    console.error('Error de red:', error);
    // Retorna un mensaje que pueda ser mostrado al usuario
    return new Error('Error de conexión. Verifica tu conexión a internet.');
};

// Función para procesar respuestas del servidor
const processResponse = async (response) => {
    if (!response.ok) {
        // Intenta parsear el error JSON, si no es JSON, devuelve un objeto vacío
        const errorData = await response.json().catch(() => ({}));
        // Lanza un error con el mensaje del servidor o un mensaje genérico
        throw new Error(errorData.message || 'Error en la solicitud. Intenta nuevamente.');
    }
    return response.json(); // Si es exitosa, devuelve el JSON de la respuesta
};

document.addEventListener('DOMContentLoaded', () => {
    if (productForm) {
        productForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el envío tradicional del formulario

            const form = event.target;
            const formData = new FormData(form);

            // Limpiar y ocultar el mensaje anterior
            responseMessageDiv.textContent = '';
            responseMessageDiv.className = '';
            responseMessageDiv.style.display = 'none';

            try {
                // Realizar la solicitud usando fetch y encadenando las funciones de manejo
                const result = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    body: formData, // FormData se encarga de formatear como multipart/form-data
                    mode: 'cors' // Asegúrate de que el modo CORS esté habilitado si tu Fastify está en otro origen/puerto
                })
                .then(processResponse) // Procesa la respuesta (verifica si es ok, parsea JSON)
                .catch(handleNetworkError); // Captura errores de red

                // Si llegamos aquí, la respuesta fue exitosa y procesada
                responseMessageDiv.className = 'success'; // Asume que tienes estilos para .success
                responseMessageDiv.textContent = result.message || 'Producto añadido con éxito.';
                form.reset(); // Limpiar el formulario después de un envío exitoso

            } catch (error) {
                // Captura errores lanzados por processResponse o handleNetworkError
                console.error('Error al añadir producto:', error);
                responseMessageDiv.className = 'error'; // Asume que tienes estilos para .error
                responseMessageDiv.textContent = error.message || 'Error desconocido al añadir el producto.';
            }
            responseMessageDiv.style.display = 'block'; // Mostrar el mensaje de respuesta
        });
    } else {
        console.error('El formulario con ID "formulario-producto" no fue encontrado.');
    }
});