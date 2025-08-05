// Script principal optimizado para VRTon
'use strict';

// Configuración y utilidades principales
const VRTon = {
    config: {
        headerScrollThreshold: 100,
        headerOffset: 80,
        debounceDelay: 100
    },
    
    // Utilidad para debounce
    debounce: (func, delay)=>{
        let timeoutId;

        return function(...args) {

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Gestión del header con scroll
    initHeaderScroll: ()=>{
        const header = document.querySelector('header');
        if (!header) return;
        
        const handleScroll = this.debounce(() => {
            const scrolled = window.pageYOffset > this.config.headerScrollThreshold;
            header.classList.toggle('scrolled', scrolled);
        }, this.config.debounceDelay);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    },
    
    // Navegación suave
    initSmoothScrolling: ()=>{
        const navLinks = document.querySelectorAll('nav a[href^="#"], .btn[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    e.preventDefault();
                    
                    const targetPosition = targetSection.offsetTop - this.config.headerOffset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Actualizar URL sin recargar
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    },
    
    // Animaciones de entrada para elementos
    initScrollAnimations: ()=>{
        if (!('IntersectionObserver' in window)) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observar elementos para animar
        const elementsToAnimate = document.querySelectorAll('.card, .project-card, .colaborador-card, .faq-item');
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    },
    
    // Gestión del formulario de contacto
    initContactForm: function() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Validación básica
            if (!name || !email || !message) {
                this.showNotification('Por favor, completa todos los campos del formulario.', 'warning');
                return;
            }
            
            if (!this.isValidEmail(email)) {
                this.showNotification('Por favor, introduce un email válido.', 'warning');
                return;
            }
            
            // Simular envío
            this.showNotification(`¡Gracias ${name}! Tu mensaje ha sido enviado correctamente.`, 'success');
            contactForm.reset();
        });
    },
    
    // Validación de email
    isValidEmail: (email)=>{
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Sistema de notificaciones
    showNotification: function(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Colores según tipo
        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    },
    
    // Carga de colaboradores (para página de colaboradores)
    loadCollaborators: async function() {
        const container = document.getElementById('colaboradores-container');
        if (!container) return;
        
        // Esta funcionalidad ha sido movida a equipos.js
        // Mantener para compatibilidad si existe contenido estático
        if (container.querySelectorAll('.colaborador-card').length > 0) {
            this.initCategoryFilters();
        }
    },
    
    // Renderizar colaboradores
    renderCollaborators: function(collaborators) {
        const container = document.getElementById('colaboradores-container');
        
        if (collaborators.length === 0) {
            container.innerHTML = '<p class="no-results">No se encontraron colaboradores.</p>';
            return;
        }
        
        container.innerHTML = '';
        
        collaborators.forEach(collaborator => {
            const card = document.createElement('div');
            card.className = `colaborador-card ${collaborator.categoria}`;
            card.setAttribute('data-categoria', collaborator.categoria);
            
            const imageUrl = collaborator.imagen ? 
                `assets/colaboradores/${collaborator.imagen}` : 
                'assets/colaboradores/placeholder.webp';
            
            card.innerHTML = `
                <div class="colaborador-image">
                    <img src="${imageUrl}" 
                         alt="${collaborator.nombre}" 
                         loading="lazy"
                         onerror="this.style.display='none'; this.parentNode.classList.add('placeholder-fallback');">
                </div>
                <div class="colaborador-info">
                    <h3>${collaborator.nombre}</h3>
                    <p class="colaborador-rol">${collaborator.categoria}</p>
                    <p>${collaborator.descripcion || 'Miembro del equipo VRTon'}</p>
                </div>
            `;
            
            container.appendChild(card);
        });
    },
    
    // Filtros de categorías
    initCategoryFilters: function() {
        const categoryButtons = document.querySelectorAll('.categoria-selector');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Actualizar botón activo
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filtrar colaboradores
                const selectedCategory = button.getAttribute('data-categoria');
                this.filterCollaboratorsByCategory(selectedCategory);
            });
        });
    },
    
    // Filtrar colaboradores por categoría
    filterCollaboratorsByCategory: function(category) {
        const cards = document.querySelectorAll('.colaborador-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-categoria');
            
            if (category === 'todos' || cardCategory === category) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Gestionar mensaje de "no resultados"
        const container = document.getElementById('colaboradores-container');
        let noResultsMsg = container.querySelector('.no-results');
        
        if (visibleCount === 0 && category !== 'todos') {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('p');
                noResultsMsg.className = 'no-results';
                noResultsMsg.textContent = 'No se encontraron colaboradores en esta categoría.';
                container.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    },
    
    // Inicialización principal
    init: function() {
        // Marcar inicio de inicialización
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.mark('vrton-script-init-start');
        }
        
        // Inicializar todas las funcionalidades
        this.initHeaderScroll();
        this.initSmoothScrolling();
        this.initScrollAnimations();
        this.initContactForm();
        
        // Marcar fin de inicialización
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.mark('vrton-script-init-end');
            window.PerformanceMonitor.measure('VRTon Script Initialization', 'vrton-script-init-start', 'vrton-script-init-end');
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VRTon.init());
} else {
    VRTon.init();
}
