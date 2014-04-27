/*jshint strict:false */
/*global angular:false */
angular.module('myApp').config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/opendata', {
        controller: 'OpendataController',
        templateUrl: 'partials/opendata.html'
    });
}]);
angular.module('myApp.controllers').controller(
    'OpendataController',
    ['$scope', '$http', 'messagesService', 'Restangular',
    function($scope, $http, messagesService, Restangular){
        Restangular.all('layers').getList().then(function (data) {
            $scope.opendataLayers = data;
        });
        $scope.previousConfiguration = {};
        $scope.traverse = function(obj, path){
            var succeed = true;
            if (typeof path !== 'object'){
                path = [path];
            }
            for (var j = 0; j < path.length; j++) {
                var splited = path[j].split('.');
                var traversed = obj;
                for (var i = 0; i < splited.length; i++) {
                    if (traversed.hasOwnProperty(splited[i])){
                        traversed = traversed[splited[i]];
                        succeed = true;
                    }else{
                        succeed = false;
                        break;
                    }
                }
                if (succeed){
                    if (traversed){
                        return traversed;
                    }
                }
            }
        };
        $scope.currentMap = {lat: 47.2383, lng: -1.5603, zoom: 11};
        $scope.markers = {
            Localisation: {
                id: undefined,
                lat: 47.2383,
                lng: -1.5603,
                message: 'Déplacer ce marker sur la localisation souhaitée.',
                focus: true,
                draggable: true
            }
        };
        $scope.getFeatureID = function(feature){
            if (!feature){
                return;
            }
            return $scope.traverse(feature, $scope.featureID);
        };
        $scope.getFeatureName = function(feature){
            if (!feature){
                return;
            }
            var name = $scope.traverse(feature, $scope.featureName);
            if (!name){
                //try OSM:
                return feature.properties.name;
            }
            return name;
        };
        $scope.hidden = [];
        $scope.geojson = '/geojson/culture-tourisme-restauration.geo.json';
        $scope.featureName = 'properties.geo.name';
        $scope.featureID = 'properties.ID';
        $scope.featureAddressExp = 'currentFeature.properties.ADR_1';
        $scope.reloadFeatures = function(){
            $http.get($scope.geojson).then(
                function(data){
                    $scope.features = data.data.features;
                    if (!$scope.previousConfiguration[$scope.geojson]){
                        $scope.previousConfiguration[$scope.geojson] = {url: $scope.geojson};
                    }
                    $scope.previousConfiguration[$scope.geojson].featureID = $scope.featureID;
                    $scope.previousConfiguration[$scope.geojson].featureName = $scope.featureName;
                    $scope.previousConfiguration[$scope.geojson].featureAddressExp = $scope.featureAddressExp;
                });
        };

        $scope.shouldDisplay = function(key, value){
            if (value === undefined || value === null || value === ''){
                return false;
            }
            for (var i = 0; i < $scope.hidden.length; i++) {
                if (key === $scope.hidden[i]){
                    return false;
                }
            }
            return true;
        };
        $scope.hide = function(key){
            $scope.hidden.push(key);
        };
        $scope.setCurrentFeature = function(feature){
            $scope.currentFeature = feature;
            $scope.markers.Localisation.lng = feature.geometry.coordinates[0];
            $scope.markers.Localisation.lat = feature.geometry.coordinates[1];
            $scope.markers.Localisation.message = $scope.getFeatureName(feature);
//            $scope.markers.Localisation.message = feature.properties.popupContent;
            $scope.currentMap.zoom = 18;
            $scope.currentMap.lat = feature.geometry.coordinates[1];
            $scope.currentMap.lng = feature.geometry.coordinates[0];
            $scope.currentAddress = $scope.$eval($scope.featureAddressExp);
        };
        $scope.$watch('geojson', function(){
            $scope.reloadFeatures();
        });
        $scope.$watch('featureID', function(){
            $scope.reloadFeatures();
        });
    }]
);