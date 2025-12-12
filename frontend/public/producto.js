// ===== PRODUCTO.JS =====
// Lógica para la página de producto individual

(function() {
    'use strict';
    
    // Datos del producto actual
    const productoActual = {
        id: 'sobre-burbuja-negro',
        nombre: 'Sobre Burbuja genérica - Color negro',
        descripcion: 'Sobre burbuja genérico de 17×22 cm con cinta adhesiva de seguridad',
        categoria: 'Empaques',
        imagen: '/frontend/assets/img/productos/bolsa-burbuja-rosada-1.webp',
        
        // Precios por rango
        rangosPrecios: {
            '20-99': { sinLogo: 500, conLogo: 600 },
            '100-299': { sinLogo: 450, conLogo: 550 },
            '300-500': { sinLogo: 400, conLogo: 500 },
            '501-1000': { sinLogo: 350, conLogo: 450 }
        },
        
        // Estado actual
        estado: {
            cantidad: 20,
            rangoActivo: '501-1000',
            conLogo: false,
            precioUnitario: 350
        }
    };
    
    // Elementos del DOM
    let elementosCargados = false;
    const elementos = {};
    
    /**
     * Inicializar la página
     */
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', cargarElementos);
        } else {
            cargarElementos();
        }
    }
    
    /**
     * Cargar elementos del DOM
     */
    function cargarElementos() {
        elementos.precioProducto = document.getElementById('precio-producto');
        elementos.cantidadInput = document.getElementById('cantidad-input');
        elementos.btnDecrementar = document.getElementById('btn-decrementar');
        elementos.btnIncrementar = document.getElementById('btn-incrementar');
        elementos.btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
        elementos.btnSinLogo = document.getElementById('btn-sin-logo');
        elementos.btnConLogo = document.getElementById('btn-con-logo');
        
        // Opciones de tabla de precios
        elementos.opcionesTabla = document.querySelectorAll('.tabla-precios__opcion');
        elementos.valoresTabla = document.querySelectorAll('.tabla-precios__valor');
        
        if (!elementos.btnAgregarCarrito) {
            console.error('❌ No se encontró el botón de agregar al carrito');
            return;
        }
        
        elementosCargados = true;
        configurarEventos();
        actualizarPrecio();
        
        console.log('✅ Página de producto inicializada');
    }
    
    /**
     * Configurar eventos
     */
    function configurarEventos() {
        // Botón agregar al carrito
        elementos.btnAgregarCarrito.addEventListener('click', agregarAlCarrito);
        
        // Cantidad
        elementos.btnDecrementar?.addEventListener('click', () => ajustarCantidad(-1));
        elementos.btnIncrementar?.addEventListener('click', () => ajustarCantidad(1));
        elementos.cantidadInput?.addEventListener('change', validarCantidad);
        
        // Sin logo / Con logo
        elementos.btnSinLogo?.addEventListener('click', () => cambiarTipoLogo(false));
        elementos.btnConLogo?.addEventListener('click', () => cambiarTipoLogo(true));
        
        // Tabla de precios
        elementos.opcionesTabla.forEach(opcion => {
            opcion.addEventListener('click', function() {
                seleccionarRango(this.dataset.rango);
            });
        });
        
        // Tabs
        configurarTabs();
    }
    
    /**
     * Agregar producto al carrito
     */
    function agregarAlCarrito() {
        // Verificar que la función del carrito esté disponible
        if (typeof agregarAlCarrito === 'undefined' || typeof window.agregarAlCarrito === 'undefined') {
            console.error('❌ La función agregarAlCarrito no está disponible');
            alert('Error: Sistema de carrito no cargado. Por favor recarga la página.');
            return;
        }
        
        const cantidad = parseInt(elementos.cantidadInput.value) || 20;
        const conLogo = productoActual.estado.conLogo;
        const precioUnitario = productoActual.estado.precioUnitario;
        
        // Preparar datos del producto para el carrito
        const productoParaCarrito = {
            _id: productoActual.id,
            nombre: productoActual.nombre,
            precio: precioUnitario,
            imagen: productoActual.imagen,
            slug: productoActual.id,
            preciosRangos: [{
                sinLogo: productoActual.rangosPrecios[productoActual.estado.rangoActivo].sinLogo,
                conLogo: productoActual.rangosPrecios[productoActual.estado.rangoActivo].conLogo
            }],
            categoria: productoActual.categoria,
            descripcion: productoActual.descripcion
        };
        
        console.log('🛒 Agregando al carrito:', {
            producto: productoParaCarrito,
            cantidad: cantidad,
            conLogo: conLogo
        });
        
        // Llamar a la función global del carrito
        try {
            // Usar la función global del carrito
            if (typeof window.agregarAlCarrito === 'function') {
                window.agregarAlCarrito(productoParaCarrito, cantidad, conLogo);
            } else {
                throw new Error('Función del carrito no disponible');
            }
        } catch (error) {
            console.error('❌ Error al agregar al carrito:', error);
            alert('Hubo un error al agregar el producto. Por favor intenta nuevamente.');
        }
    }
    
    /**
     * Ajustar cantidad
     */
    function ajustarCantidad(incremento) {
        const cantidadActual = parseInt(elementos.cantidadInput.value) || 20;
        let nuevaCantidad = cantidadActual + incremento;
        
        // Límites
        if (nuevaCantidad < 20) nuevaCantidad = 20;
        if (nuevaCantidad > 10000) nuevaCantidad = 10000;
        
        elementos.cantidadInput.value = nuevaCantidad;
        productoActual.estado.cantidad = nuevaCantidad;
        
        // Actualizar rango si es necesario
        actualizarRangoPorCantidad(nuevaCantidad);
        actualizarPrecio();
    }
    
    /**
     * Validar cantidad ingresada manualmente
     */
    function validarCantidad() {
        let cantidad = parseInt(elementos.cantidadInput.value) || 20;
        
        if (cantidad < 20) cantidad = 20;
        if (cantidad > 10000) cantidad = 10000;
        
        elementos.cantidadInput.value = cantidad;
        productoActual.estado.cantidad = cantidad;
        
        actualizarRangoPorCantidad(cantidad);
        actualizarPrecio();
    }
    
    /**
     * Actualizar rango según cantidad
     */
    function actualizarRangoPorCantidad(cantidad) {
        let nuevoRango;
        
        if (cantidad >= 501) nuevoRango = '501-1000';
        else if (cantidad >= 300) nuevoRango = '300-500';
        else if (cantidad >= 100) nuevoRango = '100-299';
        else nuevoRango = '20-99';
        
        if (nuevoRango !== productoActual.estado.rangoActivo) {
            seleccionarRango(nuevoRango);
        }
    }
    
    /**
     * Seleccionar rango de precios
     */
    function seleccionarRango(rango) {
        productoActual.estado.rangoActivo = rango;
        
        // Actualizar UI de la tabla
        elementos.opcionesTabla.forEach(opcion => {
            if (opcion.dataset.rango === rango) {
                opcion.classList.add('active');
            } else {
                opcion.classList.remove('active');
            }
        });
        
        elementos.valoresTabla.forEach(valor => {
            const rangoValor = valor.closest('th')?.dataset.rango;
            if (rangoValor === rango) {
                valor.classList.add('active');
            } else {
                valor.classList.remove('active');
            }
        });
        
        actualizarPrecio();
    }
    
    /**
     * Cambiar tipo de logo
     */
    function cambiarTipoLogo(conLogo) {
        productoActual.estado.conLogo = conLogo;
        
        // Actualizar botones
        if (conLogo) {
            elementos.btnConLogo.classList.add('active');
            elementos.btnSinLogo.classList.remove('active');
        } else {
            elementos.btnSinLogo.classList.add('active');
            elementos.btnConLogo.classList.remove('active');
        }
        
        actualizarPrecio();
    }
    
    /**
     * Actualizar precio mostrado
     */
    function actualizarPrecio() {
        const rango = productoActual.estado.rangoActivo;
        const precios = productoActual.rangosPrecios[rango];
        const precio = productoActual.estado.conLogo ? precios.conLogo : precios.sinLogo;
        
        productoActual.estado.precioUnitario = precio;
        
        // Actualizar precio principal
        if (elementos.precioProducto) {
            elementos.precioProducto.textContent = `$ ${formatearPrecio(precio)}`;
        }
        
        // Actualizar valores en la tabla
        elementos.valoresTabla.forEach(valor => {
            const precioSinLogo = parseInt(valor.dataset.precioSinLogo);
            const precioConLogo = parseInt(valor.dataset.precioConLogo);
            const precioMostrar = productoActual.estado.conLogo ? precioConLogo : precioSinLogo;
            
            valor.textContent = `$${formatearPrecio(precioMostrar)}`;
        });
    }
    
    /**
     * Configurar tabs
     */
    function configurarTabs() {
        const tabBtns = document.querySelectorAll('.producto-tabs__btn');
        const tabPanels = document.querySelectorAll('.producto-tabs__panel');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Remover active de todos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                // Activar seleccionado
                this.classList.add('active');
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
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
    
    // Inicializar
    init();
    
})();