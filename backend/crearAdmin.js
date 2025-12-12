// ===== CREAR ADMIN/OWNER MANUALMENTE =====
// Script para crear usuarios con roles privilegiados

require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  });

// Función para crear usuario
async function crearUsuarioAdmin() {
  try {
    // ===== CONFIGURACIÓN DEL USUARIO =====
    // Modifica estos datos según necesites
    
    const datosUsuario = {
      nombre: 'Jefferson Serrano',
      email: 'alfabolsaspag@gmail.com',
      password: 'desarrollador2025*alfabolsas',
      rol: 'desarrollador'
    };
    
    // ===== DESCOMENTAR PARA CREAR USUARIO OWNER (DUEÑA) =====
    /*
    const datosUsuario = {
      nombre: 'Dueña ALFA BOLSAS',
      email: 'duena@alfabolsas.com',     // Cambiar por email real
      password: 'ContraseñaTemporal123',  // Cambiar contraseña
      rol: 'owner'
    };
    */
    
    // ===== VERIFICAR SI YA EXISTE =====
    const existe = await Usuario.findOne({ email: datosUsuario.email });
    
    if (existe) {
      console.log('⚠️ El usuario ya existe:', existe.email);
      console.log('Rol actual:', existe.rol);
      
      // Opcional: Actualizar rol si es necesario
      // existe.rol = datosUsuario.rol;
      // await existe.save();
      // console.log('✅ Rol actualizado');
      
    } else {
      // ===== CREAR NUEVO USUARIO =====
      const nuevoUsuario = new Usuario(datosUsuario);
      await nuevoUsuario.save();
      
      console.log('✅ Usuario creado exitosamente:');
      console.log('   - Nombre:', nuevoUsuario.nombre);
      console.log('   - Email:', nuevoUsuario.email);
      console.log('   - Rol:', nuevoUsuario.rol);
      console.log('   - Permisos:', nuevoUsuario.permisos);
      console.log('\n⚠️ IMPORTANTE: Cambia la contraseña después del primer login');
    }
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar
crearUsuarioAdmin();