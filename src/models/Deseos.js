import mongoose from 'mongoose';

const deseoSchema = new mongoose.Schema({
    userId: {
        type: String, // Usamos String como placeholder para el ID del usuario
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto', // Referencia al modelo de Producto
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Deseo = mongoose.model('Deseo', deseoSchema);

export default Deseo;