/*global angular:false */
/*global L:false */

'use strict';

L.Icon.Default.imagePath = '/embed/images/';
//create all myApp modules
angular.module('myApp', [
    'ngRoute',
    'myApp.services',
    'myApp.controllers',
    'myApp.directives',
    'ui.bootstrap',
    'leaflet-directive',
    'angularFileUpload',
    'gettext',
    'restangular',
    'ui.tinymce',
    'ui.keypress',
    'base64',
    'ngCookies'
]);

angular.module('myApp.controllers', []);
angular.module('myApp.services', []);
angular.module('myApp.directives', []);

angular.module('myApp').config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl('/api');
    RestangularProvider.setResponseExtractor(function(response) {
        return response.data;
    });
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response) {
        if (operation === 'getList') {
            return response.data;
        }
        return response.data;
    });
});
/*patch to support model updates of tinymce*/
angular.module('myApp').config(function($provide) {
    $provide.decorator('uiTinymceDirective', ['$delegate', function($delegate) {
        $delegate[0].priority = 10;
        return $delegate;
    }]);
});
