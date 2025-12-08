# 🛍️ ALFA BOLSAS - Backend API

Backend desarrollado con **Express.js** y **MongoDB Atlas** para el ecommerce de ALFA BOLSAS S.A.S.

## 📋 Requisitos previos

- Node.js v16 o superior
- npm v8 o superior
- MongoDB Atlas cuenta creada
- Conexión a internet

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

Esto instalará:
- ✅ **express** - Framework web
- ✅ **mongoose** - ODM para MongoDB
- ✅ **dotenv** - Variables de entorno
- ✅ **cors** - Permitir peticiones desde el frontend
- ✅ **bcryptjs** - Encriptar passwords
- ✅ **jsonwebtoken** - Autenticación JWT
- ✅ **nodemon** - Reinicio automático en desarrollo

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env y completar los valores
```

### 3. Configurar MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito (M0)
3. Crear usuario de base de datos
4. Permitir acceso desde cualquier IP (0.0.0.0/0)
5. Obtener connection string
6. Pegar connection string en `.env`

## 🎮 Comandos disponibles

```bash
# Modo desarrollo (reinicio automático con nodemon)
npm run dev

# Modo producción
npm start
```

## 📂 Estructura del proyecto

```
backend/
├── controllers/          # Lógica de negocio
│   ├── productoController.js
│   ├── pedidoController.js
│   └── authController.js
├── models/              # Esquemas de MongoDB
│   ├── Producto.js
│   ├── Pedido.js
│   └── Usuario.js
├── routes/              # Rutas de la API
│   ├── productos.js
│   ├── pedidos.js
│   └── auth.js
├── middlewares/         # Middlewares personalizados
│   └── auth.js
├── config/              # Configuración
│   └── db.js
├── server.js           # Punto de entrada
├── package.json        # Dependencias
└── .env               # Variables de entorno (no subir a Git)
```

## 🌐 Endpoints de la API

### Autenticación

```
POST   /api/auth/login              # Login
POST   /api/auth/registro           # Registrar usuario (admin)
GET    /api/auth/me                 # Usuario actual (requiere auth)
PUT    /api/auth/cambiar-password   # Cambiar contraseña (requiere auth)
```

### Productos

```
GET    /api/productos               # Obtener todos los productos
GET    /api/productos/:id           # Obtener producto por ID
GET    /api/productos/slug/:slug    # Obtener producto por slug
GET    /api/productos/destacados    # Obtener destacados
GET    /api/productos/buscar?q=     # Buscar productos
POST   /api/productos               # Crear producto (admin)
PUT    /api/productos/:id           # Actualizar producto (admin)
DELETE /api/productos/:id           # Eliminar producto (admin)
POST   /api/productos/:id/calcular-precio  # Calcular precio
```

### Pedidos

```
POST   /api/pedidos                 # Crear pedido (sin auth)
GET    /api/pedidos                 # Obtener todos (admin)
GET    /api/pedidos/pendientes      # Obtener pendientes (admin)
GET    /api/pedidos/estadisticas    # Estadísticas (admin)
GET    /api/pedidos/:id             # Obtener pedido por ID (admin)
PUT    /api/pedidos/:id/estado      # Cambiar estado (admin)
PUT    /api/pedidos/:id/notas       # Agregar notas (admin)
GET    /api/pedidos/:id/whatsapp    # Enlace WhatsApp (admin)
```

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Cómo usar:

1. Hacer login en `/api/auth/login`
2. Guardar el token recibido
3. Enviar token en cada petición protegida:

```javascript
fetch('http://localhost:3000/api/pedidos', {
  headers: {
    'Authorization': 'Bearer TU_TOKEN_AQUI'
  }
})
```

## 👤 Crear primer usuario admin

```javascript
// Ejecutar en MongoDB Compass o Atlas:
db.usuarios.insertOne({
  nombre: "Jefferson Serrano",
  email: "admin@alfabolsas.com",
  password: "$2a$10$...", // Debes encriptar el password primero
  rol: "admin",
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

O usar la ruta de registro (solo una vez):

```bash
POST /api/auth/registro
Body: {
  "nombre": "Jefferson Serrano",
  "email": "admin@alfabolsas.com",
  "password": "tu-password-seguro",
  "rol": "admin"
}
```

## 🧪 Probar la API

### Con cURL:

```bash
# Obtener productos
curl http://localhost:3000/api/productos

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alfabolsas.com","password":"tupassword"}'
```

### Con herramientas:
- ✅ Postman
- ✅ Thunder Client (VS Code extension)
- ✅ Insomnia

## 📊 Estados de pedidos

Los pedidos pasan por estos estados:

1. **pendiente** - Cliente creó el pedido
2. **contactado** - Asesora contactó al cliente
3. **confirmado** - Cliente confirmó la compra
4. **pagado** - Cliente realizó el pago
5. **en-produccion** - Fabricando las bolsas
6. **enviado** - Pedido despachado
7. **entregado** - Cliente recibió el pedido
8. **cancelado** - Pedido cancelado

## 🐛 Solución de problemas

### Error: "Cannot connect to MongoDB"
- Verifica que la URI en `.env` sea correcta
- Verifica que tu IP esté permitida en MongoDB Atlas
- Verifica tu conexión a internet

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env` o cierra la aplicación que usa el puerto 3000

### Error: "JsonWebTokenError"
- Verifica que JWT_SECRET en `.env` sea el mismo que usaste para generar tokens

## 📝 Notas importantes

- ⚠️ Nunca subas el archivo `.env` a GitHub
- 🔒 Usa contraseñas seguras para usuarios admin
- 🌐 En producción, cambia `NODE_ENV=production`
- 📧 Implementa envío de emails para confirmaciones

## 👨‍💻 Desarrollado por

Jefferson Serrano  
Proyecto: ALFA BOLSAS S.A.S Ecommerce  
Fecha: Diciembre 2024

## 📄 Licencia

ISC