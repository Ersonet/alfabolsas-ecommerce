// ===== MODELO: USUARIO =====
// Define la estructura de usuarios en MongoDB

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email no válido"]
  },
  
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"]
  },
  
  rol: {
    type: String,
    enum: {
      values: ["owner", "desarrollador", "asesora", "cliente"],
      message: "Rol no válido. Debe ser: owner, desarrollador, asesora o cliente"
    },
    default: "cliente"
  },
  
  activo: {
    type: Boolean,
    default: true
  },
  
  // Permisos específicos (opcional, para control granular)
  permisos: {
    verIngresos: {
      type: Boolean,
      default: false
    },
    gestionarProductos: {
      type: Boolean,
      default: false
    },
    gestionarPedidos: {
      type: Boolean,
      default: false
    },
    gestionarUsuarios: {
      type: Boolean,
      default: false
    },
    generarFacturas: {
      type: Boolean,
      default: false
    }
  },
  
  // Estadísticas de uso
  estadisticas: {
    ultimoAcceso: Date,
    totalAccesos: { type: Number, default: 0 },
    productosCreados: { type: Number, default: 0 },
    productosEditados: { type: Number, default: 0 }
  },
  
  // Información adicional
  telefono: String,
  avatar: String,
  
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// ===== MIDDLEWARE: ENCRIPTAR CONTRASEÑA =====
usuarioSchema.pre("save", async function(next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===== MIDDLEWARE: ASIGNAR PERMISOS SEGÚN ROL =====
usuarioSchema.pre("save", function(next) {
  // Asignar permisos automáticamente según el rol
  switch(this.rol) {
    case "owner":
      this.permisos = {
        verIngresos: true,
        gestionarProductos: true,
        gestionarPedidos: true,
        gestionarUsuarios: true,
        generarFacturas: true
      };
      break;
      
    case "desarrollador":
      this.permisos = {
        verIngresos: false,
        gestionarProductos: true,
        gestionarPedidos: false,  // Solo visualización básica
        gestionarUsuarios: false,
        generarFacturas: false
      };
      break;
      
    case "asesora":
      this.permisos = {
        verIngresos: false,
        gestionarProductos: false,
        gestionarPedidos: true,  // Solo sus propios pedidos
        gestionarUsuarios: false,
        generarFacturas: false
      };
      break;
      
    case "cliente":
      this.permisos = {
        verIngresos: false,
        gestionarProductos: false,
        gestionarPedidos: false,
        gestionarUsuarios: false,
        generarFacturas: false
      };
      break;
  }
  next();
});

// ===== MÉTODOS DEL MODELO =====

// Comparar contraseña ingresada con la almacenada
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Obtener datos públicos (sin password)
usuarioSchema.methods.obtenerDatosPublicos = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    permisos: this.permisos,
    activo: this.activo,
    avatar: this.avatar,
    telefono: this.telefono,
    estadisticas: this.estadisticas,
    fechaCreacion: this.fechaCreacion
  };
};

// Registrar acceso del usuario
usuarioSchema.methods.registrarAcceso = async function() {
  this.estadisticas.ultimoAcceso = new Date();
  this.estadisticas.totalAccesos += 1;
  await this.save();
};

// Verificar si tiene un permiso específico
usuarioSchema.methods.tienePermiso = function(permiso) {
  return this.permisos[permiso] === true;
};

// Verificar si puede acceder a una ruta
usuarioSchema.methods.puedeAcceder = function(ruta) {
  const rutasPermitidas = {
    owner: ["*"], // Acceso total
    desarrollador: ["/productos", "/dashboard-desarrollador", "/perfil"],
    asesora: ["/pedidos", "/clientes", "/perfil"],
    cliente: ["/catalogo", "/mis-pedidos", "/perfil"]
  };
  
  const permitidas = rutasPermitidas[this.rol] || [];
  return permitidas.includes("*") || permitidas.some(r => ruta.startsWith(r));
};

// ===== MÉTODOS ESTÁTICOS =====

// Obtener usuarios por rol
usuarioSchema.statics.obtenerPorRol = function(rol) {
  return this.find({ rol, activo: true });
};

// Buscar usuario activo por email
usuarioSchema.statics.buscarPorEmail = function(email) {
  return this.findOne({ email, activo: true });
};

module.exports = mongoose.model("Usuario", usuarioSchema);