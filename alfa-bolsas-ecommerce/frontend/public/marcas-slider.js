// ===== SLIDER INFINITO DE MARCAS CLIENTES =====

document.addEventListener('DOMContentLoaded', () => {
  const sliderTrack = document.querySelector('.marcas-slider__track');
  
  if (!sliderTrack) {
    console.warn('No se encontró el slider de marcas');
    return;
  }

  // Duplicar el contenido para crear el efecto infinito
  const logos = sliderTrack.innerHTML;
  sliderTrack.innerHTML = logos + logos; // Duplica todos los logos

  console.log('✅ Slider de marcas iniciado');
});

// ===== DATOS DE MARCAS (opcional - si quieres generar dinámicamente) =====
/*
const marcasClientes = [
  { nombre: "Marca 1", logo: "/ruta/logo1.png" },
  { nombre: "Marca 2", logo: "/ruta/logo2.png" },
  { nombre: "Marca 3", logo: "/ruta/logo3.png" },
  { nombre: "Marca 4", logo: "/ruta/logo4.png" },
  { nombre: "Marca 5", logo: "/ruta/logo5.png" }
];

function generarMarcasSlider() {
  const track = document.querySelector('.marcas-slider__track');
  
  // Generar logos
  let logosHTML = marcasClientes.map(marca => `
    <div class="marca-logo">
      <img src="${marca.logo}" alt="${marca.nombre}" />
    </div>
  `).join('');
  
  // Duplicar para efecto infinito
  track.innerHTML = logosHTML + logosHTML;
}

// Descomentar si quieres usar generación dinámica:
// document.addEventListener('DOMContentLoaded', generarMarcasSlider);
*/