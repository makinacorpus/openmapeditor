/*jshint strict:false */
/*jslint node: true */
'use strict';

var q = require('q');
var utils = require('./utils');
var staticLayers = require('../static/geojson/index.json').layers;
var tileLayers = require('./tile-layers.json').layers;

var tileLayersById = {};
for (var i = 0; i < tileLayers.length; i++) {
	tileLayersById[tileLayers[i].id] = tileLayers[i];
}
var getTileLayerById = function(id){
	return tileLayersById[id];
};
exports.getTileLayerById = getTileLayerById;

//Use this to register source of layers
var layersRegistry = [];
layersRegistry.push({get: function(){return staticLayers;}});

exports.registry = layersRegistry;
var getCaller = function(layers){
	return layers.get();
};
var get = function(id){
	return q.all(layersRegistry.map(getCaller))
		.then(function(sources){
			var results = [];
			var result;
			for (var i = 0; i < sources.length; i++) {
				var layers = sources[i];
				for (var j = 0; j < layers.length; j++) {
					results.push(layers[j]);
					if (id){
						result = layers[j];
					}
				}
			}
			return results;
		});
};
var getTileLayers = function(id){
	return q.when(tileLayers);
};

var initialize = function(app, onSuccess, onError){
	app.get(   '/api/layers', function(req,res){
		get().then(
			function(data){onSuccess(res, data);},
			function(error){onError(res, error);});
	});
	app.get(   '/api/tile-layers', function(req,res){
		getTileLayers().then(
			function(data){onSuccess(res, data);},
			function(error){onError(res, error);});
	});
};


exports.initialize = initialize;
exports.get = get;
