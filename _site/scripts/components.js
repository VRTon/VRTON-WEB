// Componente para cargar header y footer en todas las páginas

// Función para cargar un componente HTML
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Función para cargar un componente y insertarlo antes de un elemento
async function loadComponentBefore(url, targetSelector) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.insertAdjacentHTML('beforebegin', html);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Función para cargar un componente y insertarlo después de un elemento
async function loadComponentAfter(url, targetSelector) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            targetElement.insertAdjacentHTML('afterend', html);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Función para cargar y reemplazar un placeholder
async function loadComponentReplace(url, placeholderSelector) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const placeholder = document.querySelector(placeholderSelector);
        if (placeholder) {
            placeholder.outerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    
    // Cargar header si hay un contenedor específico para él
    if (document.getElementById('header-container')) {
        await loadComponent('/includes/header.html', 'header-container');
    } else if (document.getElementById('header-placeholder')) {
        // Reemplazar el placeholder del header
        try {
            const response = await fetch('/includes/header.html');
            if (response.ok) {
                const html = await response.text();
                const placeholder = document.getElementById('header-placeholder');
                if (placeholder) {
                    placeholder.outerHTML = html;
                } else {
                    console.error('Header placeholder not found');
                }
            } else {
                console.error('Failed to fetch header:', response.status);
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Cargar footer - primero intentar con placeholder, luego con fallback
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            const response = await fetch('/includes/footer.html');
            if (response.ok) {
                const footerContent = await response.text();
                footerPlaceholder.outerHTML = footerContent;
            } else {
                console.error('Failed to fetch footer:', response.status);
            }
        } catch (error) {
            console.error('Error loading footer via placeholder:', error);
        }
    } else {
        // Fallback: cargar footer después del último section o main
        const lastSection = document.querySelector('section:last-of-type');
        const lastMain = document.querySelector('main:last-of-type');
        const targetElement = lastMain || lastSection;
        
        if (targetElement) {
            const selector = lastMain ? 'main:last-of-type' : 'section:last-of-type';
            await loadComponentAfter('includes/footer.html', selector);
        }
    }

    // Inicializar componentes después de cargar
    setTimeout(() => {
        initializeHeaderFooterComponents();
        
        // Asegurar que los eventos de idioma están configurados
        initializeLanguageSelector();
    }, 100);

    // Llamar a onComponentsReady si existe (callback para cuando los componentes están listos)
    if (typeof window.onComponentsReady === 'function') {
        window.onComponentsReady();
    }
});

// Función para reinicializar componentes después de cargar header/footer
function initializeHeaderFooterComponents() {
    
    // Reinicializar el menú móvil si existe
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        // Eliminar event listeners existentes si los hay
        menuToggle.replaceWith(menuToggle.cloneNode(true));
        const newMenuToggle = document.getElementById('menu-toggle');
        
        newMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = newMenuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = newMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    if (typeof initializeConstructionModal === 'function') {
        initializeConstructionModal();
    }
    if (window.i18n && typeof window.i18n.updateContent === 'function') {
        window.i18n.updateContent();
    }
    // Actualizar navegación activa
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPage === href) {
            link.classList.add('active');
        }
    });
}

// Función separada para inicializar el selector de idioma
function initializeLanguageSelector() {
    const languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
        const langButtons = languageSelector.querySelectorAll('.lang-btn');
        
        // 1. Leemos el idioma actual guardado en el navegador.
        const currentLanguage = localStorage.getItem('vrton-language') || 'es';

        // 2. Nos aseguramos de que ningún botón esté marcado como activo.
        langButtons.forEach(btn => btn.classList.remove('active'));

        // 3. Buscamos el botón correcto y lo marcamos como activo.
        const activeButton = languageSelector.querySelector(`.lang-btn[data-lang="${currentLanguage}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        langButtons.forEach(button => {
            // Remove any existing event listeners by cloning
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                
                // Try multiple methods to change language
                if (window.i18n && typeof window.i18n.setLanguage === 'function') {
                    window.i18n.setLanguage(lang);
                } else if (typeof window.switchLanguage === 'function') {
                    window.switchLanguage(lang);
                } else {
                    console.warn('Language system not available, storing preference');
                    localStorage.setItem('vrton-language', lang);
                    // Try to reload the page with the new language
                    location.reload();
                }
            });
        });
    }
}

// Exportar funciones para uso global si es necesario
window.loadComponent = loadComponent;
window.loadComponentBefore = loadComponentBefore;
window.loadComponentAfter = loadComponentAfter;
window.loadComponentReplace = loadComponentReplace;
window.initializeHeaderFooterComponents = initializeHeaderFooterComponents;
window.initializeLanguageSelector = initializeLanguageSelector;
