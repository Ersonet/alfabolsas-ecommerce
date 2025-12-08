// ===== LOGIN.JS =====
// Manejo del formulario de inicio de sesión

const form = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const datos = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };
    
    console.log('📤 Intentando login con:', datos.email);
    
    // Deshabilitar botón durante el envío
    const btnSubmit = form.querySelector('.btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Iniciando sesión...';
    
    try {
        const respuesta = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const resultado = await respuesta.json();
        console.log('📥 Respuesta del servidor:', resultado);
        
        if (respuesta.ok) {
            // Login exitoso
            mostrarMensaje('¡Bienvenido! Redirigiendo...', 'exito');
            
            // Guardar token y datos de usuario en localStorage
            localStorage.setItem('token', resultado.token);
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            
            console.log('✅ Sesión iniciada:', resultado.usuario);
            
            // Limpiar formulario
            form.reset();
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // o la página que tengas
            }, 1500);
            
        } else {
            // Error en el login
            mostrarMensaje(resultado.error || 'Credenciales incorrectas', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarMensaje('Error de conexión. Verifica que el servidor esté activo.', 'error');
    } finally {
        // Rehabilitar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Iniciar Sesión';
    }
});

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.style.display = 'block';
    
    // Ocultar después de 5 segundos si es error
    if (tipo === 'error') {
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }
}

// Verificar si ya hay sesión activa
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log('ℹ️ Ya existe una sesión activa');
        // Opcional: redirigir automáticamente al dashboard
        // window.location.href = 'dashboard.html';
    }
});