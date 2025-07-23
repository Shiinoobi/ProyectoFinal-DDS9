import User from '../models/Users.js'
import { hashPassword, comparePasswords } from '../util/passwordUtils.js'

export default async function profileRoutes(fastify, options) {
  fastify.post('/api/update-profile', async (request, reply) => {
    try {
      const { userId, name, email, currentPassword, newPassword } = request.body
      
      if (!userId) {
        return reply.code(400).send({
          success: false,
          error: 'Se requiere userId'
        })
      }

      const user = await User.findById(userId)
      if (!user) {
        return reply.code(404).send({ 
          success: false, 
          error: 'Usuario no encontrado' 
        })
      }
      
      // Actualizar nombre
      if (name) {
        if (name.trim().length < 2) {
          return reply.code(400).send({
            success: false,
            error: 'El nombre debe tener al menos 2 caracteres'
          })
        }
        user.name = name.trim()
      }
      
      // Validación para email
      if (email && email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return reply.code(400).send({
            success: false,
            error: 'Correo electrónico no válido'
          })
        }
        
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return reply.code(409).send({
            success: false,
            error: 'El correo electrónico ya está en uso'
          })
        }
        
        user.email = email
      }
      
      // Cambio de contraseña
      if (newPassword) {
        if (!currentPassword) {
          return reply.code(400).send({
            success: false,
            error: 'Se requiere la contraseña actual'
          })
        }
        
        const isMatch = await comparePasswords(currentPassword, user.password)
        if (!isMatch) {
          return reply.code(401).send({ 
            success: false, 
            error: 'Contraseña actual incorrecta' 
          })
        }
        
        if (newPassword.length < 6) {
          return reply.code(400).send({
            success: false,
            error: 'La contraseña debe tener al menos 6 caracteres'
          })
        }
        
        user.password = await hashPassword(newPassword)
      }
      
      await user.save()
      
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
      
      return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ 
          success: true, 
          user: userData 
        })
      
    } catch (error) {
      console.error('Error en update-profile:', error)
      return reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ 
          success: false, 
          error: 'Error interno del servidor',
          message: error.message 
        })
    }
  })
}