// buscador-alfa.js
// Funcionalidad del buscador para filtrar productos en tiempo real desde el array products

import { products } from "./productsData.js"; // Ajusta la ruta si mueves este archivo

// Selección de elementos del DOM
const searchForm = document.querySelector(".search");
const searchInput = document.getElementById("search-input");
const productosGrid = document.querySelector(".productos__grid");

// Función para renderizar productos filtrados
function renderProducts(lista) {
  productosGrid.innerHTML = ""; // Limpiar el contenedor

  lista.forEach(product => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h4 class="producto__titulo">${product.name}</h4>
      <p class="producto__precio">$${product.price.toLocaleString()} COP</p>
      <p class="producto__unidades">${product.units}</p>
      <button class="producto__boton">Agregar al carrito</button>
    `;
    productosGrid.appendChild(div);
  });
}

// Render inicial con todos los productos
renderProducts(products);

// Función para aplicar búsqueda
function aplicarBusqueda() {
  const query = searchInput.value.trim().toLowerCase();

  const resultados = products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.color.toLowerCase().includes(query) ||
    product.type.toLowerCase().includes(query) ||
    product.material.toLowerCase().includes(query)
  );

  if (resultados.length > 0) {
    renderProducts(resultados);
  } else {
    productosGrid.innerHTML = "<p>No se encontraron resultados.</p>";
  }
}

// Eventos: búsqueda por input y por submit
searchInput?.addEventListener("input", aplicarBusqueda);

searchForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  aplicarBusqueda();
});
