
document.addEventListener('DOMContentLoaded', () => {
    let scheduleData = null;
    let translations = null;
    let currentTimeInterval = null;

    const SLOT_MINUTES = 30; // cada fila = 30 minutos
    let activeSectionId = 'all';
    let activeViewMode = 'full'; // full | main | secondary

    // Estilo de fondo VRTon
    document.body.classList.add('vrton-body');

    async function loadData() {
        try {
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('schedule-data-start');
            }

            const scheduleResponse = await fetch('/data/schedule.json');
            if (!scheduleResponse.ok) {
                throw new Error('No se pudo cargar el archivo de itinerario');
            }
            scheduleData = await scheduleResponse.json();

            await loadTranslations();

            if (window.performanceMonitor) {
                window.performanceMonitor.mark('schedule-data-loaded');
            }

            setupLanguageChangeListener();
            setupFiltersUI();
            renderSchedule();

        } catch (error) {
            console.error('Error al cargar datos del itinerario:', error);
            showError();
        }
    }

    async function loadTranslations() {
        if (window.ModularTranslations) {
            translations = await window.ModularTranslations.loadTranslations(['common', 'pages/schedule']);
        } else if (window.translationSystem) {
            translations = await window.translationSystem.loadTranslations(['common', 'pages/schedule']);
        } else {
            console.warn('Sistema de traducciones no disponible');
            translations = {};
        }
    }

    function setupLanguageChangeListener() {
        const translationSystem = window.ModularTranslations || window.translationSystem;
        if (translationSystem && translationSystem.onLanguageChange) {
            translationSystem.onLanguageChange(async () => {
                await loadTranslations();
                setupFiltersUI();
                renderSchedule();
            });
        }

        window.addEventListener('languageChanged', async () => {
            await loadTranslations();
            setupFiltersUI();
            renderSchedule();
        });
    }

    function hideLoading() {
        const loadingElement = document.getElementById('schedule-loading');
        const tableElement = document.getElementById('schedule-table');
        const toolbar = document.getElementById('schedule-toolbar');

        if (loadingElement) loadingElement.style.display = 'none';
        if (tableElement) tableElement.style.display = 'block';
        if (toolbar) toolbar.style.display = 'flex';

        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    }

    function showCurrentTime() {
        const currentTimeElement = document.getElementById('current-time-indicator');
        const currentTimeDisplay = document.getElementById('current-time-display');

        if (currentTimeElement && currentTimeDisplay && scheduleData?.schedule?.timezone) {
            currentTimeElement.style.display = 'block';
            updateCurrentTimeDisplay();
        }
    }

    function updateCurrentTimeDisplay() {
        const now = new Date();
        const timeZone = scheduleData?.schedule?.timezone || 'America/Santiago';

        const timeString = now.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone
        });

        const currentTimeDisplay = document.getElementById('current-time-display');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = timeString;
        }
    }

    function setupFiltersUI() {
        if (!scheduleData?.schedule) return;

        const { sections } = scheduleData.schedule;
        const sectionFilter = document.getElementById('section-filter');

        if (!sectionFilter) return;

        const allLabel =
            getTranslation('schedule.filters.all_sections') ||
            'Todas las secciones';

        let optionsHtml = `<option value="all">${allLabel}</option>`;

        sections.forEach(section => {
            const name = getTranslation(section.name_key) || section.name_key;
            optionsHtml += `<option value="${section.id}">${name}</option>`;
        });

        sectionFilter.innerHTML = optionsHtml;
        sectionFilter.value = activeSectionId;

        sectionFilter.onchange = () => {
            activeSectionId = sectionFilter.value || 'all';
            renderSchedule(true);
        };

        // Botones de vista
        const chipButtons = document.querySelectorAll('.chip-button');
        chipButtons.forEach(btn => {
            btn.onclick = () => {
                const mode = btn.getAttribute('data-view-mode');
                if (!mode) return;
                activeViewMode = mode;

                chipButtons.forEach(b => b.classList.remove('chip-button-active'));
                btn.classList.add('chip-button-active');

                renderSchedule(true);
            };
        });
    }

    function renderSchedule(fromFilter = false) {
        if (!scheduleData || !translations) return;

        hideLoading();
        showCurrentTime();
        renderScheduleGrid();
        startCurrentTimeTracking();

        if (!fromFilter) {
            scrollToCurrentTime();
        }
    }

    function getTimeSlots() {
        const { event_start, event_end, sections } = scheduleData.schedule;

        let startTime = new Date(event_start);
        let endTime = new Date(event_end);

        
        if (activeSectionId !== 'all') {
            const section = sections.find(s => s.id === activeSectionId);
            if (section) {
                startTime = new Date(section.start_datetime);
                endTime = new Date(section.end_datetime);

                
                if (section.name_key === "schedule.sections.closing") {
                    startTime.setHours(startTime.getHours() - 1);  
                    endTime.setHours(endTime.getHours() + 1);      
                }
            }
        }

        
        startTime.setSeconds(0, 0);
        endTime.setSeconds(0, 0);

    
        const slots = [];
        const current = new Date(startTime);

        
        while (current <= endTime) {
            slots.push(new Date(current));
            current.setMinutes(current.getMinutes() + SLOT_MINUTES);
        }

        return { slots, startTime, endTime };
    }


    function renderScheduleGrid() {
    const grid = document.getElementById('schedule-grid');
    if (!grid || !scheduleData?.schedule) return;

    const { main_activities, secondary_activities, sections } = scheduleData.schedule;
    const { slots, startTime, endTime } = getTimeSlots();
    const firstSlot = slots[0];

    let html = '';

    // Fondo de filas
    slots.forEach((slot, index) => {
        const row = index + 1;
        html += `<div class="time-row-bg" data-row="${row}" style="grid-row:${row};"></div>`;
    });

    // Secciones (columna 1)
    let activeSections = sections;

    if (activeSectionId !== 'all') {
        activeSections = sections.filter(s => s.id === activeSectionId);

        
        const section = sections.find(s => s.id === activeSectionId);
        if (section && section.name_key === "schedule.sections.closing") {
            
            const prevSection = sections.find(s => s.end_datetime === section.start_datetime);
            
            const nextSection = sections.find(s => s.start_datetime === section.end_datetime);

            
            if (prevSection) activeSections.unshift(prevSection);
            if (nextSection) activeSections.push(nextSection);
        }
    }

    let lastEndIndex = 0; 

    activeSections.forEach(section => {
        const sectionStart = new Date(section.start_datetime);
        const sectionEnd = new Date(section.end_datetime);

        if (sectionEnd < startTime || sectionStart > endTime) return;  

        
        let startIndex = Math.floor((sectionStart - firstSlot) / (SLOT_MINUTES * 60000));
        if (startIndex < 0) startIndex = 0;

        
        if (startIndex < lastEndIndex) {
            startIndex = lastEndIndex;
        }

        
        let endIndex = Math.ceil((sectionEnd - firstSlot) / (SLOT_MINUTES * 60000));
        if (endIndex > slots.length - 1) endIndex = slots.length - 1;

        const span = Math.max(1, endIndex - startIndex);
        const row = startIndex + 1;

        const name = getTranslation(section.name_key) || section.name_key;
        const bg = section.background_color || '#e30613';

        lastEndIndex = endIndex; 

        html += `
            <div class="section-cell"
                 style="grid-row:${row} / span ${span}; background:${bg};">
                <span class="section-label-text">${name}</span>
            </div>
        `;
    });

    // Función para añadir las actividades principales y secundarias
    function addActivities(list, isMainColumn) {
        if (!list) return;

        list.forEach(activity => {
            const activityStart = new Date(`${activity.date}T${activity.time}:00-03:00`);
            const activityEnd = new Date(activityStart.getTime() + (activity.duration || 60) * 60000);

            if (activityEnd < startTime || activityStart > endTime) return; 

            // Filtro por vista
            if (activeViewMode === 'main' && !isMainColumn) return;
            if (activeViewMode === 'secondary' && isMainColumn) return;

            
            const diffStartMin = (activityStart - firstSlot) / 60000;

           
            let startIndex = Math.floor(diffStartMin / SLOT_MINUTES);
            if (startIndex < 0) startIndex = 0;

          
            if (startIndex < lastEndIndex) {
                startIndex = lastEndIndex; 
            }

            const rawDuration = activity.duration || 60;
            let durationSlots = Math.max(1, Math.ceil(rawDuration / SLOT_MINUTES) + 1);  

            
            const maxPossibleSpan = slots.length - startIndex;
            const span = Math.min(durationSlots, maxPossibleSpan);

           
            const row = startIndex + 1;

            const columnClass = isMainColumn ? 'activity-slot-main' : 'activity-slot-secondary';
            const columnIndex = isMainColumn ? 3 : 4;

            const cardHtml = generateActivityCard(activity);

            html += `
                <div class="activity-slot ${columnClass}"
                     style="grid-row:${row} / span ${span}; grid-column:${columnIndex};">
                    ${cardHtml}
                </div>
            `;
        });
    }

        // Función para añadir las actividades principales y secundarias
        function addActivities(list, isMainColumn) {
            if (!list) return;

            list.forEach(activity => {
                const activityStart = new Date(`${activity.date}T${activity.time}:00-03:00`);
                const activityEnd = new Date(activityStart.getTime() + (activity.duration || 60) * 60000);

                if (activityEnd < startTime || activityStart > endTime) return;  

                // Filtro por vista
                if (activeViewMode === 'main' && !isMainColumn) return;
                if (activeViewMode === 'secondary' && isMainColumn) return;

                
                const diffStartMin = (activityStart - firstSlot) / 60000;

                let startIndex = Math.floor(diffStartMin / SLOT_MINUTES);
                if (startIndex < 0) startIndex = 0;

                if (startIndex < lastEndIndex) {
                    startIndex = lastEndIndex;  
                }

                const rawDuration = activity.duration || 60;
                let durationSlots = Math.max(1, Math.ceil(rawDuration / SLOT_MINUTES) + 1);

            
                const maxPossibleSpan = slots.length - startIndex;
                const span = Math.min(durationSlots, maxPossibleSpan);

            
                const row = startIndex + 1;

                const columnClass = isMainColumn ? 'activity-slot-main' : 'activity-slot-secondary';
                const columnIndex = isMainColumn ? 3 : 4;

                const cardHtml = generateActivityCard(activity);

                html += `
                    <div class="activity-slot ${columnClass}"
                        style="grid-row:${row} / span ${span}; grid-column:${columnIndex};">
                        ${cardHtml}
                    </div>
                `;
            });
        }


        // Columna de horas (columna 2)
        slots.forEach((slot, index) => {
            const row = index + 1;
            const timeStr = slot.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: scheduleData.schedule.timezone || 'America/Santiago'
            });

            html += `
                <div class="time-cell"
                     data-row="${row}"
                     data-time="${slot.toISOString()}"
                     style="grid-row:${row};">
                    ${timeStr}
                </div>
            `;
        });

        // Función para preparar actividades
        function addActivities(list, isMainColumn) {
            if (!list) return;

            list.forEach(activity => {
                const activityStart = new Date(`${activity.date}T${activity.time}:00-03:00`);
                const activityEnd = new Date(activityStart.getTime() + (activity.duration || 60) * 60000);

                if (activityEnd < startTime || activityStart > endTime) return;

                // Filtro por vista
                if (activeViewMode === 'main' && !isMainColumn) return;
                if (activeViewMode === 'secondary' && isMainColumn) return;

                const diffStartMin = (activityStart - firstSlot) / 60000;

                let startIndex = Math.floor(diffStartMin / SLOT_MINUTES);
                if (startIndex < 0) startIndex = 0;


                const rawDuration = activity.duration || 60;
                let durationSlots = Math.max(1, Math.ceil(rawDuration / SLOT_MINUTES) + 1);

                const maxPossibleSpan = slots.length - startIndex;
                const span = Math.min(durationSlots, maxPossibleSpan);


                const row = startIndex + 1;

                const columnClass = isMainColumn ? 'activity-slot-main' : 'activity-slot-secondary';
                const columnIndex = isMainColumn ? 3 : 4;

                const cardHtml = generateActivityCard(activity);

                html += `
                    <div class="activity-slot ${columnClass}"
                        style="grid-row:${row} / span ${span}; grid-column:${columnIndex};">
                        ${cardHtml}
                    </div>
                `;
            });
        }

        let currentTimeLineElement = document.getElementById('current-time-line');

        function updateCurrentTimeLine() {

            const now = new Date();


            const firstSlotTime = new Date(scheduleData.schedule.event_start);


            const timeDiffInMinutes = (now - firstSlotTime) / (1000 * 60);


            if (timeDiffInMinutes < 0) {
                currentTimeLineElement.style.transform = 'translateY(0)';
                return;
            }

            const totalEventDuration = (new Date(scheduleData.schedule.event_end) - firstSlotTime) / (1000 * 60);
            const percentageOfTimePassed = (timeDiffInMinutes / totalEventDuration) * 100;

            currentTimeLineElement.style.transform = `translateY(${percentageOfTimePassed}%)`;
        }


        setInterval(updateCurrentTimeLine, 60000);

        updateCurrentTimeLine();

        addActivities(main_activities, true);
        addActivities(secondary_activities, false);

        grid.innerHTML = html;

        updateCurrentTimeHighlight();
    }

    function isNearCurrentTime(slotTime, now) {
        const diffMs = Math.abs(slotTime.getTime() - now.getTime());
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes <= SLOT_MINUTES / 2;
    }

    function generateActivityCard(activity) {
        const nameKey = `schedule.activities.${activity.id}.name`;
        const descriptionKey = `schedule.activities.${activity.id}.description`;

        const name = getTranslation(nameKey) || activity.id;
        const description = getTranslation(descriptionKey) || '';
        const duration = activity.duration || 60;
        const isSpecial = activity.is_special || false;

        const durationText =
            getTranslation('schedule.duration')?.replace('{{minutes}}', duration) ||
            `Duración: ${duration} minutos`;

        const specialEventText =
            getTranslation('schedule.special_event') ||
            'Evento Especial';

        return `
            <div class="activity-card ${isSpecial ? 'special' : ''}"
                 data-activity-id="${activity.id}"
                 data-duration="${duration}">
                <h4>${name}</h4>
                ${description ? `<p>${description}</p>` : ''}
                <div class="activity-meta">
                    <div class="activity-duration">${durationText}</div>
                    ${isSpecial ? `
                        <span class="special-badge">
                            <i class="fas fa-star"></i> ${specialEventText}
                        </span>` : ''
                    }
                </div>
            </div>
        `;
    }

    function getTranslation(key) {
        if (!translations || !key) return null;

        const translationSystem = window.ModularTranslations || window.translationSystem;
        if (translationSystem && translationSystem.getNestedValue) {
            const value = translationSystem.getNestedValue(translations, key);
            return value || null;
        }

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

    function startCurrentTimeTracking() {
        if (currentTimeInterval) {
            clearInterval(currentTimeInterval);
        }

        currentTimeInterval = setInterval(() => {
            updateCurrentTimeDisplay();
            updateCurrentTimeHighlight();
        }, 60000);
    }

    function updateCurrentTimeHighlight() {
        const timeCells = document.querySelectorAll('.time-cell');
        const rowBgs = document.querySelectorAll('.time-row-bg');
        const now = new Date();

        timeCells.forEach(cell => {
            const timeStr = cell.dataset.time;
            const row = cell.dataset.row;
            if (!timeStr || !row) return;

            const slotTime = new Date(timeStr);
            const near = isNearCurrentTime(slotTime, now);

            if (near) {
                cell.classList.add('current-time');
                const bg = document.querySelector(`.time-row-bg[data-row="${row}"]`);
                if (bg) bg.classList.add('current-time-row');
            } else {
                cell.classList.remove('current-time');
                const bg = document.querySelector(`.time-row-bg[data-row="${row}"]`);
                if (bg) bg.classList.remove('current-time-row');
            }
        });
    }

    function scrollToCurrentTime() {
        setTimeout(() => {
            const wrapper = document.querySelector('.schedule-grid-wrapper');
            const currentCell = document.querySelector('.time-cell.current-time');

            if (wrapper && currentCell) {
                const wrapperRect = wrapper.getBoundingClientRect();
                const cellRect = currentCell.getBoundingClientRect();

                const offset = cellRect.top - wrapperRect.top - wrapperRect.height / 2 + cellRect.height / 2;
                wrapper.scrollTo({
                    top: wrapper.scrollTop + offset,
                    behavior: 'smooth'
                });
            }
        }, 800);
    }

    function showError() {
        const container = document.getElementById('schedule-container');
        if (!container) return;

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

    window.addEventListener('beforeunload', () => {
        if (currentTimeInterval) {
            clearInterval(currentTimeInterval);
        }
    });

    // Estilos extra para error
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
            background: var(--secondary-color);
            transform: translateY(-2px);
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);

    // Init
    loadData();
});
