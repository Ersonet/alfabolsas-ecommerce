// ===== MODELO DE PEDIDO =====
// Define cómo se guarda una orden de compra

const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  
  // INFORMACIÓN DEL CLIENTE
  cliente: {
    // Si el cliente está registrado, guardamos su ID
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null  // null = cliente invitado (sin registro)
    },
    
    // Datos básicos (siempre requeridos)
    nombre: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true
    },
    
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      lowercase: true,
      trim: true
    },
    
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true
    },
    
    // Datos de envío (opcionales al crear, obligatorios al confirmar)
    ciudad: String,
    direccion: String,
    codigoPostal: String,
    departamento: String
  },
  
  // PRODUCTOS DEL PEDIDO
  productos: [{
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    
    // Guardamos los datos del producto en el momento de la compra
    // (por si después cambian los precios)
    nombre: {
      type: String,
      required: true
    },
    
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad debe ser al menos 1']
    },
    
    precioUnitario: {
      type: Number,
      required: true
    },
    
    tipoLogo: {
      type: String,
      enum: ['sin-logo', 'con-logo'],
      default: 'sin-logo'
    },
    
    subtotal: {
      type: Number,
      required: true
    }
  }],
  
  // TOTALES
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  
  costoEnvio: {
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
  
  // ESTADO DEL PEDIDO
  estado: {
    type: String,
    enum: [
      'pendiente',       // Cliente hizo pedido, esperando contacto
      'contactado',      // Asesora ya contactó al cliente
      'confirmado',      // Cliente confirmó que va a pagar
      'pagado',          // Cliente pagó
      'en-produccion',   // Bolsas en fabricación
      'enviado',         // Pedido despachado
      'entregado',       // Cliente recibió
      'cancelado'        // Se canceló
    ],
    default: 'pendiente'
  },
  
  // MÉTODO DE PAGO (cuando se confirme)
  metodoPago: {
    tipo: {
      type: String,
      enum: ['transferencia', 'efectivo', 'contraentrega', 'tarjeta', 'otro'],
      default: null
    },
    comprobante: String  // URL del comprobante si aplica
  },
  
  // INFORMACIÓN DE ENVÍO
  envio: {
    empresa: {
      type: String,
      enum: ['envia', 'rapidisimo', 'trasladarc', 'otro']
    },
    numeroGuia: String,
    fechaEnvio: Date,
    fechaEntregaEstimada: Date
  },
  
  // NOTAS INTERNAS (solo visible para admin)
  notas: {
    type: String,
    default: ''
  },
  
  // QUIÉN ATENDIÓ EL PEDIDO
  atendidoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  
  // HISTORIAL DE CAMBIOS DE ESTADO
  historialEstados: [{
    estado: {
      type: String,
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    observacion: String,
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  }]
  
}, { 
  timestamps: true 
});

// MÉTODOS DEL MODELO

// Calcular totales automáticamente
pedidoSchema.pre('save', function(next) {
  // Calcular subtotal sumando todos los productos
  this.subtotal = this.productos.reduce((sum, item) => {
    return sum + (item.precioUnitario * item.cantidad);
  }, 0);
  
  // Calcular total (subtotal + envío - descuento)
  this.total = this.subtotal + this.costoEnvio - this.descuento;
  
  next();
});

// Método para cambiar estado y agregar al historial
pedidoSchema.methods.cambiarEstado = function(nuevoEstado, observacion, usuarioId) {
  this.estado = nuevoEstado;
  
  this.historialEstados.push({
    estado: nuevoEstado,
    observacion,
    usuarioId
  });
  
  return this.save();
};

// Método para obtener el enlace de WhatsApp del cliente
pedidoSchema.methods.obtenerEnlaceWhatsApp = function() {
  const telefono = this.cliente.telefono.replace(/\D/g, ''); // Quitar caracteres no numéricos
  const mensaje = encodeURIComponent(
    `Hola ${this.cliente.nombre}, soy de ALFA BOLSAS. ` +
    `Te contacto por tu pedido #${this._id.toString().slice(-6)}`
  );
  
  return `https://wa.me/${telefono}?text=${mensaje}`;
};

// Índices para búsquedas
pedidoSchema.index({ estado: 1 });
pedidoSchema.index({ 'cliente.email': 1 });
pedidoSchema.index({ 'cliente.telefono': 1 });
pedidoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Pedido', pedidoSchema);