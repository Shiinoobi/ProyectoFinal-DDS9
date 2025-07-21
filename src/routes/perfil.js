import {User} from '../models/Users.js'
import { hashPassword, comparePasswords } from '../util/passwordUtils.js'

export default async function profileRoutes(fastify, options) {
  fastify.post('/api/update-profile', async (request, reply) => {
    try {
      const { userId, name, email, currentPassword, newPassword } = request.body
      
      // Verificar usuario
      const user = await User.findById(userId)
      if (!user) {
        return reply.code(404).send({ success: false, error: 'Usuario no encontrado' })
      }
      
      // Actualizar datos según lo solicitado
      if (name) user.name = name
      if (email) user.email = email
      
      // Si es cambio de contraseña
      if (newPassword) {
        const isMatch = await comparePasswords(currentPassword, user.password)
        if (!isMatch) {
          return reply.code(401).send({ success: false, error: 'Contraseña actual incorrecta' })
        }
        user.password = await hashPassword(newPassword)
      }
      
      // Guardar cambios
      await user.save()
      
      // Devolver usuario actualizado (sin password)
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
      
      return reply.send({ success: true, user: userData })
      
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      return reply.code(500).send({ success: false, error: 'Error al actualizar perfil' })
    }
  })
}