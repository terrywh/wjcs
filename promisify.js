"use strict";

exports.$ = function(fn) {
	return new Promise(function(resolve, reject) {
		fn.call(this, function(err, data) {
			err ? reject(err) : resolve(data)
		});
	});
}
