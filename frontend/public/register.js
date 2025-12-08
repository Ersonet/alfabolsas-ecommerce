// ===== REGISTER.JS =====
// Manejo del formulario de registro

const form = document.getElementById('registerForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario (sin rol - todos son clientes)
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };
    
    console.log('📤 Enviando datos:', datos);
    
    // Deshabilitar botón durante el envío
    const btnSubmit = form.querySelector('.btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Registrando...';
    
    try {
        const respuesta = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const resultado = await respuesta.json();
        console.log('📥 Respuesta del servidor:', resultado);
        
        if (respuesta.ok) {
            // Registro exitoso
            mostrarMensaje('¡Registro exitoso! Redirigiendo...', 'exito');
            
            // Guardar token en localStorage
            localStorage.setItem('token', resultado.token);
            localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            
            // Limpiar formulario
            form.reset();
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // o la página que tengas
            }, 2000);
            
        } else {
            // Error en el registro
            mostrarMensaje(resultado.error || 'Error al registrar usuario', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarMensaje('Error de conexión. Verifica que el servidor esté activo.', 'error');
    } finally {
        // Rehabilitar botón
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Registrarse';
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