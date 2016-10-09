module.exports = function(app) {
	return new Handler(app);
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

const WORLD_OBJS = new Map();
const WALL_OBJS = new Map();
const WALL_OBJS_list = [];

function Handler(app) {
	this.app = app
	var quadtree = app.quadtree;
	this.quadtree = quadtree;

	setInterval(function () {
		app.rpc.world.worldRemote.getRectangleObjects(null,0,0,quadtree.WIDTH,quadtree.HEIGHT,function(err,res){
			if(err){
				console.log(err);
				return 
			}
			res.objects.forEach(info=>{
				if (info.type === "Wall") {
					if(WALL_OBJS.has(info.id)){
						var obj = WALL_OBJS.get(info.id);
						obj.setInfo(info);
					}else{
						obj = new WorldObj(info);
						WALL_OBJS.set(info.id, obj);
						WALL_OBJS_list.push(obj);
					}
				}
				if(WORLD_OBJS.has(info.id)){
					var obj = WORLD_OBJS.get(info.id);
					obj.setInfo(info);
				}else{
					obj = new WorldObj(info);
					WORLD_OBJS.set(info.id, obj);
					quadtree.insert(obj);
				}
				obj.__is_hit = true;
			});
			// 删除已经不纯在的东西
			for(var obj of WORLD_OBJS.values()){
				if (obj.__is_hit) {
					obj.__is_hit = false
				}else{
					quadtree.remove(obj);
					WORLD_OBJS.delete(obj.id);
				}
			}
			// 更新物体坐标
			quadtree.refresh();
		});
	},1000/60);
}
function getRectViewItems(quadtree,left,top,width,height) {
	const objs = quadtree.getRectViewItems(left-width/2, top-height/2, width, height);
	return {
		objects: objs.concat(WALL_OBJS_list).map(obj=>obj.info)
	}
}
Handler.prototype = {
	getWorld: function(msg, session, next) {
		const view_x = parseFloat(msg.x) || 0;
		const view_y = parseFloat(msg.y) || 0;
		const view_width = parseFloat(msg.width) || 400;
		const view_height = parseFloat(msg.height) || 400;

		const res = getRectViewItems(this.quadtree, view_x, view_y, view_width, view_height);
		next(null, res);

		// this.app.rpc.world.worldRemote.getRectangleObjects(session, view_x, view_y, view_width, view_height, function(err, res) {
		// 	if (err) {
		// 		return next(err)
		// 	}
		// 	// TODO: 移除res.objects里头的ID，除了在初始化战场时候需要用ID判断一下视角的跟随者。这里是有优化空间的
		// 	next(null, res);
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