"use strict";
// support number/array/nested setting

const fs = require("fs");

const pattern_comment = /^[#;]/,
	pattern_value = /^\s*([^\s=]+)\s*=\s*([^\s]+)/,
	pattern_array = /^\s*([^\s=]+)\s*=\s*(\[[^\]]+\])/,
	pattern_string = /^\s*([^\s=]+)\s*=\s*("[^"]+")/,
	pattern_object = /^\s*([^\s=]+)\s*=\s*({.+})/;

function get_item(data, key) {
	key = key.split(".")
	for(let i=0;i<key.length;++i) {
		data = data[key[i]]
	}
	return data;
}

function set_item(data, key, val) {
	key = key.split(".")
	let last_key = key.pop();
	for(let i=0;i<key.length;++i) {
		if(data[key[i]] === undefined) {
			data[key[i]] = {};
		}
		data = data[key[i]]
	}
	if(last_key.substr(-2) == '[]') {
		last_key = last_key.substr(0, last_key.length - 2);
		if(Array.isArray(data[last_key])) {
			data[last_key].push(val);
		}else{
			data[last_key] = [val];
		}
	}else{
		data[last_key] = val;
	}
}

class Config {
	get(key) {
		return get_item(this, key);
	}
	set(key, val) {
		set_item(this, key, val);
	}
};

function parse_lines(lines, done) {
	let data = new Config();
	for(let i=0;i<lines.length;++i) {
		parse_line(data, lines[i])
	}
	done(null, data)
}

function parse_line(data, line) {
	if(line.match(pattern_comment)) {

	}else if(line.match(pattern_object)) {
		set_item(data, RegExp.$1, JSON.parse(RegExp.$2));
	}else if(line.match(pattern_array)) {
		set_item(data, RegExp.$1, JSON.parse(RegExp.$2));
	}else if(line.match(pattern_string)) {
		set_item(data, RegExp.$1, JSON.parse(RegExp.$2));
	}else if(line.match(pattern_value)) {
		set_item(data, RegExp.$1, JSON.parse(RegExp.$2));
	}
}
exports.parse_text = function(text) {
	return new Promise((resolve, reject) => {
		parse_lines(data.toString().split("\n"), resolve);
	});
};
exports.parse_file = function(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, function(err, data) {
			if(err) {
				reject(err, null);
				return;
			}
			parse_lines(data.toString().split("\n"), resolve);
		});
	});
};

