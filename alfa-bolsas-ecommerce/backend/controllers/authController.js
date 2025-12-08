// ===== CONTROLLER DE AUTENTICACIÓN =====
// Maneja login, registro y verificación de usuarios

const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// ===== REGISTRAR USUARIO (Solo Admin puede crear otros usuarios) =====
// POST /api/auth/registro
exports.registro = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Validar datos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, email y contraseña son obligatorios'
      });
    }
    
    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    
    if (usuarioExistente) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El email ya está registrado'
      });
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,  // Se encriptará automáticamente por el pre-save
      rol: rol || 'asesora'
    });
    
    await nuevoUsuario.save();
    
    // Generar token
    const token = generarToken(nuevoUsuario._id);
    
    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: nuevoUsuario.obtenerDatosPublicos()
    });
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// ===== LOGIN =====
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que vengan email y password
    if (!email || !password) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Email y contraseña son obligatorios'
      });
    }
    
    // Buscar usuario por email (incluyendo password)
    const usuario = await Usuario.findOne({ email }).select('+password');
    
    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas'
      });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario desactivado. Contacta al administrador.'
      });
    }
    
    // Comparar password
    const passwordCorrecto = await usuario.compararPassword(password);
    
    if (!passwordCorrecto) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Credenciales inválidas'
      });
    }
    
    // Registrar último acceso
    await usuario.registrarAcceso();
    
    // Generar token
    const token = generarToken(usuario._id);
    
    res.json({
      exito: true,
      mensaje: 'Login exitoso',
      token,
      usuario: usuario.obtenerDatosPublicos()
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error en el login',
      error: error.message
    });
  }
};

// ===== OBTENER USUARIO ACTUAL =====
// GET /api/auth/me
exports.obtenerUsuarioActual = async (req, res) => {
  try {
    // req.usuario viene del middleware de autenticación
    const usuario = await Usuario.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }
    
    res.json({
      exito: true,
      usuario: usuario.obtenerDatosPublicos()
    });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// ===== CAMBIAR CONTRASEÑA =====
// PUT /api/auth/cambiar-password
exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;
    
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Debes proporcionar la contraseña actual y la nueva'
      });
    }
    
    if (passwordNuevo.length < 6) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Obtener usuario con password
    const usuario = await Usuario.findById(req.usuario.id).select('+password');
    
    // Verificar password actual
    const passwordCorrecto = await usuario.compararPassword(passwordActual);
    
    if (!passwordCorrecto) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Contraseña actual incorrecta'
      });
    }
    
    // Cambiar password
    usuario.password = passwordNuevo;  // Se encriptará automáticamente
    await usuario.save();
    
    res.json({
      exito: true,
      mensaje: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

// ===== FUNCIÓN AUXILIAR: GENERAR TOKEN JWT =====
const generarToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // Payload (datos que va a contener)
    process.env.JWT_SECRET,            // Clave secreta
    { expiresIn: '30d' }               // Expira en 30 días
  );
};

// ===== EXPLICACIÓN DE JWT (JSON Web Token) =====
/*

¿QUÉ ES UN TOKEN JWT?

Es como un "pase VIP" que el servidor le da al usuario cuando hace login.

ESTRUCTURA:
xxxxx.yyyyy.zzzzz

xxxxx = Header (tipo de token)
yyyyy = Payload (datos del usuario: id, rol, etc.)
zzzzz = Signature (firma que verifica que no fue manipulado)

EJEMPLO:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

FLUJO:

1. Usuario hace login con email y password
2. Servidor verifica que sea correcto
3. Servidor genera token JWT
4. Cliente guarda el token (localStorage o cookie)
5. Cliente envía el token en cada petición:
   
   Headers: {
     Authorization: 'Bearer xxxxx.yyyyy.zzzzz'
   }

6. Servidor verifica el token
7. Si es válido, permite la acción
8. Si no es válido, retorna error 401

VENTAJAS:
- No necesitas sesiones en el servidor
- Escalable (sin estado)
- Funciona entre diferentes dominios

SEGURIDAD:
- El token está firmado (no se puede modificar)
- Tiene expiración
- Si alguien lo roba, solo funciona hasta que expire
- Por eso NUNCA guardes información sensible en el payload

*/

module.exports = {
  registro,
  login,
  obtenerUsuarioActual,
  cambiarPassword
};