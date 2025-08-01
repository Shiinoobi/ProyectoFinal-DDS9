import Deseo from "../models/Deseos.js";
import Product from "../models/Productos.js"; // Es importante importar este modelo para que Mongoose lo registre
import mongoose from "mongoose";

export default async function deseosRoutes(fastify, options) {

    // RUTA POST para agregar un producto a la lista de deseos
    fastify.post('/deseos', async (request, reply) => {
        try {
            const { userId, productId } = request.body;

            // Validación básica
            if (!userId || !mongoose.Types.ObjectId.isValid(productId)) {
                return reply.status(400).send({ message: 'Datos de usuario o producto inválidos.' });
            }

            // Verificar si el producto ya está en la lista de deseos del usuario
            const existingDeseo = await Deseo.findOne({ userId, productId });
            if (existingDeseo) {
                return reply.status(409).send({ message: 'El producto ya está en tu lista de deseos.' });
            }

            const newDeseo = new Deseo({ userId, productId });
            await newDeseo.save();

            reply.status(201).send({ message: 'Producto agregado a deseos con éxito.' });
        } catch (error) {
            fastify.log.error('Error al agregar a deseos:', error);
            reply.status(500).send({ message: 'Error interno del servidor.' });
        }
    });

    // RUTA GET para obtener la lista de deseos de un usuario
    fastify.get('/deseos/:userId', async (request, reply) => {
        try {
            const { userId } = request.params;
            
            // Forzar a Mongoose a registrar el modelo Product para que populate funcione
            // Aunque ya se importa, esta línea asegura su registro si no lo estaba
            // por alguna razón.
            mongoose.model('Producto');

            const deseos = await Deseo.find({ userId }).populate('productId');
            
            const productosDeseados = deseos.map(deseo => deseo.productId);

            reply.send(productosDeseados);
        } catch (error) {
            fastify.log.error('Error al obtener la lista de deseos:', error);
            reply.status(500).send({ message: 'Error interno del servidor: Falta el modelo de producto.' });
        }
    });

    // RUTA DELETE para eliminar un producto de la lista de deseos
    fastify.delete('/deseos/:userId/:productId', async (request, reply) => {
        try {
            const { userId, productId } = request.params;

            const result = await Deseo.deleteOne({ userId, productId });

            if (result.deletedCount === 0) {
                return reply.status(404).send({ message: 'Producto no encontrado en la lista de deseos.' });
            }

            reply.status(200).send({ message: 'Producto eliminado de la lista de deseos con éxito.' });
        } catch (error) {
            fastify.log.error('Error al eliminar producto de deseos:', error);
            reply.status(500).send({ message: 'Error interno del servidor.' });
        }
    });
}
