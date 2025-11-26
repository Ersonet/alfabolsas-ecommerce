// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  
  // ===== Toggle menú principal (móvil) =====
  const toggleBtn = document.querySelector('.navbar__toggle');
  const nav = document.getElementById('primary-nav');
  
  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open');
    });
  }

  // ===== Toggle submenú Productos =====
  const submenuButton = document.querySelector('.nav__link--button');
  const submenu = document.getElementById('submenu-productos');
  
  if (submenuButton && submenu) {
    submenuButton.addEventListener('click', () => {
      const isOpen = submenuButton.getAttribute('aria-expanded') === 'true';
      submenuButton.setAttribute('aria-expanded', String(!isOpen));
      submenu.classList.toggle('is-open');
    });

    // Cerrar submenú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!submenuButton.contains(e.target) && !submenu.contains(e.target)) {
        submenuButton.setAttribute('aria-expanded', 'false');
        submenu.classList.remove('is-open');
      }
    });

    // Cerrar submenú con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && submenu.classList.contains('is-open')) {
        submenuButton.setAttribute('aria-expanded', 'false');
        submenu.classList.remove('is-open');
        submenuButton.focus();
      }
    });
  }

  // ===== Cerrar menú móvil al hacer clic en un enlace =====
  const navLinks = document.querySelectorAll('.nav__link');
  
  if (navLinks.length > 0 && nav && toggleBtn) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ===== Prevenir envío del formulario de búsqueda (temporal) =====
  const searchForm = document.querySelector('.search');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      const searchTerm = searchInput.value.trim();
      
      if (searchTerm) {
        // Aquí puedes agregar la lógica de búsqueda
        console.log('Buscando:', searchTerm);
        // Por ejemplo: window.location.href = `/buscar?q=${encodeURIComponent(searchTerm)}`;
      }
    });
  }

  // ===== Actualizar contador del carrito (ejemplo) =====
  // Esta función puede ser llamada cuando se agreguen productos
  function updateCartCount(count) {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = count;
      cartCountElement.setAttribute('aria-label', `${count} productos en carrito`);
    }
  }

  // Ejemplo de uso (puedes remover esto en producción)
  // updateCartCount(3);

});

// Cambiar el texto del botón al hacer clic
const miBoton = document.querySelector('.mi-boton-cotizar');
if (miBoton) {
  miBoton.addEventListener('click', () => {
    console.log('¡Botón clickeado!');
  });
}



// Fin del archivo main.js