import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Insert a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
})

const User = mongoose.model('User', userSchema)

export default User