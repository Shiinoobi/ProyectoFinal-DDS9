const API_BASE_URL = 'http://localhost:3000';

// Estado de la sesión
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Verificar sesión en el servidor
export async function checkSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/check-session`, {
            credentials: 'include'
        });

        if (!response.ok) {
            const localUser = getCurrentUser();
            return !!localUser;
        }

        const data = await response.json();

        if (data.status === 'active' && data.user) {
            setSession(data.user);
            return true;
        }

        clearSession();
        return false;
    } catch (error) {
        console.error('Error verificando sesión:', error);
        const localUser = getCurrentUser();
        return !!localUser;
    }
}

// Establecer sesión
export function setSession(user) {
    try {
        if (!user || !user.name || !user.email) {
            throw new Error('Datos de usuario inválidos');
        }

        currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        updateNavbar();
    } catch (error) {
        console.error('Error estableciendo sesión:', error);
        clearSession();
    }
}

// Limpiar sesión
export function clearSession() {
    try {
        fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        updateNavbar();
        protectPage();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Obtener usuario actual
export function getCurrentUser() {
    return currentUser;
}

// Actualizar la barra de navegación según el estado de la sesión
export function updateNavbar() {
    try {
        const user = getCurrentUser();
        const accountLink = document.querySelector('a[href="Cuenta.html"]');

        if (!accountLink) {
            console.warn('Enlace de cuenta no encontrado.');
            return;
        }
        
        const loginLink = document.getElementById('login-nav-link');
        const logoutLink = document.getElementById('logout-nav-link');

        if (user) {
            // El usuario está logueado
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) {
                logoutLink.style.display = 'inline';
            }
            
            accountLink.innerHTML = `${user.name}<img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">`;
            
        } else {
            // El usuario no está logueado
            if (loginLink) loginLink.style.display = 'inline';
            if (logoutLink) logoutLink.style.display = 'none';
            accountLink.innerHTML = 'Cuenta<img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">';
        }
    } catch (error) {
        console.error('Error actualizando navbar:', error);
    }
}

// Verificar sesión al cargar páginas protegidas
export function protectPage() {
    try {
        const protectedPages = ['Cuenta.html', 'Deseos.html', 'Carrito.html', 'Facturacion.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !getCurrentUser()) {
            window.location.href = 'Login.html';
        }
    } catch (error) {
        console.error('Error protegiendo página:', error);
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        updateNavbar();
        protectPage();

        const logoutBtns = document.querySelectorAll('#logoutButton, .logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                clearSession();
                window.location.href = 'Login.html';
            });
        });

    } catch (error) {
        console.error('Error en el DOMContentLoaded:', error);
    }
});