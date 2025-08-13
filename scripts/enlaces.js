// Función asíncrona para cargar y usar el JSON
async function cargarLINKS() {
    try {
        const response = await fetch('data/enlaces.json');
        const jsonEnlaces = await response.json();

        let enlaces = `
            <div class="contOrgEl">
                <div id="imgElOrg"></div>
                <span class="textoOrgName">${jsonEnlaces.cabezera.Texto}</span>
            </div>
`;

        for (let index = 0; index < jsonEnlaces.enlaces.length; index++) {
            enlaces += `
            <a class="enlaceStyle" href="${jsonEnlaces.enlaces[index].link}" target="_blank">
                <span class="textoLink">${jsonEnlaces.enlaces[index].TextLink}</span>
                <div class="iconoSVGLink"></div>
            </a>
            `;
        }

        document.getElementById('enlaces').innerHTML = enlaces;

        const imgElOrg = document.getElementById("imgElOrg");
        if (imgElOrg) {
            imgElOrg.style.backgroundImage = `url("assets/icons/iconoSVG/${jsonEnlaces.cabezera.Logo}")`;
        }

        const iconoSVGLink = document.getElementsByClassName("iconoSVGLink");
        for (let index = 0; index < jsonEnlaces.enlaces.length; index++) {
            if (iconoSVGLink[index]) {
                iconoSVGLink[index].style.backgroundImage = `url("assets/icons/iconoSVG/${jsonEnlaces.enlaces[index].Logo}")`;
            }
        }


    } catch (error) {
        console.error('Error al cargar el JSON:', error);
    }
}

cargarLINKS();