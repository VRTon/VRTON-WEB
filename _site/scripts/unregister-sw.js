// Script to unregister service worker and clear cache
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

// Clear all caches
if ('caches' in window) {
    caches.keys().then(function(names) {
        Promise.all(names.map(function(name) {
            return caches.delete(name);
        })).catch(function(error) {
            console.error("Error deleting caches:", error);
        });
    });
}