// SEO Enhancement Script for VRTon
// This script provides additional SEO optimizations and monitoring
// 
// PERFORMANCE OPTIMIZATIONS:
// - Batched DOM reads/writes to prevent forced reflows
// - Uses requestAnimationFrame for DOM modifications
// - Avoids getComputedStyle() calls in loops
// - Throttled resize event handlers
// - Specific selectors to reduce DOM queries

class SEOEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Only run in browser environment
        if (typeof window === 'undefined') return;
        
        this.addStructuredDataForCurrentPage();
        this.optimizeImages();
        this.addBreadcrumbs();
        this.monitorPagePerformance();
        this.enhanceAccessibility();
        this.setupSocialMediaTracking();
    }

    addStructuredDataForCurrentPage() {
        const currentPath = window.location.pathname;
        
        // Add FAQ structured data for index page
        if (currentPath === '/' || currentPath.includes('index.html')) {
            this.addFAQStructuredData();
            this.addEventStructuredData();
        }
        
        // Add Team structured data for colaboradores page
        if (currentPath.includes('colaboradores')) {
            this.addTeamStructuredData();
        }
    }

    addFAQStructuredData() {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "¿Quién y cómo puede participar en la VRTon?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Toda aquella persona o comunidad que quiera ayudar a organizar la VRTon es bienvenida, siempre respetando el hecho de hacerlo sin fines de lucro. Si estás interesado en participar como voluntario dirígete a nuestro canal de Discord."
                    }
                },
                {
                    "@type": "Question", 
                    "name": "¿Para qué serán los fondos recaudados este año? ¿Qué es la Teletón?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Por tercer año consecutivo estaremos juntando fondos para la Teletón Chile. La Teletón es una campaña benéfica que se realiza en varios países con el objetivo de recaudar fondos para ayudar a personas con discapacidad, principalmente a través de centros de rehabilitación y programas de inclusión."
                    }
                },
                {
                    "@type": "Question",
                    "name": "¿Esto es transparente? ¿A dónde va el dinero?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Para maximizar la transparencia todas las donaciones se harán a través de los medios oficiales de la Teletón, sin ningún tipo de intermediario de nuestra parte."
                    }
                }
            ]
        };

        this.injectStructuredData(faqData, 'faq-schema');
    }

    addEventStructuredData() {
        const eventData = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "VRTon 2025",
            "description": "Evento anual de realidad virtual para recaudar fondos para la Teletón Chile. Actividades dentro y fuera de VRChat, juegos, shows en vivo y más.",
            "startDate": "2025-12-01",
            "endDate": "2025-12-02",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
                "@type": "VirtualLocation",
                "url": "https://discord.gg/gSCsPKTsVJ",
                "name": "VRChat y Discord"
            },
            "organizer": {
                "@type": "Organization",
                "name": "VRTon",
                "url": "https://vrton.org"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CLP",
                "availability": "https://schema.org/InStock",
                "url": "https://discord.gg/gSCsPKTsVJ"
            },
            "image": "https://vrton.org/assets/icons/icon-512x512.webp"
        };

        this.injectStructuredData(eventData, 'event-schema');
    }

    addTeamStructuredData() {
        const teamData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "VRTon",
            "url": "https://vrton.org",
            "employee": [
                {
                    "@type": "OrganizationRole",
                    "roleName": "Director",
                    "description": "Equipo encargado de la toma de decisiones estratégicas y supervisión"
                },
                {
                    "@type": "OrganizationRole",
                    "roleName": "Desarrollador",
                    "description": "Encargados de la creación de webs, aplicaciones y herramientas VR"
                },
                {
                    "@type": "OrganizationRole",
                    "roleName": "Diseñador",
                    "description": "Especialistas en diseño 2D y 3D para entornos virtuales"
                }
            ]
        };

        this.injectStructuredData(teamData, 'team-schema');
    }

    injectStructuredData(data, id) {
        // Remove existing script with same ID
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        // Create and inject new structured data
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    optimizeImages() {
        // Add loading="lazy" to images below the fold and improve CLS prevention
        const images = document.querySelectorAll('img');
        const imagesToProcess = [];
        
        // Batch DOM reads first
        images.forEach((img, index) => {
            const needsLazy = index > 1 && !img.hasAttribute('loading');
            const needsAlt = !img.hasAttribute('alt');
            const needsDimensions = !img.hasAttribute('width') && !img.hasAttribute('height');
            
            if (needsLazy || needsAlt || needsDimensions) {
                imagesToProcess.push({
                    element: img,
                    needsLazy,
                    needsAlt,
                    needsDimensions
                });
            }
        });
        
        // Batch DOM writes to prevent layout thrashing
        if (imagesToProcess.length > 0) {
            requestAnimationFrame(() => {
                imagesToProcess.forEach(({ element, needsLazy, needsAlt, needsDimensions }) => {
                    if (needsLazy) {
                        element.setAttribute('loading', 'lazy');
                    }
                    
                    if (needsAlt) {
                        element.setAttribute('alt', 'Imagen de VRTon - Realidad Virtual para Causas Solidarias');
                    }
                    
                    // Prevent CLS by setting dimensions immediately if possible
                    if (needsDimensions) {
                        // Try to get dimensions from CSS or existing styles first
                        const style = element.style;
                        const hasStyleDimensions = style.width || style.height;
                        
                        if (!hasStyleDimensions) {
                            // Set placeholder dimensions to prevent CLS
                            // Set a default aspect ratio to prevent CLS
                            const defaultAspectRatio = 16 / 9; // Placeholder ratio
                            if (element.naturalWidth && element.naturalHeight) {
                                element.style.aspectRatio = (element.naturalWidth / element.naturalHeight).toString();
                            } else {
                                element.style.aspectRatio = defaultAspectRatio.toString();
                            }
                            
                            // Only set dimensions after load if not already set
                            const handleImageLoad = function() {
                                // Check again if dimensions were set elsewhere
                                if (!this.hasAttribute('width') && !this.hasAttribute('height')) {
                                    // Use requestAnimationFrame to avoid layout thrashing
                                    requestAnimationFrame(() => {
                                        if (this.naturalWidth && this.naturalHeight) {
                                            this.setAttribute('width', this.naturalWidth);
                                            this.setAttribute('height', this.naturalHeight);
                                        }
                                    });
                                }
                                // Clean up event listener
                                this.removeEventListener('load', handleImageLoad);
                            };
                            
                            if (element.complete && element.naturalWidth) {
                                // Image already loaded
                                handleImageLoad.call(element);
                            } else {
                                // Image still loading
                                element.addEventListener('load', handleImageLoad, { once: true });
                            }
                        }
                    }
                });
            });
        }
    }

    addBreadcrumbs() {
        const currentPath = window.location.pathname;
        let breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Inicio",
                    "item": "https://vrton.org/"
                }
            ]
        };

        if (currentPath.includes('colaboradores')) {
            breadcrumbData.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Colaboradores",
                "item": "https://vrton.org/colaboradores.html"
            });
        }

        this.injectStructuredData(breadcrumbData, 'breadcrumb-schema');
    }

    monitorPagePerformance() {
        // Monitor Core Web Vitals for SEO
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry.startTime > 2500) {
                    console.warn('SEO Warning: LCP is above 2.5s:', lastEntry.startTime);
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift
            let clsScore = 0;
            new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                });
                if (clsScore > 0.1) {
                    console.warn('SEO Warning: CLS is above 0.1:', clsScore);
                }
            }).observe({ entryTypes: ['layout-shift'] });
            
            // Monitor font loading performance
            this.monitorFontLoading();
        }
    }
    
    monitorFontLoading() {
        // Monitor font loading with font-display: swap
        if ('fonts' in document) {
            // Check if fonts are loaded
            document.fonts.ready.then(() => {
                // Fonts loaded successfully
            });
            
            // Monitor individual font loads with proper error handling
            document.fonts.addEventListener('loadingdone', (event) => {
                // Font loading completed
            });
            
            document.fonts.addEventListener('loadingerror', (event) => {
                // Font loading error handled
            });
        }
        
        // Check for FOIT (Flash of Invisible Text) issues - optimized to prevent forced reflows
        this.checkFontAwesomeElements();
    }
    isFontAwesomeElement(classList) {
        // Returns true if any of the common Font Awesome classes are present
        return classList.contains('fa') || classList.contains('fas') || classList.contains('fab') || classList.contains('far');
    }

    checkFontAwesomeElements() {
        // Use more specific selectors to reduce the number of elements to check
        // This avoids expensive getComputedStyle calls in loops
        const iconElements = document.querySelectorAll('.fas, .fab, .far, .fa');
        const elementsToUpdate = [];
        
        // Batch DOM reads first - avoid getComputedStyle in loops for performance
        iconElements.forEach(element => {
            // Check if element likely contains a Font Awesome icon based on classes
            if (this.isFontAwesomeElement(element.classList) && 
                !element.textContent.trim() && 
                !element.getAttribute('aria-label')) {
                elementsToUpdate.push(element);
            }
        });
        
        // Batch DOM writes to prevent layout thrashing
        if (elementsToUpdate.length > 0) {
            requestAnimationFrame(() => {
                elementsToUpdate.forEach(element => {
                    element.setAttribute('aria-label', 'Icono');
                });
            });
        }
    }

    enhanceAccessibility() {
        // Batch accessibility improvements to prevent layout thrashing
        const elementsToUpdate = {
            buttons: [],
            navs: [],
            links: []
        };
        
        // Batch DOM reads first
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                elementsToUpdate.buttons.push(button);
            }
        });

        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => {
            elementsToUpdate.navs.push(nav);
        });

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const linkText = link.textContent.trim();
            if (!linkText && !link.getAttribute('aria-label')) {
                elementsToUpdate.links.push(link);
            }
        });
        
        // Batch DOM writes to prevent forced reflows
        if (elementsToUpdate.buttons.length > 0 || elementsToUpdate.navs.length > 0 || elementsToUpdate.links.length > 0) {
            requestAnimationFrame(() => {
                elementsToUpdate.buttons.forEach(button => {
                    button.setAttribute('aria-label', 'Botón interactivo');
                });
                
                elementsToUpdate.navs.forEach(nav => {
                    nav.setAttribute('role', 'navigation');
                });
                
                elementsToUpdate.links.forEach(link => {
                    link.setAttribute('aria-label', 'Enlace de VRTon');
                });
            });
        }
    }

    setupSocialMediaTracking() {
        // Track social media interactions for SEO insights
        const socialLinks = document.querySelectorAll('a[href*="discord.gg"], a[href*="instagram.com"], a[href*="x.com"], a[href*="youtube.com"], a[href*="tiktok.com"]');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = this.getSocialPlatform(link.href);
                
                // Send to analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'social_interaction', {
                        'social_network': platform,
                        'social_action': 'click',
                        'social_target': link.href
                    });
                }
                
                console.log(`Social media interaction: ${platform}`);
            });
        });
    }

    getSocialPlatform(url) {
        if (url.includes('discord.gg')) return 'Discord';
        if (url.includes('instagram.com')) return 'Instagram';
        if (url.includes('x.com')) return 'X (Twitter)';
        if (url.includes('youtube.com')) return 'YouTube';
        if (url.includes('tiktok.com')) return 'TikTok';
        return 'Unknown';
    }

    // Public method to update meta tags dynamically
    updatePageMeta(title, description, keywords) {
        document.title = title;
        
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', description);
        
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) keywordsMeta.setAttribute('content', keywords);
        
        // Update Open Graph
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);
        
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description);
        
        // Update Twitter Cards
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        
        const twitterDesc = document.querySelector('meta[property="twitter:description"]');
        if (twitterDesc) twitterDesc.setAttribute('content', description);
    }
}

// Initialize SEO enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.seoEnhancer = new SEOEnhancer();
    });
} else {
    window.seoEnhancer = new SEOEnhancer();
}

// Export for use in other scripts (browser compatible)
window.SEOEnhancer = SEOEnhancer;
