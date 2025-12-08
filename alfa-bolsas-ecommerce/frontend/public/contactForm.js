
/**
 * contactForm.js
 * Módulo de validación avanzada para el formulario de contacto (ALFA BOLSAS S.A.S.).
 */

// 1. SELECCIÓN DE ELEMENTOS Y REGEX
const form = document.getElementById('contactForm');
// Usamos los IDs del HTML ajustado
const nameInput = document.getElementById('name'); 
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const statusMessage = document.getElementById('form-status-message');

// Expresiones Regulares (REGEX)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// REGEX de 10 dígitos para teléfono colombiano (más preciso que la anterior)
const PHONE_REGEX = /^\d{10}$/; 

// --- 2. FUNCIONES DE UTILIDAD (UX) ---

function displayError(inputElement, message) {
    // Usamos el ID del span de error que definimos en el HTML (ej: error-email)
    const errorElement = document.getElementById(`error-${inputElement.name}`); 
    if (errorElement) {
        errorElement.textContent = message;
        inputElement.classList.add('input-error');
    }
}

function clearError(inputElement) {
    const errorElement = document.getElementById(`error-${inputElement.name}`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    inputElement.classList.remove('input-error');
}

/**
 * Muestra el mensaje de estado general (info, success, error)
 */
function setStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

// --- 3. LÓGICA DE VALIDACIÓN ---

function validateField(input) {
    clearError(input);
    const value = input.value.trim();

    // Validación de obligatoriedad (Required)
    if (input.hasAttribute('required') && value === '') {
        return !displayError(input, `El campo ${input.name} es obligatorio.`);
    }

    // Validación de formato de Correo
    if (input.id === 'email' && !EMAIL_REGEX.test(value)) {
        return !displayError(input, 'Por favor, ingrese un correo electrónico válido.');
    }

    // Validación de formato de Teléfono (10 dígitos)
    if (input.id === 'phone' && !PHONE_REGEX.test(value)) {
        return !displayError(input, 'El número debe contener exactamente 10 dígitos.');
    }
    
    // Validación de longitud del Mensaje (mínimo 10 caracteres)
    if (input.id === 'message' && value.length < 10) {
        return !displayError(input, 'El mensaje debe tener al menos 10 caracteres para ser descriptivo.');
    }

    return true; // Es válido
}


// --- 4. MANEJADOR PRINCIPAL DEL FORMULARIO ---

function handleFormSubmit(e) {
    e.preventDefault(); // Detenemos la recarga de la página

    // Validar todos los campos y verificar que todos sean válidos
    const isValid = [
        validateField(nameInput),
        validateField(emailInput),
        validateField(phoneInput),
        validateField(messageInput)
    ].every(result => result); 

    if (!isValid) {
        // Mensaje general si falla la validación
        setStatusMessage('Por favor, corrige los campos marcados antes de enviar.', 'error');
        return;
    }

    // Si es VÁLIDO: Preparamos los datos y simulamos el envío
    setStatusMessage('Enviando mensaje...', 'info');

    const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim(),
    };
    
    console.log('Datos listos para enviar al servidor/API:', formData);

    // ******************************************************************
    // ** LÓGICA FULL STACK: Aquí iría la llamada fetch() real **
    // ******************************************************************
    
    // Simulamos una respuesta exitosa del servidor después de 1 segundo
    setTimeout(() => {
        setStatusMessage('✅ ¡Mensaje enviado con éxito! Pronto nos contactaremos contigo.', 'success');
        form.reset(); // Limpia el formulario
        
        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => setStatusMessage('', ''), 5000); 

    }, 1000);
}


// --- 5. INICIALIZACIÓN Y EVENT LISTENERS ---

window.onload = () => {
    // El formulario escucha el evento submit
    form.addEventListener('submit', handleFormSubmit);

    // Damos feedback visual en tiempo real cuando el usuario sale de un campo (blur)
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });

    // Limpiar el mensaje de estado general al iniciar la interacción
    [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
        input.addEventListener('focus', () => setStatusMessage('', ''));
    });
};
