Aceptamos contribuciones para resolver errores o mejorar el rendimiento, si te gustaria aportar al diseño en si de la pagina unete a nuestro Equipo de Desarrollo a travez de nuestro servidor de discord.

# ¡Gracias por tu interés en contribuir a VRTon! ❤️

¡Hola! Nos alegra muchísimo que quieras dedicar tu tiempo y talento a mejorar este proyecto. Cada pequeña ayuda cuenta y es fundamental para nuestra misión.

Esta guía rápida está pensada para ayudarte a hacer tu primera contribución de forma segura y ordenada, especialmente si eres nuevo/a usando Git y GitHub. Siguiendo estos pasos, te aseguras de que tu trabajo se pueda integrar fácilmente y sin "romper" nada.

## La Regla de Oro: Nunca en `main`

La rama `main` es la versión "oficial" y estable de nuestra web. Es la que ven los usuarios. Para protegerla, **nunca trabajamos directamente en ella.**

Todo tu trabajo se hará en una **rama separada** que crearás para cada tarea específica (arreglar un bug, añadir una nueva función, etc.).

## Tu Flujo de Trabajo (Paso a Paso)

Aquí tienes la receta para una contribución perfecta. ¡Síguela cada vez que vayas a empezar una nueva tarea!

### 1. Prepara tu Espacio de Trabajo (Solo la primera vez)

Si es tu primera vez, necesitas crear tu propia copia ("Fork") del proyecto.

1.  **Haz un Fork:** Ve a la página principal del repositorio de VRTon y haz clic en el botón "Fork" en la esquina superior derecha.
2.  **Clona tu Fork:** Descarga tu copia a tu ordenador. Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.
    ```bash
    git clone https://github.com/TU_USUARIO/VRTON-WEB.git
    ```
3.  **Conecta con el Original:** Entra en la carpeta y añade el repositorio original de VRTon como un "remoto" llamado `upstream`.
    ```bash
    cd VRTON-WEB
    git remote add upstream https://github.com/VRTon/VRTON-WEB.git
    ```

### 2. ¡A Trabajar! (Lo que harás siempre)

Para cada nuevo bug o mejora, sigue estos pasos:

**A. Sincronízate con `main`**

Antes de escribir una sola línea de código, asegúrate de tener la última versión del proyecto.

```bash
# 1. Vuelve a tu rama main local
git checkout main

# 2. Descarga los últimos cambios del proyecto original de VRTon
git pull upstream main
```

**B. Crea tu Propia Rama**

Ahora, crea una rama nueva y segura para tu tarea. ¡Dale un nombre descriptivo!

- Para arreglar un bug: `git checkout -b fix/nombre-del-bug`
- Para añadir una función: `git checkout -b feature/nombre-de-la-funcion`

**Ejemplo:**

```bash
git checkout -b fix/menu-movil-no-cierra
```

**C. ¡Haz tu Magia!**

¡Ahora sí! Abre los archivos, programa, diseña y arregla todo lo que necesites.

**D. Guarda tus Cambios (Commit)**

Cuando hayas terminado (o quieras guardar un avance), haz un "commit".

```bash
# 1. Añade los archivos que has modificado
git add .

# 2. "Confirma" los cambios con un mensaje claro
git commit -m "Fix: El menú móvil ahora se cierra al hacer clic"
```

**E. Sube tu Rama a tu Fork**

Envía tu trabajo a tu repositorio personal en GitHub.

```bash
git push origin fix/menu-movil-no-cierra
```

### 3. Pide que Integren tu Trabajo (Pull Request)

El último paso es crear un "Pull Request" (PR). Esta es tu solicitud formal para que tu trabajo se añada al proyecto principal.

1.  Ve a la página de tu fork en GitHub.
2.  Verás un botón verde que dice **"Compare & pull request"**. Haz clic.
3.  Escribe un **título claro** y una **buena descripción** de lo que has hecho. ¿Qué problema arreglaste? ¿Cómo lo solucionaste?
4.  ¡Crea el Pull Request!

Un miembro del equipo revisará tu contribución, te dará feedback si es necesario y, finalmente, la fusionará con el proyecto.

---

¡Eso es todo! Si sigues estos pasos, tus contribuciones serán limpias, seguras y súper valiosas.

**¡Muchas gracias de nuevo y bienvenido/a al equipo!**
