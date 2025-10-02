/**
 * VPM Assets Listing - JavaScript functionality
 * Handles VCC integration and repository management
 */

'use strict';

// VPM Assets Configuration
const VPMAssets = {
    config: {
        listingUrl: 'https://vrton.org/resources/assets/vpm-listing.json',
        vccProtocol: 'vcc://vpm/addRepo?url=',
        catalogUrl: '/data/catalog.json'
    },

    data: {
        assets: [],
        filteredAssets: [],
        currentCategory: 'all'
    },

    // Initialize VPM Assets functionality
    init: async () => {
        console.log('Initializing VPM Assets...');
        
        try {
            await VPMAssets.loadCatalogData();
            VPMAssets.renderAssets();
            VPMAssets.initializeEventListeners();
            VPMAssets.initializeModals();
            VPMAssets.initializeCategoryFilter();
            
            console.log('VPM Assets initialized successfully');
        } catch (error) {
            console.error('Failed to initialize VPM Assets:', error);
            VPMAssets.showError('Failed to load asset catalog');
        }
    },

    // Load catalog data from JSON
    loadCatalogData: async () => {
        try {
            const response = await fetch(VPMAssets.config.catalogUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            VPMAssets.data.assets = data.assets || [];
            VPMAssets.data.filteredAssets = [...VPMAssets.data.assets];
            
            console.log(`Loaded ${VPMAssets.data.assets.length} assets`);
        } catch (error) {
            console.error('Error loading catalog data:', error);
            VPMAssets.data.assets = [];
            VPMAssets.data.filteredAssets = [];
        }
    },

    // Render assets in the grid
    renderAssets: () => {
        const assetsGrid = document.getElementById('assetsGrid');
        if (!assetsGrid) return;

        if (VPMAssets.data.filteredAssets.length === 0) {
            // Try to get translated no assets message
            let noAssetsMessage = 'No assets found in this category.';
            if (window.ModularTranslations && typeof window.ModularTranslations.t === 'function') {
                try {
                    const translated = window.ModularTranslations.t('assets.noAssets.message');
                    if (translated && translated !== 'assets.noAssets.message') {
                        noAssetsMessage = translated;
                    }
                } catch (error) {
                    console.warn('No assets message translation failed');
                }
            }
            
            assetsGrid.innerHTML = `
                <div class="no-assets">
                    <i class="fas fa-cube"></i>
                    <p>${noAssetsMessage}</p>
                </div>
            `;
            return;
        }

        // Get translated download button text
        let downloadText = 'Download';
        if (window.ModularTranslations && typeof window.ModularTranslations.t === 'function') {
            try {
                const translated = window.ModularTranslations.t('assets.download.button');
                if (translated && translated !== 'assets.download.button') {
                    downloadText = translated;
                }
            } catch (error) {
                console.warn('Download button translation failed');
            }
        }

        assetsGrid.innerHTML = VPMAssets.data.filteredAssets.map(asset => `
            <div class="asset-card" data-category="${asset.category}">
                <div class="asset-image" style="background-image: url('${asset.imageUrl}')">
                    <img src="${asset.imageUrl}" alt="${asset.name}" loading="lazy" 
                         onerror="this.style.display='none'; this.parentElement.style.backgroundImage='none';">
                </div>
                <div class="asset-content">
                    <div class="asset-header">
                        <h3 class="asset-name">${asset.name}</h3>
                        <span class="asset-version">v${asset.version}</span>
                    </div>
                    <p class="asset-description">${asset.description}</p>
                    <div class="asset-footer">
                        <span class="asset-category">${VPMAssets.translateCategory(asset.category)}</span>
                        <a href="${asset.downloadUrl}" class="asset-download" target="_blank" rel="noopener noreferrer"
                           onclick="VPMAssets.trackDownload('${asset.name}')">
                            <i class="fas fa-download"></i>
                            ${downloadText}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Filter assets by category
    filterAssets: (category) => {
        VPMAssets.data.currentCategory = category;
        
        if (category === 'all') {
            VPMAssets.data.filteredAssets = [...VPMAssets.data.assets];
        } else {
            VPMAssets.data.filteredAssets = VPMAssets.data.assets.filter(asset => 
                asset.category === category
            );
        }
        
        VPMAssets.renderAssets();
    },

    // Initialize category filter
    initializeCategoryFilter: () => {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter assets
                VPMAssets.filterAssets(category);
            });
        });
    },

    // Translate category names using the translation system
    translateCategory: (category) => {
        // Try to get translation from the translation system
        if (window.ModularTranslations && typeof window.ModularTranslations.t === 'function') {
            const categoryKey = category.toLowerCase();
            try {
                const translationKey = `assets.filter.${categoryKey}`;
                const translated = window.ModularTranslations.t(translationKey);
                if (translated && translated !== translationKey) {
                    return translated;
                }
            } catch (error) {
                console.warn('Translation failed for category:', category);
            }
        }
        
        // Fallback translations
        const fallbackTranslations = {
            'Ropa': 'Clothing',
            'Juguetes': 'Toys', 
            'Objetos': 'Objects'
        };
        return fallbackTranslations[category] || category;
    },

    // Track download events
    trackDownload: (assetName) => {
        console.log(`Download tracked: ${assetName}`);
        // You can add analytics tracking here if needed
    },

    // Show error message
    showError: (message) => {
        console.error('VPM Assets Error:', message);
        
        const assetsGrid = document.getElementById('assetsGrid');
        if (assetsGrid) {
            // Try to get translated error messages
            let errorMessage = message;
            let helpMessage = 'Please try refreshing the page or contact support if the problem persists.';
            
            if (window.ModularTranslations && typeof window.ModularTranslations.t === 'function') {
                try {
                    const translatedError = window.ModularTranslations.t('assets.errors.loadFailed');
                    const translatedHelp = window.ModularTranslations.t('assets.errors.helpMessage');
                    
                    if (translatedError && translatedError !== 'assets.errors.loadFailed') {
                        errorMessage = translatedError;
                    }
                    if (translatedHelp && translatedHelp !== 'assets.errors.helpMessage') {
                        helpMessage = translatedHelp;
                    }
                } catch (error) {
                    console.warn('Error translation failed, using default messages');
                }
            }
            
            assetsGrid.innerHTML = `
                <div class="no-assets">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${errorMessage}</p>
                    <p>${helpMessage}</p>
                </div>
            `;
        }
    },

    // Initialize all event listeners
    initializeEventListeners: () => {
        // VCC URL copy button
        const copyButton = document.getElementById('vccUrlFieldCopy');
        if (copyButton) {
            copyButton.addEventListener('click', VPMAssets.copyVccUrl);
        }

        // Add to VCC button
        const addToVccButton = document.getElementById('vccAddRepoButton');
        if (addToVccButton) {
            addToVccButton.addEventListener('click', VPMAssets.addToVcc);
        }

        // Help button
        const helpButton = document.getElementById('urlBarHelp');
        if (helpButton) {
            helpButton.addEventListener('click', VPMAssets.showHelpModal);
        }

        // Help modal close
        const helpCloseButton = document.getElementById('addListingToVccHelpClose');
        if (helpCloseButton) {
            helpCloseButton.addEventListener('click', VPMAssets.closeHelpModal);
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                VPMAssets.closeAllModals();
            }
        });
    },

    // Initialize modal functionality
    initializeModals: () => {
        // Ensure modals are hidden on load
        VPMAssets.closeAllModals();
    },

    // Copy VCC URL to clipboard
    copyVccUrl: async () => {
        const urlField = document.getElementById('vccUrlField');
        const copyButton = document.getElementById('vccUrlFieldCopy');
        
        if (!urlField || !copyButton) return;

        try {
            await navigator.clipboard.writeText(urlField.value);
            
            // Visual feedback
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyButton.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                copyButton.innerHTML = originalText;
                copyButton.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy URL:', error);
            // Fallback for older browsers
            urlField.select();
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Unable to copy. Please copy manually.';
            copyButton.style.background = 'var(--error-color)';
            setTimeout(() => {
                copyButton.innerHTML = originalText;
                copyButton.style.background = '';
            }, 4000);
        }
    },

    // Add repository to VCC
    addToVcc: () => {
        const vccUrl = VPMAssets.config.vccProtocol + encodeURIComponent(VPMAssets.config.listingUrl);
        window.location.assign(vccUrl);
    },

    // Show help modal
    showHelpModal: () => {
        const modal = document.getElementById('addListingToVccHelp');
        if (modal) {
            modal.hidden = false;
        }
    },

    // Close help modal
    closeHelpModal: () => {
        const modal = document.getElementById('addListingToVccHelp');
        if (modal) {
            modal.hidden = true;
        }
    },

    // Close all modals
    closeAllModals: () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.hidden = true;
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', VPMAssets.init);
} else {
    VPMAssets.init();
}

// Make VPMAssets available globally for debugging
window.VPMAssets = VPMAssets;