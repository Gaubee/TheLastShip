const EventEmitter = require("events");
// require("fs").readFileSync("../../../../../web-server/app/engine/QuadTreeWorld.ts")
const worldConfig = require("../../../../config/world.json")
const QuadTreeWorld = require("../../../../../web-server/app/engine/QuadTreeWorld").default;
module.exports = function(app) {
	return new WorldRemote(app);
};

function WorldObj(info){
	this.id = info.id;
	this.info = info;
	this.position = {x:info.config.x,y:info.config.y};
}
WorldObj.prototype.setInfo = function (new_info) {
	this.info = new_info;
	this.position.x = new_info.config.x;
	this.position.y = new_info.config.y;
}

var WorldRemote = function(app) {
	const events = this.events = new EventEmitter();
	this.app = app;
	const world = this.world = app.world;
	const channelService = this.channelService = app.get('channelService');
	[
		"explode" //子弹爆炸
		, "change-hp" //飞船、物体血量减少
		, "die" //飞船死亡
		, "ember" //物体销毁
		, "gun-fire_start" // 飞船的某个枪支发射
	].forEach(eventName => {
		events.on(eventName, function(data) {
			for (var channel_name in channelService.channels) {
				var channel = channelService.channels[channel_name];
				channel.pushMessage({
					route: eventName,
					data: data
				});
			}
		});
	});

	if (world) {
		world.listener = events;
		const quadtree = this.quadtree = new QuadTreeWorld({
			width: worldConfig.width,
			height: worldConfig.height,
			x: 0,
			y: 0,
		});
		const WORLD_OBJS = new Map();
		const STATIC_OBJS = new Map();
		const STATIC_OBJS_list = [];
		setInterval(function() {
			const p2is = world.items;
			console.log(p2is.length)
			p2is.forEach(p2i => {
				const info = p2i.toJSON();
				if (info.type === "Wall") {
					if (STATIC_OBJS.has(info.id)) {
						var obj = STATIC_OBJS.get(info.id);
						obj.setInfo(info);
					} else {
						obj = new WorldObj(info);
						STATIC_OBJS.set(info.id, obj);
						STATIC_OBJS_list.push(obj);
					}
				}
				if (WORLD_OBJS.has(info.id)) {
					var obj = WORLD_OBJS.get(info.id);
					obj.setInfo(info);
				} else {
					obj = new WorldObj(info);
					WORLD_OBJS.set(info.id, obj);
					quadtree.insert(obj);
				}
				obj.__is_hit = true;
			});
			// 删除已经不纯在的东西
			for (var obj of WORLD_OBJS.values()) {
				if (obj.__is_hit) {
					obj.__is_hit = false
				} else {
					quadtree.remove(obj);
					WORLD_OBJS.delete(obj.id);
				}
			}
			// 更新物体坐标
			quadtree.refresh();
		}, 1000 / 60);
		this.getRectViewItems = function (left,top,width,height) {
			const objs = quadtree.getRectViewItems(left-width/2, top-height/2, width, height);
			return {
				objects: objs.concat(STATIC_OBJS_list).map(obj=>obj.info)
			}
		}
	}
};

/**
 * Add user into ship channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
WorldRemote.prototype.add = function(uid, sid, name, ship_md5_id, cb) {
	const channel = this.channelService.getChannel(name, true);
	channel.add(uid, sid);
	if (ship_md5_id) {
		var cur_ship = this.world.getShip(ship_md5_id)
	}
	if (!cur_ship) {
		var cur_ship = this.world.newShip({
			ship_md5_id: ship_md5_id
		});
	}
	const base_info = this.world.getGameBaseInfo();
	cb(null, {
		ship: cur_ship,
		baseInfo: base_info,
	});
};
WorldRemote.prototype.getRectangleObjects = function(view_x, view_y, view_width, view_height, cb) {
	var res = this.getRectViewItems(view_x, view_y, view_width, view_height);
	cb(null, res);
}
WorldRemote.prototype.setConfig = function(ship_id, new_ship_config, cb) {
	try {
		var ship = this.world.setConfig(ship_id, new_ship_config)
		cb(null, ship);
	} catch (e) {
		cb(e);
	}
}
WorldRemote.prototype.fire = function(ship_id, cb) {
	try {
		var bullets = this.world.fire(ship_id);
		cb(null, bullets);
	} catch (e) {
		cb(e);
	}
};
WorldRemote.prototype.autoFire = function(ship_id, cb) {
	try {
		var bullets = this.world.autoFire(ship_id);
		cb(null, bullets);
	} catch (e) {
		cb(e);
	}
};
WorldRemote.prototype.addProto = function(ship_id, add_proto, cb) {
	try {
		var proto_list = this.world.addProto(ship_id, add_proto);
		cb(null, proto_list);
	} catch (e) {
		cb(e);
	}
};
WorldRemote.prototype.changeType = function(ship_id, new_type, cb) {
	try {
		var proto_list = this.world.changeType(ship_id, new_type);
		cb(null, proto_list);
	} catch (e) {
		cb(e);
	}
};
WorldRemote.prototype.refreshShareCache = function(cb) {
		this.world.refreshShareCache();
		cb();
	}
	/**
	 * Get user from chat channel.
	 *
	 * @param {Object} opts parameters for request
	 * @param {String} name channel name
	 * @param {boolean} flag channel parameter
	 * @return {Array} users uids in channel
	 *
	 */
WorldRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if (!!channel) {
		users = channel.getMembers();
	}
	for (var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
WorldRemote.prototype.kick = function(uid, sid, name, cb) {
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if (!!channel) {
		channel.leave(uid, sid);
	}
	var username = uid.split('*')[0];
	var param = {
		route: 'onLeave',
		user: username
	};
	console.log("Leave user!!!")
	channel.pushMessage(param);
	cb && cb()
};