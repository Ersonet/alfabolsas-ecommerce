// Inicio de la lógica de los productos recomendados

// ===== BASE DE DATOS DE PRODUCTOS =====
const todosLosProductos = [
  {
    id: 1,
    titulo: "Bolsa de papel No. 3 con manija - Marrón",
    descripcion: "Ancho x Alto + Fuelle (#3)",
    especificaciones: "25,5 x 33 + 13 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/D4A574/FFFFFF?text=Bolsa+Papel",
    url: "/producto/bolsa-papel-no3-marron"
  },
  {
    id: 2,
    titulo: "Sobre Burbuja genérica - Negra",
    descripcion: "Contiene Adhesivo de seguridad",
    especificaciones: "17 x 22 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/333333/FFFFFF?text=Sobre+Burbuja",
    url: "/producto/sobre-burbuja-negra"
  },
  {
    id: 3,
    titulo: "Bolsa Tornasol",
    descripcion: "Ideal para empacar joyería.",
    especificaciones: "7,5 x 12 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/C8A2C8/FFFFFF?text=Bolsa+Tornasol",
    url: "/producto/bolsa-tornasol"
  },
  {
    id: 4,
    titulo: "Bolsa de tela ecológica - Verde",
    descripcion: "Reutilizable y resistente",
    especificaciones: "30 x 35 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=Bolsa+Tela",
    url: "/producto/bolsa-tela-verde"
  },
  {
    id: 5,
    titulo: "Caja de cartón corrugado",
    descripcion: "Perfecta para envíos",
    especificaciones: "20 x 15 x 10 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/8B6F47/FFFFFF?text=Caja",
    url: "/producto/caja-carton-corrugado"
  },
  {
    id: 6,
    titulo: "Bolsa plástica biodegradable",
    descripcion: "Amigable con el medio ambiente",
    especificaciones: "40 x 50 Centímetros",
    precio: "00.000",
    imagen: "https://via.placeholder.com/300x300/8B4789/FFFFFF?text=Bolsa+Plastica",
    url: "/producto/bolsa-plastica-biodegradable"
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