var apiclient = (function() {
    var baseUrl = "http://localhost:8080/blueprints";

    return {
        getBlueprintsByAuthor: function(author) {
            return $.ajax({
                url: baseUrl + "/" + author,
                type: 'GET'
            });
        },

        getBlueprintsByNameAndAuthor: function(author, name) {
            return $.ajax({
                url: baseUrl + "/" + author + "/" + name,
                type: 'GET'
            });
        },

        updateBlueprint: function(author, name, blueprint) {
            return $.ajax({
                url: baseUrl + "/" + author + "/" + name,
                type: 'PUT',
                data: JSON.stringify(blueprint),
                contentType: "application/json"
            });
        },

        createBlueprint: function(blueprint) {
            return $.ajax({
                url: baseUrl,
                type: 'POST',
                data: JSON.stringify(blueprint),
                contentType: 'application/json'
            });
        },

        deleteBlueprint: function(author, name) {
            return $.ajax({
                url: baseUrl + '/' + author + '/' + name,
                type: 'DELETE'
            });
        },

        getAllBlueprints: function() {
            return $.ajax({
                url: baseUrl,
                type: 'GET'
            });
        }
    };
})();