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
	var config_keys = Object.keys(info.config);
	config_keys.splice(config_keys.indexOf("__TYPE__"), 1);
	this.toJSON = function() {
		var res = {
			id: this.id,
			config: {},
			type: this.info.type
		};
		var config = this.info.config
		config_keys.forEach((k) => {
			res.config[k] = config[k]
		});
		return res;
	}
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
	const share_no_found_ids = new cache.Cache("no_found_ids", 524288, cache.SIZE_128);
	var no_found_ids = [];
	const IDS = new cache.Cache("ids", 524288, cache.SIZE_128);
	const SHARE_ADD_IDS = new cache.Cache("add_ids", 524288, cache.SIZE_128);
	const SHARE_REMOVER_IDS = new cache.Cache("remover_ids", 524288, cache.SIZE_128);

	var cache_ids_time;
	var cache_ids_list = [];
	setInterval(function() {
		var current_ids_time = IDS.time;
		if (!current_ids_time) {
			return
		}
		var current_ids_list_str = IDS.list;
		if (current_ids_time !== cache_ids_time) { //到了要更新所有ID的时间
			cache_ids_time = current_ids_time;
			if (current_ids_list_str) {
				cache_ids_list = [];
				for (var i = 0, len = current_ids_list_str.length; i < len; i += 8) {
					cache_ids_list.push(current_ids_list_str.substr(i, 7));
				}
			} else {
				console.log("IDS_LIST_STR ERROR！", cache_ids_time);
			}
		}
		// 新增ID
		const share_add_ids_list = SHARE_ADD_IDS.list
		if (share_add_ids_list && share_add_ids_list.length) { //改变cache_ids_list
			cache_ids_list.push.apply(cache_ids_list, share_add_ids_list);
			SHARE_ADD_IDS.is_cleared = true;
		}

		// 移除ID进行垃圾回收
		const share_remover_ids_list = SHARE_REMOVER_IDS.list
		if (share_remover_ids_list && share_remover_ids_list.length) { //回收垃圾
			console.log("REMOVE:<回收垃圾>", share_remover_ids_list);
			share_remover_ids_list.forEach(id => {
				cache_ids_list.splice(cache_ids_list.indexOf(id), 1);
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

		var objects = []; // 用于伪装rpc调用的结果res.objects
		var no_found = [];
		cache_ids_list.forEach(function(id) {
			var info_config = getCache(id); // 获取共享内存对象作为config
			if (info_config && info_config.__TYPE__) {
				objects.push({ // 包装成toJSON后的数据
					id: id,
					config: info_config,
					type: info_config.__TYPE__
				});
			} else {
				no_found_ids.push(id);
			}
		});

		// 异常
		if (share_no_found_ids.is_cleared) {
			no_found_ids.splice(0, share_no_found_ids.list.length);
			share_no_found_ids.is_cleared = false;
		}
		share_no_found_ids.list = no_found_ids;
		// 有异常，但不抛出
		if (no_found_ids.length) {
			console.log("NO FOUND ERROR:", no_found_ids)
		}

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

	}, 1000 / 60)
}

function getRectViewItems(quadtree, left, top, width, height) {
	const objs = quadtree.getRectViewItems(left - width / 2, top - height / 2, width, height);
	return {
		objects: objs.concat(WALL_OBJS_list).map(obj => obj.toJSON())
	}
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
			session.set("PRE_getRectangleObjects", res);
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
	},
	controlGunAI: function(msg, session, next) {
		next(null, {});
	},
	getAIInfo: function(msg, session, next) {
		next(null, {});
	},
}