/**
 * Sistema de Preguntas Frecuentes (FAQs) V2.0
 * Integrado con el sistema de traducciones modular
 * Carga dinámicamente las FAQ y maneja la funcionalidad de acordeón
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Inicializando sistema de FAQs V2.0...');

    // Función principal para inicializar FAQs
    async function initializeFAQs() {
        try {
            // Buscar contenedor de FAQs
            const faqContainer = document.querySelector('.faq-container');
            if (!faqContainer) {
                console.log('No se encontró contenedor .faq-container - FAQ no disponible en esta página');
                return;
            }

            console.log('📍 Contenedor FAQ encontrado, cargando preguntas...');

            // Esperar a que el sistema de traducciones esté listo
            await waitForTranslationSystem();

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
            const checkSystem = () => {
                // Verificar si hay sistema i18n V3 disponible
                if (window.i18nV3 && window.i18nV3.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkSystem, 100);
                }
            };
            
            checkSystem();
            
            // Timeout después de 10 segundos
            setTimeout(() => {
                console.warn('⚠️ Sistema de traducciones no disponible, usando datos por defecto');
                resolve();
            }, 10000);
        });
    }

    // Cargar datos de FAQ desde el sistema de traducciones
    async function loadFAQData() {
        try {
            // Usar sistema i18nV3 (modular)
            if (window.i18nV3 && window.i18nV3.isInitialized) {
                const title = await window.i18nV3.t('faqs.title', 'Preguntas Frecuentes');
                const translations = window.i18nV3.translations;
                
                // Buscar preguntas en traducciones
                const faqsData = translations['faqs.questions'] || 
                               (translations.faqs && translations.faqs.questions);
                
                if (faqsData) {
                    return { title, questions: faqsData };
                }
            }
            
            // Si no hay sistema disponible, usar datos por defecto
            console.warn('⚠️ Sistema i18nV3 no disponible, usando datos por defecto');
            return getDefaultFAQData();
            
        } catch (error) {
            console.warn('⚠️ Error cargando FAQ desde traducciones:', error);
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
        const faqHTML = questions.map((faq, index) => `
            <div class="faq-item" data-faq-index="${index}">
                <div class="faq-question" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-answer-${index}">
                    <h3>${faq.question}</h3>
                    <span class="faq-toggle" aria-hidden="true">+</span>
                </div>
                <div class="faq-answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-question-${index}">
                    <div class="faq-content">
                        ${faq.answer}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = faqHTML;
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

    // Inicializar FAQs
    initializeFAQs();

    // Re-inicializar si cambia el idioma
    if (window.i18nV3) {
        window.i18nV3.addObserver((newLanguage) => {
            console.log(`🔄 Idioma cambiado a ${newLanguage}, recargando FAQs...`);
            setTimeout(initializeFAQs, 500); // Pequeño delay para que carguen las traducciones
        });
    }
});
