/**
 * ========================================
 * 🌐 SISTEMA DE INTERNACIONALIZACIÓN VRTON v3.0
 * ========================================
 * 
 * Sistema completamente integrado con el sistema modular de traducciones
 * Fallback automático al español garantizado
 * Auto-detección de módulos requeridos
 */

class I18nSystemV3 {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.defaultLanguage = 'es';
        this.translations = {};
        this.isInitialized = false;
        this.observers = [];
        this.modularSystem = null;
        
        console.log('🚀 Initializing I18n System V3');
        this.init();
    }

    /**
     * Auto-detecta el idioma
     */
    detectLanguage() {
        // 1. Parámetro URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isValidLanguage(urlLang)) {
            return urlLang;
        }

        // 2. LocalStorage
        const storedLang = localStorage.getItem('vrton-language');
        if (storedLang && this.isValidLanguage(storedLang)) {
            return storedLang;
        }

        // 3. Navegador
        const browserLang = navigator.language.split('-')[0];
        if (this.isValidLanguage(browserLang)) {
            return browserLang;
        }

        // 4. Fallback a español
        return this.defaultLanguage;
    }

    /**
     * Valida si el idioma está soportado
     */
    isValidLanguage(lang) {
        return ['es', 'en', 'pt'].includes(lang);
    }

    /**
     * Inicializa el sistema
     */
    async init() {
        try {
            // Conectar con el sistema modular
            await this.connectToModularSystem();
            
            // Configurar idioma en sistema modular
            if (this.modularSystem) {
                this.modularSystem.setLanguage(this.currentLanguage);
            }
            
            // Cargar traducciones
            await this.loadTranslations();
            
            // Aplicar traducciones a la página
            await this.updatePageTranslations();
            
            // Actualizar selector de idioma
            this.updateLanguageSelector();
            
            this.isInitialized = true;
            console.log(`🌐 I18n V3 initialized in ${this.currentLanguage}`);
            
            // Notificar inicialización
            if (window.onI18nReady) {
                window.onI18nReady();
            }
            
        } catch (error) {
            console.error('❌ I18n V3 initialization failed:', error);
            throw error;
        }
    }

    /**
     * Conecta con el sistema modular
     */
    async connectToModularSystem() {
        return new Promise((resolve) => {
            if (window.ModularTranslations) {
                this.modularSystem = window.ModularTranslations;
                console.log('🔗 Connected to Modular Translation System');
                resolve();
            } else {
                // Esperar a que se cargue
                const checkInterval = setInterval(() => {
                    if (window.ModularTranslations) {
                        this.modularSystem = window.ModularTranslations;
                        console.log('🔗 Connected to Modular Translation System (delayed)');
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // Timeout después de 5 segundos
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Modular system not found after 5 seconds');
                    resolve();
                }, 5000);
            }
        });
    }

    /**
     * Carga traducciones usando sistema modular
     */
    async loadTranslations() {
        if (this.modularSystem) {
            try {
                // Usar auto-detección de módulos
                const translations = await this.modularSystem.autoLoadTranslations();
                this.translations = this.flattenTranslations(translations);
                console.log(`📥 Loaded modular translations: ${Object.keys(this.translations).length} keys`);
            } catch (error) {
                console.error('❌ Modular loading failed:', error);
                this.translations = {};
            }
        } else {
            console.error('❌ Modular system not available');
            this.translations = {};
        }
    }

    /**
     * Aplana traducciones anidadas
     */
    flattenTranslations(nested, prefix = '') {
        const flattened = {};
        
        for (const key in nested) {
            const value = nested[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            // Preservar arrays y no intentar aplanarlos
            if (Array.isArray(value)) {
                flattened[newKey] = value;
            } else if (typeof value === 'object' && value !== null) {
                Object.assign(flattened, this.flattenTranslations(value, newKey));
            } else {
                flattened[newKey] = value;
            }
        }
        
        return flattened;
    }

    /**
     * Obtiene una traducción por clave
     */
    async t(key, fallback = key) {
        // Cargar traducciones si no están cargadas
        if (Object.keys(this.translations).length === 0) {
            await this.loadTranslations();
        }

        let translation = this.translations[key];
        
        // Si no se encuentra y no estamos en español, intentar fallback al español
        if (!translation && this.currentLanguage !== this.defaultLanguage) {
            try {
                if (this.modularSystem) {
                    // Usar sistema modular para fallback al español
                    const originalLang = this.modularSystem.currentLanguage;
                    this.modularSystem.setLanguage(this.defaultLanguage);
                    const fallbackTranslations = await this.modularSystem.autoLoadTranslations();
                    const flatFallback = this.flattenTranslations(fallbackTranslations);
                    translation = flatFallback[key];
                    this.modularSystem.setLanguage(originalLang);
                    
                    if (translation) {
                        console.log(`🔄 Using Spanish fallback for: ${key}`);
                    }
                } else {
                    console.warn(`⚠️ Modular system not available for fallback: ${key}`);
                }
            } catch (error) {
                console.warn(`⚠️ Spanish fallback failed for key: ${key}`, error);
            }
        }

        return translation || fallback;
    }

    /**
     * Cambia el idioma
     */
    async changeLanguage(lang) {
        if (!this.isValidLanguage(lang)) {
            console.warn(`⚠️ Invalid language: ${lang}, using ${this.defaultLanguage}`);
            lang = this.defaultLanguage;
        }

        if (lang === this.currentLanguage) {
            return; // No cambio necesario
        }

        this.currentLanguage = lang;
        localStorage.setItem('vrton-language', lang);
        
        // Actualizar sistema modular
        if (this.modularSystem) {
            this.modularSystem.setLanguage(lang);
        }
        
        // Limpiar traducciones para forzar recarga
        this.translations = {};
        
        // Cargar nuevas traducciones
        await this.loadTranslations();
        
        // Actualizar página
        await this.updatePageTranslations();
        this.updateLanguageSelector();
        
        // Notificar observadores
        this.notifyObservers(lang);
        
        console.log(`🔄 Language changed to: ${lang}`);
    }

    /**
     * Aplica traducciones a elementos con data-i18n
     */
    async updatePageTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        for (const element of elements) {
            const key = element.getAttribute('data-i18n');
            const translation = await this.t(key);
            
            // Aplicar traducción según el tipo de elemento
            if (element.tagName === 'INPUT') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else if (element.hasAttribute('alt')) {
                element.alt = translation;
            } else {
                // Detectar si la traducción contiene HTML y usar innerHTML o textContent apropiadamente
                if (this.containsHTML(translation)) {
                    element.innerHTML = this.sanitizeHTML(translation);
                } else {
                    element.textContent = translation;
                }
            }
        }
        
        console.log(`✨ Updated ${elements.length} translation elements`);
    }

    /**
     * Detecta si el texto contiene HTML válido
     */
    containsHTML(text) {
        if (typeof text !== 'string') return false;
        
        // Buscar tags HTML comunes usados en traducciones
        const htmlPattern = /<(br|b|strong|i|em|a|span|div|p)(\s[^>]*)?>/i;
        return htmlPattern.test(text);
    }

    /**
     * Sanitiza HTML permitiendo solo tags seguros
     */
    sanitizeHTML(html) {
        if (typeof html !== 'string') return html;
        
        // Lista de tags permitidos en traducciones
        const allowedTags = ['br', 'b', 'strong', 'i', 'em', 'a', 'span'];
        const allowedAttributes = ['href', 'target', 'rel', 'class'];
        
        // Crear un elemento temporal para parsear el HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Función recursiva para limpiar elementos
        const cleanElement = (element) => {
            // Obtener todos los elementos hijos
            const children = Array.from(element.children);
            
            children.forEach(child => {
                const tagName = child.tagName.toLowerCase();
                
                // Si el tag no está permitido, reemplazar con su contenido de texto
                if (!allowedTags.includes(tagName)) {
                    const textNode = document.createTextNode(child.textContent);
                    child.parentNode.replaceChild(textNode, child);
                    return;
                }
                
                // Limpiar atributos no permitidos
                const attributes = Array.from(child.attributes);
                attributes.forEach(attr => {
                    if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                        child.removeAttribute(attr.name);
                    }
                });
                
                // Agregar rel="noopener noreferrer" a enlaces externos
                if (tagName === 'a' && child.hasAttribute('href')) {
                    const href = child.getAttribute('href');
                    if (href.startsWith('http')) {
                        child.setAttribute('target', '_blank');
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                
                // Recursivamente limpiar elementos hijos
                cleanElement(child);
            });
        };
        
        cleanElement(temp);
        return temp.innerHTML;
    }

    /**
     * Actualiza el selector de idioma
     */
    updateLanguageSelector() {
        const languageSelectors = document.querySelectorAll('.language-selector, [data-lang-selector]');
        
        languageSelectors.forEach(selector => {
            const buttons = selector.querySelectorAll('[data-lang]');
            buttons.forEach(button => {
                const lang = button.getAttribute('data-lang');
                button.classList.toggle('active', lang === this.currentLanguage);
            });
        });
    }

    /**
     * Registra observer para cambios de idioma
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Notifica cambios a observers
     */
    notifyObservers(language) {
        this.observers.forEach(callback => {
            try {
                callback(language);
            } catch (error) {
                console.error('❌ Error in i18n observer:', error);
            }
        });
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getStats() {
        return {
            currentLanguage: this.currentLanguage,
            defaultLanguage: this.defaultLanguage,
            isInitialized: this.isInitialized,
            translationCount: Object.keys(this.translations).length,
            usingModularSystem: !!this.modularSystem,
            modularStats: this.modularSystem ? this.modularSystem.getStats() : null
        };
    }
}

// Crear instancia global
window.i18nV3 = new I18nSystemV3();

// Funciones globales para compatibilidad
window.t = async (key, fallback) => {
    return await window.i18nV3.t(key, fallback);
};

window.changeLanguage = async (lang) => {
    return await window.i18nV3.changeLanguage(lang);
};

// Función para verificar si está inicializado
window.isI18nReady = () => {
    return window.i18nV3.isInitialized;
};

// Event listeners para selectores de idioma
document.addEventListener('DOMContentLoaded', () => {
    // Manejar clicks en selectores de idioma
    document.addEventListener('click', async (e) => {
        const langButton = e.target.closest('[data-lang]');
        if (langButton) {
            e.preventDefault();
            const lang = langButton.getAttribute('data-lang');
            await window.i18nV3.changeLanguage(lang);
        }
    });
});

console.log('🚀 I18n System V3 loaded successfully');