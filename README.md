# Laboratorio - Cliente REST con HTML5, JavaScript y CSS3
## Parte I - Solución

### Escuela Colombiana de Ingeniería
### Arquitecturas de Software

---
##  Autores

- Manuel David Robayo Vega
- William Camilo Hernandez Deaza

---

##  Descripción del Proyecto

Aplicación web para la gestión y visualización de planos (blueprints) utilizando un cliente "grueso" que consume un API REST. La aplicación permite consultar planos por autor, visualizar sus detalles en una tabla interactiva y dibujar los planos seleccionados en un canvas HTML5.

---

##  Funcionalidades Implementadas

###  Completada

1. **Consulta de Planos por Autor**
   - Campo de entrada para nombre del autor
   - Botón "Get Blueprints" para realizar la búsqueda
   - Validación de entrada

2. **Visualización de Resultados**
   - Tabla dinámica con listado de planos
   - Información mostrada: nombre del plano y número de puntos
   - Botón "Open" en cada fila para visualizar el plano

3. **Cálculo de Puntos Totales**
   - Suma automática de todos los puntos de los planos del autor
   - Visualización destacada del total

4. **Dibujo de Planos en Canvas**
   - Canvas HTML5 para visualización gráfica
   - Dibujo de segmentos de recta consecutivos
   - Indicador del plano actualmente mostrado

5. **Arquitectura Modular**
   - Patrón Módulo de JavaScript implementado
   - Separación entre lógica de negocio y API
   - Fácil intercambio entre Mock y API real



---

##  Estructura del Proyecto

```
src/main/resources/static/
│
├── index.html              # Página principal de la aplicación
│
│
└── js/
    ├── apimock.js         # Datos mock para pruebas
    ├── apiclient.js       # Cliente del API REST real
    └── app.js             # Controlador principal de la aplicación
```

---



## Dependencias Maven

```xml
# Laboratorio - Cliente REST con HTML5, JavaScript y CSS3 (Parte II)

Escuela Colombiana de Ingeniería — Procesos de Desarrollo de Software (PDSW)

Autores:
- Manuel David Robayo Vega
- William Camilo Hernández Deaza

Descripción
-----------
Este documento responde los requerimientos de la segunda parte del laboratorio: agregar interacción sobre el canvas, persistencia vía REST (PUT/POST/DELETE) y control de la UI (Create / Save / Delete). El proyecto ya contiene un mock (`apimock.js`) y un cliente real (`apiclient.js`) para cambiar entre entornos.

Archivos principales modificados/creados
- `src/main/resources/static/index.html` — botones Create, Delete, Save y referencias a scripts
- `src/main/resources/static/js/app.js` — lógica principal: manejo del canvas, eventos PointerEvent, creación/guardado/borrado con promesas
- `src/main/resources/static/js/apiclient.js` — POST (create) y DELETE implementados con `$.ajax`
- `src/main/resources/static/js/apimock.js` — mocks para create/delete que retornan Promesas

Respuestas a los requerimientos (1–5)
-----------------------------------

1) Manejador de eventos en el canvas (PointerEvent)
- Qué se hizo:
    - En `app.js` se inicializan los manejadores del canvas dentro de `initCanvasEventHandlers()`.
    - Se usa `canvas.addEventListener('pointerdown', handler)` para soportar apuntadores (mouse, touch y pen) según la API PointerEvent.
    - La inicialización está modularizada dentro del módulo `app` (no está incrustada en la vista), por lo que la lógica es reutilizable y está separada.

- Notas:
    - El `pointerdown` se transforma a coordenadas relativas al canvas usando `getBoundingClientRect()`.
    - Si no hay un blueprint abierto (`currentBlueprint` con `author` y `name`), el manejador simplemente ignora el evento.

2) Agregar puntos en memoria y repintar
- Qué se hizo:
    - Cuando se detecta un `pointerdown` y hay un blueprint abierto, se crea un objeto punto {x,y} y se `push` al final de `currentBlueprint.points`.
    - Luego se invoca `drawBlueprint(points)` para repintar el canvas: dibuja líneas entre puntos consecutivos y pinta los puntos.

3) Botón Save/Update (PUT + GET + recalcular puntos)
- Qué se hizo:
    - Botón `#saveBtn` en `index.html` y su handler en `app.js`.
    - `saveCurrentBlueprint()` hace lo siguiente:
        1. Si el blueprint es nuevo (`currentBlueprint.isNew === true`), hace `POST` (`apiclient.createBlueprint`) para crear el recurso. Si no, hace `PUT` (`apiclient.updateBlueprint`) con `JSON.stringify(currentBlueprint)`.
        2. Luego, usa la promesa devuelta por la operación anterior y, en `then`, hace `GET` al recurso `/blueprints/{author}` para recargar la lista del autor.
        3. Finalmente actualiza la tabla con `updateBlueprintsTable(blueprints)` y recalcula los puntos totales con `updateTotalPoints(blueprints)`.

- Observaciones técnicas:
    - Usamos `$.ajax({type:'PUT', url:..., data: JSON.stringify(obj), contentType:'application/json'})` para las llamadas PUT como se solicita.
    - El flujo está encadenado con promesas (`then`/`catch`) para mantener el orden de operaciones.

4) Botón Create new blueprint (POST + GET) — cambia el comportamiento de Save
- Qué se hizo:
    - Botón `#createBtn` en `index.html`.
    - Al presionar `Create new blueprint`:
        - Se limpia el canvas.
        - Se solicita el nombre mediante `prompt()` (puede reemplazarse por modal si se desea).
        - Se crea en memoria `currentBlueprint = {author, name, points: [], isNew: true}`; NO se hace POST todavía.
        - Se habilita el botón `Save/Update`.
    - Al presionar `Save/Update` por primera vez para un blueprint marcado `isNew`, `saveCurrentBlueprint()` hace POST al endpoint `/blueprints`, espera la respuesta, y luego hace GET para recargar la lista y puntaje. Después de un POST exitoso, `isNew` se marca `false`.

5) Botón DELETE (DELETE + GET)
- Qué se hizo:
    - Botón `#deleteBtn` en `index.html`.
    - Al presionar `DELETE` (se pide confirmación con `confirm()`):
        1. Se limpia el canvas.
        2. Se ejecuta `DELETE /blueprints/{author}/{name}` usando `apiclient.deleteBlueprint(author,name)` que hace `$.ajax({type:'DELETE', ...})`.
        3. Luego de la promesa resolverse, se hace `GET` para recargar la lista y el puntaje.
    - Si el blueprint estaba en estado `isNew` (no persistido aún), el botón `DELETE` se mantiene deshabilitado para evitar llamadas inválidas.

Notas de implementación y detalles técnicos
----------------------------------------
- Manejo de errores:
    - Se añadió una utilidad `parseAjaxError(err)` para extraer mensajes de error útiles desde `jqXHR` o argumentos de fallo jQuery; los `.catch` usan esta función y muestran mensajes informativos.
    - El backend (`BlueprintAPIController`) ahora devuelve cuerpos JSON con `{"error":"mensaje"}` cuando ocurre una excepción, para facilitar el diagnóstico desde el cliente.

- Mock vs API real:
    - `apimock.js` ahora implementa `createBlueprint` y `deleteBlueprint` que retornan Promesas para ser coherentes con `apiclient.js`.
    - Cambia a modo real en `index.html` para probar contra tu backend en `http://localhost:8080/blueprints`.

## Cómo probar (paso a paso)

1. Compilar y ejecutar servidor:

```powershell
mvn -DskipTests package
mvn spring-boot:run
```

2. Abrir la UI en el navegador:

```
http://localhost:8080/index.html
```

3. Flujo típico:

    - Ingresar un autor y hacer **Get BluePrints**.
    - Abrir un blueprint con **Open**.
    - Hacer click en el canvas para agregar puntos (pointerdown — mouse o touch).
    - Hacer **Save/Update** para persistir cambios (PUT si existe, POST si creaste con Create antes).
    - Crear un nuevo blueprint con **Create new blueprint** y guardar (POST + GET se encadenan).
    - Borrar un blueprint abierto con **DELETE** (DELETE + GET se encadenan).

Notas finales y mejoras recomendadas
----------------------------------
- UX: Reemplazar `prompt()` y `confirm()` por modales Bootstrap para una mejor experiencia.
- Validaciones: Añadir validaciones en cliente (nombre no vacío, autor seleccionado) y mostrar mensajes inline.
- Tests: Agregar pruebas unitarias para `app.js` usando un runner JS o pruebas e2e con Cypress/Playwright.

Contacto / Soporte
------------------
Si encuentras un error al guardar (por ejemplo el cliente muestra un mensaje genérico), abre las DevTools > Network y pega aquí la petición fallida (Request URL, Method, Status, Response body). Con esa información puedo darte el cambio exacto (cliente o servidor).

---

Fin del README actualizado.
```

