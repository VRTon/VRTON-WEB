/**
 * VRTon Avatars Page JavaScript
 * Handles avatar loading, filtering, and interactions
 */

class AvatarsPage {
    constructor() {
        this.avatars = [];
        this.translations = {};
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadTranslations();
            await this.loadAvatars();
            this.setupEventListeners();
            this.renderAvatars();
        } catch (error) {
            console.error('Error initializing avatars page:', error);
            this.showError();
        }
    }
    
    async loadTranslations() {
        try {
            // Load current language from ModularTranslations
            const currentLang = window.ModularTranslations?.currentLanguage || 'es';
            
            // Load translations for avatars page
            const response = await fetch(`/data/translations/${currentLang}/pages/avatars.json`);
            if (response.ok) {
                this.translations = await response.json();
            } else {
                // Fallback to Spanish if current language fails
                const fallbackResponse = await fetch('/data/translations/es/pages/avatars.json');
                if (fallbackResponse.ok) {
                    this.translations = await fallbackResponse.json();
                }
            }
        } catch (error) {
            console.warn('Could not load translations for avatars page:', error);
            // Use default English fallbacks
            this.translations = {
                title: "VRTon Avatar Collection",
                description: "Discover our collection of public VRChat avatars",
                loading: "Loading avatars...",
                noResults: {
                    title: "No avatars found",
                    message: "Try adjusting your filters to see more results."
                }
            };
        }
    }
    
    async loadAvatars() {
        try {
            const response = await fetch('/data/avatars.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.avatars = data.avatars || [];
            
        } catch (error) {
            console.error('Error loading avatars:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Language change listener
        document.addEventListener('languageChanged', () => {
            this.loadTranslations().then(() => {
                this.renderAvatars();
            });
        });
    }
    
    renderAvatars() {
        const container = document.getElementById('avatarsContainer');
        
        if (!container) return;
        
        // Hide loading spinner
        const loadingSpinner = container.querySelector('.avatars-loading');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Render avatar cards
        this.avatars.forEach(avatar => {
            const card = this.createAvatarCard(avatar);
            container.appendChild(card);
        });
    }
    
    createAvatarCard(avatar) {
        const card = document.createElement('div');
        card.className = 'avatar-card';
        card.setAttribute('data-avatar-id', avatar.id);
        
        // Create assets HTML
        const assetsHtml = avatar.assets.map(asset => 
            `<a href="${asset.url}" class="asset-tag" title="Click to view asset">${asset.name}</a>`
        ).join('');
        
        // Create tags HTML
        const tagsHtml = avatar.tags.map(tag => 
            `<span class="style-tag">${tag}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="avatar-card-content">
                <div class="avatar-image">
                    <img src="${avatar.image}" alt="${avatar.name}" loading="lazy"
                         onerror="this.src='/assets/icons/icon-512x512.webp'">
                    <div class="avatar-status ${avatar.status}">
                        <i class="fas fa-globe"></i>
                        ${avatar.status === 'public' ? 'Public' : 'Private'}
                    </div>
                </div>
                
                <div class="avatar-info">
                    <div class="avatar-header">
                        <h3 class="avatar-name">${avatar.name}</h3>
                        <div class="avatar-creator">
                            <i class="fas fa-user"></i>
                            <span>by ${avatar.creator}</span>
                        </div>
                    </div>
                    
                    <div class="avatar-details">
                        <p class="avatar-description">${avatar.description}</p>
                        
                        <div class="avatar-assets">
                            <div class="assets-title">
                                <i class="fas fa-puzzle-piece"></i>
                                <span>Assets Used:</span>
                            </div>
                            <div class="assets-list">
                                ${assetsHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="avatar-actions">
                        <a href="${avatar.vrchatUrl}" class="vrchat-link" target="_blank" rel="noopener">
                            <i class="fas fa-external-link-alt"></i>
                            <span>View in VRChat</span>
                        </a>
                        <div class="avatar-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handler for the entire card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on asset links
            if (e.target.classList.contains('asset-tag') || e.target.closest('.asset-tag')) {
                return;
            }
            
            // Don't trigger if clicking on VRChat link
            if (e.target.classList.contains('vrchat-link') || e.target.closest('.vrchat-link')) {
                return;
            }
            
            // Open VRChat URL
            window.open(avatar.vrchatUrl, '_blank', 'noopener');
        });
        
        return card;
    }
    
    showError() {
        const container = document.getElementById('avatarsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Avatars</h3>
                <p>Sorry, we couldn't load the avatar collection. Please try refreshing the page.</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-refresh"></i>
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.avatarsPage = new AvatarsPage();
});

// Handle module loading if ModularTranslations is available
if (window.ModularTranslations) {
    window.ModularTranslations.ready(() => {
        if (!window.avatarsPage) {
            window.avatarsPage = new AvatarsPage();
        }
    });
}