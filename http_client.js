exports.invoke = function(path, query, body, method) {
		return new Promise(function(resolve, reject) {
			let x = new XMLHttpRequest();
			x.open(method ? method : (body ? "POST" : "GET"), build_url(path, query), true);
			x.onreadystatechange = function() {
				if(x.readyState == 4) {
					if(x.status == 200) {
						resolve(JSON.parse(x.responseText));
					}else{
						let err = new Error(x.responseText)
						err.status = x.status;
						reject(err);
					}
				}
			}
			if(typeof body === "object") {
				x.setRequestHeader("Content-Type", "application/json");
				body = JSON.stringify(body);
			}else{
				x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			x.send(body);
		});
	};
