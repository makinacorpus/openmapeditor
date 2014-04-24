var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var files = [
	{url : 'http://www.tinymce.com/i18n/download.php?download=fr_FR',
	file: 'tinymce_fr_FR.zip'},
];

var download = function(url, dest) {
  var file = fs.createWriteStream(path.join(__dirname, '..', 'downloads', dest));
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
  });
}
for (var i = 0; i < files.length; i++) {
	var request = download(files[i].url, files[i].file);
}

