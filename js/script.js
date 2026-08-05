// ==========================
// VARIABLES GLOBALES
// ==========================

let artistaActual = {};

let mostrarTodosSingles = false;

// ==========================
// BUSCADOR
// ==========================

function buscarArtista() {

    limpiarPantalla();

    let artistaBuscado =
        document.getElementById("busqueda").value;

    fetch(`https://musicbrainz.org/ws/2/artist/?query=${artistaBuscado}&fmt=json`)
        .then(respuesta => respuesta.json())
        .then(datos => {

            let html = "";

            html += `<h2>Resultados encontrados: ${datos.count}</h2>`;

            datos.artists.forEach(artista => {
            console.log(datos.artists);
        

            html += `
                <div>

                    <h3>
                    ${artista.name}
                    </h3>

                    <p>
                    País: ${artista.country || artista.area?.name || "Desconocido"}
                    </p>

                    <button onclick="verAlbumes(
                    '${artista.id}',
                    '${artista.name}',
                    '${artista.country || ""}',
                    '${artista.area?.name || ""}',
                    '${artista["life-span"]?.begin || ""}'
                    )">
                        Ver álbumes
                    </button>

                    <hr>

                </div>
            `;

        });

            document.getElementById("resultado").innerHTML = html;

            
        });
    }

// ==========================
// ARTISTA
// ==========================

function verAlbumes(id, nombre, pais, area, inicio) {

    artistaActual = {
    id: id,
    nombre: nombre,
    pais: pais,
    area: area,
    inicio: inicio
};

    document.getElementById("resultado").innerHTML = "";

    document.getElementById("artistaSeleccionado").innerHTML = `

        <h2>${nombre}</h2>

        <p>
            País:
            ${pais || area || "Desconocido"}
        </p>

        <p>
            Inicio:
            ${inicio || "Desconocido"}
        </p>

        <button onclick="volverBusqueda()">
            ⬅ Volver
        </button>

        <hr>

    `;

    fetch(`https://musicbrainz.org/ws/2/release-group?artist=${id}&limit=100&fmt=json`)

        .then(respuesta => respuesta.json())

        .then(datos => {

            let htmlAlbumes = "";

            let htmlSingles = "";

            let htmlEPs = "";

            let contadorSingles = 0;

            let totalSingles = 0;

            datos["release-groups"].sort((a, b) => {

                let fechaA = a["first-release-date"] || "0000";
                let fechaB = b["first-release-date"] || "0000";

                return new Date(fechaB) - new Date(fechaA);

            });
            
            datos["release-groups"].forEach(album => {

                if(album.status === "Cancelled"){
    return;
}

                if (album["primary-type"] === "Album") {

                htmlAlbumes+= `
                        <div class="tarjeta-album"
                        onclick="verDetalleAlbum(
                        '${album.id}',
                        '${album.title}',
                        '${album["first-release-date"]}',
                        '${album["primary-type"]}'
                        )">

                        <img 
                        src="https://coverartarchive.org/release-group/${album.id}/front"
                        alt="${album.title}"
                        onerror="this.src='img/sin-portada.png'">

                        <h3>${album.title}</h3>

                        <p>
                            ${album["first-release-date"]?.substring(0,4) || "Desconocido"}
                        </p>

                    </div>
                `;

                }

                if (album["primary-type"] === "EP") {

                htmlEPs += `
                    <div class="tarjeta-album"
                        onclick="verDetalleAlbum(
                        '${album.id}',
                        '${album.title}',
                        '${album["first-release-date"]}',
                        '${album["primary-type"]}'
                        )">

                        <img
                        src="https://coverartarchive.org/release-group/${album.id}/front"
                        alt="${album.title}"
                        onerror="this.src='img/sin-portada.png'">

                        <h3>${album.title}</h3>

                        <p>
                            ${album["first-release-date"]?.substring(0,4) || "Desconocido"}
                        </p>

                    </div>
                `;

                }

                if (album["primary-type"] === "Single") {

                    totalSingles++;

                    if(mostrarTodosSingles || contadorSingles < 5){

                htmlSingles += `
                    <div class="tarjeta-album"
                        onclick="verDetalleAlbum(
                        '${album.id}',
                        '${album.title}',
                        '${album["first-release-date"]}',
                        '${album["primary-type"]}'
                        )">

                        <img
                        src="https://coverartarchive.org/release-group/${album.id}/front"
                        alt="${album.title}"
                        onerror="this.src='img/sin-portada.png'">

                        <h3>${album.title}</h3>

                        <p>
                            ${album["first-release-date"]?.substring(0,4) || "Año desconocido"}
                        </p>

                    </div>
                `;}

                    contadorSingles++;

                }

            });

            let botonMostrarMas = "";

                if(totalSingles > 5 && !mostrarTodosSingles){

                    botonMostrarMas = `
                        <button onclick="mostrarMasSingles()">
                            Mostrar más
                        </button>
                    `;

                }

            if(htmlAlbumes !== "") {

                document.getElementById("albumes").innerHTML = `
                    <h2 class="titulo-seccion">Álbumes</h2>

                    <div class="grid-musica">
                        ${htmlAlbumes}
                    </div>
                `;

            } else {

                limpiarDiscografia();

            }

            if(htmlEPs !== "") {

                document.getElementById("eps").innerHTML = `
                    <h2 class="titulo-seccion">EPs</h2>

                    <div class="grid-musica">
                        ${htmlEPs}
                    </div>
                `;

            } else {

                limpiarDiscografia();

            }

            if(htmlSingles !== "") {

                document.getElementById("singles").innerHTML = `
                    <h2 class="titulo-seccion">Singles</h2>

                    <div class="grid-musica">
                        ${htmlSingles}
                    </div>

                    ${botonMostrarMas}
                `;

            } else {

                limpiarDiscografia();

            }

        });

}

function volverBusqueda(){

    limpiarPantalla();

}

// ==========================
// DETALLE DEL ÁLBUM
// ==========================

function verDetalleAlbum(id, titulo, fecha, tipo) {

    // Ocultar vista del artista
    limpiarPantalla();

    // Mostrar detalle del álbum
    document.getElementById("detalleAlbum").innerHTML = `

    <div class="contenedor-album">
    
        <div class="panel-izquierdo">

            <img
                class="portada-grande"
                src="https://coverartarchive.org/release-group/${id}/front"
                alt="${titulo}"
                onerror="this.src='img/sin-portada.png'">

            <div class="info-album">
                <h1>${titulo}</h1>

                <p class="tipo-album">${tipo}</p>

                <p class="dato-album">
                    ${fecha ? fecha.substring(0,4) : "Desconocido"}
                </p>

                <p class="dato-album">Género: Desconocido</p>

                <p class="dato-album">Canciones: --</p>

                <p class="dato-album">Duración: -- min</p>
            </div>
        </div>

        <div class="panel-centro">
            <h2>Canciones</h2>

            <div class="cancion-placeholder">
                1. Las canciones se cargarán desde MusicBrainz
            </div>

            <div class="cancion-placeholder">
                2. Aquí veremos número, título, artista, estrellas y duración
            </div>

            <div class="cancion-placeholder">
                3. Próximo sprint: conexión con la API de tracks
            </div>
        </div>

        <div class="panel-derecho">
            <h3>Artista</h3>

            <p class="dato-artista"> ${artistaActual.nombre}</p>

            <p class="dato-artista"> ${artistaActual.pais || artistaActual.area || "Desconocido"}</p>

            <p class="dato-artista"> ${artistaActual.inicio || "Desconocido"}</p>

            <button class="boton-artista" onclick="volverAlArtista()">
                ⬅ Volver al artista
            </button>
        </div>

        </div>
    `;
}

function volverAlArtista(){

    // Limpiar detalle del álbum
    limpiarPantalla();

    // Volver a mostrar la discografía
    verAlbumes(
        artistaActual.id,
        artistaActual.nombre,
        artistaActual.pais,
        artistaActual.area,
        artistaActual.inicio
    );
}

// ==========================
// UTILIDADES
// ==========================

function limpiarDiscografia(){

    document.getElementById("albumes").innerHTML = "";
    document.getElementById("eps").innerHTML = "";
    document.getElementById("singles").innerHTML = "";
}

function limpiarPantalla(){

    document.getElementById("artistaSeleccionado").innerHTML = "";
    limpiarDiscografia();
    document.getElementById("detalleAlbum").innerHTML = "";
}

function mostrarMasSingles(){

    mostrarTodosSingles = true;

    verAlbumes(
        artistaActual.id,
        artistaActual.nombre,
        artistaActual.pais,
        artistaActual.area,
        artistaActual.inicio
    );

}