// ===== MODELO: CLIENTE Y PEDIDO =====
// Guarda datos de clientes y sus pedidos del carrito

const mongoose = require("mongoose");

const clientePedidoSchema = new mongoose.Schema({
  // ===== DATOS DEL CLIENTE =====
  cliente: {
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email no válido"]
    },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true
    },
    telefono: {
      type: String,
      trim: true
    },
    
    // Dirección de envío
    direccion: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true
    },
    codigoPostal: {
      type: String,
      trim: true
    },
    ciudad: {
      type: String,
      required: [true, "La ciudad es obligatoria"],
      trim: true
    },
    departamento: {
      type: String,
      required: [true, "El departamento es obligatorio"],
      trim: true
    },
    pais: {
      type: String,
      default: "Colombia",
      trim: true
    },
    
    // Para futuras compras
    suscritoNewsletter: {
      type: Boolean,
      default: false
    }
  },
  
  // ===== PRODUCTOS EN EL CARRITO =====
  productos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    nombre: String,
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precio: {
      type: Number,
      required: true
    },
    conLogo: {
      type: Boolean,
      default: false
    },
    imagen: String,
    sku: String
  }],
  
  // ===== INFORMACIÓN DEL PEDIDO =====
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  costoEnvio: {
    type: Number,
    default: 0
  },
  impuestos: {
    type: Number,
    default: 0
  },
  descuento: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  
  codigoDescuento: String,
  
  // ===== ESTADO DEL PEDIDO =====
  estado: {
    type: String,
    enum: [
      'carrito_guardado',    // Cliente guardó el carrito pero no pagó
      'pago_pendiente',      // Intentó pagar pero falló/canceló
      'pago_procesando',     // Pago en proceso
      'pago_completado',     // Pago exitoso
      'en_preparacion',      // Pedido siendo preparado
      'enviado',             // Pedido enviado
      'entregado',           // Pedido entregado
      'cancelado'            // Pedido cancelado
    ],
    default: 'carrito_guardado'
  },
  
  // ===== MÉTODO DE PAGO =====
  metodoPago: {
    tipo: {
      type: String,
      enum: ['tarjeta', 'pse', 'efectivo', 'transferencia', 'pendiente'],
      default: 'pendiente'
    },
    detalles: String,
    referenciaPago: String,    // ID de transacción de la pasarela
    fechaPago: Date
  },
  
  // ===== TRANSPORTADORA =====
  transportadora: {
    nombre: String,
    guia: String,
    urlTracking: String
  },
  
  // ===== NOTAS Y MENSAJES =====
  notasCliente: String,
  notasInternas: String,
  
  // ===== HISTORIAL =====
  historial: [{
    accion: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    usuario: String,
    detalles: String
  }],
  
  // ===== RECORDATORIOS =====
  recordatorios: {
    enviado: {
      type: Boolean,
      default: false
    },
    fechaEnvio: Date,
    cantidadEnviados: {
      type: Number,
      default: 0
    }
  },
  
  // ===== ORIGEN =====
  origen: {
    type: String,
    enum: ['web', 'whatsapp', 'manual'],
    default: 'web'
  },
  
  // IP del cliente (para seguridad)
  ipCliente: String,
  
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// ===== ÍNDICES PARA BÚSQUEDAS RÁPIDAS =====
clientePedidoSchema.index({ 'cliente.correo': 1 });
clientePedidoSchema.index({ estado: 1 });
clientePedidoSchema.index({ createdAt: -1 });

// ===== MÉTODOS DEL MODELO =====

// Calcular totales automáticamente
clientePedidoSchema.pre('save', function(next) {
  if (this.isModified('productos') || this.isModified('costoEnvio') || this.isModified('descuento')) {
    this.subtotal = this.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    this.total = this.subtotal + this.costoEnvio + this.impuestos - this.descuento;
  }
  next();
});

// Agregar entrada al historial
clientePedidoSchema.methods.agregarHistorial = function(accion, usuario, detalles) {
  this.historial.push({
    accion,
    usuario: usuario || 'Sistema',
    detalles,
    fecha: new Date()
  });
};

// Cambiar estado del pedido
clientePedidoSchema.methods.cambiarEstado = async function(nuevoEstado, usuario, detalles) {
  const estadoAnterior = this.estado;
  this.estado = nuevoEstado;
  this.agregarHistorial(`Estado cambiado de "${estadoAnterior}" a "${nuevoEstado}"`, usuario, detalles);
  await this.save();
};

// Obtener resumen del pedido
clientePedidoSchema.methods.obtenerResumen = function() {
  return {
    id: this._id,
    cliente: {
      nombre: `${this.cliente.nombre} ${this.cliente.apellido}`,
      correo: this.cliente.correo,
      telefono: this.cliente.telefono
    },
    cantidadProductos: this.productos.length,
    totalProductos: this.productos.reduce((sum, p) => sum + p.cantidad, 0),
    subtotal: this.subtotal,
    total: this.total,
    estado: this.estado,
    metodoPago: this.metodoPago.tipo,
    fecha: this.createdAt
  };
};

// ===== MÉTODOS ESTÁTICOS =====

// Buscar pedidos pendientes de un cliente
clientePedidoSchema.statics.obtenerPendientesPorEmail = function(email) {
  return this.find({
    'cliente.correo': email.toLowerCase(),
    estado: { $in: ['carrito_guardado', 'pago_pendiente'] }
  }).sort({ createdAt: -1 });
};

// Obtener pedidos para recordatorios
clientePedidoSchema.statics.obtenerParaRecordatorio = function() {
  const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    estado: { $in: ['carrito_guardado', 'pago_pendiente'] },
    'recordatorios.enviado': false,
    createdAt: { $lt: hace24Horas }
  });
};

module.exports = mongoose.model("ClientePedido", clientePedidoSchema);