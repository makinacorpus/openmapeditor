/*jshint strict:false */
/*jslint node: true */
'use strict';

exports.insert = function(db, query, params, callback){
	db.run(query, params, function(err){
		if (err){
			callback(err);
		}
		callback(null, {lastID: this.lastID, changes: this.changes});
	});
};
