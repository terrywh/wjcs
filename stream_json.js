"use strict";
const EventEmitter = require("events").EventEmitter;

module.exports = function(stream) {
	stream.setEncoding("utf8");
	let cache = "",
		self  = new EventEmitter();
	stream.on("data", function(chunk) {
		let o = 0, p = 0, j = null;
		chunk = cache + chunk;
		while(p = chunk.indexOf("\n", o)) {
			try{
				j = JSON.parse(chunk.substr(o, p+1));
			}catch(e){
				self.emit("error", new Error("illegalJson: " + chunk.substr(o, p+1)));
				break;
			}
			self.emit("data", j);
			o = p + 1;
		}
		cache = chunk.substr(o);
	}).on("end",function() {
		if(cache.length === 0) return;
		let j = null;
		try{
			j = JSON.parse(cache.substr(o, p+1));
		}catch(e){
			self.emit("error", new Error("illegalJSON: " + cache));
			return;
		}
		cache = "";
		self.emit("data", j);
	});

	self.write = function(obj) {
		if(typeof obj === "object") this[STREAM].write(JSON.stringify(obj) + "\n");
		else this[STREAM].write(obj);
	};
	self.end = function(obj) {
		obj && self.write(obj);
		stream.end();
	};
	return self;
};

// -----------------------------------------------------------------------------
if(require.main !== module) return;
