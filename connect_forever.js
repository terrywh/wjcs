"use strict";

const net = require("net");

const
	kClosed      = Symbol("closed"),
	kCached      = Symbol("cached"),
	kStopped     = Symbol("stopped"),
	kRetryTimeout = Symbol("retryTimout");

function retryForever(socket, options) {
	socket.emit("retry", options.retry);
	clearTimeout(socket[kRetryTimeout]);
	socket[kRetryTimeout] = setTimeout(function() {
		socket.connect(options);
	}, options.retry);
}

function connectForever(options) {
	let socket = net.createConnection(options),
		owrite = socket.write;
	options.retry = options.retry || 10000;
	socket[kStopped] = true;
	socket[kCached]  = [];
	socket[kClosed]  = false;
	socket.on("connect", function() {
		let w;
		while(w = socket[kCached].shift()) {
			owrite.call(socket, w[0], w[1], w[2]);
		}
		socket[kStopped] = false;
	}).on("end", function() {
		// console.log("end", socket[kClosed]);
		socket[kStopped] = true;
		if(socket[kClosed]) return;
		retryForever(socket, options);
	}).on("error", function(err) {
		// console.log("error", err.toString(), err.stack);
		if(socket[kStopped]) { // 连接期间的错误，也要重连
			retryForever(socket, options);
		}
	}).on("close", function(hadErr) {
		socket[kStopped] = true;
		if(socket[kClosed]) return;
		retryForever(socket, options);
	});
	socket.write = function(data, encoding, callback) {
		if(socket[kStopped]) socket[kCached].push([data, encoding, callback]);
		else owrite.call(socket, data, encoding, callback);
	};
	socket.close = function(destroy) {
		socket[kClosed] = true;
		clearTimeout(socket[kRetryTimeout]); // 停止已经开始的重连
		if(destroy) {
			socket.destory();
		}else{
			socket.end();
		}
	};
	return socket;
};

module.exports = connectForever;
// -----------------------------------------------------------------------------
if(require.main !== module) return;
let socket = connectForever({"port": 7472, "host":"127.0.0.1", "retry": 2000});
socket.on("retry", function() {
	console.log("socket retry ...");
});
