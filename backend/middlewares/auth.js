// ===== MIDDLEWARE DE AUTENTICACIÓN =====
// Verifica que el usuario esté logueado y tenga permisos

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ===== MIDDLEWARE: PROTEGER RUTAS =====
// Verifica que el usuario tenga un token válido
exports.proteger = async (req, res, next) => {
  try {
    let token;
    
    // 1. Verificar si el token viene en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // El formato es: "Bearer xxxxx.yyyyy.zzzzz"
      // Extraemos solo el token (sin "Bearer ")
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Si no hay token, retornar error
    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No estás autorizado. Debes iniciar sesión.'
      });
    }
    
    // 3. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // decoded contiene: { id: 'usuario_id', iat: timestamp, exp: timestamp }
    
    // 4. Buscar el usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario no encontrado'
      });
    }
    
    // 5. Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario desactivado'
      });
    }
    
    // 6. Agregar usuario a req para usarlo en los controllers
    req.usuario = {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
    
    // 7. Continuar al siguiente middleware o controller
    next();
    
  } catch (error) {
    console.error('Error en middleware proteger:', error);
    
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token expirado. Debes iniciar sesión nuevamente.'
      });
    }
    
    res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar autenticación',
      error: error.message
    });
  }
};

// ===== MIDDLEWARE: SOLO ADMIN =====
// Verifica que el usuario sea administrador
exports.soloAdmin = (req, res, next) => {
  // req.usuario viene del middleware "proteger"
  
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      exito: false,
      mensaje: 'No tienes permisos para realizar esta acción. Solo administradores.'
    });
  }
  
  next();
};

// ===== MIDDLEWARE: SOLO ADMIN O ASESORA =====
// Verifica que el usuario sea admin o asesora
exports.soloAdminOAsesora = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'asesora') {
    return res.status(403).json({
      exito: false,
      mensaje: 'No tienes permisos para realizar esta acción'
    });
  }
  
  next();
};

// ===== EXPLICACIÓN DETALLADA =====
/*

¿CÓMO FUNCIONA LA AUTENTICACIÓN?

PASO 1: Cliente hace login
───────────────────────────
POST /api/auth/login
Body: { email, password }

Backend:
- Verifica credenciales
- Genera token JWT
- Retorna token

Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTY...


PASO 2: Cliente guarda el token
────────────────────────────────
Frontend:
localStorage.setItem('token', token);


PASO 3: Cliente hace petición protegida
────────────────────────────────────────
GET /api/pedidos
Headers: {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}


PASO 4: Middleware "proteger" intercepta
─────────────────────────────────────────
1. Lee el header Authorization
2. Extrae el token (quita "Bearer ")
3. Verifica el token con jwt.verify()
4. Si es válido, busca el usuario en la BD
5. Agrega usuario a req.usuario
6. Llama a next() para continuar


PASO 5: Controller se ejecuta
──────────────────────────────
exports.obtenerPedidos = async (req, res) => {
  // Aquí ya tienes acceso a req.usuario
  console.log(req.usuario.nombre);  // "Jefferson"
  console.log(req.usuario.rol);     // "admin"
  
  // ... resto del código
}


CÓDIGOS DE ERROR:

401 - No autorizado (token inválido o no existe)
403 - Prohibido (token válido pero sin permisos)

Ejemplo:
- Usuario es "asesora" pero intenta crear producto
- middleware "proteger" ✅ pasa (token válido)
- middleware "soloAdmin" ❌ falla (no es admin)
- Retorna 403: "No tienes permisos"


ANALOGÍA:

Hotel con habitaciones:

1. Recepción (Login):
   - Cliente da nombre y apellido
   - Recepcionista verifica reserva
   - Si está bien, le da una tarjeta-llave (token)

2. Intentar entrar a habitación (Petición protegida):
   - Cliente pasa tarjeta por lector (enviar token)
   - Sistema verifica tarjeta (middleware proteger)
   - Si es válida, abre puerta (ejecuta controller)
   - Si no es válida, puerta no abre (error 401)

3. Intentar entrar a zona VIP (Solo Admin):
   - Cliente pasa tarjeta
   - Sistema verifica que sea tarjeta VIP (middleware soloAdmin)
   - Si no es VIP, no puede entrar (error 403)

*/