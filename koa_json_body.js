"use strict";

module.exports = function() {
	return async function(ctx, next) {
		if(ctx.is("json")) 
		// 将请求 BODY 中的 JSON 数据自动解析
		await new Promise(function(resolve, reject) {
			ctx.reqBodyRaw = "";
			ctx.req.setEncoding("utf8");
			ctx.req.on("data", (chunk) => {
				ctx.reqBodyRaw += chunk;
			}).on("end", () => {
				try{
					ctx.reqBody = JSON.parse(ctx.reqBodyRaw);
				}catch(ex){
					ctx.reqBody = null;
				}
				resolve();
			});
		});
		await next();
	};
};
