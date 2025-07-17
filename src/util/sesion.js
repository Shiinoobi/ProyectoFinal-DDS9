// Estado de la sesión
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null

// Verificar sesión en el servidor
export async function checkSession() {
    try {
        const response = await fetch('/api/check-session')
        const data = await response.json()
        
        if (data.status === 'active' && currentUser) {
            return true
        }
        
        // Si no hay sesión válida, limpiar
        clearSession()
        return false
        
    } catch (error) {
        console.error('Error verificando sesión:', error)
        return false
    }
}

// Establecer sesión
export function setSession(user) {
    currentUser = user
    sessionStorage.setItem('currentUser', JSON.stringify(user))
    updateNavbar()
}

// Limpiar sesión
export function clearSession() {
    currentUser = null
    sessionStorage.removeItem('currentUser')
    updateNavbar()
    
    // Redirigir si estamos en página protegida
    if (window.location.pathname.includes('Cuenta.html')) {
        window.location.href = 'Login.html'
    }
}

// Obtener usuario actual
export function getCurrentUser() {
    return currentUser
}

// Actualizar navbar con estado de sesión
async function updateNavbar() {
    const accountLink = document.querySelector('.navbar a[href*="Cuenta.html"]')
    if (!accountLink) return
    
    // Verificar sesión en el servidor
    const sessionValid = await checkSession()
    const user = getCurrentUser()
    
    if (sessionValid && user) {
        // Limitar nombre a 8 caracteres
        const displayName = user.name.length > 8 
            ? `${user.name.substring(0, 8)}...` 
            : user.name
            
        accountLink.innerHTML = `Cuenta (${displayName})<img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">`
    } else {
        accountLink.innerHTML = 'Cuenta<img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">'
    }
}

// Verificar sesión al cargar páginas protegidas
export function protectPage() {
    if (window.location.pathname.includes('Cuenta.html') && !getCurrentUser()) {
        window.location.href = 'Login.html'
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar()
    protectPage()
    
    // Configurar logout si existe el botón
    const logoutBtn = document.getElementById('logoutButton')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault()
            clearSession()
        })
    }
})