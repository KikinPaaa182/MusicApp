// ==========================
// VARIABLES GLOBALES
// ==========================

let artistaActual = {};

const artistasTendencia = [

    "Green Day",
    "Justin Bieber",
    "Duki",
    "Kendrick Lamar",
    "Oasis"

];

// ==========================
// INICIO
// ==========================

function cargarInicio(){

    cargarTendencias();

}

let mostrarTodosAlbumes = false;
let mostrarTodosEps = false;
let mostrarTodosSingles = false;

let recargandoDiscografia = false;

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

            html += `<h2>
                        Resultados encontrados: ${datos.count}
                    </h2>`;

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
// TENDENCIAS
// ==========================

function cargarTendencias(){

    let html = "";

    artistasTendencia.forEach(artista=>{
        console.log(artista);
        fetch(`https://musicbrainz.org/ws/2/artist/?query=${artista}&fmt=json`)
        .then(respuesta=>respuesta.json())
        .then(datos=>{

            console.log(datos);
            
            let a = datos.artists[0];
            console.log(a);

            html += `

                <div class="tarjeta-artista"
                    onclick="verAlbumes(
                    '${a.id}',
                    '${a.name}',
                    '${a.country || ""}',
                    '${a.area?.name || ""}',
                    '${a["life-span"]?.begin || ""}'
                    )">

                    <div class="avatar-artista">
                        ${a.name.charAt(0).toUpperCase()}
                    </div>

                    <h3>
                        ${a.name}
                    </h3>

                    <p class="pais-artista">
                        ${a.country || a.area?.name || "Desconocido"}
                    </p>

                    <p class="estado-artista">
                        Ver discografía →
                    </p>

                </div>

            `;

            document.getElementById("gridTendencias").innerHTML = html;

        });
    });

}

// ==========================
// AUTOCOMPLETE
// ==========================

function autocompleteArtistas(
    inputId,
    autocompleteId
){

    let texto = document.getElementById(inputId).value;

        if(texto.length < 2){

            document.getElementById(autocompleteId).style.display = "none";

            return;
        }

        fetch(`https://musicbrainz.org/ws/2/artist/?query=${texto}&fmt=json`)
        .then(respuesta => respuesta.json())
        .then(datos => {
            let html = "";

            datos.artists.slice(0,5).forEach(artista => {

            html += `
                <div class="item-autocomplete" 
                    onclick="seleccionarArtista(
                    '${artista.id}',
                    '${artista.name}',
                    '${artista.country || ""}',
                    '${artista.area?.name || ""}',
                    '${artista["life-span"]?.begin || ""}'
                    )"
                >

                    <h3>
                    ${artista.name}
                    </h3>

                    <p>
                    País: ${artista.country || artista.area?.name || "Desconocido"}
                    </p>

                    <hr>

                </div>
            `;
        });

            document.getElementById(autocompleteId).innerHTML = html;
            document.getElementById(autocompleteId).style.display = "block";

        })        
}

function seleccionarArtista(id, nombre, pais, area, inicio){

    document.getElementById("busqueda").value = "";
    document.getElementById("busqueda").blur();
    
    document.getElementById("autocomplete").innerHTML = "";
    document.getElementById("autocomplete").style.display = "none";

    verAlbumes(id, nombre, pais, area, inicio);
}

// ==========================
// DESCUBRIR
// ==========================

function descubrirArtista(){
    let numero =
    Math.floor(Math.random()*artistasTendencia.length);

    let artista = artistasTendencia[numero];

    fetch(`https://musicbrainz.org/ws/2/artist/?query=${artista}&fmt=json`)
    .then(respuesta=>respuesta.json())
    .then(datos=>{

        console.log(datos);
            
        if (!datos.artists || datos.artists.length === 0) {
            console.log("MusicBrainz no devolvió artistas.");
            return;
        }

        let a = datos.artists[0];
        console.log(a);
        console.log(a.id);
        console.log(a.name);
        verAlbumes(
            a.id,
            a.name,
            a.country || "",
            a.area?.name || "",
            a["life-span"]?.begin || ""
        );
    });
}

// ==========================
// ARTISTA
// ==========================

function verAlbumes(id, nombre, pais, area, inicio) {
    
    mostrarArtista();

    artistaActual = {
    id: id,
    nombre: nombre,
    pais: pais,
    area: area,
    inicio: inicio
};

    if (!recargandoDiscografia) {

        mostrarTodosAlbumes = false;
        mostrarTodosEps = false;
        mostrarTodosSingles = false;

    }

    document.getElementById("nombreArtista").textContent = nombre;

    document.getElementById("paisArtista").textContent =
        area || pais || "Desconocido";

    document.querySelector(".avatar-artista-grande").textContent =
        nombre.charAt(0).toUpperCase();

    document.getElementById("busquedaArtista").value = nombre;

    document.getElementById("autocompleteArtista").innerHTML = "";
    document.getElementById("autocompleteArtista").style.display = "none";

    document.getElementById("resultado").innerHTML = "";

    document.getElementById("artistaSeleccionado").innerHTML = "";

        fetch(`https://musicbrainz.org/ws/2/release-group?artist=${id}&limit=100&fmt=json`)

        .then(respuesta => respuesta.json())

        .then(datos => {

            let htmlAlbumes = "";
            let htmlSingles = "";
            let htmlEPs = "";

            let contadorAlbumes = 0;
            let totalAlbumes = 0;

            let contadorEps = 0;
            let totalEps = 0;

            let contadorSingles = 0;
            let totalSingles = 0;

            console.log(datos);
            
            if (!datos["release-groups"]) {
                console.log("MusicBrainz no devolvió release-groups.");
                return;
            }

            let cantidadAlbumes = 0;

            let cantidadEps = 0;

            let cantidadSingles = 0;

            datos["release-groups"].forEach(proyecto => {

                if (proyecto["primary-type"] === "Album") {
                    cantidadAlbumes++;
                }

                if (proyecto["primary-type"] === "EP") {
                    cantidadEps++;
                }

                if (proyecto["primary-type"] === "Single") {
                    cantidadSingles++;
                }

            });

            document.getElementById("cantidadAlbumes").textContent =
                cantidadAlbumes;

            document.getElementById("cantidadEps").textContent =
                cantidadEps;

            document.getElementById("cantidadSingles").textContent =
                cantidadSingles;

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

                    totalAlbumes++;

                    if (mostrarTodosAlbumes || contadorAlbumes < 6){

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

                        <h3>
                            ${album.title}
                        </h3>

                        <p>
                            ${album["first-release-date"]?.substring(0,4) || "Desconocido"}
                        </p>

                    </div>
                `;}
                        
                        contadorAlbumes++

                }

                if (album["primary-type"] === "EP") {

                    totalEps++;

                    if (mostrarTodosEps || contadorEps < 6){

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

                        <h3>
                            ${album.title}
                        </h3>

                        <p>
                            ${album["first-release-date"]?.substring(0,4) || "Desconocido"}
                        </p>

                    </div>
                `;}
                        
                        contadorEps++

                }

                if (album["primary-type"] === "Single") {

                    totalSingles++;

                    if(mostrarTodosSingles || contadorSingles < 6){

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

                            <h3>
                                ${album.title}
                            </h3>

                            <p>
                                ${album["first-release-date"]?.substring(0,4) || "Año desconocido"}
                            </p>

                        </div>
                    `;}

                        contadorSingles++;

                    }

                });

                let botonAlbumes = "";
                let botonEps = "";
                let botonSingles = "";

                    if(totalAlbumes > 6 && !mostrarTodosAlbumes){

                        botonAlbumes = `
                            <button onclick="mostrarMasAlbumes()">
                                Mostrar más
                            </button>
                        `;

                    }
                
                    if(totalEps > 6 && !mostrarTodosEps){

                        botonEps = `
                            <button onclick="mostrarMasEps()">
                                Mostrar más
                            </button>
                        `;

                    }

                    if(totalSingles > 6 && !mostrarTodosSingles){

                        botonSingles = `
                            <button onclick="mostrarMasSingles()">
                                Mostrar más
                            </button>
                        `;

                    }

                if(htmlAlbumes !== "") {

                    document.getElementById("albumes").innerHTML = `
                        
                    <div class="cabecera-seccion">

                        <h2 class="titulo-seccion">
                            Álbumes
                        </h2>

                        ${botonAlbumes}

                    </div>

                        <div class="grid-musica">

                            ${htmlAlbumes}

                        </div>

                    `;

                } else {

                    limpiarDiscografia();

                }

                if(htmlEPs !== "") {

                    document.getElementById("eps").innerHTML = `

                    <div class="cabecera-seccion">

                        <h2 class="titulo-seccion">
                            EPs
                        </h2>

                        ${botonEps}

                    </div>

                        <div class="grid-musica">

                            ${htmlEPs}

                        </div>

                    `;

                } else {

                    limpiarDiscografia();

                }

                if(htmlSingles !== "") {

                    document.getElementById("singles").innerHTML = `

                    <div class="cabecera-seccion">

                        <h2 class="titulo-seccion">
                            Singles
                        </h2>

                        ${botonSingles}

                    </div>

                        <div class="grid-musica">

                            ${htmlSingles}

                        </div>
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

function    verDetalleAlbum(id, titulo, fecha, tipo) {

    // Ocultar vista del artista
    limpiarPantalla();

    // Mostrar detalle del álbum
    document.getElementById("detalleAlbum").innerHTML = `

        <div class="contenedor-album">
        
            <div class="panel-izquierdo">

                <img class="portada-grande"
                    src="https://coverartarchive.org/release-group/${id}/front"
                    alt="${titulo}"
                    onerror="this.src='img/sin-portada.png'">

                <div class="info-album">

                    <h1>
                        ${titulo}
                    </h1>

                    <p class="tipo-album">
                        ${tipo}
                    </p>

                    <p class="dato-album">
                        ${fecha ? fecha.substring(0,4) : "Desconocido"}
                    </p>

                    <p class="dato-album" id="paisLanzamiento">
                        País: Cargando...
                    </p>

                    <p class="dato-album" id="estadoLanzamiento">
                        Estado: Cargando...
                    </p>

                    <p class="dato-album" id="generoLanzamiento">
                        Género: Cargando...
                    </p>

                    <p class="dato-album" id="cantidadCanciones">
                        Canciones: Cargando...
                    </p>

                    <p class="dato-album" id="duracionAlbum">
                        Duración: Cargando...
                    </p>

                </div>

            </div>

            <div class="panel-centro">
                <h2>
                    Canciones
                </h2>
                
                <div id="listaCanciones">

                    <p class="cancion-placeholder">
                        Cargando canciones...
                    </p>

                </div>

            </div>

            <div class="panel-derecho">
                <h3>
                    Artista
                </h3>

                <p class="dato-artista">
                    ${artistaActual.nombre}
                </p>

                <p class="dato-artista">
                    ${artistaActual.pais || artistaActual.area || "Desconocido"}
                </p>

                <p class="dato-artista">
                    ${artistaActual.inicio || "Desconocido"}
                </p>

                <button class="boton-artista" onclick="volverAlArtista()">
                    ⬅ Volver al artista
                </button>
            </div>

        </div>
    `;

    // Buscar los releases pertenecientes a este release-group
    fetch(`https://musicbrainz.org/ws/2/release-group/${id}?inc=releases+tags&fmt=json`)
        .then(respuesta => respuesta.json())
        .then(datosAlbum => {

            console.log("Release Group:", datosAlbum);

            // Obtener géneros/tags
            let genero = "Desconocido";

            if (datosAlbum.tags && datosAlbum.tags.length > 0) {
                genero = datosAlbum.tags
                    .slice(0, 3)
                    .map(tag => tag.name)
                    .join(", ");
            }

            document.getElementById("generoLanzamiento").textContent =
                `Género: ${genero}`;

            // Buscar un release oficial
            let release = datosAlbum.releases.find(
                release => release.status === "Official"
            );

            // Si no encontramos uno oficial, usamos el primero
            if (!release) {
                release = datosAlbum.releases[0];
            }

            // Si directamente no hay releases
            if (!release) {

                document.getElementById("listaCanciones").innerHTML = `
                    <p class="cancion-placeholder">
                        No se encontraron canciones.
                    </p>
                `;

                return;
            }

            console.log("Release elegido:", release);

            // País del lanzamiento
            document.getElementById("paisLanzamiento").textContent =
                `País: ${release.country || "Desconocido"}`;

            // Estado del lanzamiento
            document.getElementById("estadoLanzamiento").textContent =
                `Estado: ${release.status || "Desconocido"}`;

            // Obtener las canciones del releas
            return fetch(
                `https://musicbrainz.org/ws/2/release/${release.id}?inc=recordings&fmt=json`
            );
        })

        .then(respuesta => {

            // Si el primer fetch no devolvió nada, no continuamos
            if (!respuesta) return null;

            return respuesta.json();
        })

        .then(datosRelease => {
            if (!datosRelease) return;
            console.log("Release con tracks:", datosRelease);

            // Los tracks están dentro de media
            let medios = datosRelease.media || [];

            let hayTracks = medios.some(media =>
                media.tracks && media.tracks.length > 0
            );

            // Si no encontramos tracks
            if (!hayTracks) {

                document.getElementById("listaCanciones").innerHTML = `
                    <p class="cancion-placeholder">
                        No se encontraron canciones.
                    </p>
                `;

                return;
            }

            // Crear HTML de las canciones
            let htmlCanciones = "";

            let duracionTotal = 0;

            medios.forEach((media, indice) => {

                if (!media.tracks || media.tracks.length === 0) {
                    return;
                }

                // Mostrar título del disco solamente si hay más de uno
                if (medios.length > 1) {

                    htmlCanciones += `

                        <div class="titulo-disco">
                            Disco ${media.position || indice + 1}
                        </div>
                    `;
                }
                    


                media.tracks.forEach(track => {

                    if (track.length) {
                        duracionTotal += track.length;
                    }

                    let duracion = "Desconocida";

                    if (track.length) {

                        let minutos = Math.floor(track.length / 60000);

                        let segundos = Math.floor(
                            (track.length % 60000) / 1000
                        );

                        segundos = segundos
                            .toString()
                            .padStart(2, "0");

                        duracion = `${minutos}:${segundos}`;
                    }


                    htmlCanciones += `
                        <div class="cancion">

                            <span class="numero-cancion">
                                ${track.position}
                            </span>

                            <span class="nombre-cancion">
                                ${track.title}
                            </span>

                            <span class="duracion-cancion">
                                ${duracion}
                            </span>

                        </div>
                    `;

                });

            });

        let minutosTotales = Math.floor(
            duracionTotal / 60000
        );

        let horas = Math.floor(minutosTotales / 60);
        let minutos = minutosTotales % 60;

        let textoDuracion = "";

        if (horas > 0 && minutos > 0) {

            textoDuracion =
                `${horas} ${horas === 1 ? "hora" : "horas"} y ${minutos} minutos`;
            
        } else if (horas > 0) {

            textoDuracion =
                `${horas} ${horas === 1 ? "hora" : "horas"}`;

        } else {

            textoDuracion =
                `${minutos} minutos`;

        }


        document.getElementById("duracionAlbum").textContent =
            `Duración: ${textoDuracion}`;

        document.getElementById("listaCanciones").innerHTML =
            htmlCanciones;

        // Calcular cantidad total de canciones
        let cantidadTracks = 0;

        medios.forEach(media => {

            if (media.tracks) {
                cantidadTracks += media.tracks.length;
            }

        });

        // Actualizar cantidad de canciones
        document.getElementById("cantidadCanciones").textContent =
            `Canciones: ${cantidadTracks}`;

    })

    .catch(error => {
        console.error("Error obteniendo canciones:", error);

        document.getElementById("listaCanciones").innerHTML = `
            <p class="cancion-placeholder">
                No se pudieron cargar las canciones.
            </p>
        `;
    });

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
// NAVEGACIÓN
// ==========================

function mostrarInicio(){

    document.getElementById("vistaInicio").style.display = "block";

    document.getElementById("vistaArtista").style.display = "none";

}

function mostrarArtista(){

    document.getElementById("vistaInicio").style.display = "none";

    document.getElementById("vistaArtista").style.display = "block";

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

function mostrarMasAlbumes() {

    mostrarTodosAlbumes = true;

    recargandoDiscografia = true;

    verAlbumes(
        artistaActual.id,
        artistaActual.nombre,
        artistaActual.pais,
        artistaActual.area,
        artistaActual.inicio
    );

    recargandoDiscografia = false;

}

function mostrarMasEps() {

    mostrarTodosEps = true;

    recargandoDiscografia = true;

    verAlbumes(
        artistaActual.id,
        artistaActual.nombre,
        artistaActual.pais,
        artistaActual.area,
        artistaActual.inicio
    );

    recargandoDiscografia = false;

}

function mostrarMasSingles() {

    mostrarTodosSingles = true;

    recargandoDiscografia = true;

    verAlbumes(
        artistaActual.id,
        artistaActual.nombre,
        artistaActual.pais,
        artistaActual.area,
        artistaActual.inicio
    );

    recargandoDiscografia = false;

}

const inputBusqueda = document.getElementById("busqueda");

inputBusqueda.addEventListener("keydown", function(event){

    if(event.key === "Enter"){

        buscarArtista();

    }

});

inputBusqueda.addEventListener("input", function(){

    autocompleteArtistas(
        "busqueda",
        "autocomplete"
    );

});

const inputBusquedaArtista = document.getElementById("busquedaArtista");

inputBusquedaArtista.addEventListener("input", function(){

    autocompleteArtistas(
        "busquedaArtista",
        "autocompleteArtista"
    );

});

cargarInicio();