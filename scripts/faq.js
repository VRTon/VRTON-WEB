/**
 * Sistema de Preguntas Frecuentes (FAQs) V2.0
 * Integrado con el sistema de traducciones modular
 * Carga dinámicamente las FAQ y maneja la funcionalidad de acordeón
 */

// Función principal para inicializar FAQs
async function initializeFAQs() {
    try {
        console.log('🔄 Inicializando sistema de FAQs V2.0...');
        console.log('🔍 Estado inicial - window.i18nV3:', !!window.i18nV3);
        console.log('🔍 Estado inicial - modular system:', !!window.ModularTranslations);

        // Buscar contenedor de FAQs
        const faqContainer = document.querySelector('.faq-container');
        if (!faqContainer) {
            console.log('No se encontró contenedor .faq-container - FAQ no disponible en esta página');
            return;
        }

        console.log('📍 Contenedor FAQ encontrado, cargando preguntas...');

        // Esperar a que el sistema de traducciones esté listo
        await waitForTranslationSystem();

        console.log('🔍 Después de esperar - window.i18nV3:', !!window.i18nV3);
        console.log('🔍 Después de esperar - i18nV3.isInitialized:', window.i18nV3?.isInitialized);
        console.log('🔍 Después de esperar - i18nV3.translations keys:', window.i18nV3?.translations ? Object.keys(window.i18nV3.translations).length : 0);

        // Cargar las FAQs desde traducciones
        const faqData = await loadFAQData();
        
        if (!faqData || !faqData.questions || faqData.questions.length === 0) {
            console.warn('⚠️ No se encontraron preguntas FAQ en las traducciones');
            faqContainer.innerHTML = '<p class="no-faqs">No hay preguntas frecuentes disponibles.</p>';
            return;
        }

        // Generar HTML para las FAQs
        generateFAQHTML(faqContainer, faqData.questions);

        // Configurar funcionalidad de acordeón
        setupAccordionFunctionality();

        console.log(`✅ Sistema de FAQs inicializado con ${faqData.questions.length} preguntas`);

    } catch (error) {
        console.error('❌ Error inicializando FAQs:', error);
        const faqContainer = document.querySelector('.faq-container');
        if (faqContainer) {
            faqContainer.innerHTML = '<p class="error-faqs">Error cargando preguntas frecuentes.</p>';
        }
    }
}

// Esperar a que el sistema de traducciones esté disponible
function waitForTranslationSystem() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 10 segundos
        
        const checkSystem = () => {
            attempts++;
            console.log(`🔍 Intentando acceder al sistema i18n (intento ${attempts}/${maxAttempts})`);
            
            // Verificar si hay sistema i18n V3 disponible
            if (window.i18nV3 && window.i18nV3.isInitialized) {
                console.log('✅ Sistema i18nV3 encontrado y inicializado');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.warn('⚠️ Sistema de traducciones no disponible después de 10 segundos, usando datos por defecto');
                resolve();
            } else {
                console.log(`⏳ Sistema i18n no disponible aún (intento ${attempts}). i18nV3 exists: ${!!window.i18nV3}, initialized: ${window.i18nV3?.isInitialized}`);
                setTimeout(checkSystem, 100);
            }
        };
        
        checkSystem();
    });
}

    // Cargar datos de FAQ desde el sistema de traducciones
    async function loadFAQData() {
        try {
            // Usar sistema i18nV3 (modular)
            if (window.i18nV3 && window.i18nV3.isInitialized) {
                const title = await window.i18nV3.t('faqs.title', 'Preguntas Frecuentes');
                const translations = window.i18nV3.translations;
                
                console.log('🔍 Todas las claves de traducción disponibles:', Object.keys(translations));
                console.log('🔍 Claves que contienen "faqs":', Object.keys(translations).filter(k => k.includes('faqs')));
                
                // Buscar preguntas en traducciones usando diferentes estructuras posibles
                let faqsData = null;
                
                // Opción 1: Acceso directo a faqs.questions (debería funcionar después del flatten)
                if (translations['faqs.questions']) {
                    faqsData = translations['faqs.questions'];
                    console.log('✅ FAQ encontrado en estructura plana (faqs.questions):', faqsData);
                }
                // Opción 2: Intentar acceder mediante el sistema modular directamente
                else {
                    try {
                        if (window.i18nV3.modularSystem) {
                            const moduleTranslations = await window.i18nV3.modularSystem.loadTranslations(['pages/faqs']);
                            console.log('🔍 Traducciones directas del módulo faqs:', moduleTranslations);
                            
                            if (moduleTranslations && moduleTranslations.faqs && moduleTranslations.faqs.questions) {
                                faqsData = moduleTranslations.faqs.questions;
                                console.log('✅ FAQ encontrado en módulo directo:', faqsData);
                            }
                        }
                    } catch (moduleError) {
                        console.warn('⚠️ Error accediendo al módulo directamente:', moduleError);
                    }
                }
                
                if (faqsData && Array.isArray(faqsData) && faqsData.length > 0) {
                    console.log(`📋 Datos FAQ cargados exitosamente: ${faqsData.length} preguntas`);
                    return { title, questions: faqsData };
                } else {
                    console.warn('⚠️ FAQ data no encontrado o no es válido:', faqsData);
                    console.log('🔍 Estructura de translations completa:', translations);
                }
            }
            
            // Si no hay sistema disponible, usar datos por defecto
            console.warn('⚠️ Sistema i18nV3 no disponible, usando datos por defecto');
            return getDefaultFAQData();
            
        } catch (error) {
            console.error('❌ Error cargando FAQ desde traducciones:', error);
            return getDefaultFAQData();
        }
    }

    // Datos por defecto en caso de error
    function getDefaultFAQData() {
        return {
            title: "Preguntas Frecuentes",
            questions: [
                {
                    question: "¿Quién y cómo puede participar en la VRTon?",
                    answer: "Todo aquella persona o comunidad que quiera ayudar a organizar la VRTon es bienvenida."
                }
            ]
        };
    }

    // Generar HTML para las FAQs
    function generateFAQHTML(container, questions) {
        const faqHTML = questions.map((faq, index) => {
            // Sanitizar y procesar el contenido HTML de la respuesta
            const sanitizedAnswer = sanitizeFAQHTML(faq.answer);
            
            return `
            <div class="faq-item" data-faq-index="${index}">
                <div class="faq-question" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-answer-${index}">
                    <h3>${escapeHTML(faq.question)}</h3>
                    <span class="faq-toggle" aria-hidden="true">+</span>
                </div>
                <div class="faq-answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}">
                    <div class="faq-content">
                        ${sanitizedAnswer}
                    </div>
                </div>
            </div>
        `}).join('');

        container.innerHTML = faqHTML;
    }

    // Función para sanitizar HTML en FAQ (reutiliza la lógica del sistema de traducciones)
    function sanitizeFAQHTML(html) {
        if (typeof html !== 'string') return html;
        
        // Lista de tags permitidos en FAQ
        const allowedTags = ['br', 'b', 'strong', 'i', 'em', 'a', 'span'];
        const allowedAttributes = ['href', 'target', 'rel', 'class'];
        
        // Crear un elemento temporal para parsear el HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Función recursiva para limpiar elementos
        const cleanElement = (element) => {
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

    // Función para escapar HTML en texto plano
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Configurar funcionalidad de acordeón
    function setupAccordionFunctionality() {
        const faqItems = document.querySelectorAll('.faq-item');
        console.log(`🔧 Configurando acordeón para ${faqItems.length} FAQs`);

        faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');

            if (!question || !answer) {
                console.warn(`⚠️ FAQ #${index + 1} no tiene estructura correcta`);
                return;
            }

            // Función para alternar FAQ
            function toggleFAQ() {
                const isActive = item.classList.contains('active');
                
                // Cerrar otras FAQs abiertas (comportamiento de acordeón)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const otherToggle = otherItem.querySelector('.faq-toggle');
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        if (otherToggle) otherToggle.textContent = '+';
                        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                });

                // Alternar estado del ítem actual
                if (isActive) {
                    item.classList.remove('active');
                    toggle.textContent = '+';
                    question.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    toggle.textContent = '−';
                    question.setAttribute('aria-expanded', 'true');
                }

                console.log(`📋 FAQ #${index + 1} - ${isActive ? 'cerrado' : 'abierto'}`);
            }

            // Event listeners
            question.addEventListener('click', toggleFAQ);
            
            // Soporte para teclado
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFAQ();
                }
            });
        });
    }

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFAQs);
} else {
    // DOM ya está listo
    initializeFAQs();
}

// También escuchar el evento de i18n ready
if (typeof window.onI18nReady === 'undefined') {
    window.onI18nReady = initializeFAQs;
} else {
    // Si ya existe, encadenar
    const originalCallback = window.onI18nReady;
    window.onI18nReady = function() {
        if (typeof originalCallback === 'function') {
            originalCallback();
        }
        initializeFAQs();
    };
}

// Re-inicializar si cambia el idioma
if (window.i18nV3) {
    window.i18nV3.addObserver((newLanguage) => {
        console.log(`🔄 Idioma cambiado a ${newLanguage}, recargando FAQs...`);
        setTimeout(initializeFAQs, 500); // Pequeño delay para que carguen las traducciones
    });
}
