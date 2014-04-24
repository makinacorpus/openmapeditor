module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		basePath : './',
		files : [
			'static/admin/js/libs.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'static/admin/js/built.js',
			'spec/angular/*Spec.js'
		],
//		reporters: ['progress'],
		autoWatch : true,
//		browsers : ['Chrome'],
		plugins : [
//		        'karma-junit-reporter',
//		        'karma-chrome-launcher',
//		        'karma-firefox-launcher',
		        'karma-jasmine'
		        ]

		/*exclude : [
		  'static/lib/angular/angular-loader.js',
		  'static/lib/angular/*.min.js',
		  'static/lib/angular/angular-scenario.js'
		],

		junitReporter : {
		  outputFile: 'test_out/unit.xml',
		  suite: 'unit'
		}*/
	});
};