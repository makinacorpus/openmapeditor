/*jshint strict:false */
/*jslint node: true */
'use strict';


/*
   $ transform-geojson -f filter.json -o my.geo.json my.json
*/
var opt = require('optimist')
        .usage('Usage: $0 SETTINGS')
        .boolean('version').describe('version','display software version')
        .boolean('help').describe('help','print this help message'),
    argv = opt.argv,
    fs = require('fs');

var settings = require('../'+argv._[0]);
var source = require(settings.source);

var _traverse = function(obj, path){
    var succeed = true;
    if (typeof path !== 'object'){
        path = [path];
    }
    for (var j = 0; j < path.length; j++) {
        var splited = path[j].split('.');
        var traversed = obj;
        for (var i = 0; i < splited.length; i++) {
            if (traversed.hasOwnProperty(splited[i])){
                traversed = traversed[splited[i]];
                succeed = true;
            }else{
                succeed = false;
                break;
            }
        }
        if (succeed){
            if (traversed){
                return traversed;
            }
        }
    }
};
var _newFeatureCollection = function(){
    var featureCollection = {type: 'FeatureCollection'};
    featureCollection.features = [];
    return featureCollection;
};
var initGeoJSON = function(values){
    var featureCollection = _newFeatureCollection();
    //detect if it's already a geojson
    if (values[0].type && values[0].properties && values[0].geometry){
        featureCollection.features = values;
        return featureCollection;
    }
    for (var i = 0; i < values.length; i++) {
        var entry = values[i];
        var feature = {
            type: 'Feature',
            properties: entry,
            geometry: {
                type: 'Point',
                coordinates: [
                    eval('entry.' + settings.geometry.lat),
                    eval('entry.' + settings.geometry.lng)
                ]
            }
        };
        featureCollection.features.push(feature);
    }
    return featureCollection;
};
var removeEntries = function(featureCollection){
    return featureCollection;
};
var addPopupContent = function(featureCollection){
    var newValues = [];
    for (var i = 0; i < featureCollection.features.length; i++) {
        var entry = featureCollection.features[i];
        var popupContent = '';
        if (settings.popupContent.title){
            var title = _traverse(entry, settings.popupContent.title);
            popupContent += '<h4>%</h4>'.replace('%', title);
        }
        for(var key in settings.popupContent.labels){
            var property = entry.properties[key];
            var label = settings.popupContent.labels[key];
            var isHTML = false;
            if (typeof property === 'string'){
                property = property.trim();
            }
            if (property === null || property === undefined || property === ''){
                continue;
            }
            if (key === 'COMMENTAIRE'){
                debugger;
            }
            if (typeof property === 'string'){
                if (property.indexOf('www') === 0){
                    property = 'http://' + property;
                }
                if (property.indexOf('http') === 0){
                    property = '<a href="%s">Site Internet</a>'
                        .replace('%s',property);
                    isHTML = true;
                }
            }
            if (isHTML){
                popupContent += '<li>' + property + '</li>';
            }else{
                popupContent += '<li>%k : %v</li>'
                    .replace('%k', label)
                    .replace('%v', property);
            }
        }
        entry.properties.popupContent = popupContent;
        newValues.push(entry);
    }
    featureCollection.features = newValues;
    return featureCollection;
};
var addIcons = function(featureCollection){
    var newValues = [];
    var settingsIcons = settings.icons;
    var settingsIcon = settings.icon;
    var addIcon = function(entry){
        if (settingsIcons){
            var switchKey = _traverse(entry, settingsIcons['switch']);
            if (!switchKey){
                entry.properties.icon = settingsIcons.default;
            }else{
                switchKey = switchKey.toLowerCase();
                for(var key in settingsIcons['case']){
                    //key === 'bicloo'                    
                    if (key === switchKey){
                        entry.properties.icon = settingsIcons['case'][key];
                    }
                }
                if (!entry.properties.icon){
                    entry.properties.icon = settingsIcons['case'].default;
                }
            }
        }else if (settingsIcon){
            entry.properties.icon = settingsIcon;
        }
    };
    for (var i = 0; i < featureCollection.features.length; i++) {
        var entry = featureCollection.features[i];
        addIcon(entry);
        newValues.push(entry);

    }
    featureCollection.properties = newValues;
    return featureCollection;
};


var save = function(featureCollection){
    var _handleError = function(err){
        if(err) {
            console.log(err);
        }
    };
    var _save = function(filename, data){
        console.log('save '+filename);
        fs.writeFile(filename, JSON.stringify(data), _handleError);
    };
    _save(settings.output, featureCollection);
    var settingsIcons = settings.icons;
    if (!settingsIcons){
        return;
    }
    for(var key in settingsIcons['case']){
        var icon = settingsIcons['case'][key];
        var newFeatureCollection = _newFeatureCollection();
        newFeatureCollection.features = [];
        for (var i = 0; i < featureCollection.features.length; i++) {
            var feature = featureCollection.features[i];
            if (feature.properties.icon === icon){
                newFeatureCollection.features.push(feature);
            }
        }
        _save(settings.output.replace('.geo.json', '-' + icon + '.geo.json'),
            newFeatureCollection);
    }
};

if (settings.data){
    source = _traverse(source, settings.data);
}

var transformed = initGeoJSON(source);
transformed = removeEntries(transformed);
transformed = addPopupContent(transformed);
transformed = addIcons(transformed);
save(transformed);
