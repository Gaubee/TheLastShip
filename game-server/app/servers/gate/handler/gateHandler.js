module.exports = function(app) {
	var res = new Handler(app);
	return res
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	// var uid = msg.uid;
	// if(!uid) {
	// 	next(null, {
	// 		code: 500
	// 	});
	// 	return;
	// }
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	console.log("connectors:",connectors);
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500,
			msg:connectors.length
		});
		return;
	}
	// here we just start `ONE` connector server, so we return the connectors[0] 
	var res = connectors[0];
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};
