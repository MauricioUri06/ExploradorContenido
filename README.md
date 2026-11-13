# Explorador de contenido aleatorio

Tarea de **Programación Web III** — Univalle.

Página web en ASP.NET Core MVC que consume cuatro APIs públicas (citas, perros, gatos y datos curiosos) con `fetch` y `async/await`, y actualiza cada sección de forma independiente sin recargar la página.

## Autor

- Mauricio Urioste

## Repositorio

_(pegar enlace de GitHub)_

## Tecnologías

- ASP.NET Core MVC (.NET 8)
- HTML, CSS y JavaScript
- Bootstrap 5

## Estructura principal

```
ExploradorContenido/
├── Controllers/HomeController.cs
├── Views/
│   ├── Home/Index.cshtml        → las cuatro tarjetas
│   └── Shared/_Layout.cshtml
└── wwwroot/
    ├── css/site.css             → estilos
    └── js/explorador.js         → consumo de las APIs
```

## Instrucciones de ejecución

**Requisitos:** SDK de .NET 8 y conexión a Internet.

### Con JetBrains Rider
1. Abrir `ExploradorContenido.sln`.
2. Seleccionar la configuración `http` o `https` en la barra superior.
3. Presionar **Run** (▶). El navegador se abre automáticamente.

### Desde la terminal
```bash
cd ExploradorContenido
dotnet run
```
Luego abrir `http://localhost:5180`.

## APIs utilizadas

| Sección | API | Endpoint (GET) | Campo usado |
|---|---|---|---|
| Citas | DummyJSON | `https://dummyjson.com/quotes/random` | `quote`, `author` |
| Perros | Dog CEO | `https://dog.ceo/api/breeds/image/random` | `message` (URL de la imagen) |
| Gatos | CATAAS | `https://cataas.com/cat?json=true` | `id` → `https://cataas.com/cat/{id}` |
| Datos curiosos | Useless Facts | `https://uselessfacts.jsph.pl/api/v2/facts/random?language=en` | `text` |

## Preguntas de reflexión

### 1. ¿Qué es un endpoint y cuál utilizaste para cada API?

Un endpoint es una dirección URL específica de una API a la que se envía una solicitud para obtener o modificar un recurso concreto. Cada endpoint responde a un método HTTP (en este caso `GET`) y devuelve datos en un formato definido, normalmente JSON.

Los endpoints utilizados fueron:

- **DummyJSON:** `https://dummyjson.com/quotes/random` — devuelve una cita aleatoria.
- **Dog CEO:** `https://dog.ceo/api/breeds/image/random` — devuelve la URL de una foto aleatoria de perro.
- **CATAAS:** `https://cataas.com/cat?json=true` — devuelve la información de un gato en JSON; con su `id` se arma la URL `https://cataas.com/cat/{id}` para mostrar la imagen.
- **Useless Facts:** `https://uselessfacts.jsph.pl/api/v2/facts/random?language=en` — devuelve un dato curioso aleatorio.

### 2. ¿Qué diferencia existe entre recibir JSON y recibir directamente una imagen?

Cuando se recibe **JSON**, la respuesta es texto estructurado con datos (por ejemplo, `{ "id": "abc123", ... }`). Hay que convertirlo a un objeto de JavaScript con `response.json()` y luego leer sus campos para decidir qué mostrar.

Cuando se recibe **directamente una imagen**, la respuesta son bytes binarios (JPEG, PNG, etc.), no texto. No se puede procesar con `response.json()` porque fallaría al intentar interpretarla como JSON. En ese caso la URL se asigna al atributo `src` de una etiqueta `<img>` y el navegador se encarga de descargarla y mostrarla.

Por eso, en la sección de gatos primero se consulta `https://cataas.com/cat?json=true` para obtener el `id` en JSON, y después se usa `https://cataas.com/cat/{id}` como `src` de la imagen.

### 3. ¿Qué función cumplen `await` y `response.json()`?

- **`await`** pausa la ejecución de una función `async` hasta que una promesa se resuelva, sin bloquear el resto de la página. Permite escribir código asíncrono de forma secuencial y legible: primero se espera la respuesta de `fetch` y luego se espera la conversión del cuerpo.
- **`response.json()`** lee el cuerpo de la respuesta HTTP y lo convierte de texto JSON a un objeto de JavaScript. También devuelve una promesa, por eso se usa con `await`:

```js
const response = await fetch(url);
const datos = await response.json();
```

### 4. ¿Por qué se debe verificar `response.ok` además de utilizar `try/catch`?

Porque `fetch` **solo rechaza la promesa cuando hay un error de red** (sin conexión, DNS, CORS, solicitud cancelada). Si el servidor responde con un error HTTP como 404 o 500, `fetch` considera que la solicitud fue exitosa y no entra al `catch`.

`response.ok` es `true` solo cuando el código de estado está entre 200 y 299. Al verificarlo y lanzar un error cuando es `false`, ese caso también llega al `catch` y se muestra el mensaje de error, en lugar de intentar procesar una respuesta inválida:

```js
if (!response.ok) {
    throw new Error(`La API respondió con el estado ${response.status}`);
}
```

### 5. ¿Cómo lograste actualizar una sección sin recargar toda la página?

Cada sección tiene su propia función (`obtenerCita`, `obtenerPerro`, `obtenerGato`, `obtenerDato`) asociada al evento `click` de su botón. Al presionarlo:

1. Se deshabilita solo ese botón y se muestra “Cargando…” en esa tarjeta.
2. Se hace la solicitud con `fetch` y `async/await`.
3. Con el resultado se modifica únicamente el DOM de esa tarjeta (`textContent` para los textos y `src`/`alt` para las imágenes).
4. En el bloque `finally` se vuelve a habilitar el botón, haya error o no.

Como todo ocurre con JavaScript en el navegador y nunca se envía un formulario ni se navega a otra URL, la página no se recarga. Además, cada sección maneja sus errores con su propio `try/catch`, por lo que si una API falla las demás siguen funcionando.

## Capturas

_(agregar las dos capturas: las cuatro secciones funcionando y un mensaje de error controlado)_
