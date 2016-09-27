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
	this.roomid = app.get("serverId") + process.pid;
	this.app = app
}
Handler.prototype = {
	enter: function(msg, session, next) {
		const roomid = this.roomid;
		const username = msg.username;
		const mac_ship_id = msg.mac_ship_id;
		const uid = roomid + username;

		const sessionService = this.app.get("sessionService");
		//重复登录
		var session_get_by_uid = sessionService.getByUid(uid);
		// console.log("sessionService.getByUid(uid):",session_get_by_uid,session_get_by_uid==session,session.uid);
		if (session_get_by_uid&&uid!==session.uid) {
			next(null, {
				code: 500,
				error: "重复登录"
			});
			return;
		}

		// 绑定ID
		session.bind(uid);

		session.on("close", ((app, session) => {
			if (session && session.uid) {
				// 剔除玩家，玩家进入自爆
				// app.rpc.world.worldRemote.kick(session, session.uid, app.get("serverId"), session.get("roomid"), null);
				console.log("REMOVE:", session.uid)
			}
		}).bind(null, this.app));

		if (mac_ship_id) {
			var md5_mac_ship_id = MD5(mac_ship_id);
		}

		console.log("SESSION ship_id", mac_ship_id, md5_mac_ship_id);

		// 进入游戏世界
		this.app.rpc.world.worldRemote.add(session, uid, this.app.get("serverId"), roomid, md5_mac_ship_id, function(err, game_info) {
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