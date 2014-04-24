/*jshint strict:false */
/*global angular:false */
/*global L:false */
angular.module('myApp').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/maps', {
        controller: 'MapListController',
        templateUrl: 'partials/maps.html'
    });
    $routeProvider.when('/maps/:id', {
        controller: 'MapListController',
        templateUrl: 'partials/maps.html'
    });
    $routeProvider.otherwise({redirectTo: '/maps'});
}]);
angular.module('myApp.controllers').controller(
    'MapListController',
    ['$scope', '$routeParams', '$location', 'gettext', 'Restangular', 'messagesService',
    function($scope, $routeParams, $location, gettext, Restangular, messagesService){
        messagesService.hook(Restangular);
        $scope.maps = [];
        $scope.newMap = '';
        Restangular.all('tile-layers').getList().then(function(data){
            $scope.mapLayers = {
                baselayers: {}
            };
            for (var i = 0; i < data.length; i++) {
                $scope.mapLayers.baselayers[data[i].id] = {
                    name: data[i].title,
                    type: 'xyz',
                    url: data[i].uri,
                    layerOptions: data[i].layerOptions
                };
            }
        });
        $scope.tiles = {
            url: "http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg",
            options: {
                attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                subdomains: '1234'
            }
        };
        $scope.hostname = $location.protocol() + '://' + $location.host();
        if ($location.port() !== 80){
            $scope.hostname += ':' + $location.port().toString();
        }
        Restangular.all('maps').getList().then(function(data){
            $scope.maps = data;
        });
        $scope.addMap = function () {
            var newMapTitle = $scope.newMap.trim();
            if (!newMapTitle.length) {
                $scope.messages.adderror('title cannot be empty');
                return;
            }
            var emptyMap = {
                id: '',
                title: newMapTitle,
                description: '',
                modified: new Date(),
                lat: 47.2383,
                lng:-1.5603,
                zoom: 11,
                layers: [],
                tileLayers: [{id: 'complet', title: 'Fond complet'}],
                leaflet: {
                    zoom: true,
                    controlLayers: true,
                    controlGeocoder: true,
                    minimap: false,
                    fullscreen: false
                },
                drawnFeatures: []
            };
            Restangular.all('maps').post(emptyMap).then(function(data){
                if (!data){
                    return;
                }
                $scope.newMap = '';
                $location.path('/maps/'+data.id);
                messagesService.addInfo(gettext('Map added'), 3000);
            });
        };
        $scope.setCurrentMap = function(map){
            $location.path('maps/'+map.id);
        };
    }]
);
angular.module('myApp.controllers').controller(
    'MapDetailsController',
    ['$scope', '$location', '$routeParams', 'leafletData', 'layersService', 'Restangular', 'messagesService', 'gettext', 'geoCodingService',
    function($scope, $location, $routeParams, leafletData, layersService, Restangular, messagesService, gettext, geoCodingService){
        console.log('init MapDetailsController');
        if ($routeParams.id === undefined){
            return;
        }
        $scope.memoizeZoom = function(){
            $scope.originalZoom = {
                lat: $scope.currentMap.lat,
                lng: $scope.currentMap.lng,
                zoom: $scope.currentMap.zoom
            };
        };
        $scope.resetZoom = function(){
            leafletData.getMap().then(function(map){
                map.setView(L.latLng($scope.originalZoom.lat, $scope.originalZoom.lng), $scope.originalZoom.zoom);
            });
        };
        Restangular.one('maps', $routeParams.id).get().then(function(currentMap){
            $scope.currentMap = currentMap;
            $scope.memoizeZoom();
        });

        $scope.searchGeoCoding = function(query){
            return geoCodingService.get(query).then(function(data){
                $scope.geocodingResults = data.data;
            });
        };
        $scope.updateLocation = function(place){
            leafletData.getMap().then(function(map){
                map.setView(L.latLng(parseFloat(place.lat), parseFloat(place.lon)), 17);
            });
        };

        layersService.layers().then(function(data){
            $scope.layers = data;
        }, function(error){
            messagesService.parseError(error);
        });
        layersService.tileLayers().then(function(data){
            $scope.tileLayers = data;
        }, function(error){
            messagesService.parseError(error);
        });
        $scope.addTileLayer = function(layer){
            var alreadyIn = false;
            for (var i = 0; i < $scope.currentMap.tileLayers.length; i++) {
                if ($scope.currentMap.tileLayers[i].id === layer.id){
                    alreadyIn = true;
                }
            }
            if (!alreadyIn){
                var copiedLayer = layersService.copy(layer);
                $scope.currentMap.tileLayers.push(copiedLayer);
            }
        };
        $scope.addLayer = function(layer){
            var alreadyIn = false;
            for (var i = 0; i < $scope.currentMap.layers.length; i++) {
                if ($scope.currentMap.layers[i].id === layer.id){
                    alreadyIn = true;
                }
            }
            if (!alreadyIn){
                var copiedLayer = layersService.copy(layer);
                copiedLayer.displayed = true;
                $scope.currentMap.layers.push(copiedLayer);
            }
        };
        $scope.rmLayer = function(layer){
            for (var i = 0; i < $scope.currentMap.layers.length; i++) {
                if ($scope.currentMap.layers[i].id === layer.id){
                    $scope.currentMap.layers.splice(i, 1);
                }
            }
        };
        $scope.moveLayer = function(layers, layer, indice){
            var index;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].id === layer.id){
                    index = i;
                    break;
                }
            }
            if (index !== undefined){
                var temp = layers[index + indice];
                layers[index+indice] = layers[index];
                layers[index] = temp;
            }
        };
        $scope.upLayer = function(layer){
            $scope.moveLayer($scope.currentMap.layers, layer, -1);
        };
        $scope.downLayer = function(layer){
            $scope.moveLayer($scope.currentMap.layers, layer, +1);
        };
        $scope.upTileLayer = function(layer){
            $scope.moveLayer($scope.currentMap.tileLayers, layer, -1);
        };
        $scope.downTileLayer = function(layer){
            $scope.moveLayer($scope.currentMap.tileLayers, layer, +1);
        };
        $scope.rmTileLayer = function(layer){
            for (var i = 0; i < $scope.currentMap.tileLayers.length; i++) {
                if ($scope.currentMap.tileLayers[i].id === layer.id){
                    $scope.currentMap.tileLayers.splice(i, 1);
                }
            }
        };
        $scope.sortLayer = function(order){
            $scope.currentMap.layers.sort(layersService.sortAscLayers);
            if (order === 'desc'){
                $scope.currentMap.layers.reverse();
            }
        };
        $scope.save = function(params){
            console.log('save');
            if (params){
                if (params.withZoom === 1){
                    $scope.memoizeZoom();
                }
            }
            $scope.currentMap.put(params).then(function(){
                messagesService.addInfo(gettext('Map saved'), 2000);
            });
        };
        $scope.delete = function(){
            $scope.currentMap.remove().then(function(){
                var index = $scope.maps.indexOf($scope.currentMap);
                if (index > -1) {
                    $scope.maps.splice(index, 1);
                    messagesService.addInfo(gettext('Map deleted'), 2000);
                }
                $location.path('maps');
            });
        };
        var watchedAttrs = [
            'title', 'description', 'layers', 'leaflet'
        ];
        $scope.$watch('currentMap', function(newValue, oldValue){
            if (oldValue === undefined || newValue === undefined){
                return;
            }
            if (newValue.id !== oldValue.id){
                return;
            }

            for (var i = 0; i < watchedAttrs.length; i++) {
                if (JSON.stringify(oldValue[watchedAttrs[i]]) !== JSON.stringify(newValue[watchedAttrs[i]])){
                    console.log(watchedAttrs[i] + ' ' + JSON.stringify(oldValue[watchedAttrs[i]]) + ' -> ' + JSON.stringify(newValue[watchedAttrs[i]]));
                    $scope.save();
                }
            }
        }, true);

    }]
);

angular.module('myApp.controllers').controller(
    'DrawController',
    ['$scope', 'leafletData', 'layersService', 'Restangular', 'messagesService', 'gettext',
    function($scope, leafletData, layersService, Restangular, messagesService, gettext){
        console.log('init DrawController');
        $scope.tinymceOptions = {
            language : 'fr_FR'
        };
        $scope.drawnFeatureCollection = {
            type: "FeatureCollection",
            features: $scope.currentMap.drawnFeatures
        };
        $scope.reloadDrawnItems = function(){
            //unload if already exists
            if ($scope.drawnItems !== undefined){
                $scope.map.removeLayer($scope.drawnItems);
            }
            $scope.drawnItems = L.geoJson($scope.drawnFeatureCollection, {
                pointToLayer: function (feature, latlng) {
                    if (feature !== undefined){
                        if (feature.properties.radius){
                            var circle = L.circle(latlng);
                            circle.setRadius(parseInt(feature.properties.radius));
                            return circle;
                        }
                    }
                    return L.marker(latlng);
                },
                onEachFeature: function (feature, layer) {
                    layer.bindLabel(feature.properties.label,
                        {noHide:true, direction: 'auto'});
                    layer.bindPopup(feature.properties.popupContent);
                }
            });
            $scope.map.addLayer($scope.drawnItems);
        };
        var onCreated = function(map, e){
            var layer = e.layer;
            var feature = layer.toGeoJSON();
            if (e.layerType === 'circle'){
                feature.properties.radius = layer.getRadius();
            }
            $scope.drawnItems.addLayer(layer);
            map.addLayer(layer);
            $scope.currentMap.drawnFeatures.push(feature);
            $scope.save();
        };
        var onDeleted = function(map, e){
            var features = [];
            $scope.drawnItems.eachLayer(function (layer) {
                features.push(layer.toGeoJSON());
            });
            $scope.currentMap.drawnFeatures = features;
            $scope.save();
        };
        var onEdited = function(map, e){
            var features = [];
            $scope.drawnItems.eachLayer(function (layer) {
                features.push(layer.toGeoJSON());
            });
            $scope.currentMap.drawnFeatures = features;
            $scope.save();
        };
        $scope.loadController = function(){
            if ($scope.map === undefined){
                return;
            }
            if ($scope.drawControl !== undefined){
                $scope.map.removeControl($scope.drawControl);
                $scope.map.removeEventListener('draw:created');
                $scope.map.removeEventListener('draw:edited');
                $scope.map.removeEventListener('draw:deleted');
            }
            $scope.drawControl = new L.Control.Draw({
                edit:{
                    featureGroup: $scope.drawnItems
                }
            });
            $scope.map.addControl($scope.drawControl);
            $scope.map.on('draw:created', function (e) {
                onCreated($scope.map, e);
            });
            $scope.map.on('draw:edited', function (e) {
                onEdited($scope.map, e);
            });
            $scope.map.on('draw:deleted', function (e) {
                onDeleted($scope.map, e);
            });
        };

        $scope.selectFeature = function(feature){
            if ($scope.currentFeature !== undefined){
                $scope.currentFeature.selected = false;
            }
            $scope.currentFeature = feature;
            $scope.currentFeature.selected = true;
            //how to get the layer ?
            $scope.drawnItems.eachLayer(function(layer){
                if (JSON.stringify(layer.toGeoJSON().geometry) === JSON.stringify(feature.geometry)){
                    if (layer.getBounds !== undefined){
                        $scope.map.fitBounds(layer.getBounds());
                    }else{
                        $scope.map.setView(layer.getLatLng());
                    }
                }
            });
        };
        $scope.$watch('currentFeature', function(newValue, oldValue){
            if (oldValue === undefined){
                return;
            }
            //remove change of currentFeature
            if (oldValue.selected !== newValue.selected){
                return;
            }
            if (oldValue.properties.popupContent !== newValue.properties.popupContent){
                $scope.reloadDrawnItems();
                $scope.loadController();
                $scope.save();
            }
            if (oldValue.properties.label !== newValue.properties.label){
                //update markers
                $scope.reloadDrawnItems();
                $scope.loadController();
                $scope.save();
            }
        }, true);
        $scope.$on('leafletDirectiveMap.load', function(event){
            leafletData.getMap().then(function(map) {
                $scope.map = map;
                $scope.reloadDrawnItems();
                $scope.loadController();
            });
        });

    }]
);
