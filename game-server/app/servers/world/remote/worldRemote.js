const EventEmitter = require("events");
const utils =
	module.exports = function(app) {
		return new WorldRemote(app);
	};

var WorldRemote = function(app) {
	const events = this.events = new EventEmitter();
	this.app = app;
	const world = this.world = app.world;
	if (world) {
		world.listener = events;
	}
	const channelService = this.channelService = app.get('channelService');
	// 监听子弹爆炸
	// 监听血量减少
	["explode", "change-hp", "die"].forEach(eventName => {
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
	var objects = this.world.getRectangleObjects(view_x, view_y, view_width, view_height);
	cb(null, {
		objects: objects,
	});
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
		var bullet = this.world.fire(ship_id);
		cb(null, bullet);
	} catch (e) {
		cb(e);
	}
};
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