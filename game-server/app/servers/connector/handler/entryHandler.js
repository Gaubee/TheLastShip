const crypto = require('crypto');

function MD5(str) {
	var md5sum = crypto.createHash("md5");
	md5sum.update(str);
	str = md5sum.digest("hex");
	return str;
};

module.exports = function(app) {
	return new Handler(app);
};

function Handler(app) {
	this.serverId = app.get("serverId");
	this.roomid = this.serverId + process.pid;
	this.app = app
}

const tick_ti_map = new Map();

Handler.prototype = {
	enter: function(msg, session, next) {
		const self = this;
		const roomid = this.roomid;
		const username = msg.username;
		const mac_ship_id = msg.mac_ship_id;
		const uid = roomid + username;

		const sessionService = this.app.get("sessionService");
		//重复登录
		var session_get_by_uid = sessionService.getByUid(uid);
		// console.log("sessionService.getByUid(uid):",session_get_by_uid,session_get_by_uid==session,session.uid);
		if (session_get_by_uid && uid !== session.uid) {
			next(null, {
				code: 500,
				error: "重复登录"
			});
			return;
		}

		// 绑定ID
		session.bind(uid);
		const kick_ti = tick_ti_map.get(mac_ship_id);
		if (kick_ti) {
			console.log("停止掉线自杀");
			clearTimeout(kick_ti);
			tick_ti_map.clear(mac_ship_id);
		}

		if (mac_ship_id) {
			var md5_mac_ship_id = MD5(mac_ship_id);
		}

		console.log("SESSION ship_id", mac_ship_id, md5_mac_ship_id);

		session.on("closed", ((app, session) => {
			if (session && session.uid) {
				console.log("掉线，启动定时自杀", session.uid);
				app.rpc.world.worldRemote.remove(session, session.uid, self.serverId, roomid, null);
				// 剔除玩家，玩家进入自爆
				const kick_ti = setTimeout(function() {
					tick_ti_map.clear(mac_ship_id);
					app.rpc.world.worldRemote.kick(session, roomid, md5_mac_ship_id, null);
				}, 20e3);
				tick_ti_map.set(mac_ship_id, kick_ti);
			}
		}).bind(null, this.app));

		// 进入游戏世界
		this.app.rpc.world.worldRemote.add(session, uid, self.serverId, roomid, md5_mac_ship_id, function(err, game_info) {
			if (err) {
				return next(err);
			}
			console.log("INIT GAME INFO:", game_info);
			// game_info 包括 总在线数，当前房间人数、rank排名信息、以及新飞船的信息
			var new_ship = game_info.ship;
			// 缓存ship_id
			session.set("ship_id", new_ship.id);
			// 给网页添加cookie
			session.push("ship_id", (err) => {
				if (err) {
					console.error("客户端添加SHIP ID失败：%j", err.stack);
				}
			});
			next(null, game_info);
		});

	}
}