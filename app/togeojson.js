/*jshint strict:false */
/*jslint node: true */
'use strict';

var tj = require('togeojson');
var fs = require('fs');
var xmldom = new (require('xmldom').DOMParser)();
var AdmZip = require('adm-zip');

var getKMLFromKMZ = function(kmz){
	var zip = new AdmZip(kmz.path);
	var zipEntries = zip.getEntries(); // an array of ZipEntry records
	var kml;
    zipEntries.forEach(function(zipEntry) {
        //console.log(zipEntry.getData()toString()); // outputs zip entries information
        if (zipEntry.entryName.indexOf('.kml') !== -1) {
            kml = zipEntry.getData().toString('utf-8');
        }
    });
    return kml;
};
var kml2Geojson = function(kmlData){
	return JSON.stringify(
		tj.kml(
			xmldom.parseFromString(kmlData)
		), null, 4
	);
};

var initMiddleware = function(onSuccess, onError){
	return function(req, res){
		var file = req.files.file;
		var kml;
		if (file.path.indexOf('.kmz') !== -1){
			//unzip kmz
			kml = getKMLFromKMZ(file);
			return onSuccess(res, kml2Geojson(kml));
		}else if (file.path.indexOf('.kml') !== -1){
			fs.readFile(file.path, function(err, data){
				if (err){
					return onError(res, err);
				}
				kml = data.toString();
				return onSuccess(res, kml2Geojson(kml));
			});
		}
	};
};

var initialize = function(app, onSuccess, onError){
	app.post(  '/api/togeojson', initMiddleware(onSuccess, onError));
};

exports.initialize = initialize;
exports.getKMLFromKMZ = getKMLFromKMZ;
exports.kml2Geojson = kml2Geojson;
exports.initMiddleware = initMiddleware;
