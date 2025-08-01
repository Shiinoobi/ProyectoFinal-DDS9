import User from '../models/Users.js'
import { hashPassword, comparePasswords } from './passwordUtils.js'

export async function loginUser(email, password) {
  try {
    const user = await User.findOne({ email })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    const isMatch = await comparePasswords(password, user.password)
    if (!isMatch) return { success: false, error: 'Contraseña incorrecta' }

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    }
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: 'Error en el servidor' }
  }
}

export async function registerUser(email, password, name) {
  try {
    const exists = await User.findOne({ email })
    if (exists) return { success: false, error: 'El correo ya está registrado' }

    const hashedPassword = await hashPassword(password)
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    })

    await newUser.save()

    return {
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    }
  } catch (error) {
    console.error('Error en registro:', error)
    return { success: false, error: 'Error en el servidor' }
  }
}