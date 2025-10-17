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
		getBlueprintsByAuthor: function(authname) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					resolve(mockdata[authname] || []);
				}, 300);
			});
		},
		getBlueprintsByNameAndAuthor: function(authname, bpname) {
			return new Promise(function(resolve) {
				setTimeout(function() {
					var authorBlueprints = mockdata[authname];
					if (authorBlueprints) {
						var blueprint = authorBlueprints.find(function(e) {
							return e.name === bpname;
						});
						resolve(blueprint || null);
					} else {
						resolve(null);
					}
				}, 300);
			});
		}
		,

		createBlueprint: function(blueprint) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					if (!blueprint || !blueprint.author || !blueprint.name) {
						reject({ status: 400, responseText: 'Invalid blueprint' });
						return;
					}
					var arr = mockdata[blueprint.author] || [];
					// avoid duplicates: if exists, reject
					if (arr.find(function(b) { return b.name === blueprint.name; })) {
						reject({ status: 409, responseText: 'Blueprint already exists' });
						return;
					}
					arr.push({ author: blueprint.author, name: blueprint.name, points: blueprint.points || [] });
					mockdata[blueprint.author] = arr;
					resolve({ status: 201 });
				}, 300);
			});
		},

		deleteBlueprint: function(author, name) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					var arr = mockdata[author];
					if (!arr) {
						reject({ status: 404, responseText: 'Author not found' });
						return;
					}
					var idx = arr.findIndex(function(b) { return b.name === name; });
					if (idx === -1) {
						reject({ status: 404, responseText: 'Blueprint not found' });
						return;
					}
					arr.splice(idx, 1);
					mockdata[author] = arr;
					resolve({ status: 200 });
				}, 300);
			});
		}
	};
})();