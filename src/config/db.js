import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

class Database {
    constructor() {
        this.mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/store"
        this.options = {
            serverSelectionTimeoutMS: 5000, // Timeout después de 5s
            socketTimeoutMS: 45000, // Cerrar conexiones después de 45s de inactividad
            maxPoolSize: 10, // Mantener hasta 10 conexiones de socket
            serverSelectionTimeoutMS: 5000, // Tiempo de espera para seleccionar servidor
            bufferCommands: false,
        }
    }

    async connect() {
        try {
            await mongoose.connect(this.mongoURI, this.options)
            console.log('🍃 Conectado a MongoDB exitosamente')
            console.log(`📍 Base de datos: ${mongoose.connection.name}`)

            // Eventos de conexión
            mongoose.connection.on('error', (err) => {
                console.error('❌ Error de conexión a MongoDB:', err)
            })

            mongoose.connection.on('disconnected', () => {
                console.log('🔌 Desconectado de MongoDB')
            })

            process.on('SIGINT', () => {
                mongoose.connection.close(() => {
                    console.log('🔐 Conexión a MongoDB cerrada por terminación de la aplicación')
                    process.exit(0)
                })
            })

        } catch (error) {
            console.error('❌ Error al conectar con MongoDB:', error)
            process.exit(1)
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect()
            console.log('🔌 Desconectado de MongoDB')
        } catch (error) {
            console.error('❌ Error al desconectar de MongoDB:', error)
        }
    }

    getConnection() {
        return mongoose.connection
    }

    isConnected() {
        return mongoose.connection.readyState === 1
    }
}

export default new Database()