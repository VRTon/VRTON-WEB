// Local Placeholder Generator for VRTon
// Replaces external placeholder services with local Canvas-generated images

class LocalPlaceholder {
    static generateDataURL(width = 300, height = 300, bgColor = '#e30613', textColor = '#ffffff', text = 'VRTon') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Dynamic font size based on canvas size
        const fontSize = Math.min(width, height) * 0.15;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Draw text in center
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL('image/png');
    }
    
    static createPlaceholderElement(width = 300, height = 300, bgColor = '#e30613', textColor = '#ffffff', text = 'VRTon') {
        const div = document.createElement('div');
        div.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(135deg, ${bgColor}, #fd5c63);
            color: ${textColor};
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            border-radius: 10px;
            font-weight: bold;
            font-size: ${Math.min(width, height) * 0.15}px;
            font-family: Arial, sans-serif;
        `;
        div.textContent = text;
        return div;
    }
    
    // Helper to replace failed images with local placeholders
    static setupImageFallbacks() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG' && e.target.complete === false) {
                e.preventDefault();
                
                // Extract dimensions and text from data attributes
                const width = parseInt(e.target.getAttribute('data-width')) || 300;
                const height = parseInt(e.target.getAttribute('data-height')) || 300;
                const text = e.target.getAttribute('data-text') || 'VRTon';
                
                // Create local placeholder
                const placeholder = LocalPlaceholder.createPlaceholderElement(width, height, '#e30613', '#ffffff', text);
                
                // Replace the image with the placeholder
                e.target.parentNode.replaceChild(placeholder, e.target);
            }
        }, true);
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        LocalPlaceholder.setupImageFallbacks();
    });
}

// Export for use in other scripts
window.LocalPlaceholder = LocalPlaceholder;
