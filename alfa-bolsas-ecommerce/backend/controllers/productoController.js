// ===== CONTROLLER DE PRODUCTOS =====
// Maneja toda la lógica relacionada con productos

const Producto = require('../models/Producto');

// ===== OBTENER TODOS LOS PRODUCTOS =====
// GET /api/productos
exports.obtenerProductos = async (req, res) => {
  try {
    // Filtros opcionales desde query params
    const { categoria, activo, destacado } = req.query;
    
    // Construir filtro dinámico
    let filtro = {};
    
    if (categoria) filtro.categoria = categoria;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (destacado !== undefined) filtro.destacado = destacado === 'true';
    
    // Buscar productos
    const productos = await Producto.find(filtro)
      .sort({ destacado: -1, createdAt: -1 }); // Destacados primero, luego más recientes
    
    res.json({
      exito: true,
      cantidad: productos.length,
      productos
    });
    
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener productos',
      error: error.message
    });
  }
};

// ===== OBTENER UN PRODUCTO POR ID =====
// GET /api/productos/:id
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }
    
    res.json({
      exito: true,
      producto
    });
    
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener producto',
      error: error.message
    });
  }
};

// ===== OBTENER PRODUCTO POR SLUG =====
// GET /api/productos/slug/:slug
exports.obtenerProductoPorSlug = async (req, res) => {
  try {
    const producto = await Producto.findOne({ slug: req.params.slug });
    
    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }
    
    res.json({
      exito: true,
      producto
    });
    
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener producto',
      error: error.message
    });
  }
};

// ===== CREAR PRODUCTO (Solo Admin) =====
// POST /api/productos
exports.crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    
    const productoGuardado = await nuevoProducto.save();
    
    res.status(201).json({
      exito: true,
      mensaje: 'Producto creado exitosamente',
      producto: productoGuardado
    });
    
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    // Si es error de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos inválidos',
        errores: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear producto',
      error: error.message
    });
  }
};

// ===== ACTUALIZAR PRODUCTO (Solo Admin) =====
// PUT /api/productos/:id
exports.actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,              // Retornar el documento actualizado
        runValidators: true     // Ejecutar validaciones
      }
    );
    
    if (!productoActualizado) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }
    
    res.json({
      exito: true,
      mensaje: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos inválidos',
        errores: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// ===== ELIMINAR PRODUCTO (Soft Delete) =====
// DELETE /api/productos/:id
exports.eliminarProducto = async (req, res) => {
  try {
    // No eliminamos realmente, solo lo marcamos como inactivo
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }
    
    res.json({
      exito: true,
      mensaje: 'Producto desactivado exitosamente',
      producto
    });
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// ===== BUSCAR PRODUCTOS =====
// GET /api/productos/buscar?q=bolsa
exports.buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Debes proporcionar un término de búsqueda'
      });
    }
    
    // Búsqueda por texto en nombre y descripción
    const productos = await Producto.find({
      $text: { $search: q },
      activo: true
    }).limit(10);
    
    res.json({
      exito: true,
      cantidad: productos.length,
      productos
    });
    
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al buscar productos',
      error: error.message
    });
  }
};

// ===== OBTENER PRODUCTOS DESTACADOS =====
// GET /api/productos/destacados
exports.obtenerProductosDestacados = async (req, res) => {
  try {
    const productos = await Producto.find({
      destacado: true,
      activo: true
    }).limit(6);
    
    res.json({
      exito: true,
      cantidad: productos.length,
      productos
    });
    
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener productos destacados',
      error: error.message
    });
  }
};

// ===== CALCULAR PRECIO =====
// POST /api/productos/:id/calcular-precio
// Body: { cantidad: 150, tipoLogo: 'con-logo' }
exports.calcularPrecio = async (req, res) => {
  try {
    const { cantidad, tipoLogo } = req.body;
    
    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La cantidad debe ser mayor a 0'
      });
    }
    
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Producto no encontrado'
      });
    }
    
    // Usar el método del modelo para obtener precio
    const precioUnitario = producto.obtenerPrecio(cantidad, tipoLogo);
    const subtotal = precioUnitario * cantidad;
    
    res.json({
      exito: true,
      calculo: {
        cantidad,
        tipoLogo,
        precioUnitario,
        subtotal
      }
    });
    
  } catch (error) {
    console.error('Error al calcular precio:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al calcular precio',
      error: error.message
    });
  }
};

// ===== EXPLICACIÓN DE CADA FUNCIÓN =====
/*

1. obtenerProductos(): 
   - Trae todos los productos
   - Puede filtrar por categoría, activo, destacado
   - Ordena: destacados primero, luego más recientes

2. obtenerProductoPorId():
   - Busca un producto específico por su ID
   - Retorna 404 si no existe

3. obtenerProductoPorSlug():
   - Busca por URL amigable (ej: "bolsa-papel-no-3")
   - Útil para SEO

4. crearProducto():
   - Crea un nuevo producto
   - Valida que tenga todos los campos requeridos
   - Solo admin puede usarlo

5. actualizarProducto():
   - Modifica un producto existente
   - Valida los nuevos datos
   - Solo admin

6. eliminarProducto():
   - NO elimina realmente (soft delete)
   - Solo lo marca como inactivo
   - Así conservas historial

7. buscarProductos():
   - Busca por texto en nombre y descripción
   - Útil para el buscador del sitio

8. obtenerProductosDestacados():
   - Trae solo productos marcados como destacados
   - Para mostrar en el home

9. calcularPrecio():
   - Calcula precio según cantidad y tipo de logo
   - Útil para el frontend
*/