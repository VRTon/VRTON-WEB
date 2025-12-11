/**
 * Press Kit Page JavaScript
 * Handles interactive functionality for the VRTon press kit page
 */

class PressKitManager {
    constructor() {
        this.currentStickerFilter = 'all';
        this.assets = {
            brandAssets: [],
            posters: [],
            stickers: [],
            bulkDownload: null
        };
        this.dataUrl = '/data/press-kit-assets.json';
        this.init();
    }

    init() {
        this.loadAssets();
        this.setupEventListeners();
        this.setupModal();
    }

    setupEventListeners() {
        // Sticker filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterStickers(e.target.dataset.filter);
            });
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
            if (e.target.closest('.poster-card, .sticker-card, .asset-card')) {
                const card = e.target.closest('.poster-card, .sticker-card, .asset-card');
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
            console.log('Loading assets from:', this.dataUrl);
            
            // Load data from JSON file
            const response = await fetch(this.dataUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Loaded data:', data);
            
            // Map data to internal structure
            this.assets.brandAssets = data.brandAssets || [];
            this.assets.posters = data.worldPosters || [];
            this.assets.stickers = data.stickers || [];
            this.assets.bulkDownload = data.bulkDownload || null;
            
            console.log('Mapped assets:', this.assets);
            
            // Render all sections
            this.renderBrandAssets();
            this.renderPosters();
            this.renderStickers();
            this.updateBulkDownload();
            
            console.log('Assets loaded and rendered successfully');
        } catch (error) {
            console.error('Error loading press kit assets:', error);
            console.error('Error details:', error.message);
            this.showError();
        }
    }



    renderBrandAssets() {
        const container = document.querySelector('.brand-assets .assets-grid');
        if (!container) return;

        if (this.assets.brandAssets.length === 0) {
            return; // Keep existing static HTML if no dynamic assets
        }

        // Keep existing static HTML and add dynamic assets
        const existingAssets = container.innerHTML;
        const dynamicAssets = this.assets.brandAssets.map(asset => `
            <div class="asset-card" data-asset-id="${asset.id}" data-asset-type="brand">
                <div class="asset-preview">
                    <img src="${asset.image}" alt="${asset.name || asset.title}" class="asset-image" onerror="this.src='/assets/colaboradores/placeholder.webp'">
                </div>
                <div class="asset-info">
                    <h3 class="asset-name">${asset.name || asset.title}</h3>
                    <div class="asset-formats">
                        ${asset.formats ? asset.formats.map(format => `<span class="format-tag">${format}</span>`).join('') : `<span class="format-tag">${asset.format}</span>`}
                    </div>
                </div>
            </div>
        `).join('');

        // Add dynamic assets after existing ones
        if (existingAssets.includes('asset-card')) {
            container.innerHTML = existingAssets + dynamicAssets;
        } else {
            container.innerHTML = dynamicAssets;
        }
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
                <img src="${poster.image}" alt="${poster.title}" class="poster-image" onerror="this.src='/assets/colaboradores/placeholder.webp'">
                <div class="poster-info">
                    <h3 class="poster-title">${poster.title}</h3>
                    <div class="asset-formats">
                        <span class="format-tag">${poster.format}</span>
                    </div>
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
                sticker.type === this.currentStickerFilter
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
                <img src="${sticker.image}" alt="${sticker.name}" class="sticker-image" onerror="this.src='/assets/colaboradores/placeholder.webp'">
            </div>
        `).join('');
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

    updateBulkDownload() {
        if (!this.assets.bulkDownload) return;

        const titleElement = document.querySelector('.bulk-title');
        const descriptionElement = document.querySelector('.bulk-description');
        const sizeElement = document.querySelector('.bulk-size');
        const formatsElement = document.querySelector('.bulk-formats');
        const downloadBtn = document.getElementById('bulkDownloadBtn');

        if (titleElement) titleElement.textContent = this.assets.bulkDownload.title;
        if (descriptionElement) descriptionElement.textContent = this.assets.bulkDownload.description;
        if (sizeElement) sizeElement.textContent = this.assets.bulkDownload.size;
        if (formatsElement) formatsElement.textContent = this.assets.bulkDownload.formats;
        if (downloadBtn) downloadBtn.dataset.downloadUrl = this.assets.bulkDownload.downloadUrl;
    }



    downloadBulkAssets() {
        // Direct download without notifications
        if (this.assets.bulkDownload && this.assets.bulkDownload.downloadUrl) {
            window.location.href = this.assets.bulkDownload.downloadUrl;
        }
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
            case 'sticker':
                asset = this.assets.stickers.find(s => s.id === assetId);
                break;
            case 'brand':
                asset = this.assets.brandAssets.find(b => b.id === assetId);
                break;
        }

        if (!asset) return;

        // Update modal content
        document.getElementById('previewTitle').textContent = asset.title || asset.name;
        const previewImage = document.getElementById('previewImage');
        previewImage.src = asset.image;
        previewImage.alt = asset.title || asset.name;
        previewImage.onerror = function() { this.src = '/assets/colaboradores/placeholder.webp'; };

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
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }



    showError() {
        const grids = ['postersGrid', 'stickersGrid'];
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