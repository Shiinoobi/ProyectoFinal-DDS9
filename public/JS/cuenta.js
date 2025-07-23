import { getCurrentUser, setSession, clearSession } from '../../src/util/sesion.js'

// Variables globales para el modal
let currentEditType = ''

// Funciones del modal
function openEditModal(type) {
  currentEditType = type
  const modal = document.getElementById('editModal')
  const title = document.getElementById('modalTitle')
  const user = getCurrentUser()

  // Configurar campos según el tipo de edición
  document.getElementById('nameFields').style.display = type === 'name' ? 'block' : 'none'
  document.getElementById('emailFields').style.display = type === 'email' ? 'block' : 'none'
  document.getElementById('passwordFields').style.display = type === 'password' ? 'block' : 'none'
  
  // Rellenar valores actuales
  if (type === 'name') document.getElementById('newName').value = user.name
  if (type === 'email') document.getElementById('newEmail').value = user.email
  
  title.textContent = `Cambiar ${type === 'name' ? 'Nombre' : type === 'email' ? 'Correo' : 'Contraseña'}`
  modal.style.display = 'block'
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none'
  document.getElementById('editForm').reset()
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser()
  if (!user) {
    window.location.href = 'Login.html'
    return
  }

  displayUserInfo(user)

  // Configurar event listeners para los botones
  document.getElementById('editNameBtn').addEventListener('click', () => openEditModal('name'))
  document.getElementById('editEmailBtn').addEventListener('click', () => openEditModal('email'))
  document.getElementById('editPasswordBtn').addEventListener('click', () => openEditModal('password'))
  document.getElementById('closeModalBtn').addEventListener('click', closeModal)
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal)
  document.getElementById('logoutButton').addEventListener('click', () => {
    clearSession()
    window.location.href = '../index.html'
  })

  document.getElementById('editForm').addEventListener('submit', handleFormSubmit)

  // Cerrar modal al hacer clic fuera
  window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('editModal')) {
      closeModal()
    }
  })
})

function displayUserInfo(user) {
  const profileInfo = document.getElementById('profileInfo')
  profileInfo.innerHTML = `
    <div class="avatar-container">
      <img src="https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Pic-Clip-Art-Background.png" alt="Avatar" class="profile-avatar">
    </div>
    <div class="profile-details">
      <p><strong>Nombre:</strong> <span id="userName">${user.name}</span></p>
      <p><strong>Correo:</strong> <span id="userEmail">${user.email}</span></p>
      <p><strong>Miembro desde:</strong> ${new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
    </div>
  `
}

async function handleFormSubmit(e) {
  e.preventDefault()
  const user = getCurrentUser()
  
  if (!user || !user.id) {
    showNotification('No se pudo obtener la sesión del usuario', 'error')
    return
  }

  try {
    const updateData = {
      userId: user.id
    }

    if (currentEditType === 'name') {
      updateData.name = document.getElementById('newName').value.trim()
      if (!updateData.name) throw new Error('El nombre no puede estar vacío')
    } 
    else if (currentEditType === 'email') {
      updateData.email = document.getElementById('newEmail').value.trim()
      if (!updateData.email) throw new Error('El correo no puede estar vacío')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
        throw new Error('Ingresa un correo válido')
      }
    } 
    else if (currentEditType === 'password') {
      updateData.currentPassword = document.getElementById('currentPassword').value
      updateData.newPassword = document.getElementById('newPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value
      
      if (!updateData.newPassword || !updateData.currentPassword) {
        throw new Error('Todos los campos de contraseña son requeridos')
      }
      if (updateData.newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
    }

    const response = await fetch('http://localhost:3000/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Error al actualizar perfil')
    }

    setSession(data.user)
    updateUserInfo(data.user)
    closeModal()
    showNotification('Cambios guardados exitosamente', 'success')
    
  } catch (error) {
    console.error('Error en handleFormSubmit:', error)
    showNotification(error.message || 'Error al guardar cambios', 'error')
  }
}

function updateUserInfo(user) {
  document.getElementById('userName').textContent = user.name
  document.getElementById('userEmail').textContent = user.email
}

function showNotification(message, type) {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}