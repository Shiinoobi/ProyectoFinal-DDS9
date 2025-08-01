import { setSession } from './sesion.js'

// Configuración base
const API_BASE_URL = 'http://localhost:3000'

// Elementos del DOM
const signUpButton = document.getElementById('signUp')
const signInButton = document.getElementById('signIn')
const container = document.getElementById('container')
const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')

// Animación del formulario
signUpButton?.addEventListener('click', () => container.classList.add("right-panel-active"))
signInButton?.addEventListener('click', () => container.classList.remove("right-panel-active"))

// Función para manejar errores de red
const handleNetworkError = (error) => {
    console.error('Error de red:', error)
    return 'Error de conexión. Verifica tu conexión a internet.'
}

// Función para procesar respuestas
const processResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error en la solicitud')
    }
    return response.json()
}

// Manejo del Login
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    try {
        const data = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            }),
            credentials: 'include',
            mode: 'cors'
        })
        .then(processResponse)
        .catch(handleNetworkError)

        setSession(data.user)
        window.location.href = 'Cuenta.html'
        
    } catch (error) {
        console.error('Login Error:', error)
        alert(error.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    }
})

// Manejo del Registro
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    try {
        const data = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value
            }),
            credentials: 'include',
            mode: 'cors'
        })
        .then(processResponse)
        .catch(handleNetworkError)

        alert('¡Registro exitoso! Por favor inicia sesión.')
        container.classList.remove("right-panel-active")
        loginForm.reset()
        registerForm.reset()
        
    } catch (error) {
        console.error('Register Error:', error)
        alert(error.message || 'Error al registrar usuario. Intenta nuevamente.')
    }
})