// ===== DASHBOARD.JS =====
// Lógica del panel de control

// Verificar autenticación
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

if (!token) {
    window.location.href = 'login.html';
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    cargarEstadisticas();
    configurarNavegacion();
    configurarCerrarSesion();
    mostrarFechaActual();
});

// ===== CARGAR DATOS DEL USUARIO =====
function cargarDatosUsuario() {
    if (!usuario.nombre || !usuario.email) {
        console.error('No hay datos de usuario en localStorage');
        return;
    }
    
    // Actualizar sidebar
    document.getElementById('userName').textContent = usuario.nombre;
    document.getElementById('userEmail').textContent = usuario.email;
    
    // Iniciales para avatar
    const iniciales = obtenerIniciales(usuario.nombre);
    document.getElementById('userInitials').textContent = iniciales;
    
    // Configuración
    document.getElementById('configNombre').value = usuario.nombre;
    document.getElementById('configEmail').value = usuario.email;
    document.getElementById('configRol').value = usuario.rol || 'desarrollador';
    
    console.log('✅ Datos de usuario cargados:', usuario);
}

// ===== CARGAR ESTADÍSTICAS =====
async function cargarEstadisticas() {
    try {
        // Obtener productos desde el backend
        const response = await fetch('http://localhost:3000/productos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const productos = await response.json();
        console.log('📦 Productos cargados:', productos);
        
        // Calcular estadísticas
        const activos = productos.filter(p => p.activo).length;
        const inactivos = productos.filter(p => !p.activo).length;
        const bajoStock = productos.filter(p => p.stock < 100).length; // Ajusta el límite según necesites
        
        // Actualizar UI
        document.getElementById('totalProductos').textContent = activos;
        document.getElementById('productosInactivos').textContent = inactivos;
        document.getElementById('bajoStock').textContent = bajoStock;
        document.getElementById('actividadMes').textContent = '0'; // Por ahora
        
        // Mostrar productos con bajo stock
        mostrarProductosBajoStock(productos);
        
        // Mostrar últimos productos (simulado por ahora)
        mostrarUltimosProductos(productos);
        
    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
        
        // Mostrar datos de ejemplo si falla
        document.getElementById('totalProductos').textContent = '0';
        document.getElementById('bajoStock').textContent = '0';
        document.getElementById('productosInactivos').textContent = '0';
        document.getElementById('actividadMes').textContent = '0';
        
        document.getElementById('listaBajoStock').innerHTML = 
            '<p class="info-message">⚠️ No se pudieron cargar los productos. Asegúrate de que el servidor esté activo.</p>';
        document.getElementById('listaUltimosProductos').innerHTML = 
            '<p class="info-message">⚠️ No se pudieron cargar los productos.</p>';
    }
}

// ===== MOSTRAR PRODUCTOS CON BAJO STOCK =====
function mostrarProductosBajoStock(productos) {
    const bajoStock = productos.filter(p => p.stock < 100 && p.activo);
    const contenedor = document.getElementById('listaBajoStock');
    
    if (bajoStock.length === 0) {
        contenedor.innerHTML = '<p class="info-message">✅ Todos los productos tienen stock suficiente</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${bajoStock.slice(0, 5).map(p => `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>${p.stock} unidades</td>
                        <td><span style="color: var(--warning);">⚠️ Bajo</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    contenedor.innerHTML = html;
}

// ===== MOSTRAR ÚLTIMOS PRODUCTOS =====
function mostrarUltimosProductos(productos) {
    const contenedor = document.getElementById('listaUltimosProductos');
    
    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="info-message">📦 No hay productos registrados</p>';
        return;
    }
    
    // Ordenar por fecha de actualización (si existe el campo)
    const ultimos = productos.slice(0, 5);
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${ultimos.map(p => `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>${p.categoria || 'Sin categoría'}</td>
                        <td>
                            <span style="color: ${p.activo ? 'var(--success)' : 'var(--danger)'};">
                                ${p.activo ? '✅ Activo' : '❌ Inactivo'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    contenedor.innerHTML = html;
}

// ===== NAVEGACIÓN ENTRE SECCIONES =====
function configurarNavegacion() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sectionId = item.dataset.section;
            
            // Cambiar activo en menú
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Cambiar título
            const titulos = {
                'resumen': 'Panel de Control',
                'productos': 'Gestión de Productos',
                'pedidos': 'Vista de Pedidos',
                'configuracion': 'Configuración'
            };
            document.getElementById('pageTitle').textContent = titulos[sectionId];
        });
    });
}

// ===== CERRAR SESIÓN =====
function configurarCerrarSesion() {
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            console.log('🚪 Sesión cerrada');
            window.location.href = 'login.html';
        }
    });
}

// ===== UTILIDADES =====
function obtenerIniciales(nombre) {
    const palabras = nombre.trim().split(' ');
    if (palabras.length >= 2) {
        return palabras[0][0] + palabras[1][0];
    }
    return palabras[0][0] + (palabras[0][1] || '');
}

function mostrarFechaActual() {
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const fecha = new Date().toLocaleDateString('es-ES', opciones);
    document.getElementById('currentDate').textContent = fecha;
}

// ===== BOTONES DE ACCIONES =====
document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
    alert('📦 Módulo de crear producto en desarrollo...');
});

console.log('✅ Dashboard inicializado correctamente');