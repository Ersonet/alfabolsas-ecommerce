// ===== MODELO DE PRODUCTO =====
// Este modelo define cómo se ve un producto en la base de datos

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  // Información básica
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,  // Quita espacios al inicio y final
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  
  descripcionCorta: {
    type: String,
    maxlength: [150, 'La descripción corta no puede tener más de 150 caracteres']
  },
  
  // Categoría del producto
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: {
      values: ['papel', 'tela', 'plastico', 'cajas', 'publicidad'],
      message: '{VALUE} no es una categoría válida'
    }
  },
  
  // Especificaciones técnicas
  especificaciones: {
    dimensiones: String,  // Ej: "17 x 22 cm"
    material: String,      // Ej: "Polietileno con burbujas"
    peso: String,          // Ej: "50 gramos"
    colores: [String]      // Ej: ["negro", "rosado", "blanco"]
  },
  
  // Sistema de precios por rangos
  precios: {
    // Precios SIN logo
    sinLogo: {
      rango1: {  // 20-99 unidades
        min: { type: Number, default: 20 },
        max: { type: Number, default: 99 },
        precio: { type: Number, required: true }
      },
      rango2: {  // 100-299 unidades
        min: { type: Number, default: 100 },
        max: { type: Number, default: 299 },
        precio: { type: Number, required: true }
      },
      rango3: {  // 300-500 unidades
        min: { type: Number, default: 300 },
        max: { type: Number, default: 500 },
        precio: { type: Number, required: true }
      },
      rango4: {  // 501-1000 unidades
        min: { type: Number, default: 501 },
        max: { type: Number, default: 1000 },
        precio: { type: Number, required: true }
      }
    },
    
    // Precios CON logo
    conLogo: {
      rango1: {
        min: { type: Number, default: 20 },
        max: { type: Number, default: 99 },
        precio: { type: Number, required: true }
      },
      rango2: {
        min: { type: Number, default: 100 },
        max: { type: Number, default: 299 },
        precio: { type: Number, required: true }
      },
      rango3: {
        min: { type: Number, default: 300 },
        max: { type: Number, default: 500 },
        precio: { type: Number, required: true }
      },
      rango4: {
        min: { type: Number, default: 501 },
        max: { type: Number, default: 1000 },
        precio: { type: Number, required: true }
      }
    }
  },
  
  // Inventario
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  
  // Imágenes del producto
  imagenes: [{
    url: String,
    esPrincipal: { type: Boolean, default: false }
  }],
  
  // Estado del producto
  activo: {
    type: Boolean,
    default: true
  },
  
  // Destacado en home
  destacado: {
    type: Boolean,
    default: false
  },
  
  // Para SEO
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
  
}, { 
  timestamps: true  // Agrega createdAt y updatedAt automáticamente
});

// MÉTODOS DEL MODELO

// Generar slug automáticamente antes de guardar
productoSchema.pre('save', function(next) {
  if (this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Reemplaza caracteres especiales con -
      .replace(/^-+|-+$/g, '');      // Quita - al inicio y final
  }
  next();
});

// Método para obtener el precio según cantidad y tipo de logo
productoSchema.methods.obtenerPrecio = function(cantidad, tipoLogo = 'sin-logo') {
  const precios = tipoLogo === 'sin-logo' ? this.precios.sinLogo : this.precios.conLogo;
  
  // Determinar en qué rango cae la cantidad
  if (cantidad >= precios.rango1.min && cantidad <= precios.rango1.max) {
    return precios.rango1.precio;
  } else if (cantidad >= precios.rango2.min && cantidad <= precios.rango2.max) {
    return precios.rango2.precio;
  } else if (cantidad >= precios.rango3.min && cantidad <= precios.rango3.max) {
    return precios.rango3.precio;
  } else if (cantidad >= precios.rango4.min) {
    return precios.rango4.precio;
  }
  
  // Si no cae en ningún rango, retornar el del primer rango
  return precios.rango1.precio;
};

// Índices para búsquedas más rápidas
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });

module.exports = mongoose.model('Producto', productoSchema);