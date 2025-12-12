// ===== GESTIÓN DE PRODUCTOS =====
// Módulo completo CRUD de productos

const API_URL = 'http://localhost:3000';
let productos = [];
let productoEditando = null;
let imagenesSeleccionadas = [];
let imagenPrincipalArchivo = null;

// ===== INICIALIZAR MÓDULO =====
function inicializarProductos() {
    cargarProductos();
    configurarEventos();
}

// ===== CARGAR PRODUCTOS =====
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();
        console.log('📦 Productos cargados:', productos.length);
        mostrarProductos(productos);
        
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('tablaProductos').innerHTML = 
            '<p class="info-message">⚠️ Error al cargar productos. Verifica que el servidor esté activo.</p>';
    }
}

// ===== MOSTRAR PRODUCTOS EN TABLA =====
function mostrarProductos(listaProductos) {
    const contenedor = document.getElementById('tablaProductos');
    
    if (listaProductos.length === 0) {
        contenedor.innerHTML = '<p class="info-message">📦 No hay productos registrados. Crea tu primer producto.</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio Base</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${listaProductos.map(p => `
                    <tr>
                        <td><strong>${p.nombre}</strong></td>
                        <td>${p.categoria || 'Sin categoría'}</td>
                        <td>$${formatearPrecio(p.preciosRangos?.[0]?.sinLogo || 0)}</td>
                        <td>
                            <span class="${p.stock < 100 ? 'badge-warning' : 'badge-success'} badge">
                                ${p.stock} unidades
                            </span>
                        </td>
                        <td>
                            <span class="${p.activo ? 'badge-success' : 'badge-danger'} badge">
                                ${p.activo ? '✅ Activo' : '❌ Inactivo'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-action btn-edit" onclick="editarProducto('${p._id}')">✏️ Editar</button>
                            <button class="btn-action btn-toggle" onclick="toggleEstadoProducto('${p._id}', ${p.activo})">
                                ${p.activo ? '🔴 Desactivar' : '🟢 Activar'}
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    contenedor.innerHTML = html;
}

// ===== FILTROS =====
function configurarFiltros() {
    const buscar = document.getElementById('buscarProducto');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroEstado = document.getElementById('filtroEstado');
    
    const aplicarFiltros = () => {
        let filtrados = [...productos];
        
        // Filtro de búsqueda
        const textoBusqueda = buscar.value.toLowerCase();
        if (textoBusqueda) {
            filtrados = filtrados.filter(p => 
                p.nombre.toLowerCase().includes(textoBusqueda) ||
                p.descripcion?.toLowerCase().includes(textoBusqueda)
            );
        }
        
        // Filtro de categoría
        if (filtroCategoria.value) {
            filtrados = filtrados.filter(p => p.categoria === filtroCategoria.value);
        }
        
        // Filtro de estado
        if (filtroEstado.value) {
            const activo = filtroEstado.value === 'true';
            filtrados = filtrados.filter(p => p.activo === activo);
        }
        
        mostrarProductos(filtrados);
    };
    
    buscar.addEventListener('input', aplicarFiltros);
    filtroCategoria.addEventListener('change', aplicarFiltros);
    filtroEstado.addEventListener('change', aplicarFiltros);
}

// ===== ABRIR MODAL NUEVO PRODUCTO =====
function abrirModalNuevo() {
    productoEditando = null;
    imagenesSeleccionadas = [];
    imagenPrincipalArchivo = null;
    
    document.getElementById('modalTitulo').textContent = 'Nuevo Producto';
    document.getElementById('formProducto').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodActivo').checked = true;
    document.getElementById('imagenesPreview').innerHTML = '';
    
    // Mostrar campos según categoría por defecto
    mostrarCamposSegunCategoria('PAPEL');
    
    document.getElementById('modalProducto').classList.add('active');
}

// ===== MOSTRAR CAMPOS SEGÚN CATEGORÍA =====
function mostrarCamposSegunCategoria(categoria) {
    const camposPapel = document.getElementById('camposPapel');
    const camposOtras = document.getElementById('camposOtras');
    
    if (categoria === 'PAPEL') {
        camposPapel.style.display = 'block';
        camposOtras.style.display = 'none';
    } else {
        camposPapel.style.display = 'none';
        camposOtras.style.display = 'block';
    }
}

// ===== EDITAR PRODUCTO =====
async function editarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar producto');
        
        const producto = await response.json();
        productoEditando = producto;
        
        // Llenar formulario
        document.getElementById('modalTitulo').textContent = 'Editar Producto';
        document.getElementById('prodId').value = producto._id;
        document.getElementById('prodNombre').value = producto.nombre;
        document.getElementById('prodCategoria').value = producto.categoria || '';
        document.getElementById('prodDescripcion').value = producto.descripcion || '';
        
        // Mostrar campos según categoría
        mostrarCamposSegunCategoria(producto.categoria);
        
        if (producto.categoria === 'PAPEL') {
            // Llenar campos de bolsas de papel
            document.getElementById('prodTipoProducto').value = producto.especificaciones?.tipoProducto || '';
            document.getElementById('prodMedida').value = producto.especificaciones?.medida || '';
            document.getElementById('prodColor').value = producto.especificaciones?.color || '';
            document.getElementById('prodCodigoSinLogo').value = producto.especificaciones?.codigoSinLogo || '';
            
            // Precios sin logo
            document.getElementById('precioSinLogo20').value = producto.preciosSinLogo?.x20 || '';
            document.getElementById('precioSinLogo100').value = producto.preciosSinLogo?.x100 || '';
            document.getElementById('precioSinLogo1000').value = producto.preciosSinLogo?.x1000 || '';
            
            // Precios con logo
            document.getElementById('precioConLogo100').value = producto.preciosConLogo?.x100 || '';
            document.getElementById('precioConLogo300').value = producto.preciosConLogo?.x300 || '';
            document.getElementById('precioConLogo500').value = producto.preciosConLogo?.x500 || '';
            document.getElementById('precioConLogo1000').value = producto.preciosConLogo?.x1000 || '';
        } else {
            // Campos para otras categorías
            document.getElementById('prodMedidas').value = producto.especificaciones?.medidas || '';
            document.getElementById('prodMaterial').value = producto.especificaciones?.material || '';
            document.getElementById('prodCapacidad').value = producto.especificaciones?.capacidad || '';
            document.getElementById('prodColorOtras').value = producto.especificaciones?.color || '';
            
            const precioBase = producto.preciosRangos?.[0];
            document.getElementById('prodPrecioBase').value = precioBase?.sinLogo || 0;
            document.getElementById('prodPrecioLogo').value = precioBase?.conLogo || 0;
        }
        
        document.getElementById('prodStock').value = producto.stock || 0;
        
        // Imágenes
        document.getElementById('prodImagenPrincipal').value = producto.imagenes?.[0] || '';
        const imagenesAdicionales = producto.imagenes?.slice(1).join(', ') || '';
        document.getElementById('prodImagenesAdicionales').value = imagenesAdicionales;
        
        // Estado
        document.getElementById('prodActivo').checked = producto.activo;
        document.getElementById('prodDestacado').checked = producto.destacado || false;
        
        document.getElementById('modalProducto').classList.add('active');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cargar el producto');
    }
}

// ===== GUARDAR PRODUCTO =====
async function guardarProducto(e) {
    e.preventDefault();
    
    const id = document.getElementById('prodId').value;
    const esEdicion = !!id;
    const categoria = document.getElementById('prodCategoria').value;
    
    // Datos básicos
    const datos = {
        nombre: document.getElementById('prodNombre').value.trim(),
        categoria: categoria,
        descripcion: document.getElementById('prodDescripcion').value.trim(),
        stock: parseInt(document.getElementById('prodStock').value) || 0,
        activo: document.getElementById('prodActivo').checked,
        destacado: document.getElementById('prodDestacado').checked,
        imagenes: []
    };
    
    // Recopilar datos según categoría
    if (categoria === 'PAPEL') {
        datos.especificaciones = {
            tipoProducto: document.getElementById('prodTipoProducto').value.trim(),
            medida: document.getElementById('prodMedida').value.trim(),
            color: document.getElementById('prodColor').value.trim(),
            codigoSinLogo: document.getElementById('prodCodigoSinLogo').value.trim()
        };
        
        datos.preciosSinLogo = {
            x20: parseFloat(document.getElementById('precioSinLogo20').value) || 0,
            x100: parseFloat(document.getElementById('precioSinLogo100').value) || 0,
            x1000: parseFloat(document.getElementById('precioSinLogo1000').value) || 0
        };
        
        datos.preciosConLogo = {
            x100: parseFloat(document.getElementById('precioConLogo100').value) || 0,
            x300: parseFloat(document.getElementById('precioConLogo300').value) || 0,
            x500: parseFloat(document.getElementById('precioConLogo500').value) || 0,
            x1000: parseFloat(document.getElementById('precioConLogo1000').value) || 0
        };
    } else {
        datos.especificaciones = {
            medidas: document.getElementById('prodMedidas').value.trim(),
            material: document.getElementById('prodMaterial').value.trim(),
            capacidad: document.getElementById('prodCapacidad').value.trim(),
            color: document.getElementById('prodColorOtras').value.trim()
        };
        
        datos.preciosRangos = [{
            cantidadMinima: 1,
            cantidadMaxima: 999999,
            sinLogo: parseFloat(document.getElementById('prodPrecioBase').value) || 0,
            conLogo: parseFloat(document.getElementById('prodPrecioLogo').value) || 0
        }];
    }
    
    // Procesar imágenes
    const imgPrincipal = document.getElementById('prodImagenPrincipal').value.trim();
    if (imgPrincipal) datos.imagenes.push(imgPrincipal);
    
    const imgAdicionales = document.getElementById('prodImagenesAdicionales').value.trim();
    if (imgAdicionales) {
        const urls = imgAdicionales.split(',').map(url => url.trim()).filter(url => url);
        datos.imagenes.push(...urls);
    }
    
    // Procesar archivos de imagen si se subieron
    const formData = new FormData();
    const imagenPrincipalInput = document.getElementById('prodImagenArchivo');
    const imagenesAdicionalesInput = document.getElementById('prodImagenesArchivos');
    
    let tieneArchivos = false;
    
    if (imagenPrincipalInput.files.length > 0) {
        formData.append('imagenPrincipal', imagenPrincipalInput.files[0]);
        tieneArchivos = true;
    }
    
    if (imagenesAdicionalesInput.files.length > 0) {
        for (let i = 0; i < imagenesAdicionalesInput.files.length; i++) {
            formData.append('imagenesAdicionales', imagenesAdicionalesInput.files[i]);
        }
        tieneArchivos = true;
    }
    
    // Si hay archivos, primero los subimos
    if (tieneArchivos) {
        try {
            const uploadResponse = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                console.log('✅ Imágenes subidas:', uploadResult);
                
                // Agregar URLs de imágenes subidas
                if (uploadResult.imagenPrincipal) {
                    datos.imagenes.unshift(uploadResult.imagenPrincipal); // Agregar al inicio
                }
                if (uploadResult.imagenesAdicionales) {
                    datos.imagenes.push(...uploadResult.imagenesAdicionales);
                }
            }
        } catch (uploadError) {
            console.warn('⚠️ Error al subir imágenes:', uploadError);
            // Continuar con URLs si las hay
        }
    }
    
    console.log('💾 Guardando producto:', datos);
    
    try {
        const url = esEdicion ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const method = esEdicion ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar producto');
        }
        
        const resultado = await response.json();
        console.log('✅ Producto guardado:', resultado);
        
        alert(`Producto ${esEdicion ? 'actualizado' : 'creado'} exitosamente`);
        cerrarModal();
        cargarProductos();
        cargarEstadisticas(); // Actualizar dashboard
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert(`Error: ${error.message}`);
    }
}

// ===== TOGGLE ESTADO PRODUCTO =====
async function toggleEstadoProducto(id, estadoActual) {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Estás seguro de ${accion} este producto?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ activo: nuevoEstado })
        });
        
        if (!response.ok) throw new Error('Error al cambiar estado');
        
        console.log(`✅ Producto ${accion}do`);
        cargarProductos();
        cargarEstadisticas();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al cambiar el estado del producto');
    }
}

// ===== CERRAR MODAL =====
function cerrarModal() {
    document.getElementById('modalProducto').classList.remove('active');
    document.getElementById('formProducto').reset();
    document.getElementById('imagenesPreview').innerHTML = '';
    imagenesSeleccionadas = [];
    imagenPrincipalArchivo = null;
    productoEditando = null;
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    // Botón nuevo producto
    document.getElementById('btnNuevoProducto').addEventListener('click', abrirModalNuevo);
    
    // Formulario
    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
    
    // Cerrar modal solo con botones específicos
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
    document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
    
    // MODIFICADO: Ya NO se cierra al hacer clic fuera del modal
    // Comentado para evitar que se cierre accidentalmente
    /*
    document.getElementById('modalProducto').addEventListener('click', (e) => {
        if (e.target.id === 'modalProducto') cerrarModal();
    });
    */
    
    // Cambiar campos según categoría seleccionada
    document.getElementById('prodCategoria').addEventListener('change', (e) => {
        mostrarCamposSegunCategoria(e.target.value);
    });
    
    // Preview de imágenes al seleccionar archivos
    document.getElementById('prodImagenArchivo').addEventListener('change', mostrarPreviewImagenPrincipal);
    document.getElementById('prodImagenesArchivos').addEventListener('change', mostrarPreviewImagenesAdicionales);
    
    // Filtros
    configurarFiltros();
}

// ===== PREVIEW DE IMÁGENES =====
function mostrarPreviewImagenPrincipal(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB permitido.');
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const previewContainer = document.getElementById('imagenesPreview');
        previewContainer.innerHTML = `
            <div class="preview-item">
                <img src="${event.target.result}" alt="Vista previa">
                <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Principal</div>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function mostrarPreviewImagenesAdicionales(e) {
    const files = Array.from(e.target.files);
    const previewContainer = document.getElementById('imagenesPreview');
    
    // Mantener la imagen principal si existe
    const principalHtml = previewContainer.querySelector('.preview-item') 
        ? previewContainer.querySelector('.preview-item').outerHTML 
        : '';
    
    let adicionalesHtml = '';
    
    files.forEach((file, index) => {
        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            alert(`La imagen ${file.name} es muy grande. Máximo 5MB permitido.`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            adicionalesHtml += `
                <div class="preview-item">
                    <img src="${event.target.result}" alt="Vista previa ${index + 1}">
                </div>
            `;
            
            if (index === files.length - 1) {
                previewContainer.innerHTML = principalHtml + adicionalesHtml;
            }
        };
        reader.readAsDataURL(file);
    });
}

// ===== UTILIDADES =====
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

// Exponer funciones globales
window.editarProducto = editarProducto;
window.toggleEstadoProducto = toggleEstadoProducto;

console.log('✅ Módulo de productos cargado');