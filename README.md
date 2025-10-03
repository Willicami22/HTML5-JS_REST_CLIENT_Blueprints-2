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
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>webjars-locator</artifactId>
    <version>0.40</version>
</dependency>

<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>bootstrap</artifactId>
    <version>3.3.7</version>
</dependency>

<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>jquery</artifactId>
    <version>3.1.0</version>
</dependency>
```

---

## Instrucciones de Ejecución

### 1. Clonar el repositorio
```bash
git clone <url-repositorio>
cd <nombre-proyecto>
```

### 2. Compilar el proyecto
```bash
mvn clean install
```

### 3. Ejecutar la aplicación
```bash
mvn spring-boot:run
```

### 4. Acceder a la aplicación
Abrir en el navegador:
```
http://localhost:8080/index.html
```

---

##  Modo de Uso

### Consultar Planos

1. **Ingresar nombre del autor** en el campo de texto
2. **Hacer clic en "Get Blueprints"**
3. Se mostrará la lista de planos en la tabla con:
   - Nombre del plano
   - Número de puntos
   - Botón "Open" para visualizar

### Visualizar un Plano

1. **Hacer clic en el botón "Open"** de cualquier plano en la tabla
2. El plano se dibujará automáticamente en el canvas
3. El título se actualizará mostrando el nombre del plano actual

### Cambiar Modo de API

- **Modo Prueba (Mock)**: Usa datos de prueba locales
- **Modo Real (API)**: Conecta con el API REST del backend

Usar los botones en el panel inferior para cambiar entre modos.

---

##  Patrón Módulo JavaScript

El proyecto implementa el patrón módulo para encapsular funcionalidad:

```javascript
var app = (function() {
    // Variables privadas
    var currentAuthor = null;
    var blueprints = [];
    
    // Métodos públicos
    return {
        setAuthor: function(name) { ... },
        loadBlueprints: function(authorName) { ... },
        drawBlueprint: function(author, name) { ... }
    };
})();
```

**Ventajas:**
- Encapsulación de datos privados
- Evita contaminación del scope global
- Mejor organización del código
- Fácil mantenimiento

---

##  Intercambio entre Mock y API

El código está diseñado para cambiar fácilmente entre el mock y el API real:

```javascript
// En index.html
window.currentApi = apimock;  // Cambiar a: apiclient

// En app.js
window.currentApi.getBlueprintsByAuthor(authorName, callback);
```

Simplemente cambiando la referencia de `window.currentApi` se intercambia entre ambas implementaciones.

---

