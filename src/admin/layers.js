
angular.module('myApp.services').factory('layersService', function ($http) {
    var drawInitilized = false;
    return {
        layers: function () {
            return $http.get('/api/layers').then(function (response) {
                return response.data;
            });
        },
        sortAscLayers: function(a, b){
			return a.title > b.title ? 1 : -1;
        },
        copy: function(layer){
			return {
				id: layer.id,
				title: layer.title,
				description: layer.description,
				uri: layer.uri
			};
        },
        tileLayers: function(){
            return $http.get('/api/tile-layers').then(function(response){
                return response.data;
            });
        },
        initDraw: function(map, drawnItems, onCreated, onEdited, onDeleted){
            if (drawInitilized){
                return;
            }
            drawInitilized = true;
            map.addLayer(drawnItems);

            // Initialise the draw control and pass it the FeatureGroup of editable layers
            var drawControl = new L.Control.Draw({
                edit:{
                    featureGroup: drawnItems
                }
            });
            map.addControl(drawControl);
            map.on('draw:created', function (e) {
                onCreated(map, e);
            });
            map.on('draw:edited', function (e) {
                onEdited(map, e);
            });
            map.on('draw:deleted', function (e) {
                onDeleted(map, e);
            });

            return drawnItems;
        }
    };
});
