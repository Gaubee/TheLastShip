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
		const uid = roomid + username;

		const sessionService = this.app.get("sessionService");
		//重复登录
		if (sessionService.getByUid(uid)) {
			next(null, {
				code: 500,
				error: "重复登录"
			});
			return;
		}

		// 绑定ID
		session.bind(uid);
		// 缓存roomid
		session.set("roomid", roomid);
		// 给网页添加cookie
		session.push("roomid", (err) => {
			if (err) {
				console.error("客户端添加ROOMID失败：%j", err.stack);
			}
		});

		session.on("close", ((app, session) => {
			if (session && session.uid) {
				// 剔除玩家，玩家进入自爆
				// app.rpc.world.worldRemote.kick(session, session.uid, app.get("serverId"), session.get("roomid"), null);
				console.log("REMOVE:", session.uid)
			}
		}).bind(null, this.app));

		// 进入游戏世界
		this.app.rpc.world.worldRemote.add(session, uid, this.app.get("serverId"), roomid, false, function(err, game_info) {
			if(err){
				return next(err);
			}
			console.log(game_info);
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