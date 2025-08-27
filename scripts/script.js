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
    debounce: (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Gestión del header con scroll
    initHeaderScroll: () => {
        const header = document.querySelector('header');
        if (!header) return;
        
        const handleScroll = VRTon.debounce(() => {
            const scrolled = window.pageYOffset > VRTon.config.headerScrollThreshold;
            header.classList.toggle('scrolled', scrolled);
        }, VRTon.config.debounceDelay);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    },
    
    // Navegación suave
    initSmoothScrolling: () => {
        const navLinks = document.querySelectorAll('nav a[href^="#"], .btn[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    e.preventDefault();
                    
                    const targetPosition = targetSection.offsetTop - VRTon.config.headerOffset;
                    
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
    initScrollAnimations: () => {
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
        const elementsToAnimate = document.querySelectorAll('.card, .project-card, .colaborador-card, .faq-item, .furality-member, .furality-leader');
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
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
        
        // Marcar fin de inicialización
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.mark('vrton-script-init-end');
            window.PerformanceMonitor.measure('VRTon Script Initialization', 'vrton-script-init-start', 'vrton-script-init-end');
        }
    }
};

// --- Lógica para el Modal "En Construcción" ---
function initializeConstructionModal() {
    const modal = document.getElementById('construction-modal');
    if (!modal) return;

    const closeModalBtn = modal.querySelector('.modal-close');
    const openModalLinks = document.querySelectorAll('a[href="#maintenance"]');

    let modalTimeout;
    const openModal = (e) => {
        e.preventDefault();
        modal.classList.add('visible');

        modalTimeout = setTimeout(() => {
            closeModal();
        }, 10000); // 10 segundos
    };

    const closeModal = () => {
        clearTimeout(modalTimeout);
        modal.classList.remove('visible');
    };

    openModalLinks.forEach(link => link.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// --- Inicialización del selector de idiomas ---
function initializeLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = button.getAttribute('data-lang');
            
            if (window.switchLanguage) {
                window.switchLanguage(lang);
            } else if (window.i18n && window.i18n.setLanguage) {
                window.i18n.setLanguage(lang);
            } else {
                console.warn('Language system not ready yet');
            }
        });
    });
}

// Make the function globally available
window.initializeLanguageSelector = initializeLanguageSelector;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VRTon.init();
        initializeConstructionModal();
        initializeLanguageSelector();
    });
} else {
    VRTon.init();
    initializeConstructionModal();
    initializeLanguageSelector();
}
