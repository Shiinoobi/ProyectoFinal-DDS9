// public/js/cuenta.js

import { getCurrentUser, setSession, clearSession } from './sesion.js';

// Elementos del DOM
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const editForm = document.getElementById('editForm');
const modalTitle = document.getElementById('modalTitle');
const nameFields = document.getElementById('nameFields');
const emailFields = document.getElementById('emailFields');
const passwordFields = document.getElementById('passwordFields');
const notificationModal = document.getElementById('notificationModal');
const notificationMessage = document.getElementById('notificationMessage');
const closeNotificationBtn = document.getElementById('closeNotificationBtn');
const notificationOkBtn = document.getElementById('notificationOkBtn');

// Variables globales para el modal
let currentEditType = '';

// Funciones del modal
function openEditModal(type) {
  currentEditType = type;
  const user = getCurrentUser();

  // Oculta todos los campos
  nameFields.style.display = 'none';
  emailFields.style.display = 'none';
  passwordFields.style.display = 'none';

  // Muestra los campos correctos
  if (type === 'name') {
    modalTitle.textContent = 'Cambiar Nombre';
    document.getElementById('newName').value = user.name;
    nameFields.style.display = 'block';
  } else if (type === 'email') {
    modalTitle.textContent = 'Cambiar Correo';
    document.getElementById('newEmail').value = user.email;
    emailFields.style.display = 'block';
  } else if (type === 'password') {
    modalTitle.textContent = 'Cambiar Contraseña';
    passwordFields.style.display = 'block';
  }

  editModal.style.display = 'block';
}

function closeModal() {
  editModal.style.display = 'none';
  editForm.reset();
}

// Funciones de notificación
function showNotification(message, type) {
  notificationMessage.textContent = message;
  notificationModal.className = `notification-modal ${type}`;
  notificationModal.style.display = 'block';
}

function closeNotificationModal() {
  notificationModal.style.display = 'none';
}

async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    const user = getCurrentUser();
    if (!user || (!user.id && !user._id)) {
      throw new Error('Se requiere userId para actualizar el perfil.');
    }
    const updateData = { userId: user.id || user._id };

    // Obtener los datos del formulario según el tipo de edición
    if (currentEditType === 'name') {
      const newName = document.getElementById('newName').value.trim();
      if (!newName) {
        throw new Error('El nombre no puede estar vacío');
      }
      updateData.name = newName;
    } else if (currentEditType === 'email') {
      const newEmail = document.getElementById('newEmail').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        throw new Error('Formato de correo electrónico inválido');
      }
      updateData.email = newEmail;
    } else if (currentEditType === 'password') {
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Todos los campos de contraseña son requeridos');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    const response = await fetch('http://localhost:3000/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error al actualizar perfil');
    }

    setSession(data.user);
    updateUserInfo(data.user);
    closeModal();
    showNotification('Cambios guardados exitosamente', 'success');

  } catch (error) {
    console.error('Error en handleFormSubmit:', error);
    showNotification(error.message || 'Error al guardar cambios', 'error');
  }
}

function updateUserInfo(user) {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'Login.html';
    return;
  }

  updateUserInfo(user);

  // Event listeners para los botones de editar
  document.getElementById('editNameBtn').addEventListener('click', () => openEditModal('name'));
  document.getElementById('editEmailBtn').addEventListener('click', () => openEditModal('email'));
  document.getElementById('editPasswordBtn').addEventListener('click', () => openEditModal('password'));

  // Event listeners para el modal y notificaciones
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  editForm.addEventListener('submit', handleFormSubmit);

  closeNotificationBtn?.addEventListener('click', closeNotificationModal);
  notificationOkBtn?.addEventListener('click', closeNotificationModal);

  window.addEventListener('click', (event) => {
    if (event.target === editModal) {
      closeModal();
    }
  });
});
