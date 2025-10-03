
// var api = apimock;
var api = apiclient;


var app = (function() {
    // Variables privadas
    var selectedAuthor = "";
    var blueprintsList = [];

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

    function drawBlueprint(points) {
        var canvas = document.getElementById('blueprintCanvas');
        var ctx = canvas.getContext('2d');
        
        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!points || points.length === 0) return;
        
        // Configuración del dibujo
        ctx.strokeStyle = '#4285F4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Mover al primer punto
        ctx.moveTo(points[0].x, points[0].y);
        
        // Dibujar líneas entre los puntos
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        // Aplicar el trazo
        ctx.stroke();
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

            window.currentApi.getBlueprintsByAuthor(author, function(blueprints) {
                if (blueprints && blueprints.length > 0) {
                    blueprintsList = blueprints;
                    updateBlueprintsTable(blueprints);
                    updateTotalPoints(blueprints);
                } else {
                    $tableBody.html('<tr><td colspan="3" class="text-center">No se encontraron planos para: ' + author + '</td></tr>');
                    $("#totalPoints").text("0");
                }
            });
        },

        openBlueprint: function(author, name) {
            if (!author || !name) return;
            
            // Mostrar mensaje de carga
            $('#blueprintTitle').text('Cargando: ' + name + '...');
            
            window.currentApi.getBlueprintsByNameAndAuthor(author, name, function(blueprint) {
                if (blueprint && blueprint.points && blueprint.points.length > 0) {
                    // Actualizar el título del plano
                    $('#blueprintTitle').text('Plano: ' + name + ' (' + blueprint.points.length + ' puntos)');
                    
                    // Dibujar el plano en el canvas
                    drawBlueprint(blueprint.points);
                } else {
                    showError("No se pudo cargar el plano o no tiene puntos: " + name);
                    $('#blueprintTitle').text('Error al cargar el plano: ' + name);
                }
            });
        }
    };
})();

$(document).ready(function() {
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

});