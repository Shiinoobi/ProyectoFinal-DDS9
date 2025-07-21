// Estado de la sesión
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null

// Verificar sesión en el servidor
export async function checkSession() {
    try {
        const response = await fetch('/api/check-session', {
            credentials: 'include'
        })
        
        if (!response.ok) {
            const localUser = getCurrentUser()
            return !!localUser
        }
        
        const data = await response.json()
        
        if (data.status === 'active' && data.user) {
            setSession(data.user)
            return true
        }
        
        clearSession()
        return false
        
    } catch (error) {
        console.error('Error verificando sesión:', error)
        const localUser = getCurrentUser()
        return !!localUser
    }
}

// Establecer sesión
export function setSession(user) {
    try {
        if (!user || !user.name || !user.email) {
            throw new Error('Datos de usuario inválidos')
        }
        
        currentUser = user
        sessionStorage.setItem('currentUser', JSON.stringify(user))
        updateNavbar()
    } catch (error) {
        console.error('Error estableciendo sesión:', error)
        clearSession()
    }
}

// Limpiar sesión
export function clearSession() {
    try {
        // Llamar al endpoint de logout
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).catch(error => console.error('Error en logout:', error))
        
        currentUser = null
        sessionStorage.removeItem('currentUser')
        localStorage.removeItem('persistentSession')
        updateNavbar()
        
        const protectedPages = ['Cuenta.html', 'Deseos.html', 'Carrito.html']
        if (protectedPages.some(page => window.location.pathname.includes(page))) {
            window.location.href = 'Login.html'
        }
    } catch (error) {
        console.error('Error limpiando sesión:', error)
    }
}

// Obtener usuario actual
export function getCurrentUser() {
    try {
        if (!currentUser && sessionStorage.getItem('currentUser')) {
            currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
        }
        return currentUser
    } catch (error) {
        console.error('Error obteniendo usuario:', error)
        return null
    }
}

// Actualizar navbar con estado de sesión
export async function updateNavbar() {
    try {
        const accountLinks = document.querySelectorAll('.navbar a[href*="Cuenta.html"]')
        if (!accountLinks.length) return
        
        const user = getCurrentUser()
        const sessionValid = await checkSession()
        
        accountLinks.forEach(accountLink => {
            if (sessionValid && user) {
                const displayName = user.name.length > 8 
                    ? `${user.name.substring(0, 8)}...` 
                    : user.name
                accountLink.innerHTML = `${displayName} <img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">`
            } else {
                accountLink.innerHTML = 'Cuenta<img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Icono">'
            }
        })
    } catch (error) {
        console.error('Error actualizando navbar:', error)
    }
}

// Verificar sesión al cargar páginas protegidas
export function protectPage() {
    try {
        const protectedPages = ['Cuenta.html', 'Deseos.html', 'Carrito.html', 'Facturacion.html']
        const currentPage = window.location.pathname.split('/').pop()
        
        if (protectedPages.includes(currentPage) && !getCurrentUser()) {
            window.location.href = 'Login.html'
        }
    } catch (error) {
        console.error('Error protegiendo página:', error)
    }
}

// Para recordar sesión entre pestañas
export function setPersistentSession(user) {
    setSession(user)
    localStorage.setItem('persistentSession', JSON.stringify(user))
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        updateNavbar()
        protectPage()
        
        const logoutBtns = document.querySelectorAll('#logoutButton, .logout-btn')
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                clearSession()
                window.location.href = '/'
            })
        })
    } catch (error) {
        console.error('Error inicializando sesión:', error)
    }
})