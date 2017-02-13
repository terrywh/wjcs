"use strict";
const os = require("os");

module.exports = function() {
	let networks = os.networkInterfaces();
	for(let name in networks) {
		let addrs = networks[name]
		for(let i=0; i<addrs.length; ++i) {
			if(addrs[i].family == "IPv4") {
				let segment = addrs[i].address.split(".");
				if(parseInt(segment[0]) == 10 // 10.0.0.0/8
					|| parseInt(segment[0]) == 172 && parseInt(segment[1]) >= 16 && parseInt(segment[1]) <= 31 // 172.16.0.0/12
					|| parseInt(segment[0]) == 192 && parseInt(segment[1]) == 168 ) { // 192.168.0.0/16

					return addrs[i].address;
					break
				}
			}
		}
	}
	return null;
};
