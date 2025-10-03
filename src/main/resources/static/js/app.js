// Módulo JavaScript para la aplicación Blueprints
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

            apimock.getBlueprintsByAuthor(author, function(blueprints) {
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
            
            apimock.getBlueprintsByNameAndAuthor(author, name, function(blueprint) {
                if (blueprint) {
                    console.log("Mostrando plano:", blueprint);
                    alert("Vista previa del plano: " + name + "\nPuntos: " + (blueprint.points ? blueprint.points.length : 0));
                } else {
                    showError("No se pudo cargar el plano: " + name);
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