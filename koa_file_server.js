"use strict"

const path = require("path"),
	fs = require("fs"),
	mtypes = {"html":"text/html","js":"text/javascript","json":"text/json","png":"image/png","jpg":"image/jpeg","gif":"image/gif","css":"text/css"};

module.exports = function(www) {
	www = path.normalize(www);
	return function*(next) {
		let status = 302, file = path.resolve(www, this.path);
		while(status === 302) {
			status = yield function(done) {
				fs.stat(file, function(error, stats) {
					done(null, error ? (error.code === "ENOENT" ? 404 : 403) : (stats.isDirectory()? 302 : 200) )
				});
			};
			if(status === 302) {
				if(file.substr(-1) === '/') {
					file += "index.html";
				}else{
					file += "/index.html";
				}
			}else if(status === 200) {
				this.type = mtypes[path.extname(file)] || "application/octet-stream";
				this.body = fs.createReadStream(file);
			}else if(status === 403){
				this.status = status;
			}else{
				yield next;
			}
		};
	};
};
