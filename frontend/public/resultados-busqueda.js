// ===== RESULTADOS DE BÚSQUEDA =====

const API_URL = 'http://localhost:3000';

// Obtener término de búsqueda de la URL
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('q') || '';

document.addEventListener('DOMContentLoaded', async () => {
    if (!searchTerm) {
        window.location.href = '/frontend/views/index.html';
        return;
    }
    
    // Mostrar término de búsqueda
    document.getElementById('searchTerm').textContent = searchTerm;
    
    // Buscar productos
    await buscarProductos(searchTerm);
});

/**
 * Buscar productos
 */
async function buscarProductos(query) {
    try {
        // Intentar desde backend
        const response = await fetch(`${API_URL}/productos/buscar?q=${encodeURIComponent(query)}`);
        
        let productos;
        if (response.ok) {
            productos = await response.json();
        } else {
            // Fallback: buscar en datos locales
            productos = buscarEnLocal(query);
        }
        
        mostrarResultados(productos);
        
    } catch (error) {
        console.error('❌ Error al buscar:', error);
        // Buscar en datos locales como fallback
        const productos = buscarEnLocal(query);
        mostrarResultados(productos);
    }
}

/**
 * Buscar en datos locales (fallback)
 */
function buscarEnLocal(query) {
    // Mismos datos de respaldo que en buscador-global.js
    const allProducts = [
        {
            _id: '1',
            nombre: 'Bolsa de papel Kraft con Manija #0',
            categoria: 'Bolsas de Papel',
            precio: 55000,
            stock: 1500,
            descripcion: 'Ideal para domicilios de comida rápida',
            imagenes: ['/frontend/public/img/bolsa-kraft-manija.jpg']
        },
        {
            _id: '2',
            nombre: 'Bolsa de Lujo Troquelada',
            categoria: 'Bolsas de Papel',
            precio: 485000,
            stock: 500,
            descripcion: 'Perfecta para boutiques y regalos',
            imagenes: ['/frontend/public/img/bolsa-lujo-blanca.jpg']
        },
        {
            _id: '3',
            nombre: 'Bolsa Kraft Pequeña Manija Rizo',
            categoria: 'Bolsas de Papel',
            precio: 210000,
            stock: 2000,
            descripcion: 'Económica y funcional',
            imagenes: ['/frontend/public/img/bolsa-rizo-marron.jpg']
        },
        {
            _id: '4',
            nombre: 'Bolsa Negra Premium con Manija',
            categoria: 'Bolsas de Papel',
            precio: 520000,
            stock: 1000,
            descripcion: 'Elegancia y resistencia',
            imagenes: ['/frontend/public/img/bolsa-negra-manija.jpg']
        },
        {
            _id: '5',
            nombre: 'Bolsa Troquelada Color',
            categoria: 'Bolsas de Papel',
            precio: 315000,
            stock: 1500,
            descripcion: 'Disponible en varios colores',
            imagenes: ['/frontend/public/img/bolsa-troquelada-roja.jpg']
        }
    ];
    
    const searchLower = query.toLowerCase();
    return allProducts.filter(p =>
        p.nombre.toLowerCase().includes(searchLower) ||
        p.descripcion.toLowerCase().includes(searchLower) ||
        p.categoria.toLowerCase().includes(searchLower)
    );
}

/**
 * Mostrar resultados
 */
function mostrarResultados(productos) {
    const grid = document.getElementById('resultsGrid');
    const countElement = document.getElementById('resultsCount');
    
    // Actualizar contador
    countElement.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`;
    
    if (productos.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h2>No se encontraron resultados</h2>
                <p>Intenta con otros términos de búsqueda</p>
                <a href="/frontend/views/index.html" class="btn-primary">Volver al inicio</a>
            </div>
        `;
        return;
    }
    
    // Renderizar productos
    grid.innerHTML = productos.map(producto => `
        <article class="product-card">
            <div class="product-card__image">
                <img src="${producto.imagenes[0]}" alt="${producto.nombre}" loading="lazy">
            </div>
            
            <div class="product-card__content">
                <span class="product-card__category">${producto.categoria}</span>
                <h3 class="product-card__title">${producto.nombre}</h3>
                <p class="product-card__description">${producto.descripcion}</p>
                <p class="product-card__price">$ ${formatearPrecio(producto.precio)}</p>
                
                <div class="product-card__actions">
                    <button class="btn-detail" onclick="verDetalle('${producto._id}')">
                        Ver Detalle
                    </button>
                    <button class="btn-add-cart" onclick="agregarAlCarrito('${producto._id}')">
                        🛒 Agregar
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

/**
 * Ver detalle del producto
 */
window.verDetalle = function(productId) {
    window.location.href = `/frontend/views/producto-detalle.html?id=${productId}`;
};

/**
 * Agregar al carrito
 */
window.agregarAlCarrito = function(productId) {
    // Implementar cuando tengas la función global del carrito
    console.log('Agregar al carrito:', productId);
    alert('Función de carrito pendiente de integración');
};

/**
 * Formatear precio
 */
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

console.log('✅ Página de resultados inicializada');