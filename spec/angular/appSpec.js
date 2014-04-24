/*jshint strict:false */
/*jshint camelcase:false*/
/*global describe:false */
/*global beforeEach:false */
/*global it:false */
/*global inject:false */
/*global expect:false */
'use strict';

describe('Routes', function(){
	var $route;
	beforeEach(module('myApp'));
	beforeEach(inject(function(_$route_){
		$route = _$route_;
	}));
	it('/ should redirect to /maps', function(){
		var route = $route.routes[null];
		expect(route.redirectTo).toBe('/maps');
	});
	it('/maps should have MapListController', function(){
		var route = $route.routes['/maps'];
		expect($route.routes['/maps'].templateUrl).toBe('partials/maps.html');
		expect(route.controller).toBe('MapListController');
	});
	it('/maps/id', function(){
		var route = $route.routes['/maps/:id'];
		expect(route.templateUrl).toBe('partials/maps.html');
		expect(route.controller).toBe('MapListController');
	});
});