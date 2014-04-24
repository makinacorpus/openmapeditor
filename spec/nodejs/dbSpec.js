'use strict';

var assert = require('assert');
var db = require('../../app/backend/db');

var mockRes = {
	body: null,
	send: function(data) {
		this.body=data;
    }
};

describe('Database', function(){
	describe('test modules API', function(){
		it('should has initialize, closeDB, manager', function(){
			expect(db.initialize).not.toBeUndefined();
			expect(db.closeDB).not.toBeUndefined();
			expect(db.manager).not.toBeUndefined();
		});
	});
	describe('test initialize and close', function(){
		it('should create the db', function(){
			expect(db.manager.db).toBe(null);
			runs(function(){db.initialize(':memory:')});
			waitsFor(function(){return db.manager.initialized});
			runs(function(){
				expect(db.manager.db).not.toBe(null);
				db.closeDB();
				expect(db.manager.db).toBe(null);
			});
		});
		it('should create only one table named maps', function(){
			var query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
			var results;
			var callback = function(err, rows){results = rows;};
			runs(function(){
				db.initialize(':memory:');
				db.manager.db.all(query, callback);
			});
			waitsFor(function(){return (results !== undefined && db.manager.initialized)});
			runs(function(){
				expect(results.length).toBe(1);
				expect(results[0].name).toBe("maps");
				db.closeDB();
			});
		});
	});
	describe('test db manager', function(){
		it('should getNewID', function(){
			var newId = db.manager.getNewID();
			expect(db.manager.getNewID).not.toBeUndefined();
			expect(newId.length).toBe(36);
		});
		it('should loadsLayers', function(){
			var map = {};
			db.manager.loadsLayers(map);
			expect(map.layers.length).toBe(0);
			map.layers = '{"layers":[{"id":"mobilite","title":"Mobilité"}]}';
			db.manager.loadsLayers(map);
			expect(map.layers.length).toBe(1);
			expect(map.layers[0].id).toBe('mobilite');
			expect(map.layers[0].title).toBe('Mobilité');
			expect(map.layers[0].description).not.toBeUndefined();
			expect(map.layers[0].uri).toBe('/geojson/mobilite.geo.json');
			map.layers = '{"layers":[{"id":"mobilite","title":"Mobilité"},{"id":"notexists","title":"not exists"}]}';
			db.manager.loadsLayers(map);
			expect(map.layers.length).toBe(1);
			expect(map.layers[0].id).toBe('mobilite');
		});
		it('should dumpsLayers', function(){
			var map = {};
			map.layers = [{ id : 'mobilite', title : 'Mobilité'}];
			db.manager.dumpsLayers(map);
			expect(typeof(map.layers)).toBe('string');
			expect(map.layers).toBe('{"layers":[{"id":"mobilite","title":"Mobilité"}]}');
			map.layers = [
				{ id : 'mobilite', title : 'Mobilité'},
				{id: 'other', title: 'dame'}
			];
			db.manager.dumpsLayers(map);
			expect(map.layers).toBe('{"layers":[{"id":"mobilite","title":"Mobilité"},{"id":"other","title":"dame"}]}');
			map.layers = '{"layers":[{"id":"mobilite","title":"Mobilité"},{"id":"other","title":"dame"}]}';
			db.manager.dumpsLayers(map);
			expect(map.layers).toBe('{"layers":[{"id":"mobilite","title":"Mobilité"},{"id":"other","title":"dame"}]}');

		});
		it('should getall working', function(){
			var resultsGetAll;
			var callbackGetAll = function(err, rows){
				resultsGetAll = [err, rows];
			};
			db.initialize(':memory:');
			runs(function(){db.manager.getAll(callbackGetAll)});
			waitsFor(function(){return resultsGetAll !== undefined});
			runs(function(){
				expect(resultsGetAll.length).toBe(2);
				expect(resultsGetAll[0]).toBe(null);
			});
			//force an error to occur
			var resultsGetAllError;
			var callbackGetAllError = function(err, rows){
				resultsGetAllError = [err, rows];
			};
			runs(function(){
				db.manager.db.serialize(function(){
					db.manager.db.run('DROP TABLE IF EXISTS maps');
				});
				db.manager.getAll(callbackGetAllError)
			});
			waitsFor(function(){return resultsGetAllError !== undefined});
			runs(function(){
				expect(resultsGetAllError.length).toBe(2);
				expect(resultsGetAllError[0]).not.toBe(null);
				expect(resultsGetAllError[0].errno).toBe(1);
				expect(resultsGetAllError[0].code).toBe('SQLITE_ERROR');
				expect('' + resultsGetAllError[0]).toBe('Error: SQLITE_ERROR: no such table: maps');
			});
			//add content
			var inserted;
			var callbackInserted = function(err, map){
				inserted = [err, map];
			};
			runs(function(){
				var map = {id:'mymap', title:'My map', description: '', lat:'0', lng: '1', zoom: '14', layers: []};
				db.manager.insert(map, callbackInserted);
			});
			waitsFor(function(){return inserted !== undefined});
			runs(function(){

			});
		});
	});
});
