"use strict";
const fs = require("fs"),
	util = require("util");

module.exports = function(file) {
	let w = fs.createWriteStream(file, {flags: "a+"}),
		l = {path: file};
	l.rotate = function() {
		w.end();
		w = fs.createWriteStream(file, {flags: "a+"});
	};
	l.print = function() {
		w.write(util.format.apply(util, arguments) + "\n");
	};
	l.fatal = function() {
		w.write(util.format.apply(util, arguments) + "\n");
		process.exit();
	};
	return l;
};
