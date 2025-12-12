// ===== BUSCADOR GLOBAL =====
// Sistema de búsqueda que funciona en todas las páginas del sitio

(function() {
    'use strict';
    
    const SEARCH_MANAGER = {
        // Base de datos de productos (simulada)
        // En producción, esto vendría del backend
        allProducts: null,
        
        // Elementos del DOM
        searchForm: null,
        searchInput: null,
        suggestionsContainer: null,
        
        // Inicializar
        async init() {
            this.searchForm = document.querySelector('.search');
            this.searchInput = document.getElementById('search-input');
            
            if (!this.searchForm || !this.searchInput) {
                console.warn('⚠️ Buscador no encontrado en esta página');
                return;
            }
            
            // Cargar productos
            await this.loadProducts();
            
            // Crear contenedor de sugerencias
            this.createSuggestionsContainer();
            
            // Configurar eventos
            this.setupEvents();
            
            console.log('✅ Buscador global inicializado');
        },
        
        // Cargar todos los productos
        async loadProducts() {
            try {
                // Intenta cargar desde el backend
                const response = await fetch('http://localhost:3000/productos');
                
                if (response.ok) {
                    this.allProducts = await response.json();
                    console.log('📦 Productos cargados desde backend:', this.allProducts.length);
                } else {
                    // Fallback: usar datos locales si el servidor no responde
                    this.useFallbackData();
                }
            } catch (error) {
                console.warn('⚠️ No se pudo conectar al backend, usando datos locales');
                this.useFallbackData();
            }
        },
        
        // Usar datos de respaldo (hardcoded)
        useFallbackData() {
            this.allProducts = [
                {
                    _id: '1',
                    nombre: 'Bolsa de papel Kraft con Manija #0',
                    categoria: 'Bolsas de Papel',
                    precio: 55000,
                    descripcion: 'Ideal para domicilios de comida rápida',
                    imagenes: ['/frontend/public/img/bolsa-kraft-manija.jpg']
                },
                {
                    _id: '2',
                    nombre: 'Bolsa de Lujo Troquelada',
                    categoria: 'Bolsas de Papel',
                    precio: 485000,
                    descripcion: 'Perfecta para boutiques y regalos',
                    imagenes: ['/frontend/public/img/bolsa-lujo-blanca.jpg']
                },
                {
                    _id: '3',
                    nombre: 'Bolsa Kraft Pequeña Manija Rizo',
                    categoria: 'Bolsas de Papel',
                    precio: 210000,
                    descripcion: 'Económica y funcional',
                    imagenes: ['/frontend/public/img/bolsa-rizo-marron.jpg']
                },
                {
                    _id: '4',
                    nombre: 'Bolsa Negra Premium con Manija',
                    categoria: 'Bolsas de Papel',
                    precio: 520000,
                    descripcion: 'Elegancia y resistencia',
                    imagenes: ['/frontend/public/img/bolsa-negra-manija.jpg']
                },
                {
                    _id: '5',
                    nombre: 'Bolsa Troquelada Color',
                    categoria: 'Bolsas de Papel',
                    precio: 315000,
                    descripcion: 'Disponible en varios colores',
                    imagenes: ['/frontend/public/img/bolsa-troquelada-roja.jpg']
                }
            ];
        },
        
        // Crear contenedor de sugerencias
        createSuggestionsContainer() {
            const container = document.createElement('div');
            container.id = 'search-suggestions';
            container.className = 'search-suggestions';
            this.searchForm.style.position = 'relative';
            this.searchForm.appendChild(container);
            this.suggestionsContainer = container;
        },
        
        // Configurar eventos
        setupEvents() {
            // Búsqueda en tiempo real
            this.searchInput.addEventListener('input', () => {
                this.handleSearch();
            });
            
            // Submit del formulario
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.goToResults();
            });
            
            // Cerrar sugerencias al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!this.searchForm.contains(e.target)) {
                    this.hideSuggestions();
                }
            });
            
            // Navegar con teclado
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideSuggestions();
                }
            });
        },
        
        // Manejar búsqueda
        handleSearch() {
            const query = this.searchInput.value.trim();
            
            if (query.length < 2) {
                this.hideSuggestions();
                return;
            }
            
            const results = this.searchProducts(query);
            this.showSuggestions(results.slice(0, 5)); // Mostrar máximo 5
        },
        
        // Buscar productos
        searchProducts(query) {
            const searchTerm = query.toLowerCase();
            
            return this.allProducts.filter(product => {
                return (
                    product.nombre.toLowerCase().includes(searchTerm) ||
                    product.descripcion?.toLowerCase().includes(searchTerm) ||
                    product.categoria?.toLowerCase().includes(searchTerm)
                );
            });
        },
        
        // Mostrar sugerencias
        showSuggestions(results) {
            if (results.length === 0) {
                this.suggestionsContainer.innerHTML = `
                    <div class="suggestion-item suggestion-empty">
                        <i class="fas fa-search"></i>
                        <span>No se encontraron productos</span>
                    </div>
                `;
                this.suggestionsContainer.classList.add('show');
                return;
            }
            
            const html = results.map(product => `
                <a href="/frontend/views/producto-detalle.html?id=${product._id}" class="suggestion-item">
                    <img src="${product.imagenes[0] || '/frontend/public/img/placeholder.jpg'}" 
                         alt="${product.nombre}" 
                         class="suggestion-img">
                    <div class="suggestion-info">
                        <p class="suggestion-name">${this.highlightMatch(product.nombre, this.searchInput.value)}</p>
                        <p class="suggestion-category">${product.categoria}</p>
                    </div>
                    <span class="suggestion-price">$${this.formatPrice(product.precio)}</span>
                </a>
            `).join('');
            
            this.suggestionsContainer.innerHTML = html + `
                <button class="suggestion-view-all" onclick="SEARCH_MANAGER.goToResults()">
                    Ver todos los resultados →
                </button>
            `;
            
            this.suggestionsContainer.classList.add('show');
        },
        
        // Ocultar sugerencias
        hideSuggestions() {
            this.suggestionsContainer.classList.remove('show');
        },
        
        // Ir a página de resultados
        goToResults() {
            const query = this.searchInput.value.trim();
            if (query) {
                window.location.href = `/frontend/views/resultados-busqueda.html?q=${encodeURIComponent(query)}`;
            }
        },
        
        // Resaltar coincidencias
        highlightMatch(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },
        
        // Formatear precio
        formatPrice(price) {
            return new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        }
    };
    
    // Exponer globalmente
    window.SEARCH_MANAGER = SEARCH_MANAGER;
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SEARCH_MANAGER.init());
    } else {
        SEARCH_MANAGER.init();
    }
    
})();