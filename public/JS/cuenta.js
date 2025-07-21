import { getCurrentUser, setSession, clearSession } from '../../src/util/sesion.js'

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser()
  if (!user) {
    window.location.href = 'Login.html'
    return
  }

  displayUserInfo(user)

  document.getElementById('logoutButton').addEventListener('click', async (e) => {
    e.preventDefault()
    try {
      await clearSession()
      window.location.href = '../index.html'
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  })

  document.getElementById('editForm').addEventListener('submit', handleFormSubmit)
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

let currentEditType = ''

function openEditModal(type) {
  currentEditType = type
  const modal = document.getElementById('editModal')
  const title = document.getElementById('modalTitle')
  const user = getCurrentUser()

  document.getElementById('nameFields').style.display = type === 'name' ? 'block' : 'none'
  document.getElementById('emailFields').style.display = type === 'email' ? 'block' : 'none'
  document.getElementById('passwordFields').style.display = type === 'password' ? 'block' : 'none'
  
  if (type === 'name') document.getElementById('newName').value = user.name
  if (type === 'email') document.getElementById('newEmail').value = user.email
  
  title.textContent = `Cambiar ${type === 'name' ? 'Nombre' : type === 'email' ? 'Correo' : 'Contraseña'}`
  modal.style.display = 'block'
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none'
  document.getElementById('editForm').reset()
}

async function handleFormSubmit(e) {
  e.preventDefault()
  const user = getCurrentUser()
  
  try {
    const updateData = {
      userId: user.id
    }

    if (currentEditType === 'name') {
      updateData.name = document.getElementById('newName').value
    } else if (currentEditType === 'email') {
      updateData.email = document.getElementById('newEmail').value
    } else if (currentEditType === 'password') {
      const newPassword = document.getElementById('newPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value
      
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
      
      updateData.currentPassword = document.getElementById('currentPassword').value
      updateData.newPassword = newPassword
    }

    const response = await fetch('/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar perfil')
    }

    setSession(data.user)
    updateUserInfo(data.user)
    closeModal()
    showNotification('Cambios guardados exitosamente', 'success')
    
  } catch (error) {
    console.error('Error:', error)
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

window.addEventListener('click', (event) => {
  if (event.target === document.getElementById('editModal')) {
    closeModal()
  }
})