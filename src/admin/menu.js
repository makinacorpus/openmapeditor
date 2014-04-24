/*jshint strict:false */
/*global angular:false */
angular.module('myApp.services').factory('menuService', function(){
    console.log('init menuService');
    //TODO: add a menuprovider
    var menu = [
        {id: 'maps', url:'#/maps', title: 'Cartes'},
        {id: 'geojson2osm', url:'#/opendata', title: 'GeoJSON to OSM'}
    ];
    return {
        get: function(){
            return menu;
        }
    };
});

angular.module('myApp.controllers').controller(
    'MenuController',
    ['$scope', '$location', 'menuService', function($scope, $location, menuService){
        console.log('init MenuController');
        $scope.menus = menuService.get();
        $scope.updateMenus = function(){
            $scope.menus = menuService.get();
            var currentUrl = '#' + $location.path();
            for (var i = 0; i < $scope.menus.length; i++) {
                if (currentUrl.indexOf($scope.menus[i].url) === 0){
                    $scope.menus[i].active = true;
                }else{
                    $scope.menus[i].active = false;
                }
            }
        };
        $scope.$on('$locationChangeSuccess', function (){
            $scope.updateMenus();
        });
    }]
);
