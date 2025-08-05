/**
 * Script para manejar el menú móvil
 * Este script controla la funcionalidad del menú hamburguesa en dispositivos móviles
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando menú móvil...');

    // Se seleccionan como variable los elementos de Menu y Nav
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    //En el caso de no detectarse los elementos de menu o nav, se advierte en consola
    if (!menuToggle || !navMenu) {
        console.warn('No se encontraron elementos del menú móvil');
        return;
    }

    // Función para alternar el menú
    function toggleMenu() {
        navMenu.classList.toggle('active');

        // Cambiar el ícono según el estado del menú
        const icon = menuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    // Evento para el botón de menú
    menuToggle.addEventListener('click', toggleMenu);

    // Cerrar el menú al hacer clic en un enlace
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');

            // Actualizar enlaces activos después de un breve retraso
            // para permitir la navegación a la sección
            setTimeout(() => {
                if (typeof markCurrentPage === 'function') {
                    markCurrentPage();
                }
            }, 100);
        });
    });

    // Cerrar el menú cuando se hace clic fuera de él
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Ajustar menú en cambio de tamaño de ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Asegurar que el contenido principal no quede oculto bajo el menú desplegable
    function adjustContentPadding() {
        const header = document.querySelector('header');
        if (header) {
            // Use requestAnimationFrame to batch layout reads
            requestAnimationFrame(() => {
                const headerHeight = header.offsetHeight;
                // Batch the style write in the same frame
                requestAnimationFrame(() => {
                    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
                });
            });
        }
    }

    // Ejecutar al cargar y cuando cambie el tamaño de la ventana
    adjustContentPadding();
    
    // Throttle resize events to prevent excessive layout calculations
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustContentPadding, 150);
    });

    // Ajustar también cuando se despliega/pliega el menú
    menuToggle.addEventListener('click', () => {
        // Esperar a que termine la transición del menú
        setTimeout(adjustContentPadding, 300);
    });

    console.log('Menú móvil inicializado correctamente');
});
