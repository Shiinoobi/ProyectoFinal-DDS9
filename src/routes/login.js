import User from "../models/Users.js"; // Asegúrate de que la ruta a tu modelo de usuario sea correcta
import { registerUser, loginUser } from "../util/authController.js";

export default async function authRoutes(app) {

  app.post('/api/register', async (request, reply) => {
    try {
      const { name, email, password } = request.body;
      // La lógica de registro se mantiene en el controlador
      const result = await registerUser(email, password, name);

      if (!result.success) {
        return reply.code(400)
          .send({ success: false, error: result.error });
      }

      // Si el registro es exitoso, el servidor simplemente responde.
      // La autenticación (creación de sesión) ocurrirá en la ruta de login.
      return reply.code(201).send({ success: true, message: "Registro exitoso." });
    } catch (error) {
      console.error('Error en registro:', error);
      return reply.code(500)
        .send({ success: false, error: 'Error en el servidor' });
    }
  });

  app.post('/api/login', async (request, reply) => {
    try {
      const { email, password } = request.body;
      const result = await loginUser(email, password);

      if (!result.success) {
        return reply.code(400)
          .send({ success: false, error: result.error });
      }

      request.session.user = {
        _id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      };

      return reply.send({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: request.session.user,
      });
    } catch (error) {
      console.error('Error en login:', error);
      return reply.code(500)
        .send({ success: false, error: 'Error en el servidor' });
    }
  });

  app.get('/api/check-session', async (request, reply) => {
    try {
      // Si `request.session.user` existe, significa que hay una sesión activa.
      if (request.session.user) {
        return reply.send({ status: 'active', user: request.session.user });
      } else {
        return reply.code(401).send({ status: 'inactive', message: 'No hay sesión activa.' });
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return reply.code(500).send({ status: 'inactive', error: 'Error en el servidor' });
    }
  });

  app.post('/api/logout', async (request, reply) => {
    try {
      // DESTRUIR LA SESIÓN: Esto elimina la sesión del servidor y la cookie.
      request.session.destroy((err) => {
        if (err) {
          console.error('Error al destruir la sesión:', err);
          return reply.code(500).send({ success: false, error: 'Error al cerrar sesión' });
        }
        reply.send({ success: true, message: 'Sesión cerrada exitosamente.' });
      });
    } catch (error) {
      console.error('Error en logout:', error);
      return reply.code(500)
        .send({ success: false, error: 'Error al cerrar sesión' });
    }
  });
}
