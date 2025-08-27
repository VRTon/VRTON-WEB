// Script para la nueva página de equipos estilo Furality con colores VRTon
document.addEventListener('DOMContentLoaded', () => {
    let colaboradoresMap = null; // Directorio de todos los colaboradores
    let equiposList = null; // Lista de equipos

    // Aplicar estilo Furality al body
    document.body.classList.add('furality-body');

    // Cargar datos de equipos desde JSON
    async function cargarDatos() {
        try {
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('teams-data-start');
            }
            
            const response = await fetch('/data/equipos.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de equipos');
            }
            const data = await response.json();
            
            colaboradoresMap = data.colaboradores; // Guardamos el directorio de personas
            equiposList = data.equipos; // Guardamos la lista de equipos

            if (window.performanceMonitor) {
                window.performanceMonitor.mark('teams-data-loaded');
            }
            
            renderizarPagina();
        } catch (error) {
            console.error('Error al cargar equipos:', error);
            mostrarError();
        }
    }

    // Renderizar toda la página
    function renderizarPagina() {
        if (!equiposList || !colaboradoresMap) return;

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        if (window.onTeamsReady) {
            window.onTeamsReady();
        }

        renderizarNavegacion();
        renderizarEquipos();
        configurarNavegacion();
        
        if (window.performanceMonitor) {
            window.performanceMonitor.mark('teams-rendered');
        }
    }

    // Iconos para cada departamento
    const iconosDepartamentos = {
        'moderacion': 'fas fa-shield-alt',
        'desarrollo': 'fas fa-code',
        'audiovisuales': 'fas fa-video',
        'diseno': 'fas fa-palette',
        'marketing': 'fas fa-bullhorn',
        'mapmaking': 'fas fa-map',
        'eventos': 'fas fa-calendar-alt',
        'dj': 'fas fa-music',
        '3d': 'fas fa-cube'
    };

    // Función para manejar errores de imágenes con placeholder local
    function handleImageError(img, nombre, isLeader = false) {
        if (!img.src.includes('placeholder.webp')) {
            img.src = '/assets/colaboradores/placeholder.webp';
            img.onerror = function() {
                const iniciales = nombre.split(' ').map(n => n[0]).join('');
                const color = isLeader ? '#e30613' : '#fd5c63';
                const size = isLeader ? 60 : 50;
                if (window.LocalPlaceholder) {
                    const dataURL = window.LocalPlaceholder.generateDataURL(size, size, color, '#ffffff', iniciales);
                    this.src = dataURL;
                } else {
                    this.style.display = 'none';
                    const initialsDiv = document.createElement('div');
                    initialsDiv.style.cssText = `width: ${size}px; height: ${size}px; background: ${color}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${size * 0.4}px;`;
                    initialsDiv.textContent = iniciales;
                    this.parentNode.appendChild(initialsDiv);
                }
                this.onerror = null;
            };
        }
    }

    // Hacer función disponible globalmente
    window.handleImageError = handleImageError;

    // Generar botones de redes sociales
    function generarBotonesSociales(social) {
        if (!social) return '';
        const redes = [];
        if (social.discord && social.discord.trim() !== '') { redes.push(`<a href="${social.discord}" class="furality-social-btn" title="Discord" target="_blank" rel="noopener noreferrer"><i class="fab fa-discord"></i></a>`); }
        if (social.twitter && social.twitter.trim() !== '') { redes.push(`<a href="${social.twitter}" class="furality-social-btn" title="Twitter" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>`); }
        if (social.telegram && social.telegram.trim() !== '') { redes.push(`<a href="${social.telegram}" class="furality-social-btn" title="Telegram" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram"></i></a>`); }
        if (social.vrchat && social.vrchat.trim() !== '') { redes.push(`<a href="${social.vrchat}" class="furality-social-btn" title="VRChat" target="_blank" rel="noopener noreferrer"><i class="fas fa-vr-cardboard"></i></a>`); }
        if (social.instagram && social.instagram.trim() !== '') { redes.push(`<a href="${social.instagram}" class="furality-social-btn" title="Instagram" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>`); }
        return redes.join('');
    }

    // Renderizar navegación estilo Furality
    function renderizarNavegacion() {
        const navegacionContainer = document.getElementById('team-navigation');
        navegacionContainer.className = 'furality-nav';
        navegacionContainer.innerHTML = `
            <button id="toggle-filters-btn" class="furality-filter-toggle">
                <i class="fas fa-filter"></i>
                <span data-i18n="colaboradores.filter_button">Filtrar Departamentos</span>
            </button>
            <div class="furality-departments-wrapper">
                <h2 data-i18n="colaboradores.departments_title">Departamentos</h2>
                <div class="furality-departments">
                    ${equiposList.map(equipo => `
                        <a href="#team-${equipo.id}" class="furality-dept-btn" data-team="${equipo.id}">
                            <i class="${iconosDepartamentos[equipo.id] || 'fas fa-users'}"></i>
                            <span data-i18n="teams.${equipo.id}.name">${equipo.nombre}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        const toggleBtn = document.getElementById('toggle-filters-btn');
        const departmentsWrapper = navegacionContainer.querySelector('.furality-departments-wrapper');
        toggleBtn.addEventListener('click', () => {
            departmentsWrapper.classList.toggle('active');
            const isExpanded = departmentsWrapper.classList.contains('active');
            toggleBtn.setAttribute('aria-expanded', isExpanded);
        });
        document.querySelectorAll('.furality-dept-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const teamId = btn.getAttribute('data-team');
                scrollToTeam(teamId);
                if (window.innerWidth <= 768) {
                    departmentsWrapper.classList.remove('active');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Renderizar equipos estilo Furality
    function renderizarEquipos() {
        const container = document.getElementById('teams-container');
        container.innerHTML = '';
        equiposList.forEach(equipo => {
            const teamSection = crearSeccionEquipo(equipo);
            container.appendChild(teamSection);
        });
        if (window.i18n && typeof window.i18n.forceUpdateContent === 'function') {
            // Forzar actualización ya que se generaron nuevos elementos dinámicamente
            window.i18n.forceUpdateContent();
        } else if (window.i18n && typeof window.i18n.updateContent === 'function') {
            // Fallback para compatibilidad
            window.i18n.updateContent();
        }
    }

    // Crear sección individual de equipo estilo Furality
    function crearSeccionEquipo(equipo) {
        const section = document.createElement('section');
        section.className = 'furality-department';
        section.id = `team-${equipo.id}`;
        section.innerHTML = `
            <h2 class="furality-dept-title" data-i18n="teams.${equipo.id}.name">${equipo.nombre}</h2>
            <p class="furality-dept-description" data-i18n="teams.${equipo.id}.description">${equipo.descripcion}</p>
            <div class="furality-leaders">
                ${equipo.lideres.map(liderRef => crearTarjetaPersona(liderRef, true)).join('')}
            </div>
            <div class="furality-members">
                ${equipo.miembros.map(miembroRef => crearTarjetaPersona(miembroRef, false)).join('')}
            </div>
        `;
        return section;
    }

    // FUNCIÓN para crear tarjetas de personas
    function crearTarjetaPersona(personaRef, isLeader) {
        const personaData = colaboradoresMap[personaRef.id]; // Busqueda en el directorio
        if (!personaData) {
            console.warn(`No se encontraron datos para el colaborador con id: ${personaRef.id}`);
            return ''; // Si no se encuentra la persona, no se crea la tarjeta
        }

        const rol = personaRef.rol;
        const rol_key = personaRef.rol_key;
        const rolTraducible = rol_key ? `data-i18n="roles.${rol_key}"` : '';
        const cardClass = isLeader ? 'furality-leader' : 'furality-member';
        const photoClass = isLeader ? 'furality-leader-photo' : 'furality-member-photo';
        const infoClass = isLeader ? 'furality-leader-info' : 'furality-member-info';
        const nameClass = isLeader ? 'furality-leader-name' : 'furality-member-name';
        const roleClass = isLeader ? 'furality-leader-role' : 'furality-member-role';
        const socialClass = isLeader ? 'furality-leader-social' : 'furality-member-social';

        return `
            <div class="${cardClass}">
                <div class="${photoClass}">
                    <img src="/assets/colaboradores/${personaData.foto}" 
                         alt="${personaData.nombre}"
                         onload="this.style.opacity='1'"
                         onerror="handleImageError(this, '${personaData.nombre}', ${isLeader})">
                </div>
                <div class="${infoClass}">
                    <div class="${nameClass}">${personaData.nombre}</div>
                    <div class="${roleClass}" ${rolTraducible}>${rol}</div>
                </div>
                <div class="${socialClass}">
                    ${generarBotonesSociales(personaData.social)}
                </div>
            </div>
        `;
    }

    // Navegación suave
    function configurarNavegacion() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const teamId = entry.target.id.replace('team-', '');
                    updateActiveButton(teamId);
                }
            });
        }, { threshold: 0.3, rootMargin: '-140px 0px -50% 0px' });
        document.querySelectorAll('.furality-department').forEach(section => {
            observer.observe(section);
        });
    }

    // Actualizar botón activo
    function updateActiveButton(activeTeamId) {
        document.querySelectorAll('.furality-dept-btn').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-team') === activeTeamId) {
                button.classList.add('active');
            }
        });
    }

    // Scroll suave a equipo específico
    function scrollToTeam(teamId) {
        const targetSection = document.getElementById(`team-${teamId}`);
        if (targetSection) {
            requestAnimationFrame(() => {
                const header = document.querySelector('header');
                const nav = document.querySelector('.furality-nav');
                const headerHeight = header ? header.offsetHeight : 80;
                const navHeight = nav ? nav.offsetHeight : 60;
                const targetPosition = targetSection.offsetTop;
                const offset = headerHeight + navHeight + 20;
                const scrollPosition = targetPosition - offset;
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            });
        }
    }

    // Mostrar error si no se pueden cargar los datos
    function mostrarError() {
        const container = document.getElementById('teams-container');
        container.className = 'furality-container';
        container.innerHTML = `<div style="text-align: center; padding: 60px 20px;"><h2 style="color: var(--white); margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Error al cargar equipos</h2><p style="color: rgba(255,255,255,0.8); font-size: 1.1rem;">No se pudieron cargar los datos de los equipos. Por favor, inténtalo más tarde.</p></div>`;
    }

    // Animaciones de entrada progresiva
    function animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.furality-member').forEach(member => {
            member.style.opacity = '0';
            member.style.transform = 'translateY(20px)';
            member.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(member);
        });
    }

    // Inicializar la aplicación
    async function inicializar() {
        await cargarDatos();
        setTimeout(animateOnScroll, 500);
    }
    
    inicializar();

    console.log('Script de equipos Furality cargado correctamente');
});