"use strict";
const fs = require("fs"),
	path = require("path"),
	levels = ["trace", "debug", "information", "notice", "warning", "error", "critical", "fatal"]; // 与 c++ 对应

let logger = {};

logger.rotate = function() {
	if(logger._fs === process.stdout) return;

	if(logger._fs) logger._fs.end();
	logger._fs = fs.createWriteStream(
		logger._file,
		{flags: "a+"});
};

logger._cache = [];
logger._write = function() {
	let data = logger._cache.shift();
	if(!data) return;
	let date = new Date();
	date = "["
			+ date.getFullYear() + "-"
			+ ("0" + (date.getMonth()+1)).substr(-2) + "-"
			+ ("0" + date.getDate()).substr(-2) + " "
			+ ("0" + date.getHours()).substr(-2) + ":"
			+ ("0" + date.getMinutes()).substr(-2) + ":"
			+ ("0" + date.getSeconds()).substr(-2) + "] ";
	logger._fs.cork();
	logger._fs.write(date);
	logger._fs.write("(" + data.shift() + ") ");

	logger._fs.write(data.shift());
	logger._fs.write("\n", function() {
		if(logger._cache.length) {
			setImmediate(logger._write);
		}
	});
	logger._fs.uncork();
};

module.exports = function(file, l) {
	if(logger._fs) return logger;
	if(typeof l === "string") {
		l = levels.indexOf(l);
	}else if(typeof l !== "number") {
		l = 0;
	}
	if(file) {
		logger._file = file.startsWith("/") ? file : path.join(__dirname, "/../log/", file);
		logger.rotate();
	}else{
		logger._fs = process.stdout;
	}

	levels.forEach(function(level, index) {
		if(index >= l) {
			logger[level] = function() {
				logger._cache.push([level, Array.from(arguments).join(" ")]);
				logger._write();
			};
		}else{
			logger[level] = function() {};
		}
	});
	logger["info"] = logger["information"];
	logger["warn"] = logger["warning"];
	logger["fail"] = logger["error"];
	return logger;
};
