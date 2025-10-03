//@author hcadavid
var apimock = (function() {
	var mockdata = {};

	mockdata["johnconnor"] = [
		{
			author: "johnconnor",
			points: [
				{"x":150,"y":120},
				{"x":215,"y":115},
				{"x":300,"y":200},
				{"x":250,"y":180}
			],
			name: "house"
		},
		{
			author: "johnconnor",
			points: [
				{"x":340,"y":240},
				{"x":15,"y":215},
				{"x":100,"y":300},
				{"x":200,"y":150},
				{"x":280,"y":220}
			],
			name: "gear"
		}
	];

	mockdata["maryweyland"] = [
		{
			author: "maryweyland",
			points: [
				{"x":140,"y":140},
				{"x":115,"y":115},
				{"x":200,"y":100},
				{"x":180,"y":200}
			],
			name: "house2"
		},
		{
			author: "maryweyland",
			points: [
				{"x":140,"y":140},
				{"x":115,"y":115},
				{"x":90,"y":160},
				{"x":140,"y":190},
				{"x":190,"y":160},
				{"x":165,"y":115}
			],
			name: "gear2"
		}
	];

	mockdata["david"] = [
		{
			author: "david",
			points: [
				{"x":100,"y":100},
				{"x":200,"y":100},
				{"x":200,"y":200},
				{"x":100,"y":200},
				{"x":100,"y":100}
			],
			name: "blueprint1"
		},
		{
			author: "david",
			points: [
				{"x":50,"y":250},
				{"x":150,"y":250},
				{"x":150,"y":350},
				{"x":50,"y":350},
				{"x":50,"y":250}
			],
			name: "blueprint2"
		}
	];

	return {
		getBlueprintsByAuthor: function(authname, callback) {
			// Simular llamada asíncrona a la API real
			setTimeout(function() {
				callback(mockdata[authname] || []);
			}, 500);
		},

		getBlueprintsByNameAndAuthor: function(authname, bpname, callback) {
			setTimeout(function() {
				var authorBlueprints = mockdata[authname];
				if (authorBlueprints) {
					var blueprint = authorBlueprints.find(function(e) {
						return e.name === bpname;
					});
					callback(blueprint || null);
				} else {
					callback(null);
				}
			}, 500);
		}
	};
})();