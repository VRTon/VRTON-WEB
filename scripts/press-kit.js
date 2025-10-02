/**
 * Press Kit Page JavaScript
 * Handles interactive functionality for the VRTon press kit page
 */

class PressKitManager {
    constructor() {
        this.currentSocialCategory = 'banners';
        this.currentStickerFilter = 'all';
        this.assets = {
            posters: [],
            social: {
                banners: [],
                profile: [],
                stories: []
            },
            stickers: []
        };
        this.init();
    }

    init() {
        this.loadAssets();
        this.setupEventListeners();
        this.setupModal();
    }

    setupEventListeners() {
        // Social media category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSocialCategory(e.target.dataset.category);
            });
        });

        // Sticker filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterStickers(e.target.dataset.filter);
            });
        });

        // Download buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.download-btn')) {
                const assetType = e.target.closest('.download-btn').dataset.asset;
                this.downloadAsset(assetType);
            }
        });

        // Bulk download
        const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');
        if (bulkDownloadBtn) {
            bulkDownloadBtn.addEventListener('click', () => {
                this.downloadBulkAssets();
            });
        }

        // Asset preview clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.poster-card, .social-asset-card, .sticker-card, .asset-card')) {
                const card = e.target.closest('.poster-card, .social-asset-card, .sticker-card, .asset-card');
                this.showAssetPreview(card);
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('assetPreviewModal');
        const closeBtn = document.getElementById('previewModalClose');
        const downloadBtn = document.getElementById('previewDownloadBtn');
        const copyBtn = document.getElementById('previewCopyBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const imageUrl = document.getElementById('previewImage').src;
                this.downloadImageFromUrl(imageUrl);
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const imageUrl = document.getElementById('previewImage').src;
                this.copyToClipboard(imageUrl);
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async loadAssets() {
        try {
            // Load sample data for demonstration
            this.loadSampleAssets();
            this.renderPosters();
            this.renderSocialAssets();
            this.renderStickers();
        } catch (error) {
            console.error('Error loading press kit assets:', error);
            this.showError();
        }
    }

    loadSampleAssets() {
        // Sample world posters
        this.assets.posters = [
            {
                id: 1,
                title: 'VRTon Community Hub',
                world: 'Community World',
                image: '/assets/comunidad.webp',
                downloadUrl: '/assets/press-kit/posters/community-hub-poster.webp'
            }
        ];

        // Sample social media assets
        this.assets.social.banners = [
            {
                id: 1,
                name: 'VRTon Banner 1920x1080',
                dimensions: '1920x1080',
                image: '/assets/icons/logo.webp',
                downloadUrl: '/assets/press-kit/social/banner-1920x1080.webp'
            },
            {
                id: 2,
                name: 'VRTon Banner 1200x630',
                dimensions: '1200x630',
                image: '/assets/icons/logo.webp',
                downloadUrl: '/assets/press-kit/social/banner-1200x630.webp'
            }
        ];

        this.assets.social.profile = [
            {
                id: 3,
                name: 'Profile Picture 512x512',
                dimensions: '512x512',
                image: '/assets/icons/icon-512x512.webp',
                downloadUrl: '/assets/icons/icon-512x512.webp'
            },
            {
                id: 4,
                name: 'Profile Picture 192x192',
                dimensions: '192x192',
                image: '/assets/icons/icon-192x192.webp',
                downloadUrl: '/assets/icons/icon-192x192.webp'
            }
        ];

        this.assets.social.stories = [
            {
                id: 5,
                name: 'Instagram Story Template',
                dimensions: '1080x1920',
                image: '/assets/icons/logo.webp',
                downloadUrl: '/assets/press-kit/social/story-template.webp'
            }
        ];

        // Sample stickers
        this.assets.stickers = [
            {
                id: 1,
                name: 'VRTon Logo Sticker',
                platform: 'discord',
                image: '/assets/icons/logo.webp',
                downloadUrl: '/assets/press-kit/stickers/logo-sticker.webp'
            },
            {
                id: 2,
                name: 'VRTon Icon Sticker',
                platform: 'telegram',
                image: '/assets/icons/icon-512x512.webp',
                downloadUrl: '/assets/press-kit/stickers/icon-sticker.webp'
            }
        ];
    }

    renderPosters() {
        const container = document.getElementById('postersGrid');
        if (!container) return;

        if (this.assets.posters.length === 0) {
            container.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-image"></i>
                    <span data-i18n="pressKit.noPosters">No posters available yet</span>
                </div>
            `;
            return;
        }

        container.innerHTML = this.assets.posters.map(poster => `
            <div class="poster-card" data-asset-id="${poster.id}" data-asset-type="poster">
                <img src="${poster.image}" alt="${poster.title}" class="poster-image">
                <div class="poster-info">
                    <h3 class="poster-title">${poster.title}</h3>
                    <p class="poster-world">${poster.world}</p>
                </div>
            </div>
        `).join('');
    }

    renderSocialAssets() {
        const container = document.getElementById('socialAssetsGrid');
        if (!container) return;

        const assets = this.assets.social[this.currentSocialCategory] || [];

        if (assets.length === 0) {
            container.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-images"></i>
                    <span>No ${this.currentSocialCategory} available yet</span>
                </div>
            `;
            return;
        }

        container.innerHTML = assets.map(asset => `
            <div class="social-asset-card" data-asset-id="${asset.id}" data-asset-type="social">
                <img src="${asset.image}" alt="${asset.name}" class="social-asset-image">
                <div class="social-asset-info">
                    <h3 class="social-asset-name">${asset.name}</h3>
                    <p class="social-asset-dimensions">${asset.dimensions}</p>
                </div>
            </div>
        `).join('');
    }

    renderStickers() {
        const container = document.getElementById('stickersGrid');
        if (!container) return;

        let filteredStickers = this.assets.stickers;
        if (this.currentStickerFilter !== 'all') {
            filteredStickers = this.assets.stickers.filter(sticker => 
                sticker.platform === this.currentStickerFilter
            );
        }

        if (filteredStickers.length === 0) {
            container.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-smile"></i>
                    <span>No stickers available for this filter</span>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredStickers.map(sticker => `
            <div class="sticker-card" data-asset-id="${sticker.id}" data-asset-type="sticker">
                <img src="${sticker.image}" alt="${sticker.name}" class="sticker-image">
            </div>
        `).join('');
    }

    switchSocialCategory(category) {
        this.currentSocialCategory = category;
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderSocialAssets();
    }

    filterStickers(filter) {
        this.currentStickerFilter = filter;
        
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderStickers();
    }

    downloadAsset(assetType) {
        // Simulate download
        this.showNotification(`Downloading ${assetType} assets...`, 'info');
        
        // In a real implementation, this would create a ZIP file or direct download
        setTimeout(() => {
            this.showNotification(`${assetType} assets downloaded successfully!`, 'success');
        }, 1500);
    }

    downloadBulkAssets() {
        this.showNotification('Preparing complete press kit download...', 'info');
        
        // Simulate bulk download preparation
        setTimeout(() => {
            this.showNotification('Complete press kit downloaded successfully!', 'success');
        }, 2000);
    }

    showAssetPreview(card) {
        const assetType = card.dataset.assetType;
        const assetId = parseInt(card.dataset.assetId);
        let asset = null;

        // Find the asset based on type and ID
        switch (assetType) {
            case 'poster':
                asset = this.assets.posters.find(p => p.id === assetId);
                break;
            case 'social':
                const socialAssets = [
                    ...this.assets.social.banners,
                    ...this.assets.social.profile,
                    ...this.assets.social.stories
                ];
                asset = socialAssets.find(s => s.id === assetId);
                break;
            case 'sticker':
                asset = this.assets.stickers.find(s => s.id === assetId);
                break;
        }

        if (!asset) return;

        // Update modal content
        document.getElementById('previewTitle').textContent = asset.title || asset.name;
        document.getElementById('previewImage').src = asset.image;
        document.getElementById('previewImage').alt = asset.title || asset.name;

        // Store download URL for modal buttons
        document.getElementById('previewDownloadBtn').dataset.downloadUrl = asset.downloadUrl;
        document.getElementById('previewCopyBtn').dataset.imageUrl = asset.image;

        // Show modal
        const modal = document.getElementById('assetPreviewModal');
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('assetPreviewModal');
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    downloadImageFromUrl(url) {
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Download started!', 'success');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Link copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showNotification('Failed to copy link', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--white);
                    padding: 15px 20px;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-medium);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    border-left: 4px solid var(--info-color);
                }
                .notification.notification-success {
                    border-left-color: var(--success-color);
                    color: var(--success-color);
                }
                .notification.notification-error {
                    border-left-color: var(--error-color);
                    color: var(--error-color);
                }
                .notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(styles);
        }

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError() {
        const grids = ['postersGrid', 'socialAssetsGrid', 'stickersGrid'];
        grids.forEach(gridId => {
            const container = document.getElementById(gridId);
            if (container) {
                container.innerHTML = `
                    <div class="loading-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error loading assets. Please try again later.</span>
                    </div>
                `;
            }
        });
    }
}

// Initialize the press kit manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PressKitManager();
});

// Export for potential use in other scripts
window.PressKitManager = PressKitManager;