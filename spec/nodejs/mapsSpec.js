'use strict';

var assert = require('assert');
var maps = require('../../app/maps');

var mockRes = {
	body: null,
	send: function(data) {
		this.body=data;
    }
};

describe('/maps related routes', function(){
	var mockReq = {
			db: {
				getAll: function(callback){
					callback(null, [1,2,3]);
				},
				get: function(id, callback){
					callback(null, {id: id, title: 'My great map'});
				},
				update: function(obj){
					this.updated = true;
				},
				insert: function(map, callback){
					callback(null, map);
				},
				delete: function(id){
					this.called = true;
				}
			},
			params: {id: 'myid'},
			body: {map: {id: 'my map'}}
	};
	describe('GET /maps', function(){
		it('should transform res of db.getAll to json', function(){
			maps.list(mockReq, mockRes);
			assert.equal(mockRes.body, '[1,2,3]');
		});
		it('should handle error', function(){
			mockReq.db.getAll = function(callback){callback({'error1': 'missing value'})};
			maps.list(mockReq, mockRes);
			assert.equal(mockRes.body, '{"error":{"error1":"missing value"}}');
		});
	});
	describe('GET /maps/:id', function(){
		it('should transform result of db.get to json', function() {
			maps.get(mockReq, mockRes);
			assert.equal(mockRes.body, '{"id":"myid","title":"My great map"}');
		});
	});
	describe('PUT /maps/:id', function(){
		it('should call db.update', function() {
			maps.update(mockReq, mockRes);
			assert.equal(mockReq.db.updated, true);
		});
	});
	describe('POST /maps', function(){
		it('should call db.insert', function() {
			maps.insert(mockReq, mockRes);
			assert.equal(mockRes.body, '{"data":{"id":"my map"}}');
		});
		it('should handle error', function() {
			mockReq.db.insert = function(map, callback){callback({'error1': 'bad value'})};
			maps.insert(mockReq, mockRes);
			assert.equal(mockRes.body, '{"error":{"error1":"bad value"}}');
		});
	});
	describe('DELETE /maps/:id', function(){
		it('should call db.delete', function() {
			maps.delete(mockReq, mockRes);
			assert.equal(mockReq.db.called, true);
		});
	});
});
