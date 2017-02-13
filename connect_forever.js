"use strict";

const net = require("net"),
	Duplex = require("stream").Duplex;

const
	kConn  = Symbol("connection"),
	kExit  = Symbol("exit"),
	kCache = Symbol("cache"),
	kStop  = Symbol("stop"),
	kRetry = Symbol("retry")，
	kTimeout= Symbol("timeout");

function onEnd(self, options) {
	self[kStop] = true;
	delete self[kConn];
	if(!self[kExit]) { // 未标记为退出时，尝试重连
		self[kRetry]++;
		self.emit("forever:retry");
		self[kTimeout] = setTimeout(retryConnect, options.retry || 10000, self, options);
	}
}

function retryConnect(self, options) {
	self[kConn] = net.connect(options, function() {
		options.keepAlive && self[kConn].setKeepAlive(true, options.keepAlive);
		self[kConn].on("end", onEnd.bind(null, self, options));

		self[kCache].forEach(function(w) {
			w.length === 3 ? self[kConn]._writev(w[0], w[1], w[2]) : self[kConn]._write(w[0], w[1]);
		});
		self[kCache] = [];
		self[kStop] = false;
	});
}

function connectForever(options) {
	let self = new Duplex({
		objectMode: true,
		read: function(size) {
			if(kStop) return null;
			return self[kConn]._read(size);
		},
		write: function(chunk, encoding, callback) {
			if(kStop) self[kCache].push([chunk, encoding, callback]);
			else self[kConn]._write(chunk, encoding, callback);
		},
		writev: function(chunks, callback) {
			if(kStop) self[kCache].push([chunks, callback]);
			else self[kConn]._writev(chunks, callback);
		}
	});
	self[kCache] = [];
	self[kExit]  = false;
	self[kStop]  = false;
	self[kEnd]   = self.end;
	self.end     = function(chunk, encoding, callback) {
		self[kExit] = true; // 主动断开
		clearTimeout(self[kTimeout]); // 取消重连
		if(!self[kStop]) self[kEnd](chunk, encoding, callback);
		else onEnd(self, options);
	};
	retryConnect(self, options);

	return self;
};

module.exports = connectForever;
