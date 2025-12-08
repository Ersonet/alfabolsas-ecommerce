// ===== SERVER.JS =====
// Servidor principal para ALFA BOLSAS ECOMMERCE

require('dotenv').config(); // Cargar variables de entorno

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Permitir conexiones desde el frontend
const path = require("path");

// Importar modelos
const Usuario = require("./models/Usuario");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const app = express();

// ===== MIDDLEWARES =====
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Para leer JSON en las peticiones
app.use(express.static(path.join(__dirname, '../frontend'))); // Servir archivos estáticos

// ===== CONEXIÓN A MONGODB ATLAS =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// ===== MIDDLEWARE DE AUTENTICACIÓN =====
function verificarToken(req, res, next) {
  const token = req.headers["authorization"]?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}

// ===== RUTAS DE AUTENTICACIÓN =====

// ===== EMAILS AUTORIZADOS CON ROLES ESPECIALES =====
const emailsAutorizados = {
  // 'duena@alfabolsas.com': 'owner',  // ← Descomentar cuando se defina el email
  'alfabolsaspag@gmail.com': 'desarrollador'
  // Agrega más emails autorizados aquí
};

// REGISTRO de usuario
app.post("/auth/register", async (req, res) => {
  console.log('📥 Datos recibidos en /auth/register:', req.body);
  
  try {
    const { nombre, email, password } = req.body;
    
    // Validar campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios (nombre, email, password)' 
      });
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }
    
    // Determinar el rol según el email
    const rolAsignado = emailsAutorizados[email.toLowerCase()] || 'cliente';
    
    console.log(`📧 Email: ${email} → Rol asignado: ${rolAsignado}`);
    
    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol: rolAsignado
    });
    
    await nuevoUsuario.save();
    console.log('✅ Usuario guardado exitosamente:', nuevoUsuario.email);
    
    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario.obtenerDatosPublicos(),
      token
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      detalle: error.message 
    });
  }
});

// LOGIN de usuario
app.post("/auth/login", async (req, res) => {
  console.log('📥 Intento de login:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son obligatorios' 
      });
    }
    
    // Buscar usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }
    
    // Verificar contraseña
    const esValida = await usuario.compararPassword(password);
    if (!esValida) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }
    
    // Registrar acceso
    await usuario.registrarAcceso();
    
    // Generar token
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    console.log('✅ Login exitoso:', usuario.email);
    
    res.json({ 
      mensaje: 'Login exitoso',
      usuario: usuario.obtenerDatosPublicos(),
      token
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      detalle: error.message 
    });
  }
});

// ===== RUTAS DE USUARIOS (protegidas) =====

// Listar usuarios (solo admin)
app.get("/usuarios", verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    
    const usuarios = await Usuario.find();
    res.json(usuarios.map(u => u.obtenerDatosPublicos()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener perfil del usuario actual
app.get("/usuarios/me", verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario.obtenerDatosPublicos());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RUTAS DE PRODUCTOS =====

// Crear producto (solo admin)
app.post("/productos", verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }
    
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    console.log('✅ Producto creado:', nuevoProducto.nombre);
    res.json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar productos activos (público)
app.get("/productos", async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto por ID (público)
app.get("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto || !producto.activo) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RUTAS DE PEDIDOS =====

// Crear pedido (requiere autenticación)
app.post("/pedidos", verificarToken, async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    console.log('✅ Pedido creado:', nuevoPedido._id);
    res.json(nuevoPedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar pedidos (admin ve todos, asesora ve solo los suyos)
app.get("/pedidos", verificarToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.usuario.rol !== 'admin') {
      query['cliente.usuarioId'] = req.usuario.id;
    }
    
    const pedidos = await Pedido.find(query)
      .populate("cliente.usuarioId")
      .populate("productos.productoId");
    
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un pedido específico
app.get("/pedidos/:id", verificarToken, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate("cliente.usuarioId")
      .populate("productos.productoId");
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'admin' && 
        pedido.cliente.usuarioId?.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este pedido' });
    }
    
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RUTA DE PRUEBA =====
app.get("/", (req, res) => {
  res.json({ 
    mensaje: "🚀 API ALFA BOLSAS ECOMMERCE activa",
    version: "1.0.0",
    endpoints: {
      auth: ["/auth/register", "/auth/login"],
      usuarios: ["/usuarios", "/usuarios/me"],
      productos: ["/productos", "/productos/:id"],
      pedidos: ["/pedidos", "/pedidos/:id"]
    }
  });
});

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});