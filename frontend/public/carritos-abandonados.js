// ===== GESTIÓN DE CARRITOS ABANDONADOS =====
// Agregar a dashboard.js o crear como archivo separado

const API_URL = 'http://localhost:3000';

/**
 * Cargar carritos abandonados
 */
async function cargarCarritosAbandonados() {
    try {
        const estado = document.getElementById('filtroEstadoCarrito')?.value || 'carrito_guardado';
        const url = estado === 'todos' 
            ? `${API_URL}/admin/pedidos-clientes`
            : `${API_URL}/admin/pedidos-clientes?estado=${estado}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar carritos');
        
        const carritos = await response.json();
        console.log('🛒 Carritos abandonados:', carritos);
        
        // Actualizar contador
        document.getElementById('totalAbandonados').textContent = carritos.length;
        
        mostrarCarritosAbandonados(carritos);
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('tablaCarritosAbandonados').innerHTML = 
            '<p class="info-message">⚠️ Error al cargar carritos abandonados</p>';
    }
}

/**
 * Mostrar carritos en tabla
 */
function mostrarCarritosAbandonados(carritos) {
    const contenedor = document.getElementById('tablaCarritosAbandonados');
    
    if (carritos.length === 0) {
        contenedor.innerHTML = '<p class="info-message">✅ No hay carritos abandonados</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Tiempo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${carritos.map(carrito => `
                    <tr>
                        <td>
                            <div class="cliente-info">
                                <span class="cliente-nombre">${carrito.cliente.nombre || 'Sin nombre'}</span>
                                <span class="cliente-email">${carrito.cliente.correo}</span>
                                ${carrito.cliente.telefono ? `<span class="cliente-telefono">📱 ${carrito.cliente.telefono}</span>` : ''}
                            </div>
                        </td>
                        <td>
                            <div class="productos-mini">
                                ${carrito.totalProductos} producto${carrito.totalProductos !== 1 ? 's' : ''}
                            </div>
                        </td>
                        <td>
                            <span class="total-destacado">$ ${formatearPrecio(carrito.total)}</span>
                        </td>
                        <td>${formatearFecha(carrito.fecha)}</td>
                        <td>
                            <span class="tiempo-transcurrido">
                                ${calcularTiempoTranscurrido(carrito.fecha)}
                            </span>
                        </td>
                        <td>
                            <div class="acciones-carrito">
                                <button class="btn-whatsapp" onclick="enviarRecordatorioWhatsApp('${carrito.id}')">
                                    💬 WhatsApp
                                </button>
                                <button class="btn-ver-detalle" onclick="verDetalleCarrito('${carrito.id}')">
                                    👁️ Ver
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    contenedor.innerHTML = html;
}

/**
 * Enviar recordatorio por WhatsApp
 */
window.enviarRecordatorioWhatsApp = async function(carritoId) {
    try {
        const response = await fetch(`${API_URL}/carrito/${carritoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar carrito');
        
        const carrito = await response.json();
        
        // Construir mensaje
        const productos = carrito.productos.map(p => 
            `• ${p.nombre} (x${p.cantidad})`
        ).join('\n');
        
        const mensaje = `Hola ${carrito.cliente.nombre}! 👋\n\n` +
                       `Notamos que dejaste productos en tu carrito:\n\n` +
                       `${productos}\n\n` +
                       `💰 Total: $${formatearPrecio(carrito.total)}\n\n` +
                       `¿Te gustaría completar tu compra? Estamos aquí para ayudarte. 😊`;
        
        const telefono = carrito.cliente.telefono?.replace(/\D/g, '') || '573188637696';
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
        
        window.open(whatsappUrl, '_blank');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al generar mensaje de WhatsApp');
    }
};

/**
 * Ver detalle del carrito
 */
window.verDetalleCarrito = async function(carritoId) {
    try {
        const response = await fetch(`${API_URL}/carrito/${carritoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar carrito');
        
        const carrito = await response.json();
        
        // Mostrar en modal o alert (puedes crear un modal bonito)
        const detalle = `
CLIENTE:
• Nombre: ${carrito.cliente.nombre} ${carrito.cliente.apellido}
• Email: ${carrito.cliente.correo}
• Teléfono: ${carrito.cliente.telefono || 'No proporcionado'}
• Ciudad: ${carrito.cliente.ciudad}, ${carrito.cliente.departamento}
• Dirección: ${carrito.cliente.direccion || 'No proporcionada'}

PRODUCTOS:
${carrito.productos.map(p => `• ${p.nombre} x${p.cantidad} - $${formatearPrecio(p.precio * p.cantidad)}`).join('\n')}

TOTAL: $${formatearPrecio(carrito.total)}
ESTADO: ${carrito.estado}
FECHA: ${new Date(carrito.createdAt).toLocaleString('es-CO')}
        `;
        
        alert(detalle);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar detalle del carrito');
    }
};

/**
 * Exportar carritos a Excel (básico)
 */
window.exportarCarritosAbandonados = function() {
    alert('Función de exportación en desarrollo.\nPróximamente podrás descargar los datos en formato Excel.');
};

/**
 * Calcular tiempo transcurrido
 */
function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const entonces = new Date(fecha);
    const diff = ahora - entonces;
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    if (horas > 0) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Formatear precio
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

// Configurar filtros
document.getElementById('filtroEstadoCarrito')?.addEventListener('change', cargarCarritosAbandonados);
document.getElementById('filtroPeriodo')?.addEventListener('change', cargarCarritosAbandonados);

console.log('✅ Módulo de carritos abandonados cargado');