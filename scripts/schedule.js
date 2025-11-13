// Schedule page JavaScript - VRTon Style
document.addEventListener('DOMContentLoaded', () => {
    let scheduleData = null;
    let translations = null;
    let currentTimeInterval = null;

    // Apply VRTon body style
    document.body.classList.add('vrton-body');

    // Load schedule data and translations
    async function loadData() {
        try {
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('schedule-data-start');
            }

            // Load schedule data
            const scheduleResponse = await fetch('/data/schedule.json');
            if (!scheduleResponse.ok) {
                throw new Error('No se pudo cargar el archivo de itinerario');
            }
            scheduleData = await scheduleResponse.json();

            await loadTranslations();

            if (window.performanceMonitor) {
                window.performanceMonitor.mark('schedule-data-loaded');
            }

            renderSchedule();
        } catch (error) {
            console.error('Error al cargar datos del itinerario:', error);
            showError();
        }
    }

    // Load or reload translations
    async function loadTranslations() {
        // Use global translation system if available
        if (window.ModularTranslations) {
            translations = await window.ModularTranslations.loadTranslations(['common', 'pages/schedule']);
        } else if (window.translationSystem) {
            translations = await window.translationSystem.loadTranslations(['common', 'pages/schedule']);
        } else {
            console.warn('Global translation system not available, translations may not work');
            translations = {};
        }
    }

    // Listen for language changes
    function setupLanguageChangeListener() {
        const translationSystem = window.ModularTranslations || window.translationSystem;
        if (translationSystem && translationSystem.onLanguageChange) {
            translationSystem.onLanguageChange(async (newLanguage) => {
                console.log(`Language changed to ${newLanguage}, reloading schedule...`);
                await loadTranslations();
                renderSchedule();
            });
        }

        // Also listen for custom language change events
        window.addEventListener('languageChanged', async (event) => {
            console.log(`Language changed event received: ${event.detail?.language}`);
            await loadTranslations();
            renderSchedule();
        });
    }

    // Render the complete schedule
    function renderSchedule() {
        if (!scheduleData || !translations) return;

        hideLoading();
        showCurrentTime();
        generateTimeBlocks();
        startCurrentTimeTracking();
        scrollToCurrentTime();

        if (window.performanceMonitor) {
            window.performanceMonitor.mark('schedule-rendered');
        }
    }

    // Hide loading screen
    function hideLoading() {
        const loadingElement = document.getElementById('schedule-loading');
        const tableElement = document.getElementById('schedule-table');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (tableElement) {
            tableElement.style.display = 'block';
        }

        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }

    // Show current time indicator
    function showCurrentTime() {
        const currentTimeElement = document.getElementById('current-time-indicator');
        const currentTimeDisplay = document.getElementById('current-time-display');
        
        if (currentTimeElement && currentTimeDisplay) {
            currentTimeElement.style.display = 'block';
            updateCurrentTimeDisplay();
        }
    }

    // Update current time display
    function updateCurrentTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: scheduleData.schedule.timezone
        });
        
        const currentTimeDisplay = document.getElementById('current-time-display');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = timeString;
        }
    }

    // Generate time blocks and activities
    function generateTimeBlocks() {
        const scheduleContent = document.getElementById('schedule-content');
        if (!scheduleContent) return;

        const { event_start, event_end, main_activities, secondary_activities, sections } = scheduleData.schedule;
        
        // Parse start and end times
        const startTime = new Date(event_start);
        const endTime = new Date(event_end);
        
        // Generate hourly time blocks
        const timeBlocks = [];
        let currentTime = new Date(startTime);
        currentTime.setMinutes(0, 0, 0); // Round to nearest hour
        
        console.log('Event start:', startTime);
        console.log('Event end:', endTime);
        
        while (currentTime <= endTime) {
            timeBlocks.push(new Date(currentTime));
            console.log('Generated time block:', currentTime.toISOString());
            currentTime.setHours(currentTime.getHours() + 1);
        }

        // Create simple activity placement maps
        const mainActivityPlacements = new Map(); // key: "date_time", value: activity
        const secondaryActivityPlacements = new Map(); // key: "date_time", value: activity
        
        // Process main activities
        if (main_activities) {
            main_activities.forEach(activity => {
                // Create activity date with proper timezone consideration
                const activityStart = new Date(`${activity.date}T${activity.time}:00-03:00`);
                
                // Find the matching time block
                const matchingBlock = timeBlocks.find(block => {
                    const blockDate = block.toISOString().split('T')[0];
                    const activityDate = activityStart.toISOString().split('T')[0];
                    const blockHour = block.getHours();
                    const activityHour = activityStart.getHours();
                    
                    return blockDate === activityDate && blockHour === activityHour;
                });
                
                if (matchingBlock) {
                    const slotDate = matchingBlock.toISOString().split('T')[0];
                    const slotTime = String(matchingBlock.getHours()).padStart(2, '0') + ':' + 
                                   String(matchingBlock.getMinutes()).padStart(2, '0');
                    const slotKey = `${slotDate}_${slotTime}`;
                    
                    mainActivityPlacements.set(slotKey, activity);
                    console.log(`Placed main activity ${activity.id} at ${slotKey}`);
                } else {
                    console.log(`No matching time block found for main activity ${activity.id}`);
                }
            });
        }
        
        // Process secondary activities
        if (secondary_activities) {
            secondary_activities.forEach(activity => {
                // Create activity date with proper timezone consideration
                const activityStart = new Date(`${activity.date}T${activity.time}:00-03:00`);
                
                // Find the matching time block
                const matchingBlock = timeBlocks.find(block => {
                    const blockDate = block.toISOString().split('T')[0];
                    const activityDate = activityStart.toISOString().split('T')[0];
                    const blockHour = block.getHours();
                    const activityHour = activityStart.getHours();
                    
                    return blockDate === activityDate && blockHour === activityHour;
                });
                
                if (matchingBlock) {
                    const slotDate = matchingBlock.toISOString().split('T')[0];
                    const slotTime = String(matchingBlock.getHours()).padStart(2, '0') + ':' + 
                                   String(matchingBlock.getMinutes()).padStart(2, '0');
                    const slotKey = `${slotDate}_${slotTime}`;
                    
                    secondaryActivityPlacements.set(slotKey, activity);
                    console.log(`Placed secondary activity ${activity.id} at ${slotKey}`);
                } else {
                    console.log(`No matching time block found for secondary activity ${activity.id}`);
                }
            });
        }

        console.log('Main activity placements:', Array.from(mainActivityPlacements.keys()));
        console.log('Secondary activity placements:', Array.from(secondaryActivityPlacements.keys()));

        // Calculate section spans
        const sectionSpans = new Map();
        sections.forEach(section => {
            const sectionStart = new Date(section.start_datetime);
            const sectionEnd = new Date(section.end_datetime);
            
            let startIndex = -1;
            let endIndex = -1;
            
            timeBlocks.forEach((block, index) => {
                if (block >= sectionStart && startIndex === -1) {
                    startIndex = index;
                }
                if (block <= sectionEnd) {
                    endIndex = index;
                }
            });
            
            if (startIndex !== -1 && endIndex !== -1) {
                const span = endIndex - startIndex + 1;
                sectionSpans.set(section.id, {
                    startIndex,
                    span,
                    section
                });
                console.log(`Section ${section.id} spans ${span} rows starting at index ${startIndex}`);
            }
        });

        // Generate HTML for time blocks
        let html = '';
        
        timeBlocks.forEach((timeBlock, index) => {
            const dateStr = timeBlock.toISOString().split('T')[0];
            // Use consistent time formatting
            const timeStr = String(timeBlock.getHours()).padStart(2, '0') + ':' + 
                           String(timeBlock.getMinutes()).padStart(2, '0');
            
            console.log(`Processing time block: ${dateStr} ${timeStr}`);
            
            // Check if this is the current time block
            const now = new Date();
            const isCurrentTime = isNearCurrentTime(timeBlock, now);
            
            // Find which section this block belongs to
            let currentSection = null;
            let isFirstRowOfSection = false;
            let sectionRowSpan = 1;
            
            for (const [sectionId, sectionData] of sectionSpans) {
                if (index >= sectionData.startIndex && index < sectionData.startIndex + sectionData.span) {
                    currentSection = sectionData.section;
                    isFirstRowOfSection = index === sectionData.startIndex;
                    sectionRowSpan = sectionData.span;
                    break;
                }
            }
            
            // Get activities for this time slot
            const slotKey = `${dateStr}_${timeStr}`;
            
            console.log(`Looking for activities with key: ${slotKey}`);
            
            const mainActivity = mainActivityPlacements.get(slotKey);
            const secondaryActivity = secondaryActivityPlacements.get(slotKey);
            
            html += `
                <div class="time-block ${isCurrentTime ? 'current-time' : ''}" 
                     data-time="${timeBlock.toISOString()}" 
                     data-section="${currentSection?.id || ''}"
                     data-section-start="${isFirstRowOfSection}"
                     data-section-span="${sectionRowSpan}"
                     ${currentSection ? `style="background-color: ${currentSection.background_color}15"` : ''}>
                    
                    <div class="section-cell" ${currentSection ? `style="background-color: ${currentSection.background_color}"` : ''}>
                        ${isFirstRowOfSection && currentSection ? 
                            `<div class="section-label-content" style="position: absolute; top: 0; left: 0; width: 100%; height: ${sectionRowSpan * 81}px;">
                                <span>${getTranslation(currentSection.name_key) || currentSection.name_key}</span>
                            </div>` : ''
                        }
                    </div>
                    
                    <div class="time-cell">
                        ${timeStr}
                    </div>
                    
                    <div class="activity-cell">
                        ${mainActivity ? generateActivityCard(mainActivity) : generateEmptyActivity()}
                    </div>
                    
                    <div class="activity-cell">
                        ${secondaryActivity ? generateActivityCard(secondaryActivity) : generateEmptyActivity()}
                    </div>
                </div>
            `;
        });
        
        scheduleContent.innerHTML = html;
    }

    // Check if time block is near current time (within 30 minutes)
    function isNearCurrentTime(timeBlock, now) {
        const diffMs = Math.abs(timeBlock.getTime() - now.getTime());
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes <= 30;
    }

    // Generate activity card HTML
    function generateActivityCard(activity) {
        // Calculate name and description keys based on activity ID
        const nameKey = `schedule.activities.${activity.id}.name`;
        const descriptionKey = `schedule.activities.${activity.id}.description`;
        
        const name = getTranslation(nameKey);
        const description = getTranslation(descriptionKey);
        
        const displayName = name || activity.id;
        const displayDescription = description || '';
        const duration = activity.duration;
        const isSpecial = activity.is_special || false;
        
        const durationText = getTranslation('schedule.duration')?.replace('{{minutes}}', duration) || `Duración: ${duration} minutos`;
        const specialEventText = getTranslation('schedule.special_event') || 'Evento Especial';
        
        return `
            <div class="activity-card ${isSpecial ? 'special' : ''}" 
                 data-activity-id="${activity.id}" 
                 data-duration="${duration}">
                <h4>${displayName}</h4>
                <p>${displayDescription}</p>
                <div class="activity-duration">${durationText}</div>
                ${isSpecial ? '<div class="special-badge"><i class="fas fa-star"></i> ' + specialEventText + '</div>' : ''}
            </div>
        `;
    }

    // Generate empty activity cell
    function generateEmptyActivity() {
        const noActivitiesText = getTranslation('schedule.no_activities') || 'Sin actividades programadas';
        return `
            <div class="no-activity">
                ${noActivitiesText}
            </div>
        `;
    }

    // Get translation by key
    function getTranslation(key) {
        if (!translations || !key) {
            return null;
        }
        
        // Use global translation system's getNestedValue if available
        const translationSystem = window.ModularTranslations || window.translationSystem;
        if (translationSystem && translationSystem.getNestedValue) {
            const value = translationSystem.getNestedValue(translations, key);
            return value || null;
        }
        
        // Fallback to manual navigation
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return typeof value === 'string' ? value : null;
    }

    // Start tracking current time
    function startCurrentTimeTracking() {
        // Update every minute
        currentTimeInterval = setInterval(() => {
            updateCurrentTimeDisplay();
            updateCurrentTimeHighlight();
        }, 60000);
    }

    // Update current time highlight in table
    function updateCurrentTimeHighlight() {
        const timeBlocks = document.querySelectorAll('.time-block');
        const now = new Date();
        
        timeBlocks.forEach(block => {
            const timeStr = block.dataset.time;
            if (timeStr) {
                const blockTime = new Date(timeStr);
                const isNear = isNearCurrentTime(blockTime, now);
                
                if (isNear) {
                    block.classList.add('current-time');
                } else {
                    block.classList.remove('current-time');
                }
            }
        });
    }

    // Scroll to current time on page load
    function scrollToCurrentTime() {
        setTimeout(() => {
            const currentTimeBlock = document.querySelector('.time-block.current-time');
            if (currentTimeBlock) {
                currentTimeBlock.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 1000);
    }

    // Show error message
    function showError() {
        const container = document.getElementById('schedule-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar el itinerario</h3>
                    <p>No se pudo cargar la información del evento. Por favor, recarga la página o inténtalo más tarde.</p>
                    <button onclick="location.reload()" class="reload-button">
                        <i class="fas fa-redo"></i> Recargar página
                    </button>
                </div>
            `;
        }
    }

    // Clean up intervals when page unloads
    window.addEventListener('beforeunload', () => {
        if (currentTimeInterval) {
            clearInterval(currentTimeInterval);
        }
    });

    // Initialize
    loadData();
    setupLanguageChangeListener();
});

// CSS for error message and special badge
const additionalStyles = `
    .error-message {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-color);
    }

    .error-message i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 20px;
        display: block;
    }

    .error-message h3 {
        margin: 20px 0;
        color: var(--text-color);
    }

    .error-message p {
        margin: 20px 0;
        color: var(--text-muted);
    }

    .reload-button {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .reload-button:hover {
        background: var(--accent-color);
        transform: translateY(-2px);
    }


`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);