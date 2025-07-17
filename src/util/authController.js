import User from '../models/Users.js'
import { hashPassword, comparePasswords } from './passwordUtils.js'

export async function registerUser(email, password, name) {
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            throw new Error('El email ya está registrado')
        }

        const hashedPassword = await hashPassword(password)

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()
        return { success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email } }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export async function loginUser(email, password) {
    try {
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        const passwordMatch = await comparePasswords(password, user.password)
        if (!passwordMatch) {
            throw new Error('Contraseña incorrecta')
        }

        return { 
            success: true, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email 
            } 
        }
    } catch (error) {
        return { success: false, error: error.message }
    }
}