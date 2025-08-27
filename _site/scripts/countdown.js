// Countdown Timer para VRTon 2025
class CountdownTimer {
    constructor() {
        // Fecha del evento: 28 de noviembre 2025, 10 PM Chile (UTC-3)
        this.targetDate = new Date('2025-11-28T22:00:00-03:00');
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        this.init();
    }

    init() {
        // Verificar que todos los elementos existen
        if (!this.elements.days || !this.elements.hours || !this.elements.minutes || !this.elements.seconds) {
            console.warn('Elementos del contador no encontrados');
            return;
        }

        // Actualizar inmediatamente
        this.updateCountdown();
        
        // Actualizar cada segundo
        this.interval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.targetDate.getTime() - now;

        // Si el evento ya pasó
        if (distance < 0) {
            this.showEventCompleted();
            return;
        }

        // Calcular tiempo restante
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Actualizar elementos con animación
        this.animateNumber(this.elements.days, days);
        this.animateNumber(this.elements.hours, hours);
        this.animateNumber(this.elements.minutes, minutes);
        this.animateNumber(this.elements.seconds, seconds);
    }

    animateNumber(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.color = 'var(--accent-color)';
            
            setTimeout(() => {
                element.textContent = newValue.toString().padStart(2, '0');
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 150);
        }
    }

    showEventCompleted() {
        clearInterval(this.interval);
        
        const container = document.querySelector('.countdown-timer');
        if (container) {
            container.innerHTML = `
                <div class="event-completed">
                    <i class="fas fa-party-horn"></i>
                    <span>¡El evento ha comenzado!</span>
                </div>
            `;
        }
    }

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Inicializar el contador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para asegurar que los elementos estén disponibles
    setTimeout(() => {
        if (document.getElementById('countdown-timer')) {
            window.countdownTimer = new CountdownTimer();
            
            // Notificar que el countdown está listo
            if (window.onCountdownReady) {
                window.onCountdownReady();
            }
        } else {
            // Si no hay contador en esta página, marcar como listo igualmente
            if (window.onCountdownReady) {
                window.onCountdownReady();
            }
        }
    }, 100);
});

// Limpiar el interval si la página se descarga
window.addEventListener('beforeunload', () => {
    if (window.countdownTimer) {
        window.countdownTimer.destroy();
    }
});
