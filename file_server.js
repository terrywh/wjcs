"use strict"

const path = require("path"),
	fs = require("fs"),
	mtypes = require("mime-types");

module.exports = function(www) {
	www = path.normalize(www)
	return function*(next) {
		let status = 302,
			path   = this.path,
			fsys   = wpPattern.test(www + "/" + path) ? wpFileSys: fs
		while(status === 302) {
			status = yield function(done) {
				fsys.stat(www + path, function(error, stats) {
					done(null, error ? (error.code === "ENOENT" ? 404 : 403) : (stats.isDirectory()? 302 : 200) )
				});
			};
			if(status === 302) {
				if(path.substr(-1) === '/') {
					path += "index.html"
				}else{
					path += "/index.html"
				}
			}else if(status === 200) {
				this.type = mtypes.lookup(path) || "application/octet-stream"
				this.body = fsys.createReadStream(www + path)
			}else if(status === 403){
				this.status = status
			}else{
				yield next
			}
		}
	};
};
