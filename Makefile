# only build node when not using salt !
node:
	./bootstrap.sh
buildapp:
	nodejs/bin/npm install
	nodejs/bin/npm install bower
	nodejs/bin/npm install gulp
	nodejs/bin/node node_modules/.bin/bower install
	nodejs/bin/node scripts/tinymce-download-lang.js
	nodejs/bin/node node_modules/.bin/gulp
	unzip downloads/tinymce_fr_FR.zip
	cp langs/* static/tinymce/langs/ && rm -rf langs downloads/tinymce_fr_FR.zip
builddata:
	wget -O downloads/opendata/osm-cuisine.osm --post-file=scripts/osm-request-cuisine.txt http://api.openstreetmap.fr/oapi/interpreter
	./nodejs/bin/node node_modules/.bin/osmtogeojson downloads/opendata/osm-cuisine.osm > downloads/opendata/osm-cuisine.json
	nodejs/bin/node scripts/transform-geojson.js scripts/opendata-transform-osm-cuisine.json

	wget -O downloads/opendata/osm-bakery.osm --post-file=scripts/osm-request-bakery.txt http://api.openstreetmap.fr/oapi/interpreter
	./nodejs/bin/node node_modules/.bin/osmtogeojson downloads/opendata/osm-bakery.osm > downloads/opendata/osm-bakery.json
	nodejs/bin/node scripts/transform-geojson.js scripts/opendata-transform-osm-bakery.json

builddb:
	mkdir -p var
	sqlite3 var/maps.sqlite < scripts/database-create-maps.sql

build: node buildapp builddata builddb

updatedb:
	sqlite3 var/maps.sqlite < scripts/database-update-schema.sql

clean:
	rm -rf bower_components downloads/* node_modules
