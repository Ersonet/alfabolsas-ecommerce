/**
 * productPaperBags.js
 * Módulo de lógica para la vista de la categoría "Bolsas de Papel".
 * Contiene el renderizado dinámico, la lógica de filtrado y el ordenamiento.
 */
import { products } from './productsData.js'; 

// --- 1. SELECCIÓN DE ELEMENTOS Y ESTADO GLOBAL ---

const productGrid = document.getElementById('product-grid');
const sortSelect = document.getElementById('sort-select');
const filterList = document.querySelectorAll('.shop-sidebar input[type="checkbox"]');

// ESTADO GLOBAL: Almacena los filtros activos
let currentFilters = {
    tipo: [],
    material: [],
    color: []
};
let currentSort = 'relevancia';

// --- 2. FUNCIONES DE RENDERIZADO ---

/**
 * Genera el código HTML de una sola tarjeta de producto.
 */
function createProductCard(product) {
    // Formato de precio en pesos colombianos (COP)
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(product.price);

    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="units">${product.units}</p>
                <p class="price">${formattedPrice}</p>
            </div>
            <div class="actions">
                <button class="btn btn-primary">Ver Detalle</button>
                <button class="btn btn-secondary">Añadir a Cotización</button>
            </div>
        </div>
    `;
}

/**
 * Renderiza los productos en el contenedor (#product-grid).
 */
function renderProducts(productsArray) {
    productGrid.innerHTML = ''; // Limpiar antes de renderizar
    
    if (productsArray.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No se encontraron productos que coincidan con los filtros.</p>';
        return;
    }

    // Inyectar todo el HTML de una vez para mejor rendimiento (eficiencia del DOM)
    const cardsHtml = productsArray.map(product => createProductCard(product)).join('');
    productGrid.innerHTML = cardsHtml;
}

// --- 3. LÓGICA DE FILTROS Y ORDENAMIENTO ---

/**
 * Filtra y ordena los productos basándose en el estado global (currentFilters y currentSort).
 */
function applyFiltersAndSort() {
    let filteredProducts = products; 

    // APLICAR FILTROS: Iteramos sobre los tipos de filtro (tipo, material, color)
    Object.keys(currentFilters).forEach(key => {
        const activeValues = currentFilters[key]; 

        if (activeValues.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                // Filtramos el array, manteniendo solo los productos cuyo atributo (ej: product.tipo)
                // esté en la lista de valores activos para ese filtro.
                activeValues.includes(product[key])
            );
        }
    });

    // APLICAR ORDENAMIENTO
    if (currentSort === 'precio-asc') {
        filteredProducts.sort((a, b) => a.price - b.price); // Menor a Mayor
    } else if (currentSort === 'precio-desc') {
        filteredProducts.sort((a, b) => b.price - a.price); // Mayor a Menor
    }

    // RENDERIZAR RESULTADOS
    renderProducts(filteredProducts);
}

// --- 4. CONEXIÓN AL HTML (EVENT LISTENERS) ---

function setupEventListeners() {
    // Listener para el SELECT de "Ordenar por"
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFiltersAndSort();
    });

    // Listener para los Checkboxes del Sidebar
    filterList.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const { name, value, checked } = e.target;
            
            if (checked) {
                // Agregar filtro
                currentFilters[name].push(value);
            } else {
                // Eliminar filtro
                currentFilters[name] = currentFilters[name].filter(v => v !== value);
            }
            
            applyFiltersAndSort();
        });
    });

    // Renderizado inicial al cargar la página
    applyFiltersAndSort(); 
}

// Ejecutamos la configuración inicial una vez que el DOM esté completamente cargado.
window.onload = setupEventListeners;