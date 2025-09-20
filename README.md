[![Jekyll site CI](https://github.com/VRTon/VRTON-WEB/actions/workflows/jekyll-docker.yml/badge.svg)](https://github.com/VRTon/VRTON-WEB/actions/workflows/jekyll-docker.yml)
# VRTon - Organización Sin Ánimo de Lucro

Este repositorio contiene el código fuente del sitio web de VRTon, una organización sin ánimo de lucro dedicada a utilizar la Realidad Virtual para causas solidarias.

## 🚀 Desarrollo Local

### Prerrequisitos

- [Docker](https://www.docker.com/get-started) instalado en tu sistema
- [Git](https://git-scm.com/) para clonar el repositorio

### Instalación y Configuración

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/VRTon/VRTON-WEB.git
   cd VRTON-WEB
   ```

2. **Construir y ejecutar con Docker:**

   ```bash
   docker-compose up --build
   ```

3. **Acceder al sitio local:**
   - Abre tu navegador en: <http://localhost:4000>
   - El sitio se recarga automáticamente cuando editas archivos

### Comandos Útiles

#### Desarrollo continuo (con auto-reload)

```bash
docker-compose up
```

#### Solo construir el sitio (sin servidor)

```bash
docker run --rm -v ${PWD}:/srv/jekyll jekyll/jekyll:latest jekyll build
```

#### Detener el servidor

```bash
docker-compose down
```

#### Limpiar y reconstruir

```bash
docker-compose down
docker-compose up --build
```

## 📁 Estructura del Proyecto

```text
├── _config.yml          # Configuración de Jekyll
├── _includes/           # Componentes reutilizables
│   ├── head-meta.html
│   ├── header.html
│   ├── footer.html
│   └── scripts.html
├── _layouts/            # Plantillas de página
│   └── default.html
├── scripts/             # JavaScript del sitio
│   ├── i18n-v3.js      # Sistema de traducción
│   ├── equipos.js      # Gestión de equipos
│   ├── faq.js          # Preguntas frecuentes
│   └── ...
├── assets/             # Recursos estáticos
│   ├── icons/
│   ├── colaboradores/  # Imagenes de los colaboradores
│   ├── css             # Estilos
│   └── ...
├── data/               # Datos del sitio
│   ├── translations/
│   ├── equipos.json    # Datos de los colaboradores
│   └── catalog.json    # Utilizado por el sistema de descarga de assets
├── docker-compose.yml  # Configuración de Docker
└── README.md
```

## 📝 Notas de Desarrollo

### Sistema de Traducción (i18n)

- Los textos se gestionan en `data/translations/{lang_key}/...`
- Usa atributos `data-i18n` en HTML para elementos traducibles
- Especificar archivo de traduccion en el front matter como `translation_modules`

### GitHub Pages

- La carpeta `_site/` se genera automáticamente
- Solo edita archivos fuente, nunca `_site/`
- Los cambios se despliegan automáticamente al hacer push
