/**
 * Sistema de Preguntas Frecuentes (FAQs)
 * Este script maneja la funcionalidad para mostrar/ocultar respuestas
 * de las preguntas frecuentes al hacer clic en ellas.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de FAQs...');

    // Obtener todos los elementos de preguntas
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('FAQs encontradas:', faqItems.length);

    if (faqItems.length === 0) {
        console.warn('No se encontraron elementos FAQ en la página');
        return;
    }

    // Añadir evento de clic a cada pregunta
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');

        if (!question) {
            console.warn(`FAQ #${index + 1} no tiene un elemento .faq-question`);
            return;
        }

        question.addEventListener('click', function() {
            // Verificar si está activo actualmente
            const isActive = item.classList.contains('active');

            // Cerrar otras preguntas abiertas (comportamiento de acordeón)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Alternar estado del ítem actual
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }

            console.log(`FAQ #${index + 1} - ${isActive ? 'cerrado' : 'abierto'}`);
        });
    });

    console.log('Sistema de FAQs inicializado correctamente');
});
