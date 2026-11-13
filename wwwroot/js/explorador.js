const URL_CITAS = "https://dummyjson.com/quotes/random";
const URL_PERROS = "https://dog.ceo/api/breeds/image/random";
const URL_GATOS = "https://cataas.com/cat?json=true";
const URL_IMAGEN_GATO = "https://cataas.com/cat/";
const URL_DATOS = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";
const TIEMPO_LIMITE_MS = 10000;

const secciones = {
    citas: crearSeccion("seccion-citas"),
    perros: crearSeccion("seccion-perros"),
    gatos: crearSeccion("seccion-gatos"),
    datos: crearSeccion("seccion-datos")
};

const textoCita = document.getElementById("texto-cita");
const autorCita = document.getElementById("autor-cita");
const imagenPerro = document.getElementById("imagen-perro");
const razaPerro = document.getElementById("raza-perro");
const imagenGato = document.getElementById("imagen-gato");
const textoDato = document.getElementById("texto-dato");

function crearSeccion(idSeccion) {
    const elemento = document.getElementById(idSeccion);
    return {
        estado: elemento.querySelector(".estado"),
        contenido: elemento.querySelector(".contenido"),
        boton: elemento.querySelector("button")
    };
}

function mostrarEstado(seccion, mensaje, tipo) {
    seccion.estado.textContent = mensaje;
    seccion.estado.className = `estado estado--${tipo}`;
    seccion.estado.hidden = false;
}

function ocultarEstado(seccion) {
    seccion.estado.textContent = "";
    seccion.estado.hidden = true;
}

function crearMensajeError(descripcion) {
    if (!navigator.onLine) {
        return `Sin conexión a Internet. No se pudo obtener ${descripcion}. Revisa tu conexión y presiona el botón para reintentar.`;
    }
    return `No se pudo obtener ${descripcion}. Presiona el botón para reintentar.`;
}

async function ejecutarConsulta(seccion, descripcion, consulta) {
    seccion.boton.disabled = true;
    seccion.contenido.hidden = true;
    mostrarEstado(seccion, "Cargando…", "cargando");

    try {
        await consulta();
        ocultarEstado(seccion);
        seccion.contenido.hidden = false;
    } catch (error) {
        console.error(`Error al obtener ${descripcion}:`, error);
        mostrarEstado(seccion, crearMensajeError(descripcion), "error");
    } finally {
        seccion.boton.disabled = false;
    }
}

async function obtenerJson(url) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_MS);

    try {
        const response = await fetch(url, { cache: "no-store", signal: controlador.signal });
        if (!response.ok) {
            throw new Error(`La API respondió con el estado ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(temporizador);
    }
}

function cargarImagen(imagen, url, textoAlternativo) {
    return new Promise((resolve, reject) => {
        imagen.onload = () => resolve();
        imagen.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
        imagen.alt = textoAlternativo;
        imagen.src = url;
    });
}

function obtenerRazaDesdeUrl(urlImagen) {
    const coincidencia = urlImagen.match(/\/breeds\/([^/]+)\//);
    if (!coincidencia) {
        return "";
    }
    return coincidencia[1].split("-").reverse().join(" ");
}

async function obtenerCita() {
    await ejecutarConsulta(secciones.citas, "la cita", async () => {
        const datos = await obtenerJson(URL_CITAS);
        if (!datos.quote || !datos.author) {
            throw new Error("La respuesta no contiene la cita o el autor");
        }
        textoCita.textContent = datos.quote;
        autorCita.textContent = datos.author;
    });
}

async function obtenerPerro() {
    razaPerro.textContent = "";
    await ejecutarConsulta(secciones.perros, "la imagen del perro", async () => {
        const datos = await obtenerJson(URL_PERROS);
        if (datos.status !== "success" || !datos.message) {
            throw new Error("La respuesta no contiene la URL de la imagen");
        }
        const raza = obtenerRazaDesdeUrl(datos.message);
        const textoAlternativo = raza ? `Foto aleatoria de un perro de raza ${raza}` : "Foto aleatoria de un perro";
        await cargarImagen(imagenPerro, datos.message, textoAlternativo);
        razaPerro.textContent = raza ? `Raza: ${raza}` : "";
    });
}

async function obtenerGato() {
    await ejecutarConsulta(secciones.gatos, "la imagen del gato", async () => {
        const datos = await obtenerJson(URL_GATOS);
        const idGato = datos.id ?? datos._id;
        if (!idGato) {
            throw new Error("La respuesta no contiene el identificador del gato");
        }
        await cargarImagen(imagenGato, URL_IMAGEN_GATO + encodeURIComponent(idGato), "Foto aleatoria de un gato");
    });
}

async function obtenerDato() {
    await ejecutarConsulta(secciones.datos, "el dato curioso", async () => {
        const datos = await obtenerJson(URL_DATOS);
        if (!datos.text) {
            throw new Error("La respuesta no contiene el dato curioso");
        }
        textoDato.textContent = datos.text;
    });
}

secciones.citas.boton.addEventListener("click", obtenerCita);
secciones.perros.boton.addEventListener("click", obtenerPerro);
secciones.gatos.boton.addEventListener("click", obtenerGato);
secciones.datos.boton.addEventListener("click", obtenerDato);

obtenerCita();
obtenerPerro();
obtenerGato();
obtenerDato();
