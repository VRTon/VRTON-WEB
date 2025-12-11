// Script para la nueva página de equipos estilo vrton con colores VRTon
document.addEventListener('DOMContentLoaded', () => {
    let colaboradoresMap = null; // Directorio de todos los colaboradores
    let equiposList = null; // Lista de equipos

    // Aplicar estilo vrton al body
    document.body.classList.add('vrton-body');

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
        if (social.discord && social.discord.trim() !== '') {
            redes.push(`<a href="${social.discord}" class="vrton-social-btn" title="Discord" target="_blank" rel="noopener noreferrer"><i class="fab fa-discord"></i></a>`);
        }
        if (social.twitter && social.twitter.trim() !== '') {
            redes.push(`<a href="${social.twitter}" class="vrton-social-btn" title="Twitter" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>`);
        }
        if (social.telegram && social.telegram.trim() !== '') {
            redes.push(`<a href="${social.telegram}" class="vrton-social-btn" title="Telegram" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram"></i></a>`);
        }
        if (social.vrchat && social.vrchat.trim() !== '') {
            redes.push(`<a href="${social.vrchat}" class="vrton-social-btn" title="VRChat" target="_blank" rel="noopener noreferrer"><i class="fas fa-vr-cardboard"></i></a>`);
        }
        if (social.instagram && social.instagram.trim() !== '') {
            redes.push(`<a href="${social.instagram}" class="vrton-social-btn" title="Instagram" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram"></i></a>`);
        }
        if (social.github && social.github.trim() !== '') {
            redes.push(`<a href="${social.github}" class="vrton-social-btn" title="GitHub" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>`);
        }
        if (social.other && social.other.trim() !== '') {
            redes.push(`<a href="${social.other}" class="vrton-social-btn" title="Enlace" target="_blank" rel="noopener noreferrer"><i class="fas fa-link"></i></a>`);
        }
        return redes.join('');
    }

    // Renderizar navegación estilo vrton
    function renderizarNavegacion() {
        const navegacionContainer = document.getElementById('team-navigation');
        navegacionContainer.className = 'vrton-nav';
        navegacionContainer.innerHTML = `
            <button id="toggle-filters-btn" class="vrton-filter-toggle">
                <i class="fas fa-filter"></i>
                <span data-i18n="colaboradores.filter_button">Filtrar Departamentos</span>
            </button>
            <div class="vrton-departments-wrapper">
                <h2 data-i18n="colaboradores.departments_title">Departamentos</h2>
                <div class="vrton-departments">
                    ${equiposList.map(equipo => `
                        <a href="#team-${equipo.id}" class="vrton-dept-btn" data-team="${equipo.id}">
                            <i class="${iconosDepartamentos[equipo.id] || 'fas fa-users'}"></i>
                            <span data-i18n="teams.${equipo.id}.name">${equipo.nombre}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        const toggleBtn = document.getElementById('toggle-filters-btn');
        const departmentsWrapper = navegacionContainer.querySelector('.vrton-departments-wrapper');
        toggleBtn.addEventListener('click', () => {
            departmentsWrapper.classList.toggle('active');
            const isExpanded = departmentsWrapper.classList.contains('active');
            toggleBtn.setAttribute('aria-expanded', isExpanded);
        });
        document.querySelectorAll('.vrton-dept-btn').forEach(btn => {
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

    // Renderizar equipos estilo vrton
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

    // Crear sección individual de equipo estilo vrton
    function crearSeccionEquipo(equipo) {
        const section = document.createElement('section');
        section.className = 'vrton-department';
        section.id = `team-${equipo.id}`;
        section.innerHTML = `
            <h2 class="vrton-dept-title" data-i18n="teams.${equipo.id}.name">${equipo.nombre}</h2>
            <p class="vrton-dept-description" data-i18n="teams.${equipo.id}.description">${equipo.descripcion}</p>
            <div class="vrton-leaders">
                ${equipo.lideres.map(liderRef => crearTarjetaPersona(liderRef, true)).join('')}
            </div>
            <div class="vrton-members">
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

        const rol_key = personaRef.rol_key;
        
        // Procesar múltiples rol_key separadas por comas
        let rolesHTML = '';
        if (rol_key) {
            const rolKeys = rol_key.split(',').map(key => key.trim());
            const roleElements = rolKeys.map(key => 
                `<span data-i18n="roles.${key}">${key}</span>`
            );
            rolesHTML = roleElements.join(', ');
        }
        
        const cardClass = isLeader ? 'vrton-leader' : 'vrton-member';
        const photoClass = isLeader ? 'vrton-leader-photo' : 'vrton-member-photo';
        const infoClass = isLeader ? 'vrton-leader-info' : 'vrton-member-info';
        const nameClass = isLeader ? 'vrton-leader-name' : 'vrton-member-name';
        const roleClass = isLeader ? 'vrton-leader-role' : 'vrton-member-role';
        const socialClass = isLeader ? 'vrton-leader-social' : 'vrton-member-social';

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
                    <div class="${roleClass}">${rolesHTML}</div>
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
        document.querySelectorAll('.vrton-department').forEach(section => {
            observer.observe(section);
        });
    }

    // Actualizar botón activo
    function updateActiveButton(activeTeamId) {
        document.querySelectorAll('.vrton-dept-btn').forEach(button => {
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
                const nav = document.querySelector('.vrton-nav');
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
        container.className = 'vrton-container';
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
        document.querySelectorAll('.vrton-member').forEach(member => {
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

    console.log('Script de equipos vrton cargado correctamente');
});