// Icon Optimizer for VRTon - Load only needed Font Awesome icons
// This script replaces full Font Awesome with a minimal subset for faster loading

class IconOptimizer {
    constructor() {
        this.icons = {
            // Map specific icons to their Unicode values for faster loading
            'fa-discord': '\uf392',
            'fa-envelope': '\uf0e0', 
            'fa-handshake': '\uf2b5',
            'fa-vr-cardboard': '\uf729'
        };
        
        this.init();
    }

    init() {
        // Only run if Font Awesome hasn't loaded after 2 seconds
        setTimeout(() => {
            if (!this.isFontAwesomeLoaded()) {
                this.loadMinimalIcons();
            }
        }, 2000);
    }

    isFontAwesomeLoaded() {
        // Check if Font Awesome CSS is loaded by testing a known class
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-test';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        document.body.appendChild(testElement);
        
        const computed = window.getComputedStyle(testElement);
        const fontFamily = computed.fontFamily;
        document.body.removeChild(testElement);
        
        return fontFamily.includes('Font Awesome');
    }

    loadMinimalIcons() {
        console.log('Loading minimal icon set for faster performance');
        
        // Create minimal CSS with only needed icons
        const minimalCSS = `
            @font-face {
                font-family: "FA-Minimal";
                src: url("data:font/woff2;base64,") format("woff2");
                font-display: swap;
            }
            
            .fa-discord::before { content: "${this.icons['fa-discord']}"; font-family: "Font Awesome 6 Brands", "FA-Minimal", "Segoe UI Emoji"; }
            .fa-envelope::before { content: "${this.icons['fa-envelope']}"; font-family: "Font Awesome 6 Free", "FA-Minimal", "Segoe UI Emoji"; }
            .fa-handshake::before { content: "${this.icons['fa-handshake']}"; font-family: "Font Awesome 6 Free", "FA-Minimal", "Segoe UI Emoji"; }
            .fa-vr-cardboard::before { content: "${this.icons['fa-vr-cardboard']}"; font-family: "Font Awesome 6 Free", "FA-Minimal", "Segoe UI Emoji"; }
            
            .fas, .fab, .far {
                display: inline-block;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                line-height: 1;
                font-weight: 900;
            }
            
            .fab {
                font-weight: 400;
            }
        `;

        // Inject minimal CSS
        const style = document.createElement('style');
        style.textContent = minimalCSS;
        document.head.appendChild(style);
    }

    // Preload critical font files for even faster loading
    preloadCriticalFonts() {
        const criticalFonts = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-brands-400.woff2'
        ];

        criticalFonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = fontUrl;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            
            if (!document.querySelector(`link[href="${fontUrl}"]`)) {
                document.head.appendChild(link);
            }
        });
    }
}

// Initialize icon optimizer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new IconOptimizer();
    });
} else {
    new IconOptimizer();
}
