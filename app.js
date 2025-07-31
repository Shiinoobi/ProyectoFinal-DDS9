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
        // Configuración CORS
        await app.register(fastifyCors, {
            origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
            credentials: true,
            exposedHeaders: ['set-cookie'],
            maxAge: 86400,
            preflightContinue: false
        })

        // Conexión a la base de datos
        await Database.connect()

        await app.register(async (fastify) => {
            const productRoutes = (await import('./src/routes/producto.js')).default
            await productRoutes(fastify)
        })

        await app.register(async (fastify) => {
            const authRoutes = (await import('./src/routes/login.js')).default
            await authRoutes(fastify)
        })

        // Registrar rutas de perfil (modular)
        await app.register(async (fastify) => {
            const profileRoutes = (await import('./src/routes/perfil.js')).default
            await profileRoutes(fastify)
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