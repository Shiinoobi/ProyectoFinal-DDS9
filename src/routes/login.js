import { registerUser, loginUser } from "../util/authController.js"
import User from "../models/Users.js"

export default async function authRoutes(app) {
  // Ruta de registro
  app.post('/api/register', async (request, reply) => {
    try {
      const { name, email, password } = request.body
      const result = await registerUser(email, password, name)

      if (!result.success) {
        return reply.code(400)
          .header('Access-Control-Allow-Credentials', 'true')
          .send({ success: false, error: result.error })
      }

      // Crear token de sesión simple
      const sessionToken = `session_${result.user.id}_${Date.now()}`
      await User.findByIdAndUpdate(result.user.id, { sessionToken })

      // Configurar cookie manualmente
      const cookieOptions = [
        `Path=/`,
        `HttpOnly`,
        `SameSite=Strict`,
        `Max-Age=86400`,
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
      ].filter(Boolean).join('; ')

      return reply
        .header('Set-Cookie', `sessionToken=${sessionToken}; ${cookieOptions}`)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: true, user: result.user })
    } catch (error) {
      console.error('Error en registro:', error)
      return reply.code(500)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: false, error: 'Error en el servidor' })
    }
  })

  // Ruta de login
  app.post('/api/login', async (request, reply) => {
    try {
      const { email, password } = request.body
      const result = await loginUser(email, password)

      if (!result.success) {
        return reply.code(400)
          .header('Access-Control-Allow-Credentials', 'true')
          .send({ success: false, error: result.error })
      }

      // Crear token de sesión simple
      const sessionToken = `session_${result.user.id}_${Date.now()}`
      await User.findByIdAndUpdate(result.user.id, { sessionToken })

      // Configurar cookie manualmente
      const cookieOptions = [
        `Path=/`,
        `HttpOnly`,
        `SameSite=Strict`,
        `Max-Age=86400`,
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
      ].filter(Boolean).join('; ')

      return reply
        .header('Set-Cookie', `sessionToken=${sessionToken}; ${cookieOptions}`)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: true, user: result.user })
    } catch (error) {
      console.error('Error en login:', error)
      return reply.code(500)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: false, error: 'Error en el servidor' })
    }
  })

  // Ruta para verificar sesión
  app.get('/api/check-session', async (request, reply) => {
    try {
      const sessionToken = request.cookies?.sessionToken
      
      if (!sessionToken || !sessionToken.startsWith('session_')) {
        return reply
          .header('Access-Control-Allow-Credentials', 'true')
          .send({ status: 'inactive' })
      }

      const userId = sessionToken.split('_')[1]
      const user = await User.findOne({ 
        _id: userId,
        sessionToken: sessionToken
      }).select('-password')
      
      if (!user) {
        return reply
          .header('Access-Control-Allow-Credentials', 'true')
          .send({ status: 'inactive' })
      }

      return reply
        .header('Access-Control-Allow-Credentials', 'true')
        .send({
          status: 'active',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          }
        })
    } catch (error) {
      console.error('Error verificando sesión:', error)
      return reply
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ status: 'inactive' })
    }
  })

  // Ruta de logout
  app.post('/api/logout', async (request, reply) => {
    try {
      const sessionToken = request.cookies?.sessionToken
      if (sessionToken && sessionToken.startsWith('session_')) {
        const userId = sessionToken.split('_')[1]
        await User.findByIdAndUpdate(userId, { $unset: { sessionToken: 1 } })
      }
      
      // Configurar cookie de expiración manualmente
      const cookieOptions = [
        `Path=/`,
        `HttpOnly`,
        `SameSite=Strict`,
        `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
      ].filter(Boolean).join('; ')

      return reply
        .header('Set-Cookie', `sessionToken=; ${cookieOptions}`)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: true })
    } catch (error) {
      console.error('Error en logout:', error)
      return reply.code(500)
        .header('Access-Control-Allow-Credentials', 'true')
        .send({ success: false, error: 'Error al cerrar sesión' })
    }
  })
}