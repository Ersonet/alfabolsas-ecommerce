// ===== RUTAS DE PRODUCTOS =====
// Define qué URL llama a qué función del controller

const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { proteger, soloAdmin } = require('../middlewares/auth');

// ===== RUTAS PÚBLICAS (No requieren autenticación) =====

// GET /api/productos - Obtener todos los productos
// Ejemplo: /api/productos?categoria=papel&activo=true
router.get('/', productoController.obtenerProductos);

// GET /api/productos/destacados - Obtener productos destacados
router.get('/destacados', productoController.obtenerProductosDestacados);

// GET /api/productos/buscar?q=bolsa - Buscar productos
router.get('/buscar', productoController.buscarProductos);

// GET /api/productos/slug/:slug - Obtener producto por slug
// Ejemplo: /api/productos/slug/bolsa-papel-no-3
router.get('/slug/:slug', productoController.obtenerProductoPorSlug);

// GET /api/productos/:id - Obtener un producto específico
// Ejemplo: /api/productos/507f1f77bcf86cd799439011
router.get('/:id', productoController.obtenerProductoPorId);

// POST /api/productos/:id/calcular-precio - Calcular precio
// Body: { cantidad: 150, tipoLogo: 'con-logo' }
router.post('/:id/calcular-precio', productoController.calcularPrecio);

// ===== RUTAS PROTEGIDAS (Requieren autenticación) =====

// POST /api/productos - Crear producto (Solo Admin)
router.post('/', proteger, soloAdmin, productoController.crearProducto);

// PUT /api/productos/:id - Actualizar producto (Solo Admin)
router.put('/:id', proteger, soloAdmin, productoController.actualizarProducto);

// DELETE /api/productos/:id - Eliminar producto (Solo Admin)
router.delete('/:id', proteger, soloAdmin, productoController.eliminarProducto);

// ===== EXPLICACIÓN DE MIDDLEWARES =====
/*

¿QUÉ ES UN MIDDLEWARE?

Un middleware es una función que se ejecuta ANTES del controller.

EJEMPLO:

router.get('/', middleware1, middleware2, controller);

FLUJO:
1. Cliente hace petición
2. Se ejecuta middleware1
3. Se ejecuta middleware2
4. Se ejecuta controller
5. Se envía respuesta

MIDDLEWARES QUE USAMOS:

1. proteger: 
   - Verifica que el token JWT sea válido
   - Si es válido, permite continuar
   - Si no es válido, retorna error 401

2. soloAdmin:
   - Verifica que el usuario sea admin
   - Si es admin, permite continuar
   - Si no es admin, retorna error 403

ANALOGÍA:

Imagina un club nocturno:

Cliente intenta entrar
   ↓
1er Security (proteger): Verifica que tenga entrada (token)
   ↓
2do Security (soloAdmin): Verifica que tenga pase VIP (rol admin)
   ↓
Si pasa los dos → Entra al club (ejecuta controller)

*/

module.exports = router;