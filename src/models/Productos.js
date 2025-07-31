import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Laptops',
            'Smartphones',
            'Tablets',
            'Accessories',
            'Wearables'
        ],
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true // Esto añade campos `createdAt` y `updatedAt` automáticamente
})

const Product = mongoose.model('Producto', productSchema)

export default Product