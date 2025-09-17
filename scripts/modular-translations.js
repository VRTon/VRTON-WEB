/**
 * ========================================
 * 🌐 SISTEMA DE TRADUCCIONES DINÁMICO - VRTON
 * ========================================
 * 
 * Sistema modular de traducciones con carga dinámica y fallback automático al español.
 * Organizado por idiomas y categorías para mejor escalabilidad y mantenimiento.
 * 
 * Estructura:
 * - data/translations/[lang]/common.json       - Elementos comunes (nav, footer, etc.)
 * - data/translations/[lang]/pages/[page].json - Traducciones específicas por página
 * - data/translations/[lang]/legal/[doc].json  - Documentos legales
 * - data/translations/[lang]/components/[comp].json - Componentes reutilizables
 */

class ModularTranslationSystem {
    constructor() {
        this.defaultLanguage = 'es';
        this.currentLanguage = this.detectLanguage();
        this.loadedTranslations = new Map();
        this.cache = new Map();
        this.fallbackCache = new Map();
        
        // Configuración de paths
        this.basePath = '/data/translations';
        
        // Event emitters para notificar cambios
        this.translationLoadedCallbacks = [];
        
        console.log(`🌐 ModularTranslationSystem initialized - Language: ${this.currentLanguage}`);
    }

    /**
     * Detecta el idioma del usuario
     */
    detectLanguage() {
        // 1. Verificar localStorage
        const stored = localStorage.getItem('vrton-language');
        if (stored && this.isLanguageSupported(stored)) {
            return stored;
        }

        // 2. Verificar URL params
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isLanguageSupported(urlLang)) {
            this.setLanguage(urlLang);
            return urlLang;
        }

        // 3. Verificar navigator language
        const browserLang = navigator.language.split('-')[0];
        if (this.isLanguageSupported(browserLang)) {
            return browserLang;
        }

        // 4. Fallback al idioma por defecto
        return this.defaultLanguage;
    }

    /**
     * Verifica si un idioma está soportado
     */
    isLanguageSupported(lang) {
        return ['es', 'en', 'pt'].includes(lang);
    }

    /**
     * Establece el idioma actual
     */
    setLanguage(lang) {
        if (!this.isLanguageSupported(lang)) {
            console.warn(`⚠️ Language '${lang}' not supported, fallback to '${this.defaultLanguage}'`);
            lang = this.defaultLanguage;
        }

        this.currentLanguage = lang;
        localStorage.setItem('vrton-language', lang);
        
        // Limpiar cache al cambiar idioma
        this.cache.clear();
        
        console.log(`🔄 Language changed to: ${lang}`);
        
        // Notificar cambio
        this.notifyLanguageChange(lang);
    }

    /**
     * Carga traducciones dinámicamente por módulos
     * @param {Array<string>} modules - Lista de módulos a cargar (ej: ['common', 'pages/home', 'legal/terms-volunteer'])
     * @returns {Promise<Object>} Objeto con todas las traducciones cargadas
     */
    async loadTranslations(modules = ['common']) {
        console.log(`📥 Loading translations for modules: ${modules.join(', ')}`);
        
        const translations = {};
        
        for (const module of modules) {
            try {
                const moduleTranslations = await this.loadModule(module);
                this.mergeDeep(translations, moduleTranslations);
            } catch (error) {
                console.error(`❌ Failed to load module '${module}':`, error);
            }
        }

        // Guardar en cache
        const cacheKey = `${this.currentLanguage}:${modules.join(',')}`;
        this.cache.set(cacheKey, translations);

        console.log(`✅ Translations loaded successfully for ${modules.length} modules`);
        return translations;
    }

    /**
     * Carga un módulo específico con fallback automático
     * @param {string} module - Nombre del módulo (ej: 'common', 'pages/home')
     * @returns {Promise<Object>} Traducciones del módulo
     */
    async loadModule(module) {
        const cacheKey = `${this.currentLanguage}:${module}`;
        
        // Verificar cache
        if (this.cache.has(cacheKey)) {
            console.log(`💾 Loading '${module}' from cache`);
            return this.cache.get(cacheKey);
        }

        try {
            // Intentar cargar en el idioma actual
            const url = `${this.basePath}/${this.currentLanguage}/${module}.json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const translations = await response.json();
            this.cache.set(cacheKey, translations);
            
            console.log(`✅ Loaded module '${module}' in '${this.currentLanguage}'`);
            return translations;
            
        } catch (error) {
            console.warn(`⚠️ Failed to load '${module}' in '${this.currentLanguage}':`, error.message);
            
            // Fallback al idioma por defecto
            if (this.currentLanguage !== this.defaultLanguage) {
                return await this.loadModuleFallback(module);
            } else {
                console.error(`❌ Failed to load '${module}' even in default language`);
                return {};
            }
        }
    }

    /**
     * Carga módulo en idioma de fallback (español)
     * @param {string} module - Nombre del módulo
     * @returns {Promise<Object>} Traducciones del módulo en español
     */
    async loadModuleFallback(module) {
        const fallbackKey = `${this.defaultLanguage}:${module}`;
        
        // Verificar cache de fallback
        if (this.fallbackCache.has(fallbackKey)) {
            console.log(`💾 Loading fallback '${module}' from cache`);
            return this.fallbackCache.get(fallbackKey);
        }

        try {
            const url = `${this.basePath}/${this.defaultLanguage}/${module}.json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const translations = await response.json();
            this.fallbackCache.set(fallbackKey, translations);
            
            console.log(`🔄 Loaded fallback '${module}' in '${this.defaultLanguage}'`);
            return translations;
            
        } catch (error) {
            console.error(`❌ Failed to load fallback '${module}':`, error.message);
            return {};
        }
    }

    /**
     * Obtiene una traducción específica por clave
     * @param {string} key - Clave de traducción (ej: 'nav.inicio', 'hero.title')
     * @param {Array<string>} modules - Módulos donde buscar
     * @returns {Promise<string>} Traducción encontrada
     */
    async getTranslation(key, modules = ['common']) {
        const translations = await this.loadTranslations(modules);
        return this.getNestedValue(translations, key) || key;
    }

    /**
     * Carga traducciones para una página específica
     * @param {string} pageName - Nombre de la página
     * @returns {Promise<Object>} Traducciones de la página
     */
    async loadPageTranslations(pageName) {
        const modules = ['common'];
        
        // Agregar módulo de página si existe
        if (pageName && pageName !== 'home') {
            modules.push(`pages/${pageName}`);
        } else if (pageName === 'home') {
            modules.push('pages/home');
        }
        
        // Agregar módulos de componentes comunes
        modules.push('components/loading');
        
        return await this.loadTranslations(modules);
    }

    /**
     * Carga traducciones para documentos legales
     * @param {string} documentName - Nombre del documento legal
     * @returns {Promise<Object>} Traducciones del documento
     */
    async loadLegalTranslations(documentName) {
        const modules = ['common', `legal/${documentName}`];
        return await this.loadTranslations(modules);
    }

    /**
     * Obtiene valor anidado de un objeto usando notación de puntos
     * @param {Object} obj - Objeto donde buscar
     * @param {string} path - Ruta usando puntos (ej: 'nav.inicio')
     * @returns {*} Valor encontrado o undefined
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    /**
     * Fusiona objetos profundamente
     * @param {Object} target - Objeto destino
     * @param {Object} source - Objeto fuente
     */
    mergeDeep(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * Registra callback para cambios de idioma
     * @param {Function} callback - Función a ejecutar cuando cambie el idioma
     */
    onLanguageChange(callback) {
        this.translationLoadedCallbacks.push(callback);
    }

    /**
     * Notifica cambio de idioma a todos los callbacks registrados
     * @param {string} newLanguage - Nuevo idioma
     */
    notifyLanguageChange(newLanguage) {
        this.translationLoadedCallbacks.forEach(callback => {
            try {
                callback(newLanguage);
            } catch (error) {
                console.error('❌ Error in language change callback:', error);
            }
        });
    }

    /**
     * Limpia todo el cache
     */
    clearCache() {
        this.cache.clear();
        this.fallbackCache.clear();
        console.log('🧹 Translation cache cleared');
    }

    /**
     * Obtiene estadísticas del sistema
     * @returns {Object} Estadísticas del cache y traducciones
     */
    getStats() {
        return {
            currentLanguage: this.currentLanguage,
            defaultLanguage: this.defaultLanguage,
            cacheSize: this.cache.size,
            fallbackCacheSize: this.fallbackCache.size,
            loadedModules: Array.from(this.cache.keys())
        };
    }

    /**
     * Detecta qué módulos necesita la página actual
     */
    detectRequiredModules() {
        const modules = ['common']; // Siempre incluir common
        
        // 1. Verificar si hay módulos especificados en window
        if (window.requiredTranslationModules && Array.isArray(window.requiredTranslationModules)) {
            return window.requiredTranslationModules;
        }
        
        // 2. Verificar atributo data-translation-modules en body
        const bodyModules = document.body.getAttribute('data-translation-modules');
        if (bodyModules) {
            return bodyModules.split(',').map(m => m.trim());
        }
        
        // 3. Verificar elementos con data-translation-modules
        const elementsWithModules = document.querySelector('[data-translation-modules]');
        if (elementsWithModules) {
            const elementModules = elementsWithModules.getAttribute('data-translation-modules');
            return elementModules.split(',').map(m => m.trim());
        }
        
        // 4. Detectar página actual por URL
        const path = window.location.pathname;
        const page = this.getPageFromPath(path);
        
        if (page) {
            modules.push(`pages/${page}`);
        }
        
        // 5. Detectar componentes en la página
        if (document.querySelector('[data-component="teams"]') || 
            document.querySelector('.colaboradores-container') ||
            document.querySelector('.team-grid')) {
            modules.push('components/teams');
        }
        
        if (document.querySelector('[data-component="loading"]') || 
            document.querySelector('.loading-screen')) {
            modules.push('components/loading');
        }
        
        // 6. Detectar elementos específicos que requieren módulos
        // FAQs
        if (document.querySelector('[data-i18n*="faqs."]') ||
            document.querySelector('.faqs') ||
            document.querySelector('#faqs')) {
            modules.push('pages/faqs');
        }
        
        // Mantenimiento
        if (document.querySelector('[data-i18n*="maintenance."]')) {
            modules.push('pages/maintenance');
        }
        
        // Legal elements
        if (document.querySelector('[data-i18n*="legal."]') ||
            document.querySelector('.legal-document-container')) {
            modules.push('components/legal');
        }
        
        // 7. Detectar documentos legales por contenido
        if (document.querySelector('[data-document-type="legal"]') ||
            document.querySelector('.legal-document-container') ||
            path.includes('terminos') || path.includes('reglas')) {
            if (path.includes('terminos-voluntariado')) {
                modules.push('legal/terms-volunteer');
            } else if (path.includes('reglas-evento')) {
                modules.push('legal/event-rules');
            }
        }
        
        // 8. Detectar por elementos data-i18n específicos
        const i18nElements = document.querySelectorAll('[data-i18n]');
        const detectedKeys = new Set();
        
        i18nElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const parts = key.split('.');
                if (parts.length > 1) {
                    detectedKeys.add(parts[0]);
                }
            }
        });
        
        // Mapear claves detectadas a módulos
        detectedKeys.forEach(key => {
            switch(key) {
                case 'faqs':
                    if (!modules.includes('pages/faqs')) modules.push('pages/faqs');
                    break;
                case 'maintenance':
                    if (!modules.includes('pages/maintenance')) modules.push('pages/maintenance');
                    break;
                case 'legal':
                    if (!modules.includes('components/legal')) modules.push('components/legal');
                    break;
                case 'termsVolunteer':
                    if (!modules.includes('legal/terms-volunteer')) modules.push('legal/terms-volunteer');
                    break;
                case 'eventRules':
                    if (!modules.includes('legal/event-rules')) modules.push('legal/event-rules');
                    break;
                case 'teams':
                    if (!modules.includes('components/teams')) modules.push('components/teams');
                    break;
                case 'loading':
                    if (!modules.includes('components/loading')) modules.push('components/loading');
                    break;
            }
        });
        
        console.log(`🔍 Auto-detected modules: ${modules.join(', ')}`);
        return [...new Set(modules)]; // Eliminar duplicados
    }

    /**
     * Obtiene el nombre de la página desde la ruta
     */
    getPageFromPath(path) {
        if (path === '/' || path === '/index.html') return 'home';
        
        const cleanPath = path.replace(/\/$/, '').replace('.html', '');
        const pathSegments = cleanPath.split('/').filter(s => s);
        
        if (pathSegments.length === 0) return 'home';
        
        const fileName = pathSegments[pathSegments.length - 1];
        
        const pageMap = {
            'colaboradores': 'colaboradores',
            'links': 'links',
            'reglas-evento': 'event-rules',
            'terminos-voluntariado': 'terms-volunteer'
        };
        
        return pageMap[fileName] || fileName;
    }

    /**
     * Auto-carga traducciones para la página actual
     */
    async autoLoadTranslations() {
        const modules = this.detectRequiredModules();
        return await this.loadTranslations(modules);
    }
}

// Instancia global del sistema de traducciones
window.ModularTranslations = new ModularTranslationSystem();

// Función de conveniencia para uso rápido
window.t = async (key, modules = ['common']) => {
    return await window.ModularTranslations.getTranslation(key, modules);
};

// Función para cargar traducciones de página
window.loadPageTranslations = async (pageName) => {
    return await window.ModularTranslations.loadPageTranslations(pageName);
};

// Función para cargar traducciones legales
window.loadLegalTranslations = async (documentName) => {
    return await window.ModularTranslations.loadLegalTranslations(documentName);
};

console.log('🚀 Modular Translation System loaded successfully');