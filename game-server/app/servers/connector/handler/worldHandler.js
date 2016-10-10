module.exports = function(app) {
	return new Handler(app);
};

const cache = require("node-shared-cache");
const worldConfig = require("../../../../config/world.json")
const QuadTreeWorld = require("../../../../../web-server/app/engine/QuadTreeWorld").default;
const os = require("os");

function WorldObj(info) {
	this.id = info.id;
	this.info = info;
	this.position = {
		x: info.config.x,
		y: info.config.y
	};
}
WorldObj.prototype.setInfo = function(new_info) {
	this.info = new_info;
	this.position.x = new_info.config.x;
	this.position.y = new_info.config.y;
}
const WORLD_OBJS = new Map();
const WALL_OBJS = new Map();
const WALL_OBJS_list = [];

const SHARED_CACHE = new Map();
const is_linux = os.platform() === "linux";

function getCache(id) {
	if (SHARED_CACHE.has(id)) {
		return SHARED_CACHE.get(id)
	}
	var res = new cache.Cache(id, 524288, cache.SIZE_128);
	SHARED_CACHE.set(id, res);
	return res;
}
const removeCache = is_linux ? function(id) {
	if (SHARED_CACHE.get(id)) {
		SHARED_CACHE.set(id, null); // 不使用delete，确保不会被重新创建
		cache.release(id); // Linux需要清空/dev/shm下的文件
	}
} : function(id) {
	var obj = SHARED_CACHE.get(id);
	if (obj) {
		cache.clear(SHARED_CACHE.get(id));
	}
	SHARED_CACHE.set(id, null);
}

function Handler(app) {
	this.app = app
	const quadtree = this.quadtree = new QuadTreeWorld({
		width: worldConfig.width,
		height: worldConfig.height,
		x: 0,
		y: 0,
	});
	const NO_FOUND = new cache.Cache("no_found", 524288, cache.SIZE_128);

	setInterval(function() {
		// console.time("refreshShareCache")
		// app.rpc.world.worldRemote.refreshShareCache(null, function(err, ids) {
		// if (err||!ids) {
		// 	return
		// }
		const IDS = new cache.Cache("ids", 524288, cache.SIZE_128);
		const SHARE_REMOVER_IDS = new cache.Cache("remover_ids", 524288, cache.SIZE_128);
		var ids = IDS.list;
		if (!ids) {
			return
		}
		// ID索引，避免未知问题
		var remover_map = {};
		// 进行垃圾回收
		if (SHARE_REMOVER_IDS.list && SHARE_REMOVER_IDS.list.length) { //回收垃圾
			// SHARE_REMOVER_IDS.list.forEach(id => {
			// 	console.log("REMOVE:",WORLD_OBJS.get(id))
			// });
			SHARE_REMOVER_IDS.list.forEach(id => {
				remover_map[id] = true;//
				removeCache(id);
				// 删除Obj缓存
				var obj = WORLD_OBJS.get(id);
				if (obj) {
					WORLD_OBJS.delete(id);
					quadtree.remove(obj);
				}
			});
			SHARE_REMOVER_IDS.is_cleared = true;
		}

		var objects = [];
		var no_found = [];
		ids.forEach(function(id) {
			if (remover_map[id]) {
				return
			}
			var info_config = getCache(id); // 获取共享内存对象作为config
			if (info_config && info_config.__TYPE__) {
				objects.push({ // 包装成toJSON后的数据
					id: id,
					config: info_config,
					type: info_config.__TYPE__
				});
			} else {
				no_found.push(id);
			}
		});
		// no_found.length&&console.log("NO FOUND:", no_found)
		NO_FOUND.list = no_found;

		objects.forEach(info => {
			if (info.type === "Wall") {
				if (!WALL_OBJS.has(info.id)) { //墙对象默认不更新，只进行初始化生成
					// 	var obj = WALL_OBJS.get(info.id);
					// 	obj.setInfo(info);
					// } else {
					obj = new WorldObj(info);
					WALL_OBJS.set(info.id, obj);
					WALL_OBJS_list.push(obj);
				}
			} else {
				if (WORLD_OBJS.has(info.id)) {
					var obj = WORLD_OBJS.get(info.id);
					obj.setInfo(info);
				} else {
					obj = new WorldObj(info);
					WORLD_OBJS.set(info.id, obj);
					quadtree.insert(obj);
				}
			}
		});
		// 更新物体坐标
		quadtree.refresh();

		// console.timeEnd("refreshShareCache")
		// })
	}, 1000 / 30)
}

function getRectViewItems(quadtree, left, top, width, height) {
	const objs = quadtree.getRectViewItems(left - width / 2, top - height / 2, width, height);
	return {
		objects: objs.concat(WALL_OBJS_list).map(obj => obj.info)
	}
}

function fastAssign(to_obj, from_obj) {
	for (var key in from_obj) {
		var value = from_obj[key];
		if (value instanceof Array) {
			to_obj[key] = value.map(item => fastAssign({}, item))
		} else if (value instanceof Object) {
			fastAssign((to_obj[key] = {}), value);
		} else {
			to_obj[key] = value
		}
	}
	return to_obj
}
Handler.prototype = {
	getWorld: function(msg, session, next) {
		const view_x = parseFloat(msg.x) || 0;
		const view_y = parseFloat(msg.y) || 0;
		const view_width = parseFloat(msg.width) || 400;
		const view_height = parseFloat(msg.height) || 400;

		// console.log(session);
		function handle_res(res) {

			var pre_res
				// console.log("msg.min:", msg.min)
			if (msg.min && (pre_res = session.get("PRE_getRectangleObjects"))) {
				var min_res = {
					objects: []
				};

				var obj_map = {};
				pre_res.objects.forEach(function(pre_obj) {
					obj_map[pre_obj.id] = pre_obj
				});
				res.objects.forEach(function(obj) {
					var pre_obj = obj_map[obj.id];
					if (pre_obj) {
						var config = obj.config;
						var pre_config = pre_obj.config;
						var min_config = {};
						var _is_push = false;
						for (var k in config) {
							var v = config[k];
							if (pre_config[k] !== v) {
								min_config[k] = v;
								_is_push = true;
							}
						}
						_is_push && min_res.objects.push({
							id: obj.id,
							config: min_config
						})
					} else {
						min_res.objects.push(obj);
					}
				});
			}

			next(null, min_res || res);
			session.set("PRE_getRectangleObjects", fastAssign({}, res));
			session.push("PRE_getRectangleObjects");
		}
		const res = getRectViewItems(this.quadtree, view_x, view_y, view_width, view_height);
		handle_res(res);
		// this.app.rpc.world.worldRemote.getRectangleObjects(session, view_x, view_y, view_width, view_height, function(err, res) {
		// 	if (err) {
		// 		return next(err)
		// 	}
		// 	handle_res(res);
		// });
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