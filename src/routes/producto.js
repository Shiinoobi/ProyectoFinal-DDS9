// src/routes/productRoutes.js
import Product from "../models/Productos.js"
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import mongoose from "mongoose"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Directorio para guardar las imágenes subidas: public/img/productos
// '..' para salir de 'routes', '..' para salir de 'src', luego 'public/img/productos'
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'img', 'productos')

export default async function productRoutes(fastify, options) {
    // Registrar el plugin fastify-multipart para manejar 'multipart/form-data'
    fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // Limite de 10MB para el archivo
            files: 1 // Solo permitir un archivo por subida
        }
    })

    // Servir archivos estáticos del nuevo directorio 'public/img/productos'
    // Esto es crucial para que las imágenes subidas sean accesibles por el navegador
    fastify.register(fastifyStatic, {
        root: UPLOADS_DIR,
        prefix: '/img/productos/', // El prefijo que se usará en las URLs para acceder a las imágenes
        decorateReply: false // Evita conflictos si ya tienes fastify-static registrado globalmente
    })

    // Ruta para servir el HTML del formulario de Productos
    fastify.get('/productos', async (request, reply) => {
        // Asume que Productos.html está en la raíz de tu proyecto
        const productHtmlPath = path.join(__dirname, '..', '..', 'Productos.html')
        try {
            const htmlContent = await fs.readFile(productHtmlPath, 'utf-8')
            reply.type('text/html').send(htmlContent)
        } catch (err) {
            fastify.log.error(err)
            reply.status(500).send('Error al cargar la página de productos. ' + err.message)
        }
    })

    fastify.get('/products/:id', async (request, reply) => {
        try {
            const { id } = request.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return reply.code(400).send({ message: 'ID de producto inválido' });
            }

            const product = await Product.findById(id);

            if (!product) {
                console.warn('Error en la ruta /products/:id:', error);
                return reply.code(404).send({ message: 'Producto no encontrado' });
            }

            reply.code(200).send(product);
        } catch (error) {
            fastify.log.error('Error fetching product by ID:', error);
            console.error('Error en la ruta /products/:id:', error);
            reply.code(500).send({ message: 'Error interno del servidor' });
        }
    });

    // RUTA para obtener productos aleatorios
    fastify.get('/products/random', async (request, reply) => {
        try {
            const { limit = 4 } = request.query;
            const products = await Product.aggregate([
                { $sample: { size: parseInt(limit) } }
            ]);
            reply.send(products);
        } catch (error) {
            fastify.log.error('Error fetching random products:', error);
            reply.status(500).send({ message: 'Error interno del servidor' });
        }
    });


    fastify.get('/products/categories', async (request, reply) => {
        try {
            const categories = await Product.distinct('category');
            reply.send(categories);
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Error al obtener las categorías', error: error.message });
        }
    });

    fastify.get('/products', async (request, reply) => {
        try {
            const { sort, page = 1, limit = 8, category } = request.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const filter = {};
            if (category) {
                filter.category = category;
            }

            let productsQuery;
            if (sort === 'price') {
                productsQuery = Product.find(filter).sort({ price: 1 });
            } else if (sort === 'category') {
                productsQuery = Product.find(filter).sort({ category: 1 });
            } else {
                productsQuery = Product.find(filter).sort({ createdAt: -1 });
            }

            const totalProducts = await Product.countDocuments(filter);
            const products = await productsQuery.skip(skip).limit(parseInt(limit));

            reply.send({ products, totalProducts });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Error al obtener los productos', error: error.message });
        }
    });

    // Ruta POST para añadir un nuevo producto
    fastify.post('/products', async (request, reply) => {
        try {
            const data = await request.file() // Obtener el archivo del request (solo uno)

            if (!data) {
                return reply.status(400).send({ message: 'No se ha subido ninguna imagen.' })
            }

            const fields = data.fields
            const name = fields.name?.value
            const price = fields.price?.value
            const category = fields.category?.value
            const description = fields.description?.value

            if (!name || !price || !category) {
                return reply.status(400).send({ message: 'Nombre, precio y categoría son obligatorios.' })
            }

            // Crear el directorio 'public/img/productos' si no existe
            await fs.mkdir(UPLOADS_DIR, { recursive: true })

            // Generar un nombre único para la imagen
            const filename = `${Date.now()}-${data.filename}`
            const imagePath = path.join(UPLOADS_DIR, filename)

            // Guardar el archivo en el servidor
            await fs.writeFile(imagePath, await data.toBuffer())

            // Crear el nuevo producto en la base de datos
            const newProduct = new Product({
                name: name,
                price: parseFloat(price),
                category: category,
                // Guarda la ruta relativa al directorio 'public' para acceder desde el navegador
                image: `/img/productos/${filename}`,
                description: description
            })

            await newProduct.save()

            reply.status(201).send({ message: 'Producto añadido exitosamente', product: newProduct })
        } catch (error) {
            fastify.log.error(error)
            reply.status(500).send({ message: 'Error al añadir el producto', error: error.message })
        }
    })
}