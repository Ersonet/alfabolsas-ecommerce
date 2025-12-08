// ===== RUTAS DE AUTENTICACIÓN =====

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { proteger } = require('../middlewares/auth');

// ===== RUTAS PÚBLICAS =====

// POST /api/auth/login - Iniciar sesión
// Body: { email: 'admin@alfabolsas.com', password: 'mipassword' }
router.post('/login', authController.login);

// POST /api/auth/registro - Registrar nuevo usuario (Solo Admin)
// Body: { nombre, email, password, rol }
router.post('/registro', authController.registro);

// ===== RUTAS PROTEGIDAS =====

// GET /api/auth/me - Obtener datos del usuario actual
// Headers: { Authorization: 'Bearer TOKEN' }
router.get('/me', proteger, authController.obtenerUsuarioActual);

// PUT /api/auth/cambiar-password - Cambiar contraseña
// Headers: { Authorization: 'Bearer TOKEN' }
// Body: { passwordActual, passwordNuevo }
router.put('/cambiar-password', proteger, authController.cambiarPassword);

// ===== EXPLICACIÓN DEL FLUJO DE AUTENTICACIÓN =====
/*

FLUJO COMPLETO DE LOGIN:

1. USUARIO ingresa email y password en el frontend

2. FRONTEND hace petición:
   POST /api/auth/login
   Body: { email, password }

3. BACKEND (authController.login):
   - Busca usuario por email
   - Compara password encriptado
   - Si es correcto, genera token JWT
   - Retorna: { token, usuario }

4. FRONTEND guarda el token:
   localStorage.setItem('token', token);

5. FRONTEND hace peticiones protegidas:
   fetch('/api/pedidos', {
     headers: {
       'Authorization': 'Bearer ' + token
     }
   })

6. BACKEND (middleware proteger):
   - Lee el token del header
   - Verifica que sea válido
   - Si es válido, permite continuar
   - Si no es válido, retorna error 401

EJEMPLO COMPLETO:

// Frontend - Login
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.exito) {
    // Guardar token
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    
    // Redirigir al panel admin
    window.location.href = '/admin/dashboard.html';
  } else {
    alert('Credenciales incorrectas');
  }
}

// Frontend - Hacer petición protegida
async function obtenerPedidos() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/pedidos', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  const data = await response.json();
  return data.pedidos;
}

// Frontend - Verificar si está logueado
function estaLogueado() {
  const token = localStorage.getItem('token');
  return token !== null;
}

// Frontend - Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

*/

module.exports = router;