// ===== CONTROLLER DE PEDIDOS =====
// Maneja toda la lógica de órdenes de compra

const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

// ===== CREAR PEDIDO (Sin necesidad de registro) =====
// POST /api/pedidos
exports.crearPedido = async (req, res) => {
  try {
    const { cliente, productos } = req.body;
    
    // Validar datos del cliente
    if (!cliente || !cliente.nombre || !cliente.email || !cliente.telefono) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan datos del cliente (nombre, email, teléfono)'
      });
    }
    
    // Validar productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El pedido debe tener al menos un producto'
      });
    }
    
    // Verificar y calcular precios de cada producto
    const productosConPrecios = [];
    let subtotalCalculado = 0;
    
    for (const item of productos) {
      // Buscar el producto en la base de datos
      const producto = await Producto.findById(item.productoId);
      
      if (!producto) {
        return res.status(404).json({
          exito: false,
          mensaje: `Producto con ID ${item.productoId} no encontrado`
        });
      }
      
      if (!producto.activo) {
        return res.status(400).json({
          exito: false,
          mensaje: `El producto ${producto.nombre} no está disponible`
        });
      }
      
      // Calcular precio unitario según cantidad y tipo de logo
      const precioUnitario = producto.obtenerPrecio(
        item.cantidad, 
        item.tipoLogo || 'sin-logo'
      );
      
      const subtotalProducto = precioUnitario * item.cantidad;
      
      productosConPrecios.push({
        productoId: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: precioUnitario,
        tipoLogo: item.tipoLogo || 'sin-logo',
        subtotal: subtotalProducto
      });
      
      subtotalCalculado += subtotalProducto;
    }
    
    // Crear el pedido
    const nuevoPedido = new Pedido({
      cliente: {
        usuarioId: req.usuario ? req.usuario.id : null, // Si está logueado
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        ciudad: cliente.ciudad || '',
        direccion: cliente.direccion || ''
      },
      productos: productosConPrecios,
      subtotal: subtotalCalculado,
      costoEnvio: 0, // Se calculará después
      total: subtotalCalculado,
      historialEstados: [{
        estado: 'pendiente',
        observacion: 'Pedido creado por el cliente'
      }]
    });
    
    await nuevoPedido.save();
    
    // TODO: Enviar email de confirmación al cliente
    // TODO: Notificar a las asesoras por email/WhatsApp
    
    res.status(201).json({
      exito: true,
      mensaje: 'Pedido creado exitosamente. Nos contactaremos contigo pronto.',
      pedido: nuevoPedido
    });
    
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el pedido',
      error: error.message
    });
  }
};

// ===== OBTENER TODOS LOS PEDIDOS (Solo Admin) =====
// GET /api/pedidos
exports.obtenerPedidos = async (req, res) => {
  try {
    const { estado, limite = 50 } = req.query;
    
    let filtro = {};
    if (estado) filtro.estado = estado;
    
    const pedidos = await Pedido.find(filtro)
      .populate('atendidoPor', 'nombre email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limite));
    
    res.json({
      exito: true,
      cantidad: pedidos.length,
      pedidos
    });
    
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener pedidos',
      error: error.message
    });
  }
};

// ===== OBTENER PEDIDOS PENDIENTES (Solo Admin) =====
// GET /api/pedidos/pendientes
exports.obtenerPedidosPendientes = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ 
      estado: 'pendiente' 
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({
      exito: true,
      cantidad: pedidos.length,
      pedidos
    });
    
  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener pedidos pendientes',
      error: error.message
    });
  }
};

// ===== OBTENER UN PEDIDO POR ID =====
// GET /api/pedidos/:id
exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('productos.productoId', 'nombre categoria')
      .populate('atendidoPor', 'nombre email');
    
    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    res.json({
      exito: true,
      pedido
    });
    
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener pedido',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR ESTADO DEL PEDIDO (Solo Admin) =====
// PUT /api/pedidos/:id/estado
exports.actualizarEstado = async (req, res) => {
  try {
    const { estado, observacion } = req.body;
    
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    // Usar el método del modelo para cambiar estado
    await pedido.cambiarEstado(
      estado, 
      observacion, 
      req.usuario ? req.usuario.id : null
    );
    
    // Si se marca como contactado, guardar quién lo atendió
    if (estado === 'contactado' && req.usuario && !pedido.atendidoPor) {
      pedido.atendidoPor = req.usuario.id;
      await pedido.save();
    }
    
    res.json({
      exito: true,
      mensaje: 'Estado actualizado exitosamente',
      pedido
    });
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// ===== AGREGAR NOTAS AL PEDIDO (Solo Admin) =====
// PUT /api/pedidos/:id/notas
exports.agregarNotas = async (req, res) => {
  try {
    const { notas } = req.body;
    
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { notas },
      { new: true }
    );
    
    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    res.json({
      exito: true,
      mensaje: 'Notas actualizadas',
      pedido
    });
    
  } catch (error) {
    console.error('Error al agregar notas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al agregar notas',
      error: error.message
    });
  }
};

// ===== OBTENER ENLACE DE WHATSAPP =====
// GET /api/pedidos/:id/whatsapp
exports.obtenerEnlaceWhatsApp = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    
    if (!pedido) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Pedido no encontrado'
      });
    }
    
    const enlace = pedido.obtenerEnlaceWhatsApp();
    
    res.json({
      exito: true,
      enlace
    });
    
  } catch (error) {
    console.error('Error al obtener enlace:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener enlace de WhatsApp',
      error: error.message
    });
  }
};

// ===== ESTADÍSTICAS DE PEDIDOS (Solo Admin) =====
// GET /api/pedidos/estadisticas
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const estadisticas = {
      pendientes: await Pedido.countDocuments({ estado: 'pendiente' }),
      contactados: await Pedido.countDocuments({ estado: 'contactado' }),
      confirmados: await Pedido.countDocuments({ estado: 'confirmado' }),
      enProduccion: await Pedido.countDocuments({ estado: 'en-produccion' }),
      enviados: await Pedido.countDocuments({ estado: 'enviado' }),
      pedidosHoy: await Pedido.countDocuments({ 
        createdAt: { $gte: hoy } 
      }),
      totalPedidos: await Pedido.countDocuments()
    };
    
    // Calcular ventas del día
    const ventasHoy = await Pedido.aggregate([
      {
        $match: {
          createdAt: { $gte: hoy },
          estado: { $nin: ['cancelado'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    
    estadisticas.ventasHoy = ventasHoy.length > 0 ? ventasHoy[0].total : 0;
    
    res.json({
      exito: true,
      estadisticas
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// ===== EXPLICACIÓN =====
/*

FLUJO COMPLETO DE UN PEDIDO:

1. Cliente agrega productos al carrito (frontend)
2. Cliente hace checkout sin registrarse
3. crearPedido():
   - Valida datos del cliente
   - Verifica que los productos existan
   - Calcula precios automáticamente
   - Crea pedido con estado "pendiente"
   
4. Asesora ve el pedido en panel admin
5. Asesora contacta al cliente por WhatsApp (usando obtenerEnlaceWhatsApp)
6. Asesora marca pedido como "contactado"
7. Cliente confirma → cambiar a "confirmado"
8. Cliente paga → cambiar a "pagado"
9. Producción → cambiar a "en-produccion"
10. Envío → cambiar a "enviado"
11. Entrega → cambiar a "entregado"

TODO EL HISTORIAL SE GUARDA EN historialEstados[]

*/