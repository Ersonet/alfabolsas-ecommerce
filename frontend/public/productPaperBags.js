/**
 * productPaperBags.js
 * Renderiza los productos de bolsas de papel y gestiona los filtros.
 * ACTUALIZADO: Incluye botón "Agregar al carrito"
 */

import { products } from './productsData.js';

// Estado actual de filtros
let currentFilters = {
    tipo: [],
    material: [],
    color: []
};

// Estado actual de ordenamiento
let currentSort = 'relevancia';

/**
 * Inicializar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupFilters();
    setupSorting();
    
    console.log('✅ Módulo de productos de papel cargado');
});

/**
 * Renderizar productos en el grid
 */
function renderProducts(productsToRender) {
    const productGrid = document.getElementById('product-grid');
    
    if (!productGrid) {
        console.error('❌ No se encontró el contenedor #product-grid');
        return;
    }
    
    if (productsToRender.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products">
                <p>No se encontraron productos con los filtros seleccionados.</p>
            </div>
        `;
        return;
    }
    
    productGrid.innerHTML = productsToRender.map(product => `
        <article class="product-card">
            <div class="product-card__image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            
            <div class="product-card__content">
                <h3 class="product-card__title">${product.name}</h3>
                
                <p class="product-card__units">${product.units}</p>
                
                <p class="product-card__price">$ ${formatPrice(product.price)}</p>
                
                <div class="product-card__actions">
                    <button 
                        class="btn-detail" 
                        onclick="verDetalle(${product.id})"
                        aria-label="Ver detalles de ${product.name}">
                        Ver Detalle
                    </button>
                    
                    <button 
                        class="btn-add-cart" 
                        onclick="agregarProductoAlCarrito(${product.id})"
                        aria-label="Agregar ${product.name} al carrito">
                        🛒 Agregar al Carrito
                    </button>
                </div>
                
                <button 
                    class="btn-quote" 
                    onclick="cotizarProducto(${product.id})"
                    aria-label="Cotizar ${product.name} por WhatsApp">
                    Añadir a Cotización
                </button>
            </div>
        </article>
    `).join('');
}

/**
 * Configurar filtros
 */
function setupFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const filterType = e.target.name; // tipo, material, color
            const filterValue = e.target.value;
            
            if (e.target.checked) {
                currentFilters[filterType].push(filterValue);
            } else {
                currentFilters[filterType] = currentFilters[filterType].filter(v => v !== filterValue);
            }
            
            applyFilters();
        });
    });
}

/**
 * Aplicar filtros
 */
function applyFilters() {
    let filteredProducts = products;
    
    // Filtrar por tipo
    if (currentFilters.tipo.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            currentFilters.tipo.includes(p.tipo)
        );
    }
    
    // Filtrar por material
    if (currentFilters.material.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            currentFilters.material.includes(p.material)
        );
    }
    
    // Filtrar por color
    if (currentFilters.color.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
            currentFilters.color.includes(p.color)
        );
    }
    
    // Aplicar ordenamiento
    filteredProducts = sortProducts(filteredProducts, currentSort);
    
    renderProducts(filteredProducts);
}

/**
 * Configurar ordenamiento
 */
function setupSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }
}

/**
 * Ordenar productos
 */
function sortProducts(productsArray, sortType) {
    const sorted = [...productsArray];
    
    switch(sortType) {
        case 'precio-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'precio-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'relevancia':
        default:
            return sorted;
    }
}

/**
 * NUEVO: Agregar producto al carrito
 */
window.agregarProductoAlCarrito = function(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error('❌ Producto no encontrado');
        return;
    }
    
    // Preparar datos del producto para el carrito
    const productoCarrito = {
        _id: product.id.toString(), // Simular MongoDB _id
        nombre: product.name,
        precio: product.price,
        imagen: product.image,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        preciosRangos: [{
            sinLogo: product.price,
            conLogo: product.price * 1.15 // 15% más con logo
        }]
    };
    
    // Llamar a la función del carrito (debe estar disponible globalmente)
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(productoCarrito, 1, false);
    } else {
        console.error('❌ La función agregarAlCarrito no está disponible. Asegúrate de incluir carrito.js');
        alert('Por favor, recarga la página e intenta nuevamente.');
    }
};

/**
 * Ver detalle del producto
 */
window.verDetalle = function(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Guardar producto en localStorage para la página de detalle
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    
    // Redirigir a página de detalle (si existe)
    window.location.href = `producto-detalle.html?id=${productId}`;
};

/**
 * Cotizar producto por WhatsApp
 */
window.cotizarProducto = function(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const mensaje = `Hola, me interesa cotizar:\n\n` +
                   `📦 ${product.name}\n` +
                   `💰 Precio: $${formatPrice(product.price)}\n` +
                   `📏 ${product.units}`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=573188637696&text=${encodeURIComponent(mensaje)}`;
    
    window.open(whatsappUrl, '_blank');
};

/**
 * Formatear precio
 */
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

console.log('✅ productPaperBags.js cargado con funcionalidad de carrito');