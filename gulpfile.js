var concat = require('gulp-concat');
var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var gettext = require('gulp-angular-gettext');

gulp.task('lint', function() {
  gulp.src([
      'app/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
  gulp.src(['static/admin/built.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
gulp.task('jasmine', function(){
  gulp.src('spec/nodejs/*Spec.js')
    .pipe(jasmine());
});
gulp.task('test', ['lint', 'jasmine']);
gulp.task('copy', function() {
  gulp.src(['bower_components/font-awesome/fonts/*'])
    .pipe(gulp.dest('static/admin/fonts'));
  gulp.src(['bower_components/tinymce/**'])
    .pipe(gulp.dest('static/tinymce'));
  gulp.src(['bower_components/leaflet-dist/images/*'])
    .pipe(gulp.dest('static/embed/images'))
    .pipe(gulp.dest('static/admin/css/images'));
  gulp.src(['bower_components/leaflet-fullscreen/dist/*.png'])
    .pipe(gulp.dest('static/embed'));
  gulp.src(['bower_components/leaflet-control-geocoder/images/*'])
    .pipe(gulp.dest('static/embed/images'))
    .pipe(gulp.dest('static/admin/css/images'));
  gulp.src(['bower_components/leaflet-label/dist/images/*'])
    .pipe(gulp.dest('static/embed/images'))
    .pipe(gulp.dest('static/admin/css/images'));
  gulp.src(['bower_components/leaflet-draw/dist/images/*'])
    .pipe(gulp.dest('static/admin/css/images'));
});
gulp.task('scripts-libs', function() {
  gulp.src([
        'bower_components/underscore/underscore-min.js',
        'bower_components/danialfarid-angular-file-upload/dist/angular-file-upload-shim.min.js',
        'bower_components/leaflet-dist/leaflet.js',
        'bower_components/leaflet-draw/dist/leaflet.draw.js',
        'bower_components/leaflet-label/dist/leaflet.label.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.min.js',
        'bower_components/angular-gettext/dist/angular-gettext.min.js',
        'bower_components/angular-leaflet/dist/angular-leaflet-directive.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/danialfarid-angular-file-upload/dist/angular-file-upload.min.js',
        'bower_components/lodash/dist/lodash.min.js',
        'bower_components/restangular/dist/restangular.min.js',
        'bower_components/angular-ui-tinymce/src/tinymce.js',
        'bower_components/angular-ui-utils/keypress.min.js'
      ])
    .pipe(concat("libs.js"))
    .pipe(gulp.dest('static/admin/js'));
});
gulp.task('scripts', ['scripts-libs'], function() {
  gulp.src(['src/admin/*.js'])
    .pipe(concat("built.js"))
    .pipe(gulp.dest('static/admin/js'));
});
gulp.task('styles', function() {
  gulp.src([
      'bower_components/bootstrap/dist/css/bootstrap.min.css',
      'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
      'bower_components/leaflet-dist/leaflet.css',
      'bower_components/leaflet-draw/dist/leaflet.draw.css',
      'bower_components/leaflet-label/dist/leaflet.label.css',
      'bower_components/font-awesome/css/font-awesome.min.css',
      'src/admin/app.css'
    ])
    .pipe(concat("built.css"))
    .pipe(gulp.dest('static/admin/css'));
});
gulp.task('embed', function() {
  gulp.src([
    'bower_components/leaflet.markercluster/dist/leaflet.markercluster.js',
    'bower_components/leaflet-MiniMap/src/Control.MiniMap.js',
    'bower_components/leaflet-fullscreen/dist/Leaflet.fullscreen.min.js',
    'bower_components/leaflet-control-geocoder/Control.Geocoder.js',
    'bower_components/leaflet-label/dist/leaflet.label.js',
    'src/embed/icons.js',
    'src/embed/embed.js'
    ])
    .pipe(concat("built.js"))
    .pipe(gulp.dest('static/embed'));
  gulp.src([
    'bower_components/leaflet.markercluster/dist/MarkerCluster.css',
    'bower_components/leaflet.markercluster/dist/MarkerCluster.Default.css',
    'bower_components/leaflet-MiniMap/src/Control.MiniMap.css',
    'bower_components/leaflet-fullscreen/dist/leaflet.fullscreen.css',
    'bower_components/leaflet-control-geocoder/Control.Geocoder.css',
    'bower_components/leaflet-label/dist/leaflet.label.css',
    'src/embed/embed.css'
    ])
    .pipe(concat("built.css"))
    .pipe(gulp.dest('static/embed'));
  gulp.src([
    'bower_components/leaflet-dist/images/*',
    'bower_components/leaflet-Minimap/src/images/*'
    ])
    .pipe(gulp.dest('static/embed/images'));
});
gulp.task('copygeojson', function(){
  gulp.src(['src/geojson-index.json'])
    .pipe(concat('index.json'))
    .pipe(gulp.dest('static/geojson'));
});
gulp.task('pot', function () {
  return gulp.src([
      'static/admin/index.html',
      'static/admin/partials/*.html',
      'src/admin/*.js'])
    .pipe(gettext.extract('out.pot'))
    .pipe(gulp.dest('po'));
});

gulp.task('po', function () {
  return gulp.src('po/*.po')
    .pipe(gettext.compile({
        format: 'json'
    }))
    .pipe(gulp.dest('static/admin/translations'));
});
gulp.task('default', ['embed', 'scripts', 'copy', 'copygeojson', 'styles']);
gulp.task('watch', function () {
  gulp.watch(['app/*.js', 'app/**/*.js','spec/nodejs/*.js'], ['embed', 'lint']);
  gulp.watch('src/admin/*.js', ['scripts', 'styles', 'copy', 'lint']);
  gulp.watch('src/embed/*', ['lint', 'embed', 'scripts']);
  gulp.watch('src/geojson-index.json', ['copygeojson']);
});
