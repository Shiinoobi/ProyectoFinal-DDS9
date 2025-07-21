import fastify from "fastify"
import path from "path"
import fastifyStatic from "@fastify/static"
import fastifyCors from "@fastify/cors"
import { fileURLToPath } from "url"
import Database from "./src/config/db.js"
import dotenv from "dotenv"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
    }
})

// Configuración de archivos estáticos
app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/',
})

async function startServer() {
    try {
        // Configuración CORS mejorada según documentación oficial
        await app.register(fastifyCors, {
            origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Dominios específicos
            methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept'],
            credentials: true,
            exposedHeaders: ['set-cookie'],
            maxAge: 86400,
            preflightContinue: false
        })

        // Conexión a la base de datos
        await Database.connect()

        await app.register(async (fastify) => {
            const authRoutes = (await import('./src/routes/login.js')).default
            await authRoutes(fastify)
        })

        // Registrar rutas de perfil (modular)
        await app.register(async (fastify) => {
            // Ruta para actualizar perfil
            fastify.post('/api/update-profile', async (request, reply) => {
                const { User } = await import('./src/models/Users.js')
                const { hashPassword, comparePasswords } = await import('./src/utils/passwordUtils.js')

                try {
                    const { userId, name, email, currentPassword, newPassword } = request.body

                    // Verificar usuario
                    const user = await User.findById(userId)
                    if (!user) {
                        return reply.code(404).send({ success: false, error: 'Usuario no encontrado' })
                    }

                    // Actualizar datos
                    if (name) user.name = name
                    if (email) user.email = email

                    // Cambio de contraseña
                    if (newPassword) {
                        const isMatch = await comparePasswords(currentPassword, user.password)
                        if (!isMatch) {
                            return reply.code(401).send({ success: false, error: 'Contraseña actual incorrecta' })
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
                        .header('Access-Control-Allow-Credentials', 'true')
                        .send({ success: true, user: userData })

                } catch (error) {
                    console.error('Error actualizando perfil:', error)
                    return reply.code(500).send({
                        success: false,
                        error: 'Error al actualizar perfil'
                    })
                }
            })
        })

        // Health check endpoint
        app.get('/health', async (request, reply) => {
            const dbConnection = Database.getConnection()
            return {
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0',
                database: {
                    connected: Database.isConnected(),
                    name: dbConnection?.name || 'disconnected'
                }
            }
        })

        // Iniciar servidor
        const port = process.env.PORT || 3000
        const address = await app.listen({
            port: port,
            host: '0.0.0.0'
        })

        console.log(`🚀 Servidor Fastify corriendo en ${address}`)
        console.log('📊 Endpoints disponibles:')
        console.log('   - GET  /health')
        console.log('   - POST /api/register')
        console.log('   - POST /api/login')
        console.log('   - GET  /api/check-session')
        console.log('   - POST /api/update-profile')

    } catch (error) {
        console.error('Error al iniciar el servidor:', error)
        await Database.disconnect()
        process.exit(1)
    }
}

// Apagado controlado
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, async () => {
        console.log(`Recibido ${signal}, cerrando servidor...`)
        try {
            await app.close()
            await Database.disconnect()
            console.log('Servidor cerrado correctamente')
            process.exit(0)
        } catch (err) {
            console.error('Error durante el cierre:', err)
            process.exit(1)
        }
    })
})

startServer()