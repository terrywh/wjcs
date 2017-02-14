"use strict";

exports.koaFileServer = function(path) {
	return require("./file_server.js")(path);
};

exports.streamJSON = function() {
	if(stream) return require("./stream_json.js")(stream);
	else return require("./stream_json.js");
};

exports.rotateLogger = function(file) {
	return require("./rotate_logger.js")(file);
};

exports.localAddress = function() {
	return require("./local_adress.js")();
};

exports.connectForever = function(options) {
	return require("./connect_forever.js")(options);
};
