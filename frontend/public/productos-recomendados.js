// Inicio de la lógica de los productos recomendados

// ===== BASE DE DATOS DE PRODUCTOS =====
const todosLosProductos = [
  {
    id: 1,
    titulo: "Bolsa de papel No. 3 con manija - Marrón",
    descripcion: "Ancho x Alto + Fuelle (#3)",
    especificaciones: "25,5 x 33 + 13 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/bolsa-de-papel-numero-3-kraft-marron-alfa-bolsas.webp",
    url: "/producto/bolsa-papel-no3-marron"
  },
  {
    id: 2,
    titulo: "Sobre tipo burbuja - Negra",
    descripcion: "Contiene Adhesivo de seguridad",
    especificaciones: "17 x 22 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/sobre-de-burbuja-negra-17x22cms-alfa-bolsas.webp",
    url: "/frontend/views/sobre-burbuja-rosado.html"
  },
  {
    id: 3,
    titulo: "Sobre de papel #1",
    descripcion: "Ideal para empacar joyería.",
    especificaciones: "20 x 25 + 5 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/sobre-de-papel-numero-1-de-alfa-bolsas.webp",
    url: "/producto/bolsa-tornasol"
  },
  {
    id: 4,
    titulo: "Bolsa de tela especial sin fuelle - Beige",
    descripcion: "Reutilizable y resistente",
    especificaciones: "35 x 45 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/bolsa-de-tela-especial-sin-fuelle-beige-alfa-bolsas.webp",
    url: "/frontend/views/bolsa-tela-especial-beige-35x45.html"
  },
  {
    id: 5,
    titulo: "Bolsa de papel con manija cinta",
    descripcion: "Perfecta para accesorios y regalos pequeños",
    especificaciones: "11 x 23 + 8 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/bolsas-de-papel-con-manija-cinta-11x23.webp",
    url: "/frontend/views/bolsa-manija-cinta-11x23.html"
  },
  {
    id: 6,
    titulo: "Bolsa plástica grafilada BIO - Amarilla",
    descripcion: "Amigable con el medio ambiente",
    especificaciones: "20 x 30 Centímetros",
    precio: "00.000",
    imagen: "/frontend/assets/img/recomendados/bolsa-de-plastico-biodegradable-amarilla-alfa-bolsas.webp",
    url: "/frontend/views/bolsa-plastica-grafilada-bio-amarilla-20x30.html"
  }
];

// ===== FUNCIÓN PARA SELECCIONAR 3 PRODUCTOS ALEATORIOS =====
function seleccionarProductosAleatorios(productos, cantidad = 3) {
  // Crear una copia del array para no modificar el original
  const productosDisponibles = [...productos];
  const productosSeleccionados = [];

  // Seleccionar productos aleatorios sin repetir
  for (let i = 0; i < cantidad && productosDisponibles.length > 0; i++) {
    const indiceAleatorio = Math.floor(Math.random() * productosDisponibles.length);
    productosSeleccionados.push(productosDisponibles[indiceAleatorio]);
    productosDisponibles.splice(indiceAleatorio, 1);
  }

  return productosSeleccionados;
}

// ===== FUNCIÓN PARA CREAR TARJETA DE PRODUCTO =====
function crearTarjetaProducto(producto) {
  return `
    <article class="producto-card">
      <div class="producto-card__image">
        <img src="${producto.imagen}" 
             alt="${producto.titulo}" 
             width="300" 
             height="300"
             loading="lazy" />
      </div>
      
      <div class="producto-card__info">
        <h3 class="producto-card__title">${producto.titulo}</h3>
        <p class="producto-card__description">${producto.descripcion}</p>
        <p class="producto-card__specs">${producto.especificaciones}</p>
        <p class="producto-card__price">$ ${producto.precio}</p>
      </div>
      
      <button type="button" 
              class="producto-card__btn" 
              onclick="location.href='${producto.url}'" 
              aria-label="Ver detalles de ${producto.titulo}">
        +
      </button>
    </article>
  `;
}

// ===== FUNCIÓN PARA RENDERIZAR LOS PRODUCTOS =====
function renderizarProductosRecomendados() {
  const contenedor = document.getElementById('productos-grid');
  
  if (!contenedor) {
    console.error('No se encontró el contenedor de productos');
    return;
  }

  // Seleccionar 3 productos aleatorios
  const productosAleatorios = seleccionarProductosAleatorios(todosLosProductos, 3);

  // Generar el HTML de las tarjetas
  const tarjetasHTML = productosAleatorios.map(producto => 
    crearTarjetaProducto(producto)
  ).join('');

  // Insertar en el DOM
  contenedor.innerHTML = tarjetasHTML;

  console.log('✅ Productos recomendados cargados:', productosAleatorios.map(p => p.titulo));
}

// ===== EJECUTAR AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductosRecomendados();
});

// Fin de la lógica de los productos recomendados