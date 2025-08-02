import mongoose from 'mongoose';

const carritoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    quantity: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Carrito', carritoSchema);