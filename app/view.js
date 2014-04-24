/*jshint strict:false */
/*jslint node: true */
'use strict';

var config = require('./config.json').app;
var express = require('express');
var http = require('http');
var maps = require('./maps');

var app = express();

app.set('port', config.port.view);
app.use(maps.configure(config.path.db));
app.use(immo.configure());
//http://www.senchalabs.org/connect/logger.html
app.use(express.logger(config.logger));
//app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.bodyParser());
//app.use(express.session({ secret: config.sessionSecret }));
app.use(express.methodOverride());

app.use(app.router);
if (config.logstacktrace) {
	app.use(express.errorHandler());
}
var onSuccess = function(res, data){
	res.send(data);
};
var onError = function(res, error){
	console.error(error.stack);
	res.send(500, {error: error.stack});
};

// ######## /VIEW API (not authenticated here) ###### //


app.get(   '/view/map/:id', function(req,res){
	req.mapManager.get(req.params.id).then(
		function(data){onSuccess(res, data);},
		function(error){onError(res, error);});
});


http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGTERM', function () {
	console.log('Closing');
	app.close();
});