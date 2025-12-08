// ===== MODELO DE USUARIO =====
// Solo para administradores y asesoras (NO para clientes)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no válido']
  },
  
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false  // No incluir password en consultas por defecto
  },
  
  // ROL: Define qué puede hacer el usuario
  rol: {
    type: String,
    enum: {
      values: ['admin', 'asesora'],
      message: '{VALUE} no es un rol válido'
    },
    default: 'asesora'
  },
  
  // Estado del usuario
  activo: {
    type: Boolean,
    default: true
  },
  
  // Información adicional
  telefono: String,
  
  // Estadísticas (para asesoras)
  estadisticas: {
    pedidosAtendidos: {
      type: Number,
      default: 0
    },
    ultimoAcceso: Date
  }
  
}, { 
  timestamps: true 
});

// ===== MÉTODOS PRE-SAVE =====

// Encriptar password antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo encriptar si el password fue modificado (o es nuevo)
  if (!this.isModified('password')) return next();
  
  try {
    // Generar "salt" (valor aleatorio para hacer única cada encriptación)
    const salt = await bcrypt.genSalt(10);
    
    // Encriptar password
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error) {
    next(error);
  }
});

// ===== MÉTODOS DEL MODELO =====

// Comparar password ingresado con el encriptado
usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
  try {
    // bcrypt.compare compara el password normal con el encriptado
    return await bcrypt.compare(passwordIngresado, this.password);
  } catch (error) {
    throw new Error('Error al comparar passwords');
  }
};

// Generar datos públicos del usuario (sin password)
usuarioSchema.methods.obtenerDatosPublicos = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    activo: this.activo
  };
};

// Actualizar último acceso
usuarioSchema.methods.registrarAcceso = function() {
  this.estadisticas.ultimoAcceso = new Date();
  return this.save();
};

// ===== EXPLICACIÓN: ¿POR QUÉ ENCRIPTAR EL PASSWORD? =====
/*
  Imagina que guardas el password como texto normal:
  
  Usuario: jefferson@email.com
  Password: mipassword123
  
  Si alguien hackea la base de datos, ve TODOS los passwords.
  
  Con encriptación:
  
  Usuario: jefferson@email.com
  Password: $2a$10$fKJH34kj5h34kjh5kj3h4kj5h3k4j5h3k4j5h  ← Imposible de descifrar
  
  Cuando haces login:
  1. Escribes: "mipassword123"
  2. El sistema lo encripta de la misma manera
  3. Compara los dos valores encriptados
  4. Si coinciden = password correcto
*/

// Índice para búsqueda por email
usuarioSchema.index({ email: 1 });

module.exports = mongoose.model('Usuario', usuarioSchema);