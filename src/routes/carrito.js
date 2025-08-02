import Carrito from '../models/Carrito.js';
import Product from '../models/Productos.js';
import mongoose from 'mongoose';

export default async function carritoRoutes(fastify, options) {
    // 🛒 Agregar producto al carrito
    fastify.post('/carrito', async (request, reply) => {
        try {
            console.log('📥 Datos recibidos en /carrito:', request.body);
            const { userId, productId } = request.body;

            // Validaciones básicas
            if (!userId || !mongoose.Types.ObjectId.isValid(productId)) {
                return reply.status(400).send({ message: 'Datos inválidos' });
            }

            // (Opcional) Verificar existencia del producto
            // const existeProducto = await Product.findById(productId);
            // if (!existeProducto) {
            //     return reply.status(404).send({ message: 'Producto no existe en la base.' });
            // }

            // Verificar si el producto ya está en el carrito
            const existente = await Carrito.findOne({ userId, productId });

            if (existente) {
                existente.quantity += 1;
                await existente.save();
                return reply.status(200).send({ message: 'Cantidad actualizada en el carrito.' });
            }

            const nuevo = new Carrito({ userId, productId });
            await nuevo.save();
            reply.status(201).send({ message: 'Producto añadido al carrito.' });

        } catch (error) {
            console.error('❌ Error interno en POST /carrito:', error);
            reply.status(500).send({ message: 'Error al añadir al carrito.' });
        }
    });

    // 📦 Obtener productos del carrito para un usuario
    fastify.get('/carrito/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            const productos = await Carrito.find({ userId }).populate('productId');
            reply.send(productos);
        } catch (error) {
            console.error('❌ Error en GET /carrito:', error);
            reply.status(500).send({ message: 'Error al obtener el carrito.' });
        }
    });

    // 🗑️ Eliminar producto específico del carrito
    fastify.delete('/carrito/:userId/:productId', async (request, reply) => {
        try {
            const { userId, productId } = request.params;
            const resultado = await Carrito.deleteOne({ userId, productId });

            if (resultado.deletedCount === 0) {
                return reply.status(404).send({ message: 'Producto no encontrado en el carrito.' });
            }

            reply.send({ message: 'Producto eliminado del carrito.' });
        } catch (error) {
            console.error('❌ Error en DELETE /carrito:', error);
            reply.status(500).send({ message: 'Error al eliminar del carrito.' });
        }
    });
}