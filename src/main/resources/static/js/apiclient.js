/**
 * Módulo apiclient.js
 * Maneja las llamadas a la API REST real del servicio de Blueprints
 */
var apiclient = (function() {
    // URL base de la API REST
    var API_BASE_URL = "http://localhost:8080/blueprints";
    
    /**
     * Maneja errores de las peticiones AJAX
     * @param {string} error - Mensaje de error
     * @param {function} callback - Función de callback a llamar con el error
     */
    function handleError(error, callback) {
        console.error("Error en la petición:", error);
        if (typeof callback === 'function') {
            callback(null);
        }
    }

    return {
        /**
         * Obtiene todos los planos de un autor
         * @param {string} authname - Nombre del autor
         * @param {function} callback - Función de retorno con los planos
         */
        getBlueprintsByAuthor: function(authname, callback) {
            if (!authname) {
                handleError("Se requiere el nombre del autor", callback);
                return;
            }
            
            $.ajax({
                url: `${API_BASE_URL}/${authname}`,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data && Array.isArray(data)) {
                        // Mapear la respuesta al formato esperado
                        var blueprints = data.map(function(bp) {
                            return {
                                author: authname,
                                name: bp.name,
                                points: bp.points || []
                            };
                        });
                        callback(blueprints);
                    } else {
                        callback([]);
                    }
                },
                error: function(xhr, status, error) {
                    handleError(error, callback);
                }
            });
        },

        /**
         * Obtiene un plano específico por autor y nombre
         * @param {string} authname - Nombre del autor
         * @param {string} bpname - Nombre del plano
         * @param {function} callback - Función de retorno con el plano
         */
        getBlueprintsByNameAndAuthor: function(authname, bpname, callback) {
            if (!authname || !bpname) {
                handleError("Se requieren el autor y el nombre del plano", callback);
                return;
            }
            
            $.ajax({
                url: `${API_BASE_URL}/${authname}/${bpname}`,
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (data) {
                        // Asegurar que la respuesta tenga el formato esperado
                        var blueprint = {
                            author: authname,
                            name: data.name || bpname,
                            points: data.points || []
                        };
                        callback(blueprint);
                    } else {
                        callback(null);
                    }
                },
                error: function(xhr, status, error) {
                    if (xhr.status === 404) {
                        // Plano no encontrado
                        callback(null);
                    } else {
                        handleError(error, callback);
                    }
                }
            });
        }
    };
})();
