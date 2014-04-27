/*jshint strict:false */
/*global angular:false */
angular.module('myApp.services').factory('osmService',
    ['$base64', '$cookieStore', '$http', '$q',
    function ($base64, $cookieStore, $http, $q) {
        var API = 'http://api.openstreetmap.org';
        // initialize to whatever is in the cookie, if anything
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
        var parseXml;

        if (typeof window.DOMParser !== 'undefined') {
            parseXml = function(xmlStr) {
                return ( new window.DOMParser() ).parseFromString(xmlStr, 'text/xml');
            };
        } else if (typeof window.ActiveXObject !== 'undefined' &&
               new window.ActiveXObject('Microsoft.XMLDOM')) {
            parseXml = function(xmlStr) {
                var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = 'false';
                xmlDoc.loadXML(xmlStr);
                return xmlDoc;
            };
        } else {
            throw new Error('No XML parser found');
        }

        return {
            setCredentials: function (username, password) {
                console.log('setCrendentials');
                var encoded = $base64.encode(username + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                $cookieStore.put('authdata', encoded);
            },
            getAuthorization: function(username, password){
                var encoded = $base64.encode(username + ':' + password);
                return 'Basic ' + encoded;
            },
            clearCredentials: function () {
                document.execCommand('ClearAuthenticationCache');
                $cookieStore.remove('authdata');
                delete $http.defaults.headers.common.Authorization;
            },
            parseXML: function(data){
                return parseXml(data);
            },
            get: function(method, config){
                var deferred = $q.defer();
                var self = this;

                $http.get(API + method, config).then(function(data){
                    deferred.resolve(self.parseXML(data.data));
                },function(data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            overpass: function(query){
                var url = 'http://overpass-api.de/api/interpreter';
                var deferred = $q.defer();
                var self = this;
                var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
                var data = {data:query};
                $http.post(url, query, {headers: headers}).then(function(data){
                    deferred.resolve(self.parseXML(data.data));
                },function(data) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            getNodesInJSON: function(xmlNodes){
                var nodesHTML = xmlNodes.documentElement.getElementsByTagName('node');
                var nodes = [];
                var node, tags, tag, i, j;
                for (i = 0; i < nodesHTML.length; i++) {
                    node = {
                        type: 'Feature',
                        properties: {id: nodesHTML[i].id},
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                parseFloat(nodesHTML[i].getAttribute('lon')),
                                parseFloat(nodesHTML[i].getAttribute('lat'))
                            ]
                        }
                    };
                    tags = nodesHTML[i].getElementsByTagName('tag');
                    for (j = 0; j < tags.length; j++) {
                        tag = tags[j];
                        node.properties[tag.getAttribute('k')] = tag.getAttribute('v');
                    }
                    nodes.push(node);
                }
                return nodes;
            }
        };
    }
]);
angular.module('myApp.controllers').controller(
    'OSMController',
    ['$scope', '$http', 'osmService', 'messagesService', 'Restangular', 'leafletData',
    function($scope, $http, osmService, messagesService, Restangular, leafletData){
        $scope.username = '';
        $scope.password = '';
        $scope.overpassquery = '[cuisine]';
        osmService.clearCredentials();
        $scope.nodes = [];
        $scope.login = function(){
            $scope.Authorization = osmService.getAuthorization($scope.username, $scope.password);
            osmService.get('/api/capabilities').then(function(capabilities){
                $scope.capabilities = capabilities;
            });
        };
        $scope.logout = function(){
            osmService.clearCredentials();
        };
        $scope.getMapData = function(){
            leafletData.getMap().then(function(map) {
                var b = map.getBounds();
                //Overpass get
                var obox = '' + b.getSouth() + ',' + b.getWest() + ',' + b.getNorth() + ',' + b.getEast();
                var query = 'node('+ obox+')' + $scope.overpassquery + ';out;';

                osmService.overpass(query).then(function(nodes){
                    $scope.nodes = osmService.getNodesInJSON(nodes);
                });

                // OSM get -> all nodes but only with ids
                // So lets use overpass api
                /*
                var bbox = '' + b.getWest() + ',' + b.getSouth() + ',' + b.getEast()+ ',' + b.getNorth();
                osmService.get('/api/0.6/map', {params: {bbox: bbox}}).then(function(map){
                    $scope.nodes = map.documentElement.getElementsByTagName('node');
                }, function(data, status, headers, config){
                    //can't find the reason ...
                });
                */
            });
        };
    }]
);