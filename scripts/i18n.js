// Sistema de internacionalización para VRTon
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('vrton-language') || 'es';
        this.translations = {};
        this.isInitialized = false;
        this.lastTranslatedLanguage = null;
        this.init();
    }

    async init() {
        try {
            const response = await fetch('/data/translations.json');
            this.translations = await response.json();
            this.updateContent();
            this.updateLanguageSelector();
            
            // Notificar que i18n está completamente inicializado
            this.isInitialized = true;
            if (window.onI18nReady) {
                window.onI18nReady();
            }
        } catch (error) {
            console.error('Error loading translations:', error);
            // Still notify even on error to prevent infinite loading
            if (window.onI18nReady) {
                window.onI18nReady();
            }
        }
        
        // Initialize language selector if components are already loaded
        if (window.initializeLanguageSelector) {
            window.initializeLanguageSelector();
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            // Chequear si el idioma es el mismo que el actual
            if (this.currentLanguage === lang && this.lastTranslatedLanguage === lang) {
                console.log('Language is already set to:', lang);
                return;
            }
            
            this.currentLanguage = lang;
            localStorage.setItem('vrton-language', lang);
            this.updateContent();
            this.updateLanguageSelector();
            
            // Actualizar el atributo lang del documento
            document.documentElement.lang = lang === 'es' ? 'es' : 'en';
        } else {
            console.error('Language not found in translations:', lang);
        }
    }

    getText(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback al key si no se encuentra la traducción
            }
        }
        
        return value;
    }

    updateContent() {
        // Chequear si ya se tradujo a este idioma para evitar traducciones innecesarias
        if (this.lastTranslatedLanguage === this.currentLanguage) {
            console.log('Content already translated to:', this.currentLanguage);
            return;
        }

        console.log('Translating content to:', this.currentLanguage);

        // Actualizar todos los elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                const text = this.getText(key);
                if (text !== key) {
                    if (element.hasAttribute('data-i18n-html')) {
                        element.innerHTML = text;
                    } else {
                        element.textContent = text; 
                    }
                }
            }
        });
        
        // Actualizar lista de proyectos
        const projectsList = document.querySelector('[data-i18n-list="causa.projects"]');
        if (projectsList) {
            const projects = this.getText('causa.projects');
            if (Array.isArray(projects)) {
                projectsList.innerHTML = projects.map(project => 
                    `<li><i class="fas fa-check-circle"></i> ${project}</li>`
                ).join('');
            }
        }

        // Generar FAQs dinámicamente solo si hay contenedor de FAQ en la página
        this.generateFAQs();
        
        // Actualizar meta tags para SEO
        this.updateMetaTags();

        // Marcar que se completó la traducción para este idioma
        this.lastTranslatedLanguage = this.currentLanguage;
        console.log('Translation completed for:', this.currentLanguage);
    }
    
    // Método para forzar una nueva traducción (útil cuando se cargan nuevos elementos dinámicamente)
    forceUpdateContent() {
        this.lastTranslatedLanguage = null;
        this.updateContent();
    }

    updateElement(selector, key) {
        const element = document.querySelector(selector);
        if (element) {
            const text = this.getText(key);
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = text;
            } else {
                element.textContent = text;
            }
        }
    }

    generateFAQs() {
        const faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) {
            // No hay contenedor de FAQ en esta página, salir silenciosamente
            return;
        }

        const faqs = this.getText('faqs.questions');
        if (Array.isArray(faqs) && faqs.length > 0) {
            faqContainer.innerHTML = faqs.map((faq, index) => `
                <div class="faq-item" itemscope itemtype="https://schema.org/Question">
                    <div class="faq-question" role="button" tabindex="0" aria-expanded="false" aria-controls="faq${index + 1}">
                        <h3 itemprop="name">${faq.question}</h3>
                        <i class="fas fa-chevron-down" aria-hidden="true"></i>
                    </div>
                    <div class="faq-answer" id="faq${index + 1}" itemscope itemtype="https://schema.org/Answer">
                        <div itemprop="text">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Reinicializar funcionalidad de FAQs
            this.initializeFAQs();
        } else {
            console.warn('No FAQ questions found in translations');
        }
    }

    initializeFAQs() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                
                // Cerrar todas las FAQs
                faqQuestions.forEach(q => {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.style.maxHeight = null;
                    q.querySelector('i').style.transform = 'rotate(0deg)';
                });
                
                // Abrir la FAQ actual si no estaba expandida
                if (!isExpanded) {
                    question.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    updateLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
        
        // Initialize language selector if it exists
        if (window.initializeLanguageSelector) {
            window.initializeLanguageSelector();
        }
    }

    updateMetaTags() {
        if (!this.translations[this.currentLanguage]) return;
        
        const htmlLang = document.querySelector('html');
        if (htmlLang) {
            htmlLang.setAttribute('lang', this.currentLanguage === 'en' ? 'en' : 'es');
        }
        
        // Update elements with data-i18n-content attribute
        const metaElements = document.querySelectorAll('[data-i18n-content]');
        metaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-content');
            const text = this.getText(key);
            if (text) {
                element.setAttribute('content', text);
            }
        });
        
        // Update title elements with data-i18n attribute
        const titleElements = document.querySelectorAll('title[data-i18n]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            if (text) {
                element.textContent = text;
            }
        });
        
        // Update hreflang attributes
        this.updateHreflangTags();
    }
    
    updateHreflangTags() {
        // Remove existing hreflang tags
        document.querySelectorAll('link[hreflang]').forEach(link => link.remove());
        
        // Add new hreflang tags
        const head = document.head;
        const currentPath = window.location.pathname;
        const baseUrl = 'https://vrton.org';
        
        // Spanish version
        const esLink = document.createElement('link');
        esLink.rel = 'alternate';
        esLink.hreflang = 'es';
        esLink.href = baseUrl + currentPath;
        head.appendChild(esLink);
        
        // English version  
        const enLink = document.createElement('link');
        enLink.rel = 'alternate';
        enLink.hreflang = 'en';
        enLink.href = baseUrl + currentPath + (currentPath.includes('?') ? '&' : '?') + 'lang=en';
        head.appendChild(enLink);
        
        // x-default (fallback)
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = baseUrl + currentPath;
        head.appendChild(defaultLink);
    }
}

// Inicializar el sistema de internacionalización
let i18n;

document.addEventListener('DOMContentLoaded', () => {
    i18n = new I18n();
    // Hacer disponible globalmente
    window.i18n = i18n;
    
    // Función global para cambiar idioma (compatibilidad con código existente)
    window.switchLanguage = function(lang) {
        if (i18n && typeof i18n.setLanguage === 'function') {
            i18n.setLanguage(lang);
        } else {
            console.warn('i18n not ready yet, storing language preference');
            localStorage.setItem('vrton-language', lang);
        }
    };
});
