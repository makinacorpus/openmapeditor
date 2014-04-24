Project
=======

repository: https://github.com/makinacorpus/openmapeditor

contact: jeanmichel.francois@makina-corpus.com

Dependencies
------------

To build the project you need:

* NodeJS
* SQLite

Build
-----

	make build

Start your engine
-----------------

dev:

	./node_modules/.bin/nodemon app/api.js
	./node_modules/.bin/nodemon app/view.js

prod:

	nodejs/bin/node node_modules/.bin/forever start app/api.js
	nodejs/bin/node node_modules/.bin/forever start app/view.js

	nodejs/bin/node node_modules/.bin/forever restart app/api.js
	nodejs/bin/node node_modules/.bin/forever restart app/view.js

	nodejs/bin/node node_modules/.bin/forever stop app/api.js
	nodejs/bin/node node_modules/.bin/forever stop app/view.js
