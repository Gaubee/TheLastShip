module.exports = function(app) {
	return new Handler(app);
};
function Handler(app) {
	this.app = app
}
Handler.prototype = {
	getWorld: function(msg, session, next) {
		const view_x = parseFloat(msg.x) || 0;
		const view_y = parseFloat(msg.y) || 0;
		const view_width = parseFloat(msg.width) || 400;
		const view_height = parseFloat(msg.height) || 400;
		const self = this;

		this.app.rpc.world.worldRemote.getRectangleObjects(session, view_x, view_y, view_width, view_height, function(err, res) {
			if (err) {
				return next(err)
			}
			var pre_res
			if (msg.min&&(pre_res = self.__pre_getRectangleObjects)) {
				var min_res = {objects:[]};

				var obj_map = {};
				pre_res.objects.forEach(function (pre_obj) {
					obj_map[pre_obj.id] = pre_obj
				});
				res.objects.forEach(function (obj) {
					var pre_obj = obj_map[obj.id];
					if (pre_obj) {
						var config = obj.config;
						var pre_config = pre_obj.config;
						var min_config = {};
						for(var k in config){
							var v = config[k];
							if (pre_config[k] !== v) {
								min_config[k] = v;
							}
						}
						min_res.objects.push({
							id: obj.id,
							config: min_config
						})
					}else{
						min_res.objects.push(obj);
					}
				});
			}
			self.__pre_getRectangleObjects = res;
			// TODO: 移除res.objects里头的ID，除了在初始化战场时候需要用ID判断一下视角的跟随者。这里是有优化空间的
			next(null, min_res||res);
		});
	},
	setConfig: function(msg, session, next) {
		const ship_id = session.get("ship_id");
		if (!ship_id) {
			return next({
				code: 500,
				error: "No Found Ship Id."
			});
		}
		if (typeof msg.config !== "object") {
			return next({
				code: 500,
				error: "No Found ConfigInfo To Set."
			});
		}
		this.app.rpc.world.worldRemote.setConfig(session, ship_id, msg.config, function(err, res) {
			next(err, res)
		});
	},
	fire: function(msg, session, next) {
		const ship_id = session.get("ship_id");
		if (!ship_id) {
			return next({
				code: 500,
				error: "No Found Ship Id."
			});
		}
		this.app.rpc.world.worldRemote.fire(session, ship_id, function(err, res) {
			next(err, res)
		});
	},
	autoFire: function(msg, session, next) {
		const ship_id = session.get("ship_id");
		if (!ship_id) {
			return next({
				code: 500,
				error: "No Found Ship Id."
			});
		}
		this.app.rpc.world.worldRemote.autoFire(session, ship_id, function(err, res) {
			next(err, res)
		});
	},
	addProto: function(msg, session, next) {
		const ship_id = session.get("ship_id");
		if (!ship_id) {
			return next({
				code: 500,
				error: "No Found Ship Id."
			});
		}
		this.app.rpc.world.worldRemote.addProto(session, ship_id, msg.proto, function(err, res) {
			next(err, res)
		});
	},
	changeType: function(msg, session, next) {
		const ship_id = session.get("ship_id");
		if (!ship_id) {
			return next({
				code: 500,
				error: "No Found Ship Id."
			});
		}
		this.app.rpc.world.worldRemote.changeType(session, ship_id, msg.type, function(err, res) {
			next(err, res)
		});
	}
}