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
            origin: 'http://localhost:5500', // Específico (no array)
            methods: ['GET', 'POST', 'OPTIONS'], // OPTIONS es esencial
            allowedHeaders: ['Content-Type', 'Accept'],
            credentials: true,
            exposedHeaders: ['set-cookie'], // Necesario para cookies
            maxAge: 86400, // Cache preflight por 24h
            preflightContinue: false // Importante para credenciales
        })

        // Conexión a la base de datos
        await Database.connect()

        // Rutas de autenticación
        await app.register(async (fastify) => {
            // Ruta de registro
            fastify.post('/api/register', async (request, reply) => {
                const { name, email, password } = request.body
                const { registerUser } = await import('./src/util/authController.js')
                const result = await registerUser(email, password, name)

                return result.success
                    ? reply
                        .header('Access-Control-Allow-Credentials', 'true')
                        .send({ success: true, user: result.user })
                    : reply
                        .code(400)
                        .header('Access-Control-Allow-Credentials', 'true')
                        .send({ success: false, error: result.error })
            })

            // Ruta de login
            fastify.post('/api/login', async (request, reply) => {
                const { email, password } = request.body
                const { loginUser } = await import('./src/util/authController.js')
                const result = await loginUser(email, password)

                return result.success
                    ? reply
                        .header('Access-Control-Allow-Credentials', 'true')
                        .send({ success: true, user: result.user })
                    : reply
                        .code(400)
                        .header('Access-Control-Allow-Credentials', 'true')
                        .send({ success: false, error: result.error })
            })

            // Ruta para verificar sesión
            fastify.get('/api/check-session', async (request, reply) => {
                return reply
                    .header('Access-Control-Allow-Credentials', 'true')
                    .send({ status: 'active' })
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