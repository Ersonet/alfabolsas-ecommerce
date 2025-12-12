// ===== AUTH-MANAGER.JS =====
// Sistema global de gestión de sesión
// Incluir en TODAS las páginas del sitio

(function() {
    'use strict';
    
    const AUTH_MANAGER = {
        // Verificar si hay sesión activa
        isAuthenticated() {
            return !!localStorage.getItem('token');
        },
        
        // Obtener datos del usuario
        getUser() {
            const userData = localStorage.getItem('usuario');
            return userData ? JSON.parse(userData) : null;
        },
        
        // Obtener token
        getToken() {
            return localStorage.getItem('token');
        },
        
        // Cerrar sesión
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/frontend/views/index.html';
        },
        
        // Actualizar navbar según sesión
        updateNavbar() {
            const loginButton = document.querySelector('.tool--login');
            
            if (!loginButton) return;
            
            if (this.isAuthenticated()) {
                const user = this.getUser();
                this.renderUserMenu(loginButton, user);
            }
        },
        
        // Renderizar menú de usuario
        renderUserMenu(container, user) {
            const iniciales = this.getInitials(user.nombre);
            
            const menuHTML = `
                <div class="user-menu">
                    <button class="user-menu__trigger" id="userMenuBtn" aria-label="Menú de usuario">
                        <span class="user-avatar">${iniciales}</span>
                        <span class="user-name-mobile">${user.nombre.split(' ')[0]}</span>
                        <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 4px;"></i>
                    </button>
                    
                    <div class="user-menu__dropdown" id="userMenuDropdown">
                        <div class="user-menu__header">
                            <div class="user-avatar user-avatar--large">${iniciales}</div>
                            <div class="user-menu__info">
                                <p class="user-menu__name">${user.nombre}</p>
                                <p class="user-menu__email">${user.email}</p>
                                <span class="user-menu__role">${this.getRoleLabel(user.rol)}</span>
                            </div>
                        </div>
                        
                        <div class="user-menu__divider"></div>
                        
                        <ul class="user-menu__list">
                            ${this.getMenuItemsByRole(user.rol)}
                        </ul>
                        
                        <div class="user-menu__divider"></div>
                        
                        <button class="user-menu__logout" onclick="AUTH_MANAGER.logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
            
            container.outerHTML = menuHTML;
            
            // Configurar toggle del menú
            setTimeout(() => this.setupMenuToggle(), 100);
        },
        
        // Obtener items del menú según rol
        getMenuItemsByRole(rol) {
            const items = {
                owner: `
                    <li><a href="/frontend/views/dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
                    <li><a href="/frontend/views/dashboard.html#productos"><i class="fas fa-box"></i> Productos</a></li>
                    <li><a href="/frontend/views/dashboard.html#pedidos"><i class="fas fa-shopping-cart"></i> Pedidos</a></li>
                    <li><a href="/frontend/views/dashboard.html#carritos-abandonados"><i class="fas fa-shopping-basket"></i> Carritos Abandonados</a></li>
                    <li><a href="/frontend/views/dashboard.html#usuarios"><i class="fas fa-users"></i> Usuarios</a></li>
                `,
                desarrollador: `
                    <li><a href="/frontend/views/dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a></li>
                    <li><a href="/frontend/views/dashboard.html#productos"><i class="fas fa-box"></i> Gestionar Productos</a></li>
                    <li><a href="/frontend/views/dashboard.html#configuracion"><i class="fas fa-cog"></i> Configuración</a></li>
                `,
                asesora: `
                    <li><a href="/frontend/views/dashboard.html"><i class="fas fa-chart-line"></i> Mi Panel</a></li>
                    <li><a href="/frontend/views/dashboard.html#pedidos"><i class="fas fa-shopping-cart"></i> Mis Pedidos</a></li>
                    <li><a href="/frontend/views/dashboard.html#clientes"><i class="fas fa-users"></i> Mis Clientes</a></li>
                `,
                cliente: `
                    <li><a href="/frontend/views/mis-pedidos.html"><i class="fas fa-shopping-bag"></i> Mis Pedidos</a></li>
                    <li><a href="/frontend/views/perfil.html"><i class="fas fa-user"></i> Mi Perfil</a></li>
                `
            };
            
            return items[rol] || items.cliente;
        },
        
        // Obtener etiqueta del rol
        getRoleLabel(rol) {
            const labels = {
                owner: '👑 Dueña',
                desarrollador: '💻 Desarrollador',
                asesora: '📞 Asesora',
                cliente: '👤 Cliente'
            };
            return labels[rol] || 'Usuario';
        },
        
        // Obtener iniciales
        getInitials(nombre) {
            const palabras = nombre.trim().split(' ');
            if (palabras.length >= 2) {
                return palabras[0][0] + palabras[1][0];
            }
            return palabras[0][0] + (palabras[0][1] || '');
        },
        
        // Configurar toggle del menú
        setupMenuToggle() {
            const trigger = document.getElementById('userMenuBtn');
            const dropdown = document.getElementById('userMenuDropdown');
            
            if (!trigger || !dropdown) return;
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        },
        
        // Proteger página (solo para páginas admin)
        protectPage(allowedRoles = []) {
            if (!this.isAuthenticated()) {
                alert('Debes iniciar sesión para acceder a esta página');
                window.location.href = '/frontend/views/login.html';
                return false;
            }
            
            const user = this.getUser();
            
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
                alert('No tienes permisos para acceder a esta página');
                window.location.href = '/frontend/views/index.html';
                return false;
            }
            
            return true;
        },
        
        // Inicializar
        init() {
            this.updateNavbar();
            console.log('✅ Auth Manager inicializado');
        }
    };
    
    // Exponer globalmente
    window.AUTH_MANAGER = AUTH_MANAGER;
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AUTH_MANAGER.init());
    } else {
        AUTH_MANAGER.init();
    }
    
})();