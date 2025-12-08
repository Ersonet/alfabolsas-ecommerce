// ===== PÁGINA DE PRODUCTO - JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', () => {
  
  // ===== VARIABLES GLOBALES =====
  let cantidadSeleccionada = 20;
  let rangoActivo = '501-1000';
  let tipoLogo = 'sin-logo'; // 'sin-logo' o 'con-logo'
  
  // Precios por rango (puedes actualizar estos valores)
  const preciosPorRango = {
    '20-99': { sinLogo: 500, conLogo: 600 },
    '100-299': { sinLogo: 450, conLogo: 550 },
    '300-500': { sinLogo: 400, conLogo: 500 },
    '501-1000': { sinLogo: 350, conLogo: 450 }
  };

  // ===== GALERÍA DE IMÁGENES =====
  const imagenPrincipal = document.getElementById('imagen-principal');
  const miniaturas = document.querySelectorAll('.miniatura');

  miniaturas.forEach(miniatura => {
    miniatura.addEventListener('click', () => {
      // Remover clase active de todas
      miniaturas.forEach(m => m.classList.remove('active'));
      
      // Agregar clase active a la clickeada
      miniatura.classList.add('active');
      
      // Cambiar imagen principal
      const nuevaImagen = miniatura.getAttribute('data-imagen');
      imagenPrincipal.src = nuevaImagen;
    });
  });

  // ===== TABLA DE PRECIOS - SELECCIÓN DE RANGO =====
  const opcionesRango = document.querySelectorAll('.tabla-precios__opcion');
  const valoresTabla = document.querySelectorAll('.tabla-precios__valor');

  opcionesRango.forEach(opcion => {
    opcion.addEventListener('click', () => {
      // Remover active de todas las opciones
      opcionesRango.forEach(op => op.classList.remove('active'));
      valoresTabla.forEach(val => val.classList.remove('active'));
      
      // Agregar active a la seleccionada
      opcion.classList.add('active');
      
      // Obtener el rango seleccionado
      rangoActivo = opcion.getAttribute('data-rango');
      
      // Encontrar y activar el valor correspondiente
      const indice = Array.from(opcionesRango).indexOf(opcion);
      valoresTabla[indice].classList.add('active');
      
      // Actualizar precio
      actualizarPrecio();
      
      // Ajustar cantidad mínima según rango
      ajustarCantidadMinima();
    });
  });

  // ===== CANTIDAD - INCREMENTAR / DECREMENTAR =====
  const btnDecrementar = document.getElementById('btn-decrementar');
  const btnIncrementar = document.getElementById('btn-incrementar');
  const inputCantidad = document.getElementById('cantidad-input');

  btnDecrementar.addEventListener('click', () => {
    let cantidad = parseInt(inputCantidad.value);
    if (cantidad > parseInt(inputCantidad.min)) {
      cantidad -= 10;
      inputCantidad.value = cantidad;
      cantidadSeleccionada = cantidad;
      verificarRangoCantidad();
    }
  });

  btnIncrementar.addEventListener('click', () => {
    let cantidad = parseInt(inputCantidad.value);
    cantidad += 10;
    inputCantidad.value = cantidad;
    cantidadSeleccionada = cantidad;
    verificarRangoCantidad();
  });

  // Cuando el usuario escribe manualmente
  inputCantidad.addEventListener('input', () => {
    let cantidad = parseInt(inputCantidad.value);
    if (!isNaN(cantidad) && cantidad >= 20) {
      cantidadSeleccionada = cantidad;
      verificarRangoCantidad();
    }
  });

  // Verificar si la cantidad ingresada cae en otro rango
  function verificarRangoCantidad() {
    let nuevoRango = '';
    
    if (cantidadSeleccionada >= 20 && cantidadSeleccionada <= 99) {
      nuevoRango = '20-99';
    } else if (cantidadSeleccionada >= 100 && cantidadSeleccionada <= 299) {
      nuevoRango = '100-299';
    } else if (cantidadSeleccionada >= 300 && cantidadSeleccionada <= 500) {
      nuevoRango = '300-500';
    } else if (cantidadSeleccionada >= 501) {
      nuevoRango = '501-1000';
    }
    
    // Si el rango cambió, actualizar la selección
    if (nuevoRango && nuevoRango !== rangoActivo) {
      rangoActivo = nuevoRango;
      
      // Actualizar visualmente la tabla
      opcionesRango.forEach(opcion => {
        if (opcion.getAttribute('data-rango') === nuevoRango) {
          opcionesRango.forEach(op => op.classList.remove('active'));
          valoresTabla.forEach(val => val.classList.remove('active'));
          
          opcion.classList.add('active');
          const indice = Array.from(opcionesRango).indexOf(opcion);
          valoresTabla[indice].classList.add('active');
        }
      });
      
      actualizarPrecio();
    }
  }

  // Ajustar cantidad mínima según rango seleccionado
  function ajustarCantidadMinima() {
    const rangos = {
      '20-99': 20,
      '100-299': 100,
      '300-500': 300,
      '501-1000': 501
    };
    
    const minimo = rangos[rangoActivo];
    inputCantidad.min = minimo;
    
    // Si la cantidad actual es menor que el mínimo, ajustarla
    if (cantidadSeleccionada < minimo) {
      cantidadSeleccionada = minimo;
      inputCantidad.value = minimo;
    }
  }

  // ===== SELECTOR SIN LOGO / CON LOGO =====
  const btnSinLogo = document.getElementById('btn-sin-logo');
  const btnConLogo = document.getElementById('btn-con-logo');

  btnSinLogo.addEventListener('click', () => {
    btnSinLogo.classList.add('active');
    btnConLogo.classList.remove('active');
    tipoLogo = 'sin-logo';
    actualizarPrecio();
  });

  btnConLogo.addEventListener('click', () => {
    btnConLogo.classList.add('active');
    btnSinLogo.classList.remove('active');
    tipoLogo = 'con-logo';
    actualizarPrecio();
  });

  // ===== ACTUALIZAR PRECIO =====
  function actualizarPrecio() {
    const precioProducto = document.getElementById('precio-producto');
    const precios = preciosPorRango[rangoActivo];
    
    if (!precios) return;
    
    let precioUnitario = tipoLogo === 'sin-logo' ? precios.sinLogo : precios.conLogo;
    let precioTotal = precioUnitario * cantidadSeleccionada;
    
    // Formatear precio en pesos colombianos
    precioProducto.textContent = formatearPrecioCOP(precioTotal);
    
    // Actualizar también los valores en la tabla
    actualizarValoresTabla();
  }

  // Actualizar valores en la tabla según sin/con logo
  function actualizarValoresTabla() {
    valoresTabla.forEach((valor, index) => {
      const rango = opcionesRango[index].getAttribute('data-rango');
      const precios = preciosPorRango[rango];
      
      if (precios) {
        const precio = tipoLogo === 'sin-logo' ? precios.sinLogo : precios.conLogo;
        valor.textContent = formatearPrecioCOP(precio);
      }
    });
  }

  // Formatear precio en pesos colombianos
  function formatearPrecioCOP(precio) {
    return '$ ' + precio.toLocaleString('es-CO');
  }

  // ===== TABS DE INFORMACIÓN =====
  const tabButtons = document.querySelectorAll('.producto-tabs__btn');
  const tabPanels = document.querySelectorAll('.producto-tabs__panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remover active de todos los botones y paneles
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Agregar active al botón clickeado
      button.classList.add('active');
      
      // Mostrar el panel correspondiente
      const tabId = button.getAttribute('data-tab');
      const panel = document.getElementById('tab-' + tabId);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });

  // ===== BOTÓN AÑADIR AL CARRITO =====
  const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');

  btnAgregarCarrito.addEventListener('click', () => {
    const producto = {
      nombre: 'Sobre Burbuja genérica - Color negro',
      cantidad: cantidadSeleccionada,
      rango: rangoActivo,
      tipoLogo: tipoLogo,
      precioUnitario: tipoLogo === 'sin-logo' 
        ? preciosPorRango[rangoActivo].sinLogo 
        : preciosPorRango[rangoActivo].conLogo,
      precioTotal: calcularPrecioTotal()
    };
    
    console.log('Producto agregado al carrito:', producto);
    
    // Aquí irá la lógica para agregar al carrito real
    // Por ahora, mostrar alerta
    alert(`Producto agregado al carrito:\n\n` +
          `${producto.nombre}\n` +
          `Cantidad: ${producto.cantidad} unidades\n` +
          `Tipo: ${tipoLogo === 'sin-logo' ? 'Sin logo' : 'Con logo'}\n` +
          `Total: ${formatearPrecioCOP(producto.precioTotal)}`);
    
    // Opcional: actualizar contador del carrito en el header
    actualizarContadorCarrito();
  });

  function calcularPrecioTotal() {
    const precioUnitario = tipoLogo === 'sin-logo' 
      ? preciosPorRango[rangoActivo].sinLogo 
      : preciosPorRango[rangoActivo].conLogo;
    return precioUnitario * cantidadSeleccionada;
  }

  function actualizarContadorCarrito() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      let count = parseInt(cartCount.textContent) || 0;
      count++;
      cartCount.textContent = count;
      cartCount.setAttribute('aria-label', `${count} productos en carrito`);
    }
  }

  // ===== PRODUCTOS RELACIONADOS (aleatorios) =====
  const productosRelacionados = [
    {
      id: 1,
      titulo: "Bolsa de papel No. 3 con manija - Marrón",
      descripcion: "25,5 x 33 + 13 Centímetros",
      precio: "00.000",
      imagen: "https://via.placeholder.com/250x250/D4A574/FFFFFF?text=Bolsa+Papel",
      url: "/producto/bolsa-papel-no3-marron"
    },
    {
      id: 2,
      titulo: "Sobre Burbuja genérica - Negra",
      descripcion: "17 x 22 Centímetros",
      precio: "00.000",
      imagen: "https://via.placeholder.com/250x250/333333/FFFFFF?text=Sobre+Burbuja",
      url: "/producto/sobre-burbuja-negra"
    },
    {
      id: 3,
      titulo: "Bolsa Tornasol",
      descripcion: "7,5 x 12 Centímetros",
      precio: "00.000",
      imagen: "https://via.placeholder.com/250x250/C8A2C8/FFFFFF?text=Bolsa+Tornasol",
      url: "/producto/bolsa-tornasol"
    }
  ];

  function cargarProductosRelacionados() {
    const grid = document.getElementById('productos-relacionados-grid');
    if (!grid) return;
    
    // Seleccionar 3 productos aleatorios
    const productosAleatorios = productosRelacionados
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    grid.innerHTML = productosAleatorios.map(producto => `
      <article class="producto-card">
        <div class="producto-card__image">
          <img src="${producto.imagen}" alt="${producto.titulo}" width="250" height="250" loading="lazy" />
        </div>
        <div class="producto-card__info">
          <h3 class="producto-card__title">${producto.titulo}</h3>
          <p class="producto-card__description">${producto.descripcion}</p>
          <p class="producto-card__price">$ ${producto.precio}</p>
        </div>
        <button type="button" class="producto-card__btn" onclick="location.href='${producto.url}'" aria-label="Ver detalles de ${producto.titulo}">
          +
        </button>
      </article>
    `).join('');
  }

  // Cargar productos relacionados al inicio
  cargarProductosRelacionados();
  
  // Inicializar precio
  actualizarPrecio();
  
  console.log('✅ Página de producto cargada correctamente');
});