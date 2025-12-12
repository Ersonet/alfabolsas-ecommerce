// ===== CHECKOUT - LÓGICA =====

const API_URL = 'http://localhost:3000';
let carrito = [];
let pedidoId = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
    cargarResumenPedido();
    configurarFormulario();
    configurarMetodosPago();
});

// ===== CARGAR CARRITO DESDE LOCALSTORAGE =====
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (!carritoGuardado) {
        alert('No hay productos en el carrito');
        window.location.href = 'index.html';
        return;
    }
    
    carrito = JSON.parse(carritoGuardado);
    
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('🛒 Carrito cargado:', carrito);
}

// ===== CARGAR RESUMEN DEL PEDIDO =====
function cargarResumenPedido() {
    const contenedor = document.getElementById('resumenProductos');
    
    // Renderizar productos
    contenedor.innerHTML = carrito.map(item => `
        <div class="summary-product">
            <div style="position: relative;">
                <img src="${item.imagen}" alt="${item.nombre}" class="summary-product-img">
                <span class="summary-product-quantity">${item.cantidad}</span>
            </div>
            <div class="summary-product-info">
                <div class="summary-product-name">${item.nombre}</div>
                <div class="summary-product-sku">SKU: ${item.sku}</div>
                <div class="summary-product-price">$ ${formatearPrecio(item.precio * item.cantidad)}</div>
            </div>
        </div>
    `).join('');
    
    // Calcular y mostrar totales
    actualizarTotales();
}

// ===== ACTUALIZAR TOTALES =====
function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const impuestos = 0; // Calcular según necesites
    const envio = 0; // Se calcula después con la ciudad
    const total = subtotal + impuestos + envio;
    
    document.getElementById('resumenSubtotal').textContent = `$ ${formatearPrecio(subtotal)}`;
    document.getElementById('resumenImpuestos').textContent = `$ ${formatearPrecio(impuestos)}`;
    document.getElementById('resumenTotal').textContent = `$ ${formatearPrecio(total)}`;
    
    // Actualizar texto de subtotal
    const subtotalRow = document.querySelector('.total-row:first-child span:first-child');
    if (subtotalRow) {
        subtotalRow.textContent = `Subtotal (${totalProductos} producto${totalProductos !== 1 ? 's' : ''})`;
    }
}

// ===== CONFIGURAR FORMULARIO =====
function configurarFormulario() {
    const form = document.getElementById('formCheckout');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await procesarPedido();
    });
    
    // Auto-formatear número de tarjeta
    const numeroTarjeta = document.getElementById('numeroTarjeta');
    numeroTarjeta?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Auto-formatear fecha de vencimiento
    const fechaVencimiento = document.getElementById('fechaVencimiento');
    fechaVencimiento?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}

// ===== CONFIGURAR MÉTODOS DE PAGO =====
function configurarMetodosPago() {
    const radios = document.querySelectorAll('input[name="metodoPago"]');
    
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Mostrar/ocultar detalles de tarjeta
            const detallesTarjeta = document.getElementById('detallesTarjeta');
            if (detallesTarjeta) {
                detallesTarjeta.style.display = e.target.value === 'tarjeta' ? 'block' : 'none';
            }
        });
    });
    
    // Botón aplicar descuento
    document.getElementById('btnAplicarDescuento')?.addEventListener('click', aplicarDescuento);
}

// ===== APLICAR CÓDIGO DE DESCUENTO =====
function aplicarDescuento() {
    const codigo = document.getElementById('codigoDescuento').value.trim();
    
    if (!codigo) {
        alert('Ingresa un código de descuento');
        return;
    }
    
    // TODO: Validar código con el backend
    alert('Función de descuento en desarrollo');
    console.log('Código ingresado:', codigo);
}

// ===== PROCESAR PEDIDO =====
async function procesarPedido() {
    const btnFinalizar = document.getElementById('btnFinalizar');
    btnFinalizar.disabled = true;
    btnFinalizar.textContent = 'Procesando...';
    
    try {
        // Recopilar datos del formulario
        const datosCliente = {
            cliente: {
                correo: document.getElementById('correo').value.trim(),
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                codigoPostal: document.getElementById('codigoPostal').value.trim(),
                ciudad: document.getElementById('ciudad').value.trim(),
                departamento: document.getElementById('departamento').value.trim(),
                pais: document.getElementById('pais').value,
                suscritoNewsletter: document.getElementById('newsletter').checked
            },
            productos: carrito,
            subtotal: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            costoEnvio: 0,
            impuestos: 0,
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            estado: 'carrito_guardado',
            metodoPago: {
                tipo: document.querySelector('input[name="metodoPago"]:checked').value,
                detalles: ''
            },
            origen: 'web',
            notasCliente: ''
        };
        
        console.log('📦 Enviando pedido:', datosCliente);
        
        // Guardar pedido en el servidor
        const response = await fetch(`${API_URL}/carrito/guardar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCliente)
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar el pedido');
        }
        
        const resultado = await response.json();
        pedidoId = resultado.pedidoId;
        
        console.log('✅ Pedido guardado:', resultado);
        
        // Procesar pago según método seleccionado
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
        
        if (metodoPago === 'tarjeta') {
            await procesarPagoTarjeta(pedidoId);
        } else if (metodoPago === 'pse') {
            await procesarPagoPSE(pedidoId);
        } else {
            // Otros métodos
            mostrarConfirmacionPendiente(pedidoId);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al procesar el pedido. Por favor intenta nuevamente.');
        btnFinalizar.disabled = false;
        btnFinalizar.textContent = 'Finalizar el pedido';
    }
}

// ===== PROCESAR PAGO CON TARJETA =====
async function procesarPagoTarjeta(pedidoId) {
    // TODO: Integrar con pasarela de pagos real
    console.log('💳 Procesando pago con tarjeta...');
    
    // Simulación de pago
    const pagoExitoso = confirm('Simulación de pago:\n¿El pago fue exitoso?\n\nOK = Sí, Cancelar = No');
    
    try {
        await fetch(`${API_URL}/carrito/${pedidoId}/pago`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exitoso: pagoExitoso,
                tipo: 'tarjeta',
                referenciaPago: 'REF-' + Date.now()
            })
        });
        
        if (pagoExitoso) {
            mostrarConfirmacionExitosa(pedidoId);
        } else {
            mostrarConfirmacionPendiente(pedidoId);
        }
        
    } catch (error) {
        console.error('❌ Error al actualizar pago:', error);
        mostrarConfirmacionPendiente(pedidoId);
    }
}

// ===== PROCESAR PAGO PSE =====
async function procesarPagoPSE(pedidoId) {
    // TODO: Integrar con PSE
    console.log('🏦 Redirigiendo a PSE...');
    alert('Integración con PSE en desarrollo');
    mostrarConfirmacionPendiente(pedidoId);
}

// ===== MOSTRAR CONFIRMACIÓN EXITOSA =====
function mostrarConfirmacionExitosa(pedidoId) {
    localStorage.removeItem('carrito');
    
    alert(`✅ ¡Pago exitoso!\n\nNúmero de pedido: ${pedidoId}\n\nRecibirás un correo con los detalles.`);
    window.location.href = `confirmacion.html?pedido=${pedidoId}&estado=exitoso`;
}

// ===== MOSTRAR CONFIRMACIÓN PENDIENTE =====
function mostrarConfirmacionPendiente(pedidoId) {
    localStorage.removeItem('carrito');
    
    alert(`📋 Pedido guardado\n\nNúmero de pedido: ${pedidoId}\n\nTus datos han sido guardados. Puedes completar el pago más tarde.`);
    window.location.href = `confirmacion.html?pedido=${pedidoId}&estado=pendiente`;
}

// ===== UTILIDADES =====
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

console.log('✅ Checkout inicializado');