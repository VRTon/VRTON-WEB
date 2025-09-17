// Critical Request Chain Optimizer for VRTon
// This script optimizes the critical rendering path by managing resource loading priorities

class CriticalPathOptimizer {
    constructor() {
        this.criticalResources = new Set();
        this.loadingQueue = [];
        this.startTime = performance.now();
        this.init();
    }

    init() {
        this.identifyCriticalResources();
        this.optimizeCloudflareScripts();
        this.implementResourcePrioritization();
        this.monitorCriticalPath();
    }

    identifyCriticalResources() {
        // Define critical resources for VRTon
        this.criticalResources = new Set([
            'styles.min.css',
            'logo.webp',
            'loading.min.js',
            'performance.min.js',
            'seo-enhancer.min.js'
        ]);
    }

    optimizeCloudflareScripts() {
        // Defer Cloudflare Rocket Loader and email decode to prevent critical path blocking
        if (typeof window !== 'undefined') {
            // Disable automatic Cloudflare optimizations that interfere with critical path
            if (window.CloudflareApps && typeof window.CloudflareApps.deferRocketLoader !== 'undefined') {
                window.CloudflareApps.deferRocketLoader = true;
            } else {
                // Fallback: defer Cloudflare scripts manually
                document.addEventListener('DOMContentLoaded', () => {
                    const cfScripts = document.querySelectorAll('script[src*="cloudflare"]');
                    cfScripts.forEach(script => {
                        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                            script.setAttribute('defer', '');
                        }
                    });
                });
            }
            
            // Mark Cloudflare scripts as non-critical
            document.addEventListener('DOMContentLoaded', () => {
                const cfScripts = document.querySelectorAll('script[src*="cloudflare"]');
                cfScripts.forEach(script => {
                    if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                        script.setAttribute('defer', '');
                    }
                });
            });
        }
    }

    implementResourcePrioritization() {
        // Implement intelligent resource loading with strategic preconnects
        const resourceHints = {
            // Critical preconnects (limit to 4 as recommended)
            preconnect: [
                { href: 'https://flagcdn.com', crossorigin: true },
                { href: 'https://cdnjs.cloudflare.com', crossorigin: true }
            ],
            // Preload critical assets
            preload: [
                { href: '/assets/icons/logo.webp', as: 'image', type: 'image/webp', fetchpriority: 'high' },
                { href: 'https://flagcdn.com/w20/es.png', as: 'image', type: 'image/png' },
                { href: 'https://flagcdn.com/w20/us.png', as: 'image', type: 'image/png' },
                { href: '/assets/css/styles.min.css', as: 'style' },
                { href: '/scripts/loading.min.js', as: 'script' }
            ],
            // Prefetch non-critical but important assets
            prefetch: [
                // Video prefetch removed - handled by video-optimizer.js for smart loading
                { href: '/scripts/i18n-v3.js', as: 'script' }
            ]
        };

        // Apply resource hints dynamically if not already present
        Object.entries(resourceHints).forEach(([type, resources]) => {
            resources.forEach(resource => {
                const existingLink = document.querySelector(`link[rel="${type}"][href="${resource.href}"]`);
                if (!existingLink) {
                    const link = document.createElement('link');
                    link.rel = type;
                    link.href = resource.href;
                    if (resource.as) link.as = resource.as;
                    if (resource.type) link.type = resource.type;
                    if (resource.crossorigin) link.crossOrigin = 'anonymous';
                    if (resource.fetchpriority) link.fetchPriority = resource.fetchpriority;
                    document.head.appendChild(link);
                }
            });
        });

        // Monitor preconnect effectiveness
        this.monitorPreconnectPerformance();
    }

    monitorPreconnectPerformance() {
        // Track connection timing for preconnected origins
        const preconnectedOrigins = [
            'https://flagcdn.com',
            'https://cdnjs.cloudflare.com'
        ];

        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    const origin = new URL(entry.name).origin;
                    
                    if (preconnectedOrigins.includes(origin)) {
                        const connectTime = entry.connectEnd - entry.connectStart;
                        const dnsTime = entry.domainLookupEnd - entry.domainLookupStart;
                        
                        console.log(`🔗 Preconnected resource: ${entry.name}`, {
                            connectTime: `${connectTime.toFixed(2)}ms`,
                            dnsTime: `${dnsTime.toFixed(2)}ms`,
                            totalTime: `${entry.duration.toFixed(2)}ms`,
                            savedTime: connectTime < 50 ? '✅ Fast connection' : '⚠️ Slow connection'
                        });

                        // Track flagcdn.com specifically (80ms LCP savings potential)
                        if (origin === 'https://flagcdn.com') {
                            const savings = Math.max(0, 80 - connectTime);
                            console.log(`🏁 flagcdn.com performance: ${savings.toFixed(2)}ms saved (target: 80ms)`);
                        }
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    monitorCriticalPath() {
        // Monitor critical path performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.analyzeResourceTiming(entry);
                });
            });
            
            observer.observe({ entryTypes: ['resource', 'navigation'] });
        }

        // Report critical path metrics
        window.addEventListener('load', () => {
            setTimeout(() => this.reportCriticalPathMetrics(), 1000);
        });
    }

    analyzeResourceTiming(entry) {
        const resourceName = entry.name.split('/').pop();
        
        // Check if this is a critical resource
        const isCritical = Array.from(this.criticalResources).some(critical => 
            entry.name.includes(critical)
        );

        if (isCritical) {
            const timing = {
                name: resourceName,
                duration: entry.duration,
                startTime: entry.startTime,
                size: entry.transferSize || entry.encodedBodySize || 0,
                critical: true
            };

            // Warn about slow critical resources
            if (entry.duration > 200) {
                console.warn(`🚨 Critical resource slow: ${resourceName} (${entry.duration.toFixed(2)}ms)`);
            }

            this.logResourceTiming(timing);
        }

        // Track Cloudflare scripts specifically
        if (entry.name.includes('cloudflare') || entry.name.includes('rocket-loader')) {
            console.log(`☁️ Cloudflare resource: ${resourceName} - ${entry.duration.toFixed(2)}ms`);
        }
    }

    logResourceTiming(timing) {
        if (window.PerformanceMonitor && window.PerformanceMonitor.debug) {
            console.log(`📊 Critical Resource: ${timing.name}`, {
                duration: `${timing.duration.toFixed(2)}ms`,
                size: `${(timing.size / 1024).toFixed(1)}KB`,
                startTime: `${timing.startTime.toFixed(2)}ms`
            });
        }
    }

    reportCriticalPathMetrics() {
        const totalTime = performance.now() - this.startTime;
        
        if (window.PerformanceMonitor && window.PerformanceMonitor.debug) {
            console.group('🛣️ Critical Path Report');
            console.log(`Total critical path time: ${totalTime.toFixed(2)}ms`);
            
            // Analyze navigation timing
            if (performance.navigation) {
                const nav = performance.getEntriesByType('navigation')[0];
                if (nav) {
                    console.log(`DOM Content Loaded: ${nav.domContentLoadedEventEnd.toFixed(2)}ms`);
                    console.log(`Load Complete: ${nav.loadEventEnd.toFixed(2)}ms`);
                    console.log(`First Paint: ${nav.responseEnd.toFixed(2)}ms`);
                }
            }
            
            console.groupEnd();
        }

        // Send metrics to analytics if available
        if (typeof gtag === 'function') {
            gtag('event', 'critical_path_timing', {
                'custom_map': {
                    'metric1': 'critical_path_duration'
                },
                'critical_path_duration': Math.round(totalTime)
            });
        }
    }

    // Public method to manually mark resources as critical
    markAsCritical(resourcePath) {
        this.criticalResources.add(resourcePath);
    }

    // Public method to get current critical path metrics
    getCriticalPathMetrics() {
        return {
            criticalResources: Array.from(this.criticalResources),
            totalTime: performance.now() - this.startTime,
            loadingQueue: this.loadingQueue
        };
    }
}

// Initialize critical path optimizer
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.criticalPathOptimizer = new CriticalPathOptimizer();
    });
}

// Export for use in other scripts (browser compatible)
window.CriticalPathOptimizer = CriticalPathOptimizer;
