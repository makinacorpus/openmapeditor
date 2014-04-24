(function () {
	'use strict';
    L.Icon.Default.imagePath = '/embed/images';
    L.FallbackTileLayer = L.TileLayer.extend({
        _tileOnError: function () {
            var layer = this._layer;

            layer.fire('tileerror', {
                tile: this,
                url: this.src
            });

            var newUrl;
            if(this.src.indexOf('.jpg') > 0) {
                console.log('swtich to png');
                newUrl = this.src.replace('jpg', 'png');
            } else {
                newUrl = layer.options.errorTileUrl;
            }
            if (newUrl) {
                this.src = newUrl;
            }
            layer._tileLoaded();
        }
    });
    var mapid = window.location.hash.replace('#', '');

    var pointToLayer = function (feature, latlng){
        var iconid = feature.properties.icon;
        if (iconid !== undefined && icons[iconid] !== undefined){
            return L.marker(latlng, {icon: icons[iconid]});
        }else if (iconid !== undefined){
            //console.log('icon not found: ' + iconid);
        }
        return L.marker(latlng);
    };
    var onEachFeature = function (feature, layer) {
        if (feature.properties.popupContent !== undefined){
            layer.bindPopup(feature.properties.popupContent);
        }else if (feature.properties.description !== undefined){
            layer.bindPopup(feature.properties.description.replace('\r\n', '<br/>'));
        }else if (feature.properties.type === 'project'){
            layer.bindPopup(feature.properties.name);
        }else{
            var html = '<ul>';
            for (var propertyName in feature.properties) {
                html += '<li>'+ propertyName + ' : ' + feature.properties[propertyName] + '</li>';
            }
            html += '</ul>';
            layer.bindPopup(html);
        }
    };
    var toggleSelectLayer = function(controller, e){
        if (e.name === 'Tout / Rien'){
            var controlOverlays = $('.leaflet-control-layers-overlays input');
            var newValue = controlOverlays.first()[0].checked;
            if (newValue){
                controlOverlays.attr('checked', 'checked');
            }else{
                controlOverlays.removeAttr('checked');
            }
        }
    };
    var styleFeature = function(feature){
        /*support for zae*/
        switch (feature.properties.VOCATION_PRINCIPALE){
        	case 'Artisanat': return {color: '#27a22d'};
        	case 'Industrie / Logistique': return {color: '#009de0'};
        	case 'Commerce': return {color: '#684a94'};
        	case 'Tertiaire': return {color: '#feed01'};
        	case 'PME/PMI': return {color: '#f18a00'};
        	case 'Technologique': return {color: '#009de0'};
        	case 'Non précisé': return {color: '#f18a00'};
        	case null: return {color: '#ddd'};
        }
        switch (feature.properties.styleUrl) {
            /*support for za*/
            case '#PolyStyle01': return {color: '#ff6e6e'};
            /*color support for lila*/
            case '#1':  return {color: '#FFFF40'};
            case '#10': return {color: '#FF6666'};
            case '#11': return {color: '#FF66FF'};
            case '#12': return {color: '#FF8080'};
            case '#12 expre*': return {color: '#FFCF12'};
            case '#13': return {color: '#FFFF00'};
            case '#14': return {color: '#FFFFCC'};
            case '#15': return {color: '#FFFFFF'};
            case '#16': return {color: '#FF194C'};
            case '#18': return {color: '#FF994C'};
            case '#180': return {color: '#FF0000'};
            case '#20': return {color: '#FFFF00'};
            case '#22': return {color: '#FF00E6'};
            case '#23': return {color: '#FF00E6'};
            case '#24': return {color: '#FF00E6'};
            case '#3': return {color: '#FF9900'};
            case '#30': return {color: '#FF0080'};
            case '#31': return {color: '#FFFF73'};
            case '#32': return {color: '#FFFF26'};
            case '#4': return {color: '#FFCCB3'};
            case '#270': return {color: '#FFCCB3'};
            case '#290': return {color: '#FFCCB3'};
            case '#40': return {color: '#FF6680'};
            case '#41A': return {color: '#FFB326'};
            case '#41B': return {color: '#FFB326'};
            case '#41C': return {color: '#FFB326'};
            case '#42': return {color: '#FFFFFF'};
            case '#44': return {color: '#FF00FF'};
            case '#46': return {color: '#FF0000'};
            case '#49': return {color: '#FF66CC'};
            case '#50': return {color: '#FF0033'};
            case '#59': return {color: '#FF00CC'};
            case '#60': return {color: '#FF19B3'};
            case '#62': return {color: '#FF9900'};
            case '#71': return {color: '#FFCC00'};
            case '#A': return {color: '#FF0000'};
            case '#C': return {color: '#FF00FF'};
            case '#Castebus': return {color: '#FF00ED'};
            case '#D': return {color: '#FF000066'};
            case '#E': return {color: '#FFFF99'};
            case '#G': return {color: '#FF198C'};
            case '#H': return {color: '#FF26A6'};
            case '#J': return {color: '#FFFF57'};
            case '#K': return {color: '#FF0059'};
            case '#M': return {color: '#FF26F7'};
            case '#N': return {color: '#FF0066'};
            case '#N bis': return {color: '#FF00FF'};
        };
        switch (feature.properties.id) {
            /*support for za*/
            case 'route#1-0': return {color: '#007945'};
            case 'route#2-0': return {color: '#e52b38'};
            case 'route#3-0': return {color: '#0079bc'};
            case 'route#4-0': return {color: '#fdc613'};
            case 'route#11-0': return {color: '#e8c389'};
            case 'route#12-0': return {color: '#b5ddf2'};
            case 'route#23-0': return {color: '#20b4e3'};
            case 'route#25-0': return {color: '#f8e921'};
            case 'route#26-0': return {color: '#159634'};
            case 'route#27-0': return {color: '#b5ddf2'};
            case 'route#28-0': return {color: '#b5ddf2'};
            case 'route#29-0': return {color: '#f5bac4'};
            case 'route#30-0': return {color: '#ffed0c'};
            case 'route#31-0': return {color: '#FFFF73'};
            case 'route#33-0': return {color: '#f5bac4'};
            case 'route#36-0': return {color: '#01a4a6'};
            case 'route#39-0': return {color: '#f5bac4'};
            case 'route#42-0': return {color: '#c0d785'};
            case 'route#47-0': return {color: '#beabd0'};
            case 'route#54-0': return {color: '#c0d785'};
            case 'route#59-0': return {color: '#f5bac4'};
            case 'route#67-0': return {color: '#154593'};
            case 'route#68-0': return {color: '#154593'};
            case 'route#70-0': return {color: '#ffed0c'};
            case 'route#73-0': return {color: '#ffed0c'};
            case 'route#74-0': return {color: '#c0d785'};
            case 'route#75-0': return {color: '#e8c389'};
            case 'route#77-0': return {color: '#73a5bc'};
            case 'route#79-0': return {color: '#f5bac4'};
            case 'route#80-0': return {color: '#ffed0c'};
            case 'route#81-0': return {color: '#1ba4a6'};
            case 'route#84-0': return {color: '#c0d785'};
            case 'route#85-0': return {color: '#f5bac4'};
            case 'route#86-0': return {color: '#28b4e4'};
            case 'route#87-0': return {color: '#f8b323'};
            case 'route#88-0': return {color: '#f8b323'};
            case 'route#89-0': return {color: '#76ad20'};
            case 'route#90-0': return {color: '#c0893a'};
            case 'route#91-0': return {color: '#009534'};
            case 'route#93-0': return {color: '#01a4a6'};
            case 'route#95-0': return {color: '#c0d785'};
            case 'route#96-0': return {color: '#f8b323'};
            case 'route#97-0': return {color: '#beabd0'};
            case 'route#98-0': return {color: '#f8b323'};
            case 'route#99-0': return {color: '#f8b323'};
            case 'route#C1-0': return {color: '#28b4e4'};
            case 'route#C2-0': return {color: '#ed7703'};
            case 'route#C3-0': return {color: '#f8b323'};
            case 'route#C4-0': return {color: '#b5ddf2'};
            case 'route#C5-0': return {color: '#b5ddf2'};
            case 'route#C6-0': return {color: '#beabd0'};
            case 'route#C7-0': return {color: '#c0d785'};
            case 'route#E1-0': return {color: '#e52b38'};
            case 'route#E4-0': return {color: '#ff6e6e'};
            case 'route#E5-0': return {color: '#e52b38'};
            case 'route#E8-0': return {color: '#e52b38'};
            case 'route#LU-0': return {color: '#ff6e6e'};
            case 'route#NA-0': return {color: '#ff6e6e'};
            case 'route#NL-0': return {color: '#ff6e6e'};
            case 'route#RA-0': return {color: '#ff6e6e'};
            case 'route#RB-0': return {color: '#ff6e6e'};
            case 'route#RS-0': return {color: '#ff6e6e'};
            case 'route#RT-0': return {color: '#ff6e6e'};
            case 'route#ZB-0': return {color: '#ff6e6e'};
            case 'route#ZT-0': return {color: '#ff6e6e'};
        };
    };
    $.getJSON("/view/map/"+mapid, function(json) {
        var settings = json;
        window.document.title = settings.title;
        var translateKeys = {
            amenity: 'Catégorie :',
            name: 'Nom :',
            place: 'Place :'

        };
        translateKeys['is in'] = 'Zone :';

        var mapOptions = {
            zoomControl: settings.leaflet.zoom,
            zoom: settings.zoom,

            fullscreenControl: settings.leaflet.fullscreen
        };
        var map = L.map('map', mapOptions);

        var baseLayers = {};
        var firstTile;
        for (var i = 0; i < settings.tileLayers.length; i++) {
            var tile = settings.tileLayers[i];
            if (tile.id === 'ortho'){
                baseLayers[tile.title] = L.layerGroup([
                    new L.TileLayer(
                        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    ),
                    new L.FallbackTileLayer(
                        tile.uri,
                        tile.layerOptions
                    )
                ]);
            }else{
                baseLayers[tile.title] =  new L.TileLayer(
                    tile.uri,
                    tile.layerOptions
                );
            }
            if (firstTile === undefined){
                firstTile = baseLayers[tile.title];
            }
        }
        if (firstTile !== undefined){
            firstTile.addTo(map);
        }else{
            baseLayers = null;
            map._layersMaxZoom=18; //fix maxZoom exception
        }
        var controller = L.control.layers(baseLayers, null);
        if (settings.leaflet.controlLayers){
            controller.addTo(map);
            if (settings.layers.length > 1){
                var emptyLayer = L.layerGroup();
                controller.addOverlay(emptyLayer, 'Tout / Rien');
            }
        }
        if (settings.leaflet.controlGeocoder){
            L.Control.geocoder().addTo(map);
        }

        //center
        map.setView([settings.lat, settings.lng], settings.zoom);
        if (settings.layers !== null){
            for (var i = 0; i < settings.layers.length; i++) {
                var markers = L.markerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: true,
                    zoomToBoundsOnClick: false,
                    disableClusteringAtZoom:17
                });
                controller.addOverlay(markers, settings.layers[i].title);
                if (settings.layers[i].displayed){
                    map.addLayer(markers);
                }
                markers.on('clusterclick', function (a) {
                    a.layer.spiderfy();
                });
                $.ajax({
                    type: "get",
                    url: settings.layers[i].uri,
                    dataType: 'json',
                    context: {settings: settings.layers[i], markers: markers},
                    success: function (data) {
                        var geoJsonLayer = L.geoJson(data, {
                            pointToLayer: pointToLayer,
                            onEachFeature: onEachFeature,
                            style: styleFeature
                        });
                        this.markers.addLayer(geoJsonLayer);
                        //overlayMaps[this.settings.title] = this.markers;
                        controller.addOverlay(this.markers, this.settings.title);
                    },
                    error: function(xhr, ajaxOptions, thrownError){
                        console.log(this.settings.uri);
                        console.log(this.settings);
                        console.log(xhr.status);
                        console.log(thrownError);
                    }
                });
            };
            if (settings.leaflet.controlLayers){
                map.on('overlayadd', function(overlayadded){
                    toggleSelectLayer(controller, overlayadded);
                });
                map.on('overlayremove', function(overlayremoved){
                    toggleSelectLayer(controller, overlayremoved);
                });
            }
        }
        //add minimap
        if (settings.leaflet.minimap){
            var miniMapSettings = {
                subdomains: "1234",
                minZoom: 0, maxZoom: 10,
                opacity: 0.5
            };
            var miniMapLayer = new L.TileLayer(
                "http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg",
                miniMapSettings
            );
            var miniMap = new L.Control.MiniMap(
                miniMapLayer,
                { toggleDisplay: true }
            ).addTo(map);
        }
        var drawnFeatureCollection = {
            type: "FeatureCollection",
            features: settings.drawnFeatures
        };
        var popup, label;
        var drawnItems = L.geoJson(drawnFeatureCollection, {
            pointToLayer: function (feature, latlng) {
                if (feature !== undefined){
                    if (feature.properties.radius){
                        console.log(feature.properties.radius);
                        var circle = L.circle(latlng);
                        circle.setRadius(parseInt(feature.properties.radius));
                        return circle;
                    }
                }
                return L.marker(latlng);
            },
            onEachFeature: function (feature, layer) {
                popup = feature.properties.popupContent;
                label = feature.properties.label;
                if (label !== undefined && label !== ''){
                    layer.bindLabel(label, {noHide:true, direction: 'auto'});
                }
                if (popup !== undefined && popup !== ''){
                    layer.bindPopup(feature.properties.popupContent);
                }
                
            }
        });
        drawnItems.addTo(map);
    });

})();