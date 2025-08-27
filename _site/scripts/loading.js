// Loading Manager for VRTon - Coordinates all dynamic resource loading

// =============================================================================
// CONFIGURATION CONSTANTS - Easy to modify loading behavior
// =============================================================================

// Timeout configurations (in milliseconds)
const LOADING_TIMEOUTS = {
    DEFAULT_TIMEOUT: 8000,          // Default loading timeout for index page
    TEAM_PAGE_TIMEOUT: 5000,        // Faster timeout for team page
    TEAMS_SPECIFIC_TIMEOUT: 1500,   // Specific timeout for teams loading
    FINALIZING_DELAY: 300,          // Delay before completing loading
    SCREEN_REMOVAL_DELAY: 800,      // Delay before removing loading screen from DOM
    COMPONENT_READY_DELAY: 100      // Delay for marking non-page-specific components as ready
};

// Animation timing configurations
const ANIMATION_TIMING = {
    STAGE_UPDATE_DELAY: 800,        // Default delay between loading stage updates
    STAGE_UPDATE_DELAY_TEAM: 400,   // Faster delay for team page
    INITIAL_DELAY: 500,             // Initial delay before starting animation
    INITIAL_DELAY_TEAM: 200         // Faster initial delay for team page
};

// Video loading configurations
const VIDEO_CONFIG = {
    MIN_READY_STATE: 3,             // HAVE_FUTURE_DATA - minimum video ready state
    VIDEO_ELEMENT_ID: 'background-video'
};

// Page detection selectors
const PAGE_SELECTORS = {
    TEAM_PAGE_PATHS: ['colaboradores'],
    TEAM_PAGE_SELECTOR: '.furality-hero',
    INDEX_PAGE_PATHS: ['/', 'index.html'],
    INDEX_PAGE_SELECTOR: '.hero-video'
};

// DOM selectors
const DOM_SELECTORS = {
    LOADING_SCREEN: 'loading-screen',
    LOADING_TEXT: '.loading-text',
    LOADING_SUBTEXT: '.loading-subtext'
};

// Local storage keys
const STORAGE_KEYS = {
    LANGUAGE: 'vrton-language'
};

// Default language
const DEFAULT_LANGUAGE = 'es';

// Loading states configuration
const LOADING_STATES = {
    I18N: 'i18n',
    COMPONENTS: 'components',
    COUNTDOWN: 'countdown',
    DOM: 'dom',
    VIDEO: 'video',
    TEAMS: 'teams'
};

// =============================================================================
// CLASS DEFINITION
// =============================================================================

class LoadingManager {
    // Static constants for external access
    static DEFAULT_TIMEOUT = LOADING_TIMEOUTS.DEFAULT_TIMEOUT;
    static TEAM_PAGE_TIMEOUT = LOADING_TIMEOUTS.TEAM_PAGE_TIMEOUT;

    constructor() {
        this.loadingStates = {
            [LOADING_STATES.I18N]: false,
            [LOADING_STATES.COMPONENTS]: false,
            [LOADING_STATES.COUNTDOWN]: false,
            [LOADING_STATES.DOM]: false,
            [LOADING_STATES.VIDEO]: false,
            [LOADING_STATES.TEAMS]: false
        };
        
        this.loadingScreen = document.getElementById(DOM_SELECTORS.LOADING_SCREEN);
        this.loadingText = document.querySelector(DOM_SELECTORS.LOADING_TEXT);
        this.loadingSubtext = document.querySelector(DOM_SELECTORS.LOADING_SUBTEXT);
        
        // Detect current page
        this.isTeamPage = this.detectTeamPage();
        this.isIndexPage = this.detectIndexPage();
        
        this.currentLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_LANGUAGE;
        this.translations = null; // Will be loaded from i18n
        
        // Only enable debug logging in development
        this.debug = this.isDebugMode();
        
        this.fallbackMessages = {
            es: {
                loading: 'Cargando VRTon',
                loadingTeam: 'Cargando Equipo',
                preparing: 'Preparando experiencia inmersiva...',
                preparingTeam: 'Preparando información del equipo...',
                translations: 'Cargando traducciones...',
                components: 'Cargando componentes...',
                countdown: 'Iniciando contador...',
                teams: 'Cargando información del equipo...',
                video: 'Preparando video...',
                finalizing: 'Finalizando carga...'
            },
            en: {
                loading: 'Loading VRTon',
                loadingTeam: 'Loading Team',
                preparing: 'Preparing immersive experience...',
                preparingTeam: 'Preparing team information...',
                translations: 'Loading translations...',
                components: 'Loading components...',
                countdown: 'Starting countdown...',
                teams: 'Loading team information...',
                video: 'Preparing video...',
                finalizing: 'Finalizing load...'
            }
        };
        this.init();
    }

    detectTeamPage() {
        return PAGE_SELECTORS.TEAM_PAGE_PATHS.some(path => 
            window.location.pathname.includes(path)
        ) || document.querySelector(PAGE_SELECTORS.TEAM_PAGE_SELECTOR);
    }

    detectIndexPage() {
        return PAGE_SELECTORS.INDEX_PAGE_PATHS.some(path => 
            window.location.pathname === path || window.location.pathname.includes(path)
        ) || document.querySelector(PAGE_SELECTORS.INDEX_PAGE_SELECTOR);
    }

    isDebugMode() {
        return location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.hostname.includes('localhost') ||
               location.protocol === 'file:';
    }
    
    init() {
        try {
            // Monitor DOM loading
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.markReady(LOADING_STATES.DOM);
                });
            } else {
                this.markReady(LOADING_STATES.DOM);
            }
            
            // Monitor video loading (only on index page)
            if (this.isIndexPage) {
                this.setupVideoLoading();
            } else {
                // No video on other pages, mark as ready
                this.markReady(LOADING_STATES.VIDEO);
            }
            
            // Set up callbacks for dynamic resources
            this.setupCallbacks();
            
            // Update loading text based on page type
            this.updateInitialLoadingText();
            
            // Start loading animation
            this.startLoadingAnimation();
            
            // Fallback timeout to prevent infinite loading
            const timeoutDuration = this.isTeamPage ? 
                LOADING_TIMEOUTS.TEAM_PAGE_TIMEOUT : 
                LOADING_TIMEOUTS.DEFAULT_TIMEOUT;
                
            setTimeout(() => {
                if (!this.isAllReady()) {
                    if (this.debug) console.warn('Loading timeout reached, forcing completion');
                    this.completeLoading();
                }
            }, timeoutDuration);
        } catch (error) {
            console.error('Error initializing LoadingManager:', error);
            // Force completion on error to prevent infinite loading
            this.completeLoading();
        }
    }
    
    setupVideoLoading() {
        try {
            // Check if VideoOptimizer is handling video loading
            if (window.VideoOptimizer || window.videoOptimizer) {
                // VideoOptimizer will handle video loading and notify us
                if (this.debug) console.log('Video loading delegated to VideoOptimizer');
                return;
            }
            
            // Fallback to original video loading logic
            const video = document.getElementById(VIDEO_CONFIG.VIDEO_ELEMENT_ID);
            if (video) {
                const checkVideo = () => {
                    if (video.readyState >= VIDEO_CONFIG.MIN_READY_STATE) { // HAVE_FUTURE_DATA
                        this.markReady(LOADING_STATES.VIDEO);
                    } else {
                        video.addEventListener('canplay', () => {
                            this.markReady(LOADING_STATES.VIDEO);
                        }, { once: true });
                        
                        video.addEventListener('loadeddata', () => {
                            this.markReady(LOADING_STATES.VIDEO);
                        }, { once: true });
                    }
                };
                
                if (video.readyState >= VIDEO_CONFIG.MIN_READY_STATE) {
                    this.markReady(LOADING_STATES.VIDEO);
                } else {
                    checkVideo();
                }
            } else {
                // No video, mark as ready
                this.markReady(LOADING_STATES.VIDEO);
            }
        } catch (error) {
            console.error('Error setting up video loading:', error);
            // Mark video as ready on error to prevent blocking
            this.markReady(LOADING_STATES.VIDEO);
        }
    }
    
    setupCallbacks() {
        try {
            // i18n callback
            window.onI18nReady = () => {
                try {
                    // Get translations from i18n system
                    if (window.i18n && window.i18n.translations) {
                        this.translations = window.i18n.translations;
                        this.currentLang = window.i18n.currentLanguage;
                    }
                    
                    this.updateLoadingText('translations');
                    this.markReady(LOADING_STATES.I18N);
                } catch (error) {
                    console.error('Error in i18n callback:', error);
                    this.markReady(LOADING_STATES.I18N);
                }
            };
            
            // Components callback
            window.onComponentsReady = () => {
                try {
                    this.updateLoadingText('components');
                    this.markReady(LOADING_STATES.COMPONENTS);
                } catch (error) {
                    console.error('Error in components callback:', error);
                    this.markReady(LOADING_STATES.COMPONENTS);
                }
            };
            
            // Countdown callback (only on index page)
            window.onCountdownReady = () => {
                try {
                    this.updateLoadingText('countdown');
                    this.markReady(LOADING_STATES.COUNTDOWN);
                } catch (error) {
                    console.error('Error in countdown callback:', error);
                    this.markReady(LOADING_STATES.COUNTDOWN);
                }
            };
            
            // Teams callback (only on team page)
            window.onTeamsReady = () => {
                try {
                    this.updateLoadingText('teams');
                    this.markReady(LOADING_STATES.TEAMS);
                } catch (error) {
                    console.error('Error in teams callback:', error);
                    this.markReady(LOADING_STATES.TEAMS);
                }
            };
            
            // If not on index page, mark countdown as ready
            if (!this.isIndexPage) {
                setTimeout(() => this.markReady(LOADING_STATES.COUNTDOWN), LOADING_TIMEOUTS.COMPONENT_READY_DELAY);
            }
            
            // If not on team page, mark teams as ready
            if (!this.isTeamPage) {
                setTimeout(() => this.markReady(LOADING_STATES.TEAMS), LOADING_TIMEOUTS.COMPONENT_READY_DELAY);
            }
            
            // Add a faster timeout specifically for teams loading
            if (this.isTeamPage) {
                setTimeout(() => {
                    if (!this.loadingStates[LOADING_STATES.TEAMS]) {
                        if (this.debug) console.warn('Teams loading timeout reached, forcing completion');
                        this.markReady(LOADING_STATES.TEAMS);
                    }
                }, LOADING_TIMEOUTS.TEAMS_SPECIFIC_TIMEOUT);
            }
        } catch (error) {
            console.error('Error setting up callbacks:', error);
            // Mark all components as ready on error to prevent blocking
            this.markReady(LOADING_STATES.I18N);
            this.markReady(LOADING_STATES.COMPONENTS);
            this.markReady(LOADING_STATES.COUNTDOWN);
            this.markReady(LOADING_STATES.TEAMS);
        }
    }
    
    markReady(component) {
        try {
            if (this.debug) console.log(`Loading: ${component} ready`);
            this.loadingStates[component] = true;
            
            if (this.isAllReady()) {
                this.completeLoading();
            }
        } catch (error) {
            console.error(`Error marking ${component} as ready:`, error);
            // Still try to complete loading if all other components are ready
            if (this.isAllReady()) {
                this.completeLoading();
            }
        }
    }
    
    isAllReady() {
        try {
            return Object.values(this.loadingStates).every(state => state === true);
        } catch (error) {
            console.error('Error checking if all components are ready:', error);
            return true; // Assume ready on error to prevent infinite loading
        }
    }
    
    updateLoadingText(stage) {
        try {
            // Use i18n translations if available, otherwise fallback
            const messages = (this.translations && this.translations[this.currentLang] && this.translations[this.currentLang].loading) 
                ? this.translations[this.currentLang].loading 
                : this.fallbackMessages[this.currentLang] || (this.fallbackMessages[DEFAULT_LANGUAGE] || {});
                
            let text = this.isTeamPage ? 
                (messages.loadingTeam || messages.loading) : 
                (messages.loading || messages.title);
            let subtext = this.isTeamPage ? 
                (messages.preparingTeam || messages.preparing) : 
                messages.preparing;
            
            switch (stage) {
                case 'translations':
                    subtext = messages.translations;
                    break;
                case 'components':
                    subtext = messages.components;
                    break;
                case 'countdown':
                    subtext = messages.countdown;
                    break;
                case 'teams':
                    subtext = messages.teams;
                    break;
                case 'video':
                    subtext = messages.video;
                    break;
                case 'finalizing':
                    subtext = messages.finalizing;
                    break;
            }
            
            if (this.loadingText) this.loadingText.textContent = text;
            if (this.loadingSubtext) this.loadingSubtext.textContent = subtext;
        } catch (error) {
            console.error('Error updating loading text:', error);
            // Set fallback text on error
            if (this.loadingText) this.loadingText.textContent = 'Loading...';
            if (this.loadingSubtext) this.loadingSubtext.textContent = 'Please wait...';
        }
    }
    
    updateInitialLoadingText() {
        try {
            const messages = this.fallbackMessages[this.currentLang] || this.fallbackMessages[DEFAULT_LANGUAGE];
            const text = this.isTeamPage ? messages.loadingTeam : messages.loading;
            const subtext = this.isTeamPage ? messages.preparingTeam : messages.preparing;
            
            if (this.loadingText) this.loadingText.textContent = text;
            if (this.loadingSubtext) this.loadingSubtext.textContent = subtext;
        } catch (error) {
            console.error('Error updating initial loading text:', error);
            // Set fallback text on error
            if (this.loadingText) this.loadingText.textContent = 'Loading...';
            if (this.loadingSubtext) this.loadingSubtext.textContent = 'Please wait...';
        }
    }
    
    startLoadingAnimation() {
        try {
            const stages = this.isTeamPage ? 
                ['translations', 'components', 'teams'] : 
                ['translations', 'components', 'countdown', 'video'];
            let currentStage = 0;
            
            const updateStage = () => {
                try {
                    if (currentStage < stages.length && !this.isAllReady()) {
                        this.updateLoadingText(stages[currentStage]);
                        currentStage++;
                        // Faster timing for team page
                        const delay = this.isTeamPage ? 
                            ANIMATION_TIMING.STAGE_UPDATE_DELAY_TEAM : 
                            ANIMATION_TIMING.STAGE_UPDATE_DELAY;
                        setTimeout(updateStage, delay);
                    }
                } catch (error) {
                    console.error('Error updating loading stage:', error);
                }
            };
            
            // Faster initial delay for team page
            const initialDelay = this.isTeamPage ? 
                ANIMATION_TIMING.INITIAL_DELAY_TEAM : 
                ANIMATION_TIMING.INITIAL_DELAY;
            setTimeout(updateStage, initialDelay);
        } catch (error) {
            console.error('Error starting loading animation:', error);
        }
    }
    
    completeLoading() {
        try {
            this.updateLoadingText('finalizing');
            
            // Small delay to show finalizing message
            setTimeout(() => {
                try {
                    // Add loaded class to body for content animation
                    document.body.classList.remove('loading');
                    document.body.classList.add('loaded');
                    
                    // Hide loading screen with smooth transition
                    if (this.loadingScreen) {
                        this.loadingScreen.classList.add('hidden');
                    }
                    
                    // Remove loading screen from DOM after transition
                    setTimeout(() => {
                        if (this.loadingScreen && this.loadingScreen.parentNode) {
                            this.loadingScreen.remove();
                        }
                    }, LOADING_TIMEOUTS.SCREEN_REMOVAL_DELAY);
                    
                    if (this.debug) console.log('🚀 VRTon loading completed successfully!');
                } catch (error) {
                    console.error('Error completing loading transition:', error);
                    // Still remove loading class to show content
                    document.body.classList.remove('loading');
                    document.body.classList.add('loaded');
                }
            }, LOADING_TIMEOUTS.FINALIZING_DELAY);
        } catch (error) {
            console.error('Error in completeLoading:', error);
            // Emergency fallback - just remove loading class
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            if (this.loadingScreen) {
                this.loadingScreen.style.display = 'none';
            }
        }
    }
    
    // Public method to force completion (for debugging)
    forceComplete() {
        try {
            if (this.debug) console.log('Forcing loading completion...');
            this.completeLoading();
        } catch (error) {
            console.error('Error forcing completion:', error);
            // Emergency fallback
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize loading manager immediately with error handling
let loadingManager;
try {
    loadingManager = new LoadingManager();
    // Make it globally accessible for debugging
    window.loadingManager = loadingManager;
    
    // Add global error handler for loading manager
    window.addEventListener('error', (event) => {
        console.error('Global error detected, forcing loading completion:', event.error);
        if (loadingManager && typeof loadingManager.forceComplete === 'function') {
            loadingManager.forceComplete();
        }
    });
    
} catch (error) {
    console.error('Failed to initialize LoadingManager:', error);
    
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
            console.error('Emergency loading completion failed:', emergencyError);
        }
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoadingManager, loadingManager };
}
