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

    function parseAjaxError(err) {
        // err may be: a string, an Error object, a jqXHR, or jQuery fail args
        try {
            if (!err) return 'Error desconocido';
            if (typeof err === 'string') return err;
            if (err.responseText) return err.responseText;
            if (err.statusText) return err.statusText;
            // jQuery sometimes passes (jqXHR, textStatus, errorThrown) as multiple args;
            // if someone forwarded an array-like object, try to extract
            if (err.length && typeof err[1] === 'string') return err[1];
            if (err.errorThrown) return err.errorThrown;
            if (err.message) return err.message;
            return JSON.stringify(err);
        } catch (e) {
            return 'Error desconocido';
        }
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
                    var msg = parseAjaxError(error);
                    $tableBody.html('<tr><td colspan="3" class="text-center">Error al cargar los planos: ' + msg + '</td></tr>');
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
                        
                        // Habilitar el botón Save y DELETE cuando se abre un blueprint existente
                        enableSaveButton();
                        $('#deleteBtn').prop('disabled', false);
                    } else {
                        showError("No se pudo cargar el plano: " + name);
                        $('#blueprintTitle').text('Error al cargar el plano: ' + name);
                        disableSaveButton();
                    }
                })
                .catch(function(error) {
                    console.error("Error al obtener el blueprint:", error);
                    var msg = parseAjaxError(error);
                    showError("No se pudo cargar el plano: " + name + ' - ' + msg);
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

            // Decide whether to POST (create) or PUT (update) based on isNew flag
            var opPromise;
            if (currentBlueprint.isNew) {
                opPromise = window.currentApi.createBlueprint(currentBlueprint);
            } else {
                opPromise = window.currentApi.updateBlueprint(author, name, currentBlueprint);
            }
 
            opPromise
                .then(function() {
                    // If it was a creation, clear the isNew flag so future saves do PUT
                    if (currentBlueprint.isNew) currentBlueprint.isNew = false;
                    // Refresh the author's blueprint list
                    return window.currentApi.getBlueprintsByAuthor(author);
                })
                .then(function(blueprints) {
                    if (blueprints && blueprints.length > 0) {
                        blueprintsList = blueprints;
                        updateBlueprintsTable(blueprints);
                        updateTotalPoints(blueprints);
                    }
                    showSuccess("Blueprint guardado exitosamente");
                    $saveBtn.prop('disabled', false).html('<span class="glyphicon glyphicon-floppy-disk"></span> Save/Update');
                    // enable delete now that it's persisted
                    $('#deleteBtn').prop('disabled', false);
                })
                .catch(function(error) {
                    console.error("Error en el proceso de guardado:", error);
                    var msg = parseAjaxError(error);
                    showError("Error al guardar el blueprint: " + msg);
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

            // Mark the blueprint as new (not yet persisted). The actual POST will happen on Save.
            currentBlueprint = { author: author, name: name, points: [], isNew: true };
            $('#blueprintTitle').text('Plano: ' + name + ' (0 puntos)');
            enableSaveButton();
            // Keep DELETE disabled until the blueprint is persisted (or an existing one is opened)
            $('#deleteBtn').prop('disabled', true);
            showSuccess('Plano listo para crear. Presione Save/Update para persistirlo.');
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
                    var msg = parseAjaxError(err);
                    showError('No se pudo eliminar el blueprint: ' + msg);
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