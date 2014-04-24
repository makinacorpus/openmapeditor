/*jshint strict:false */
/*jslint node: true */
'use strict';

var express = require('express');
var http = require('http');

var config = require('./config.json').app;

//generic
var layers = require('./layers');
var maps = require('./maps');
var togeojson = require('./togeojson');


var app = express();

app.set('port', config.port.api);
app.use(maps.configure(config.path.db));
//http://www.senchalabs.org/connect/logger.html
app.use(express.logger(config.logger));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.session({ secret: config.session.secret }));
app.use(express.methodOverride());

app.use(app.router);
if (config.logstacktrace) {
	app.use(express.errorHandler());
}
var onSuccess = function(res, data){
	res.send(data);
};
var onError = function(res, error){
	if (error.status){
		res.send(error.status, error.msg);
	}else{
		console.error(error.stack);
		res.send(500, {error: error.stack});
	}
};

//API # /api/maps
maps.initialize(app, onSuccess, onError);
layers.initialize(app, onSuccess, onError);
togeojson.initialize(app, onSuccess, onError);


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGTERM', function () {
	console.log('Closing');
	app.close();
});