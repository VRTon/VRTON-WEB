// Simple Loading Manager for VRTon - Lightweight and straightforward

// =============================================================================
// DEBUG TOGGLE FUNCTIONALITY
// =============================================================================

function createDebugToggle() {
    // Check if we're in a debug environment
    const isDebugEnvironment =
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname.includes('localhost') ||
        location.protocol === 'file:';

    if (!isDebugEnvironment) return;

    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'loading-debug-panel';
    debugPanel.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; z-index: 10000; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">
            <div style="margin-bottom: 8px; font-weight: bold;">Loading Debug</div>
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                <input type="checkbox" id="disable-loading" ${localStorage.getItem('vrton-disable-loading') === 'true' ? 'checked' : ''}>
                Disable Loading Screen
            </label>
            <div style="margin-top: 5px; font-size: 10px; color: #ccc;">
                Refresh page after toggle
            </div>
        </div>
    `;

    document.body.appendChild(debugPanel);

    // Add event listener
    const checkbox = debugPanel.querySelector('#disable-loading');
    checkbox.addEventListener('change', (e) => {
        localStorage.setItem('vrton-disable-loading', e.target.checked.toString());

        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 50px; right: 10px; z-index: 10001;
            background: #27ae60; color: white; padding: 8px 12px;
            border-radius: 3px; font-size: 12px; font-family: sans-serif;
        `;
        notification.textContent = 'Setting saved! Refresh page to apply.';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
        debugPanel.style.opacity = '0.3';
        debugPanel.style.pointerEvents = 'none';

        // Show on hover
        debugPanel.addEventListener('mouseenter', () => {
            debugPanel.style.opacity = '1';
            debugPanel.style.pointerEvents = 'auto';
        });

        debugPanel.addEventListener('mouseleave', () => {
            debugPanel.style.opacity = '0.3';
            debugPanel.style.pointerEvents = 'none';
        });
    }, 10000);
}

// =============================================================================
// SIMPLE LOADING MANAGER
// =============================================================================

class SimpleLoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.isTeamPage = this.detectTeamPage();

        const path = window.location.pathname || '';

        // Página de itinerario: loading ultra rápido
        if (path.includes('schedule')) {
            this.loadingTimeout = 150; // o 0 si la quieres totalmente instantánea
        } else {
            // resto de páginas
            this.loadingTimeout = this.isTeamPage ? 500 : 800;
        }

        console.log('🚀 Simple Loading Manager initialized');
        this.init();
    }


    detectTeamPage() {
        return (
            window.location.pathname.includes('colaboradores') ||
            document.querySelector('.furality-hero')
        );
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startLoading());
        } else {
            this.startLoading();
        }
    }

    startLoading() {
        // Update loading text based on page
        this.updateLoadingText();

        const path = window.location.pathname || '';

        // Página de "schedule": quitar loading prácticamente al instante
        if (path.includes('schedule')) {
            this.completeLoading();
            return;
        }

        // Para la página de inicio, espera vídeo si existe
        if (!this.isTeamPage && this.hasVideo()) {
            this.waitForVideo();
        } else {
            // Simple timeout-based loading
            this.startTimeout();
        }
    }

    updateLoadingText() {
        const loadingText = document.querySelector('.loading-text');
        const loadingSubtext = document.querySelector('.loading-subtext');

        if (this.isTeamPage) {
            if (loadingText) loadingText.textContent = 'Cargando Equipo';
            if (loadingSubtext)
                loadingSubtext.textContent = 'Preparando información del equipo...';
        } else {
            if (loadingText) loadingText.textContent = 'Cargando VRTon';
            if (loadingSubtext)
                loadingSubtext.textContent = 'Preparando experiencia inmersiva...';
        }
    }

    hasVideo() {
        const video = document.getElementById('background-video');
        return video && video.src;
    }

    waitForVideo() {
        const video = document.getElementById('background-video');
        let videoReady = false;

        const checkVideo = () => {
            if (video && video.readyState >= 3) {
                // HAVE_FUTURE_DATA
                videoReady = true;
                this.completeLoading();
            }
        };

        // Check immediately
        checkVideo();

        // Listen for video events
        if (video && !videoReady) {
            video.addEventListener('canplay', checkVideo);
            video.addEventListener('loadeddata', checkVideo);
        }

        // Fallback timeout
        setTimeout(() => {
            if (!videoReady) {
                console.log('⏰ Video loading timeout, completing anyway');
                this.completeLoading();
            }
        }, this.loadingTimeout);
    }

    startTimeout() {
        setTimeout(() => {
            this.completeLoading();
        }, this.loadingTimeout);
    }

    completeLoading() {
        if (!this.loadingScreen) return;

        console.log('✅ Loading complete');

        // Fade out loading screen
        this.loadingScreen.style.opacity = '0';

        // Remove loading class and add loaded class
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        // Remove loading screen from DOM after animation
        setTimeout(() => {
            if (this.loadingScreen && this.loadingScreen.parentNode) {
                this.loadingScreen.parentNode.removeChild(this.loadingScreen);
            }
        }, 800); // Match CSS transition duration
    }

    // Force completion method for debugging
    forceComplete() {
        console.log('🔧 Force completing loading...');
        this.completeLoading();
    }

    // Compatibility methods for old loading system
    markReady(state) {
        console.log(`📋 markReady called for: ${state} (compatibility mode)`);
        // In simple mode, we don't use states, so just ignore
        return true;
    }

    // Compatibility method for old loading system
    isReady(state) {
        console.log(`📋 isReady called for: ${state} (compatibility mode)`);
        return true; // Always return true in simple mode
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Create debug toggle first
createDebugToggle();

// Check if loading is disabled via debug toggle
const isLoadingDisabled = localStorage.getItem('vrton-disable-loading') === 'true';

if (isLoadingDisabled) {
    // Immediately hide loading screen and mark as loaded
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        console.log('🚀 Loading screen disabled via debug toggle');
    });

    // Don't initialize loading manager
    window.loadingManager = null;
} else {
    // Initialize simple loading manager
    let loadingManager;
    try {
        loadingManager = new SimpleLoadingManager();
        // Make it globally accessible for debugging
        window.loadingManager = loadingManager;
    } catch (error) {
        console.error('Failed to initialize SimpleLoadingManager:', error);

        // Emergency fallback - remove loading screen manually
        document.addEventListener('DOMContentLoaded', () => {
            try {
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');

                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
            } catch (emergencyError) {
                console.error(
                    'Emergency loading completion failed:',
                    emergencyError
                );
            }
        });
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleLoadingManager, loadingManager };
}
