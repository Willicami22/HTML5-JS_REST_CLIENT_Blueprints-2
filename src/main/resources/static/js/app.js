// var api = apimock;
var api = apiclient;


var app = (function() {
    // Variables privadas
    var selectedAuthor = "";
    var blueprintsList = [];
    var currentBlueprint = { author: "", name: "", points: [] };

    function updateBlueprintsTable(blueprints) {
        var $tableBody = $("#BluePrints tbody");
        $tableBody.empty();

        if (blueprints && blueprints.length > 0) {
            blueprints.forEach(function(blueprint) {
                var row = $("<tr>");
                $("<td>").text(blueprint.name || 'Sin nombre').appendTo(row);
                var points = blueprint.points ? blueprint.points.length : 0;
                $("<td>").text(points).appendTo(row);
                
                var openBtn = $('<button>').addClass('btn btn-primary btn-sm open-blueprint')
                                         .text('Abrir')
                                         .data('author', blueprint.author)
                                         .data('name', blueprint.name);
                
                $("<td>").append(openBtn).appendTo(row);
                row.appendTo($tableBody);
            });
        } else {
            var row = $("<tr>");
            $("<td>", { colspan: 3, class: 'text-center' })
                .text("No hay planos disponibles")
                .appendTo(row);
            row.appendTo($tableBody);
        }
    }

    function updateTotalPoints(blueprints) {
        var totalPoints = 0;
        if (blueprints && blueprints.length > 0) {
            totalPoints = blueprints.reduce(function(sum, blueprint) {
                return sum + (blueprint.points ? blueprint.points.length : 0);
            }, 0);
        }
        $("#totalPoints").text(totalPoints);
    }

    function showError(message) {
        alert("Error: " + message);
    }

    function showSuccess(message) {
        // Mostrar un mensaje de éxito temporal
        var alertHtml = '<div class="alert alert-success alert-dismissible" role="alert" style="position: fixed; top: 70px; right: 20px; z-index: 9999;">' +
                       '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                       '<strong>¡Éxito!</strong> ' + message +
                       '</div>';
        $('body').append(alertHtml);
        
        // Eliminar el mensaje después de 3 segundos
        setTimeout(function() {
            $('.alert-success').fadeOut(function() {
                $(this).remove();
            });
        }, 3000);
    }

    function drawBlueprint(points) {
        var canvas = document.getElementById('blueprintCanvas');
        var ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!points || points.length === 0) return;
        
        ctx.strokeStyle = '#4285F4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        ctx.moveTo(points[0].x, points[0].y);
        
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = '#DB4437';
        points.forEach(function(point) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function addPointToCurrentBlueprint(x, y) {
        // Verificar que hay un blueprint seleccionado
        if (!currentBlueprint.name || !currentBlueprint.author) {
            console.log("No hay blueprint seleccionado. No se puede agregar el punto.");
            return;
        }
        
        var newPoint = { x: x, y: y };
        
        // 1. Agregar el punto al final de la secuencia (solo en memoria)
        currentBlueprint.points.push(newPoint);
        
        console.log("Nuevo punto agregado:", newPoint);
        console.log("Total de puntos:", currentBlueprint.points.length);
        
        // 2. Repintar el dibujo con todos los puntos
        drawBlueprint(currentBlueprint.points);
        
        // Actualizar el título con el nuevo conteo de puntos
        $('#blueprintTitle').text('Plano: ' + currentBlueprint.name + 
                                 ' (' + currentBlueprint.points.length + ' puntos)');
    }

    function initCanvasEventHandlers() {
        var canvas = document.getElementById('blueprintCanvas');
        
        if (!canvas) {
            console.error("Canvas no encontrado");
            return;
        }

        // Manejador para PointerEvent (soporta mouse y touch)
        canvas.addEventListener('pointerdown', function(event) {
            // Verificar que hay un blueprint abierto antes de procesar el click
            if (!currentBlueprint.name || !currentBlueprint.author) {
                console.log("No hay blueprint abierto. Seleccione uno primero.");
                return;
            }
            
            // Obtener las coordenadas relativas al canvas
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            
            // Agregar el punto al blueprint actual
            addPointToCurrentBlueprint(Math.round(x), Math.round(y));
        });

        // Cambiar el cursor cuando el mouse está sobre el canvas
        canvas.style.cursor = 'crosshair';
        
        console.log("Manejadores de eventos del canvas inicializados");
    }

    function enableSaveButton() {
        $('#saveBtn').prop('disabled', false);
    }

    function disableSaveButton() {
        $('#saveBtn').prop('disabled', true);
    }

    return {
        loadBlueprints: function(author) {
            if (!author) {
                showError("Por favor ingrese un nombre de autor");
                return;
            }

            selectedAuthor = author;
            $("#NameAuthor").text(author + " BluePrints:");
            
            var $tableBody = $("#BluePrints tbody");
            $tableBody.html('<tr><td colspan="3" class="text-center">Cargando...</td></tr>');

            window.currentApi.getBlueprintsByAuthor(author)
                .then(function(blueprints) {
                    console.log("Blueprints obtenidos:", blueprints);
                    if (blueprints && blueprints.length > 0) {
                        blueprintsList = blueprints;
                        updateBlueprintsTable(blueprints);
                        updateTotalPoints(blueprints);
                    } else {
                        $tableBody.html('<tr><td colspan="3" class="text-center">No se encontraron planos para: ' + author + '</td></tr>');
                        $("#totalPoints").text("0");
                    }
                })
                .catch(function(error) {
                    console.error("Error al obtener blueprints:", error);
                    $tableBody.html('<tr><td colspan="3" class="text-center">Error al cargar los planos</td></tr>');
                    $("#totalPoints").text("0");
                });
        },

        openBlueprint: function(author, name) {
            if (!author || !name) return;
            
            $('#blueprintTitle').text('Cargando: ' + name + '...');
            
            window.currentApi.getBlueprintsByNameAndAuthor(author, name)
                .then(function(blueprint) {
                    console.log("Blueprint obtenido:", blueprint);
                    if (blueprint && blueprint.points) {
                        // Guardar el blueprint actual (copia profunda de los puntos)
                        currentBlueprint = {
                            author: blueprint.author,
                            name: blueprint.name,
                            points: blueprint.points.map(function(p) {
                                return { x: p.x, y: p.y };
                            })
                        };
                        
                        $('#blueprintTitle').text('Plano: ' + name + ' (' + currentBlueprint.points.length + ' puntos)');
                        
                        drawBlueprint(currentBlueprint.points);
                        
                        // Habilitar el botón Save cuando se abre un blueprint
                        enableSaveButton();
                    } else {
                        showError("No se pudo cargar el plano: " + name);
                        $('#blueprintTitle').text('Error al cargar el plano: ' + name);
                        disableSaveButton();
                    }
                })
                .catch(function(error) {
                    console.error("Error al obtener el blueprint:", error);
                    showError("No se pudo cargar el plano: " + name);
                    $('#blueprintTitle').text('Error al cargar el plano: ' + name);
                    disableSaveButton();
                });
        },

        saveCurrentBlueprint: function() {
            // Verificar que hay un blueprint cargado
            if (!currentBlueprint.name || !currentBlueprint.author) {
                showError("No hay ningún blueprint abierto para guardar");
                return;
            }

            var author = currentBlueprint.author;
            var name = currentBlueprint.name;

            console.log("Guardando blueprint:", author + "/" + name);
            console.log("Puntos a guardar:", currentBlueprint.points.length);

            // Deshabilitar el botón mientras se procesa
            var $saveBtn = $('#saveBtn');
            $saveBtn.prop('disabled', true).html('<span class="glyphicon glyphicon-refresh glyphicon-spin"></span> Guardando...');

            // Usar promesas para ejecutar las operaciones en orden
            // 1. Hacer PUT al API con el plano actualizado (se asume que el recurso ya existe)
            window.currentApi.updateBlueprint(author, name, currentBlueprint)
                .then(function(response) {
                    console.log("Blueprint actualizado exitosamente en el servidor");
                    
                    // 2. Hacer GET al recurso /blueprints/{author} para obtener los planos del autor
                    return window.currentApi.getBlueprintsByAuthor(author);
                })
                .then(function(blueprints) {
                    console.log("Blueprints recargados del servidor");
                    
                    if (blueprints && blueprints.length > 0) {
                        blueprintsList = blueprints;
                        updateBlueprintsTable(blueprints);
                        
                        // 3. Calcular nuevamente los puntos totales del usuario
                        updateTotalPoints(blueprints);
                    }
                    
                    showSuccess("Blueprint guardado exitosamente");
                    
                    // Rehabilitar el botón
                    $saveBtn.prop('disabled', false).html('<span class="glyphicon glyphicon-floppy-disk"></span> Save/Update');
                })
                .catch(function(error) {
                    console.error("Error en el proceso de guardado:", error);
                    showError("Error al guardar el blueprint: " + (error.responseText || error.statusText || "Error desconocido"));
                    
                    // Rehabilitar el botón
                    $saveBtn.prop('disabled', false).html('<span class="glyphicon glyphicon-floppy-disk"></span> Save/Update');
                });
        },

        createNewBlueprint: function() {
            var author = selectedAuthor;
            if (!author) {
                showError('Por favor seleccione o ingrese un autor antes de crear un blueprint');
                return;
            }

            var name = prompt('Ingrese el nombre del nuevo blueprint:');
            if (!name) {
                showError('Nombre de blueprint no provisto');
                return;
            }

            // Clear canvas and set currentBlueprint with empty points
            var canvas = document.getElementById('blueprintCanvas');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            currentBlueprint = { author: author, name: name, points: [] };
            $('#blueprintTitle').text('Plano: ' + name + ' (0 puntos)');
            enableSaveButton();
            $('#deleteBtn').prop('disabled', false);

            // Create on the server, then refresh list and points using promises
            window.currentApi.createBlueprint(currentBlueprint)
                .then(function() {
                    return window.currentApi.getBlueprintsByAuthor(author);
                })
                .then(function(blueprints) {
                    blueprintsList = blueprints;
                    updateBlueprintsTable(blueprints);
                    updateTotalPoints(blueprints);
                    showSuccess('Blueprint creado exitosamente');
                })
                .catch(function(err) {
                    console.error('Error creando blueprint:', err);
                    showError('No se pudo crear el blueprint: ' + (err.responseText || err.statusText || 'Error desconocido'));
                });
        },

        deleteCurrentBlueprint: function() {
            if (!currentBlueprint || !currentBlueprint.name || !currentBlueprint.author) {
                showError('No hay blueprint seleccionado para eliminar');
                return;
            }

            var author = currentBlueprint.author;
            var name = currentBlueprint.name;

            // Clear canvas immediately
            var canvas = document.getElementById('blueprintCanvas');
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            $('#blueprintTitle').text('Current Blueprint: None');
            disableSaveButton();
            $('#deleteBtn').prop('disabled', true);

            // Delete on server, then refresh list
            window.currentApi.deleteBlueprint(author, name)
                .then(function() {
                    return window.currentApi.getBlueprintsByAuthor(author);
                })
                .then(function(blueprints) {
                    blueprintsList = blueprints;
                    updateBlueprintsTable(blueprints);
                    updateTotalPoints(blueprints);
                    currentBlueprint = { author: '', name: '', points: [] };
                    showSuccess('Blueprint eliminado correctamente');
                })
                .catch(function(err) {
                    console.error('Error eliminando blueprint:', err);
                    showError('No se pudo eliminar el blueprint: ' + (err.responseText || err.statusText || 'Error desconocido'));
                });
        },

        init: function() {
            initCanvasEventHandlers();
        }
    };
})();

$(document).ready(function() {
    // Inicializar los manejadores de eventos del canvas
    app.init();

    $("#searchBtn").click(function() {
        var author = $("#Author").val().trim();
        app.loadBlueprints(author);
    });

    $("#Author").keypress(function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $("#searchBtn").click();
        }
    });

    $(document).on('click', '.open-blueprint', function() {
        var author = $(this).data('author');
        var name = $(this).data('name');
        app.openBlueprint(author, name);
    });

    // Manejador para el botón Save/Update
    $("#saveBtn").click(function() {
        app.saveCurrentBlueprint();
    });

    // Manejador para Create new blueprint
    $("#createBtn").click(function() {
        app.createNewBlueprint();
    });

    // Manejador para DELETE
    $("#deleteBtn").click(function() {
        if (confirm('¿Confirma que desea eliminar el blueprint actual?')) {
            app.deleteCurrentBlueprint();
        }
    });

});