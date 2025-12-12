// ===== CARRITO DE COMPRAS =====
// Gestión completa del carrito y checkout

const API_URL = 'http://localhost:3000';

// Carrito en memoria (localStorage)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    configurarEventosCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
});

// ===== CONFIGURAR EVENTOS =====
function configurarEventosCarrito() {
    // Abrir carrito
    document.getElementById('btnCarrito')?.addEventListener('click', abrirCarrito);
    
    // Cerrar carrito
    document.getElementById('btnCerrarCarrito')?.addEventListener('click', cerrarCarrito);
    document.getElementById('carritoOverlay')?.addEventListener('click', cerrarCarrito);
    
    // Ir a pagar
    document.getElementById('btnIrAPagar')?.addEventListener('click', irACheckout);
}

// ===== AGREGAR AL CARRITO =====
function agregarAlCarrito(producto, cantidad = 1, conLogo = false) {
    // Verificar si el producto ya está en el carrito
    const indiceExistente = carrito.findIndex(
        item => item.productoId === producto._id && item.conLogo === conLogo
    );
    
    if (indiceExistente !== -1) {
        // Si ya existe, aumentar cantidad
        carrito[indiceExistente].cantidad += cantidad;
    } else {
        // Si no existe, agregarlo
        const precio = conLogo 
            ? (producto.preciosRangos?.[0]?.conLogo || 0)
            : (producto.preciosRangos?.[0]?.sinLogo || 0);
        
        carrito.push({
            productoId: producto._id,
            nombre: producto.nombre,
            cantidad: cantidad,
            precio: precio,
            conLogo: conLogo,
            imagen: producto.imagenes?.[0] || 'https://via.placeholder.com/100',
            sku: producto.slug || `PROD-${producto._id.slice(-6)}`
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarNotificacion('✅ Producto agregado al carrito');
    
    console.log('🛒 Producto agregado:', producto.nombre);
}

// ===== ACTUALIZAR CANTIDAD =====
function actualizarCantidad(indice, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(indice);
        return;
    }
    
    carrito[indice].cantidad = nuevaCantidad;
    guardarCarrito();
    renderizarCarrito();
}

// ===== ELIMINAR DEL CARRITO =====
function eliminarDelCarrito(indice) {
    const producto = carrito[indice];
    carrito.splice(indice, 1);
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarNotificacion(`❌ ${producto.nombre} eliminado del carrito`);
}

// ===== VACIAR CARRITO =====
function vaciarCarrito() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
        mostrarNotificacion('🗑️ Carrito vaciado');
    }
}

// ===== RENDERIZAR CARRITO =====
function renderizarCarrito() {
    const contenedor = document.getElementById('carritoProductos');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icon">🛒</div>
                <p>Esto está muy solo...</p>
                <button class="btn-primary" onclick="cerrarCarrito()">¡Vamos a comprar!</button>
            </div>
        `;
        document.getElementById('btnIrAPagar').disabled = true;
        return;
    }
    
    // Renderizar productos
    contenedor.innerHTML = carrito.map((item, indice) => `
        <div class="carrito-item">
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-sku">SKU: ${item.sku}</div>
                <div class="carrito-item-precio">$ ${formatearPrecio(item.precio)}</div>
                <div class="carrito-item-cantidad">
                    <button class="btn-cantidad" onclick="actualizarCantidad(${indice}, ${item.cantidad - 1})">-</button>
                    <span class="cantidad-valor">${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="actualizarCantidad(${indice}, ${item.cantidad + 1})">+</button>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${indice})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Actualizar totales
    actualizarTotales();
    document.getElementById('btnIrAPagar').disabled = false;
}

// ===== ACTUALIZAR TOTALES =====
function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    document.getElementById('carritoSubtotal').textContent = `$ ${formatearPrecio(subtotal)}`;
    document.getElementById('carritoTotal').textContent = `$ ${formatearPrecio(subtotal)}`;
    document.getElementById('totalPagar').textContent = `$${formatearPrecio(subtotal)}`;
}

// ===== ACTUALIZAR CONTADOR =====
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contador = document.getElementById('carritoContador');
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ===== ABRIR/CERRAR CARRITO =====
function abrirCarrito() {
    document.getElementById('panelCarrito').classList.add('active');
    document.getElementById('carritoOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
    document.getElementById('panelCarrito').classList.remove('active');
    document.getElementById('carritoOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== IR A CHECKOUT =====
function irACheckout() {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Guardar carrito en localStorage para el checkout
    guardarCarrito();
    
    // Redirigir a página de checkout
    window.location.href = 'checkout.html';
}

// ===== GUARDAR/CARGAR CARRITO =====
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    return carrito;
}

// ===== OBTENER CARRITO =====
function obtenerCarrito() {
    return carrito;
}

// ===== OBTENER TOTALES =====
function obtenerTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return {
        subtotal,
        envio: 0, // Se calcula en checkout
        impuestos: 0,
        total: subtotal
    };
}

// ===== UTILIDADES =====
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

function mostrarNotificacion(mensaje) {
    // Implementar sistema de notificaciones toast
    console.log('📢', mensaje);
    // Por ahora solo console.log, después agregar toasts visuales
}

// Exponer funciones globales
window.agregarAlCarrito = agregarAlCarrito;
window.actualizarCantidad = actualizarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.obtenerCarrito = obtenerCarrito;
window.obtenerTotales = obtenerTotales;

console.log('✅ Módulo de carrito cargado');