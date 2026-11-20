# Bluey · Plantilla editable

Abre index.html en un navegador o publica esta carpeta completa con GitHub Pages. No requiere instalación ni compilación.

## Personalizar

Edita **datos.js**. Allí cambias nombre, edad, fecha, hora, zona horaria, lugar, Google Maps, contactos, fotografías y textos. Es el único archivo que necesitas editar para los datos del festejo; los textos y el calendario se actualizan al recargar.

`portada.imagenes` contiene la ilustración panorámica de Bluey y Bingo que acompaña al mensaje familiar. Las ilustraciones transparentes de la portada se encuentran en `assets/bluey-character-v1.png` y `assets/bingo-character-v1.png`.

Para cambiar las fotos, añade tus archivos a assets/ y modifica fotos[].src. posicion permite ajustar el encuadre, por ejemplo «50% 30%».

Los valores actuales son ficticios: Mateo, 3 años. Los teléfonos están vacíos y modoDemo es true. La confirmación abre una vista de ejemplo sin enviar mensajes. Para usar WhatsApp, configura los números y cambia modoDemo a false. No hay conexión a un registro de invitados externo.

Las ilustraciones de personajes, las imágenes temáticas y las fuentes se sirven desde `assets/`. Consulta `CREDITOS.md` para sus fuentes.


## Escenario y galería

Esta edición incluye tres imágenes temáticas locales. `fotos` controla la galería; `ambientacion.src` y `ambientacion.alt` controlan el paisaje o escenario. Puedes reemplazarlos por archivos dentro de assets/. `textos` también permite editar los titulares del escenario, fecha, ubicación y confirmación.

Publicación independiente: copia **todo el contenido de esta carpeta**, incluido assets/ y .nojekyll, a tu repositorio. Activa GitHub Pages desde main / (root). Mantén las rutas relativas para poder publicar también en una subcarpeta.

## Rediseño de la invitación

`index.html` carga `fiesta.css` y `fiesta.js` para el diseño adaptable, los títulos que aparecen por palabras, Bluey recorriendo la sección de actividades detrás de las tarjetas y el globo con confeti. `core.js` mantiene la cuenta regresiva, el calendario, la galería y las confirmaciones. Las hojas de estilo de ediciones anteriores se conservan como referencia y ya no se cargan.

El botón «Pausar animaciones» del pie permite detener el movimiento. La invitación también respeta la preferencia de movimiento reducido del dispositivo y detiene la animación de recorrido fuera de pantalla.

`celebration-fx.css` y `celebration-fx.js` añaden cinco globos: rojo, azul, amarillo, menta y lila, con tamaños y ritmos distintos. Tres cruzan las separaciones entre secciones y dos flotan en los bordes. En celular se muestran tres globos. Comparten un solo ciclo de animación y se ocultan al pausar, al abrir una foto o al escribir en el formulario. También se incluyen destellos suaves y un brillo en el boleto.

El bloque «¿Te gustó esta invitación?» usa el mismo enlace de WhatsApp de negocio de la invitación de Bob Esponja: `https://wa.me/message/P7RPHXQSCT34P1`. Ese enlace es independiente de los contactos de confirmación del festejo.
