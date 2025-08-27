// Video Optimization Manager for VRTon Background Video
class VideoOptimizer {
    constructor() {
        this.video = null;
        this.isLoaded = false;
        this.isLowBandwidth = false;
        this.shouldPlayVideo = true;
        
        this.init();
    }
    
    init() {
        this.video = document.getElementById('background-video');
        if (!this.video) return;
        
        this.detectBandwidth();
        this.setupIntersectionObserver();
        this.loadVideoSmart();
    }
    
    // Detect user's connection speed
    detectBandwidth() {
        // Check for Network Information API
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const slowConnections = ['slow-2g', '2g', '3g'];
            
            if (slowConnections.includes(connection.effectiveType)) {
                this.isLowBandwidth = true;
                this.shouldPlayVideo = false;
            }
            
            // Also check if user has data saver enabled
            if (connection.saveData) {
                this.isLowBandwidth = true;
                this.shouldPlayVideo = false;
            }
        }
        
        // Fallback: Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.shouldPlayVideo = false;
        }
        
        // Mobile detection - be more conservative on mobile
        if (window.innerWidth <= 768) {
            this.isLowBandwidth = true;
        }
    }
    
    // Setup intersection observer for performance
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.loadVideo();
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoaded) {
                    this.loadVideo();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Start loading when video is 50px away from viewport
        });
        
        observer.observe(this.video);
    }
    
    // Smart video loading based on conditions
    loadVideoSmart() {
        // If low bandwidth or reduced motion, don't load video
        if (!this.shouldPlayVideo) {
            this.showStaticFallback();
            this.notifyVideoReady(); // Still notify loading manager
            return;
        }
        
        // Check if video is in viewport immediately
        const rect = this.video.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
            // Video is immediately visible, load with a small delay to not block initial render
            setTimeout(() => this.loadVideo(), 100);
        }
        // Otherwise, intersection observer will handle it
    }
    
    // Check if browser supports WebM format
    supportsWebM() {
        const video = document.createElement('video');
        return video.canPlayType('video/webm') !== '';
    }
    
    // Load the actual video
    loadVideo() {
        if (this.isLoaded || !this.video) return;
        
        // Set loading state
        // this.isLoaded = true; // Moved to onVideoLoaded()
        
        // Choose appropriate video source based on device and bandwidth
        let videoSrc, webmSrc;
        
        if (this.isLowBandwidth || window.innerWidth <= 768) {
            // Use mobile version for low bandwidth or mobile devices
            videoSrc = this.video.getAttribute('data-src-mobile') || this.video.getAttribute('data-src-mp4');
            webmSrc = null; // Skip WebM for mobile to save bandwidth
        } else {
            // Use optimized versions for desktop
            videoSrc = this.video.getAttribute('data-src-mp4');
            webmSrc = this.video.getAttribute('data-src-webm');
        }
        
        // Load sources in order of preference - only load one format at a time
        const sources = this.video.querySelectorAll('source');
        
        // Clear existing sources first
        sources.forEach(source => {
            source.removeAttribute('src');
        });
        
        // Strategy: Try WebM first (if available and supported), then MP4
        if (webmSrc && this.supportsWebM()) {
            // Use WebM for better compression
            const webmSource = Array.from(sources).find(s => s.getAttribute('type') === 'video/webm');
            if (webmSource) {
                webmSource.src = webmSrc;
            }
        } else if (videoSrc) {
            // Use MP4 as fallback or primary on mobile
            const mp4Source = Array.from(sources).find(s => s.getAttribute('type') === 'video/mp4');
            if (mp4Source) {
                mp4Source.src = videoSrc;
            }
        }
        
        // Rely solely on <source> elements for video loading
        // Removed fallback to video.src to prevent redundant network requests
        
        // Setup event listeners
        this.video.addEventListener('loadeddata', () => {
            this.onVideoLoaded();
        });
        
        this.video.addEventListener('error', () => {
            this.onVideoError();
        });
        
        // Preload and start loading
        this.video.load();
    }
    
    // Handle video loaded successfully
    onVideoLoaded() {
        // Remove poster to show video
        this.video.removeAttribute('poster');
        
        // Play video if autoplay is desired
        if (this.shouldPlayVideo) {
            this.video.play().catch(e => {
                this.showStaticFallback();
            });
        }
        
        this.notifyVideoReady();
    }
    
    // Handle video loading error
    onVideoError() {
        this.showStaticFallback();
        this.notifyVideoReady();
    }
    
    // Show static background instead of video
    showStaticFallback() {
        this.video.style.display = 'none';
        
        // Create static background
        const heroSection = this.video.closest('.hero-video');
        if (heroSection && !heroSection.querySelector('.static-bg')) {
            const staticBg = document.createElement('div');
            staticBg.className = 'static-bg';
            staticBg.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                z-index: -2;
            `;
            heroSection.appendChild(staticBg);
        }
    }
    
    // Notify loading manager that video is ready
    notifyVideoReady() {
        if (window.loadingManager && typeof window.loadingManager.markReady === 'function') {
            window.loadingManager.markReady('video');
        }
        
        // Also notify any performance monitors
        if (window.performanceMonitor) {
            window.performanceMonitor.mark('video-optimized-ready');
        }
    }
    
    // Public method to pause/resume video for performance
    pauseVideo() {
        if (this.video && !this.video.paused) {
            this.video.pause();
        }
    }
    
    resumeVideo() {
        if (this.video && this.video.paused && this.shouldPlayVideo) {
            this.video.play().catch(e => console.log('Resume video error:', e));
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.videoOptimizer = new VideoOptimizer();
    });
} else {
    window.videoOptimizer = new VideoOptimizer();
}

// Export for use in other scripts
window.VideoOptimizer = VideoOptimizer;
