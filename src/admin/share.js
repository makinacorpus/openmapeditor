/*jshint strict:false */
/*global angular:false */

angular.module('myApp.controllers').controller(
    'ShareController',
    ['$scope', '$routeParams',
    function($scope, $routeParams){
        console.log('init ShareController');
        $scope.currentMapId = $routeParams.id;
    }]
);
