import {registerUser, loginUser} from "../util/authController.js"

export default async function routes(app) {
  // Ruta de registro
  app.post('/api/register', async (request, reply) => {
    const { name, email, password } = request.body
    const result = await registerUser(email, password, name)
    
    if (result.success) {
      return reply.send({ success: true, user: result.user })
    } else {
      return reply.code(400).send({ success: false, error: result.error })
    }
  })

  // Ruta de login
  app.post('/api/login', async (request, reply) => {
    const { email, password } = request.body
    const result = await loginUser(email, password)
    
    if (result.success) {
      return reply.send({ success: true, user: result.user })
    } else {
      return reply.code(400).send({ success: false, error: result.error })
    }
  })

  // Ruta para verificar sesión
  app.get('/api/check-session', async (request, reply) => {
    // Esta ruta sería consumida desde el frontend para verificar la sesión
    return reply.send({ status: 'active' })
  })
}