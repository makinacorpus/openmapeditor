/*jshint strict:false */
/*jslint node: true */
'use strict';

var events = require('events');
var q = require('q');
var sqlite3 = require('sqlite3').verbose();

var layers = require('./layers');

var queries = {
    select: 'SELECT id, title FROM maps WHERE hide = 0',
    insert: 'INSERT INTO maps (id, title, description, modified, lat, lng, zoom, layers, tileLayers, leaflet, drawnFeatures) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    update: 'UPDATE maps SET title = ?, description = ?, modified = ?, layers = ?, tileLayers = ?, leaflet = ?, drawnFeatures = ? WHERE id= ?',
    delete: 'DELETE FROM maps WHERE id = ?',
    selectById: 'SELECT id, title, description, modified, lat, lng, zoom, layers, tileLayers, leaflet, drawnFeatures FROM maps WHERE id = ?'
};


//https://github.com/mapbox/node-sqlite3/wiki/API
function Manager(){
    events.EventEmitter.call(this);
    this.db = null;
    this.initialized = false;
    this.layers = [];
    this.getNewID = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);
            });
    };
    this.loadsLayers = function(map){
        if (map.tileLayers === undefined || map.tileLayers === null){
            map.tileLayers = [];
        }else{
            map.tileLayers = JSON.parse(map.tileLayers).layers;
            for (var i = 0; i < map.tileLayers.length; i++) {
                var tileLayer = map.tileLayers[i];
                var originalTileLayer = layers.getTileLayerById(tileLayer.id);
                tileLayer.uri = originalTileLayer.uri;
                tileLayer.layerOptions = originalTileLayer.layerOptions;
                //we need to load tile datas here;
            }
        }
        map.layers = JSON.parse(map.layers).layers;
        console.log('return promise for map '+map.id);
        return layers.get().then(function(knownLayers){
            //update uri in case we have change it in db
            console.log('load layers in the map '+map.id);
            for (var j = 0; j < map.layers.length; j++) {
                var found = false;
                for (var i = 0; i < knownLayers.length; i++){
                    if (map.layers[j].id === knownLayers[i].id){
                        found = true;
                        console.log(knownLayers[i].uri);
                        map.layers[j].uri = knownLayers[i].uri;
                        map.layers[j].description = knownLayers[i].description;
                    }
                }
                if (!found){
                    map.layers.pop(j);
                }
            }
            return map;
        });
    };
    this.dumpsLayers = function(map){
        if (map === undefined){
            return;
        }
        if (typeof map.layers === 'string'){
            return;
        }
        var tileLayers = [];
        for (var i = 0; i < map.tileLayers.length; i++) {
            tileLayers.push({
                id: map.tileLayers[i].id,
                title: map.tileLayers[i].title
            });
        }
        map.tileLayers = JSON.stringify({layers:tileLayers});
        tileLayers = [];
        for (var j = 0; j < map.layers.length; j++) {
            tileLayers.push({
                id: map.layers[j].id,
                title: map.layers[j].title,
                displayed: map.layers[j].displayed
            });
        }
        map.layers = JSON.stringify({layers:tileLayers});
    };
    this.loadsLeaflet = function(map){
        if (map === undefined){
            return;
        }
        if (map.leaflet === undefined || map.leaflet === null){
            map.leaflet = {
                zoom: true,
                controlLayers: true,
                minimap: true
            };
            return;
        }
        if (typeof map.leaflet === 'string'){
            map.leaflet = JSON.parse(map.leaflet);
        }
    };
    this.dumpsLeaflet = function(map){
        if (map === undefined){
            return;
        }
        if (typeof map.leaflet === 'string'){
            return;
        }
        map.leaflet = JSON.stringify(map.leaflet);
    };
    this.loadsFeatures = function(map){
        if (map === undefined){
            return;
        }
        if (map.drawnFeatures === undefined){
            map.drawnFeatures = [];
            return;
        }
        map.drawnFeatures = JSON.parse(map.drawnFeatures);
    };
    this.dumpsFeatures = function(map){
        if (map === undefined){
            return;
        }
        if (map.drawnFeatures === undefined){
            map.drawnFeatures = '[]';
            return;
        }
        //remove all outside of geojson (like .selected used by UI)
        var features = [];
        var feature;
        for (var i = 0; i < map.drawnFeatures.length; i++) {
            features.push({
                type: map.drawnFeatures[i].type,
                geometry: map.drawnFeatures[i].geometry,
                properties: map.drawnFeatures[i].properties
            });
        }
        map.drawnFeatures = JSON.stringify(features);
    };
    this.getAll = function(){
        var self = this;
        return q.ninvoke(self.db, 'all', queries.select)
            .then(function(rows){
                return rows;
            });
    };
    this.get = function(id){
        var self = this;
        return q.ninvoke(this.db, 'get', queries.selectById, [id])
            .then(function(row){
                if (row){
                    return self.loadsLayers(row).then(function(row){
                        self.loadsLeaflet(row);
                        self.loadsFeatures(row);
                        return row;
                    });
                }else{
                    throw {status: 404, msg: 'Map doesn t exists'};
                }
            });
    };
    this.insert = function(map){
        var self = this;
        if (map.id === undefined || map.id === '' || map.id === null){
            map.id = this.getNewID();
        }
        this.dumpsLayers(map);
        this.dumpsLeaflet(map);
        this.dumpsFeatures(map);
        var values = [
            map.id,
            map.title,
            map.description,
            new Date().toISOString(),
            map.lat,
            map.lng,
            map.zoom,
            map.layers,
            map.tileLayers,
            map.leaflet,
            map.drawnFeatures
        ];
        return q.ninvoke(self.db, 'run', queries.insert, values)
        .then(function(){
            if (map.hide !== undefined){
                q.ninvoke(self.db, 'run', 'UPDATE maps SET hide=1 WHERE id = ?',
                    [map.id]);
            }
            return map;
        });
    };
    this.update = function(map, options){
        if (options.withZoom === '1'){
            q.ninvoke(this.db, 'run',
                'UPDATE maps SET lat = ?, lng = ?, zoom = ? WHERE id = ?',
                [map.lat, map.lng, map.zoom, map.id]);
        }
        this.dumpsLayers(map);
        this.dumpsLeaflet(map);
        this.dumpsFeatures(map);
        var values = [
            map.title,
            map.description,
            new Date().toISOString(),
            map.layers,
            map.tileLayers,
            map.leaflet,
            map.drawnFeatures,
            map.id
        ];
        console.log('update maps');
        return q.ninvoke(this.db, 'run', queries.update, values)
            .then(function(){return 'OK';});
    };
    this.delete = function(id){
        return q.ninvoke(this.db, 'run', queries.delete, [id]);
    };
}
var manager = new Manager();

var configure = function(path){
    if (manager.db === null){
//      var exists = fs.existsSync(path);
        var db = new sqlite3.Database(path);
        manager.db = db;
    }
    return function(req, res, next){
        req.mapManager = manager;
        req.db = manager.db;
        return next();
    };
};

var initialize = function(app, onSuccess, onError){
    app.post(  '/api/maps', function(req, res){
        var data = req.body;
        req.mapManager.insert(data).then(
            function(data){onSuccess(res, data);},
            function(error){onError(res, error);});
    });
    app.get(   '/api/maps', function(req, res){
        req.mapManager.getAll().then(
            function(data){onSuccess(res, data);},
            function(error){onError(res, error);});
    });
    app.get(   '/api/maps/:id', function(req, res){
        return req.mapManager.get(req.params.id).then(
            function(data){onSuccess(res, data);},
            function(error){onError(res, error);});
    });
    app.put(  '/api/maps/:id', function(req, res){
        req.mapManager.update(req.body, req.query).then(
            function(data){onSuccess(res, data);},
            function(error){onError(res, error);});
    });
    app.delete('/api/maps/:id', function(req, res){
        req.mapManager.delete(req.params.id).then(
            function(data){onSuccess(res, data);},
            function(error){onError(res, error);});
    });
};
var closeDB = function(){
    if (manager.db !== null){
        manager.db.close();
        manager.db = null;
    }
};

exports.configure = configure;
exports.initialize = initialize;
exports.closeDB = closeDB;