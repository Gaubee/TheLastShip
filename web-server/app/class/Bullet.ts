import {
	P2I
} from "../engine/Collision";
import BulletDrawer from "./Drawer/BulletDrawer";
import Victor from "../engine/Victor";
import Flyer from "./Flyer";
import Wall from "./Wall";
import Gun from "./Gun";
import TWEEN from "../../class/Tween";
const Easing = TWEEN.Easing;

import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options,
	_isBorwser,
	_isNode,
} from "../const";

export interface BulletConfig {
	x?: number
	y?: number
	rotation?: number
	x_force?: number
	y_force?: number
	size?: number
	body_color?: number
	delay?: number// 延迟发射

	// 生命周期
	lift_time?: number
	density?: number

	// 队伍标志，避免误伤
	team_tag?: number
	// 穿透能力
	penetrate?: number

	// 伤害
	damage?: number

	// 大小
	scale?: number

	type?: string
}


export default class Bullet extends P2I {
	// static collisionMask  = 1<<1;
	body: PIXI.Graphics = new PIXI.Graphics()
	config: BulletConfig = {
		x: 0,
		y: 0,
		rotation: 0,
		x_force: 0,
		y_force: 0,
		size: pt2px(5),
		body_color: 0x2255ff,
		delay: 0,
		lift_time: 3500,
		density: 2,
		penetrate: 0,

		team_tag: NaN,
		damage: 0,

		scale: 1,
		type: "normal"
	};

	body_shape: p2.Shape
	static material = new p2.Material()
	owner: Gun
	constructor(new_config: BulletConfig = {}, owner?: Gun) {
		super();
		const self = this;
		self.owner = owner;
		const config = self.config;
		mix_options(config, new_config);

		BulletDrawer(self, config);

		// if (_isBorwser) {//要涉及到子弹角度旋转，这里暂时不做缓存控制
		// 	self.cacheAsBitmap = true;
		// }

		self.p2_body.force = [config.x_force, config.y_force];
		self.p2_body.position = [config.x, config.y];
		self.position.set(config.x, config.y);

		self.once("add-to-world", (world: p2.World) => {
			function _go_to_explode() {
				var acc_time = 0
				self.on("update", function(delay) {
					// 持续的推进力
					self.p2_body.force = [config.x_force, config.y_force];
					acc_time += delay;
					if (acc_time >= config.lift_time) {
						self.emit("explode");
					}
				});
			}
			if (self.config.delay) {
				world.removeBody(self.p2_body);// 临时移除
				var acc_delay = self.config.delay;
				self.on("update", function _(delay) {
					acc_delay -= delay;
					if (acc_delay <= 0) {
						world.addBody(self.p2_body);//随后加入
						self.off("update", _);
						_go_to_explode();
					}
				});
			} else {
				_go_to_explode();
			}
		});

		var source_damage = config.damage;
		self.on("penetrate", function(obj: P2I, change_damage) {
			config.penetrate -= obj.config.density / config.density;
			if (isFinite(change_damage)) {
				var damage_rate = config.scale = change_damage / source_damage;
				self.scale && self.scale.set(damage_rate, damage_rate);
				config.damage = change_damage;
			}
			if (config.penetrate <= 0) {// 穿透耗尽，子弹销毁
				self.emit("explode");
			}
		});
		var in_wall_updater = [];
		self.on("in-wall", function(wall: Wall) {
			var acc_ms = 0;
			var penetrate_time = 200;
			var _update = function(delay) {
				// 每200ms进行一次穿透性削弱
				acc_ms += delay;
				if (acc_ms > penetrate_time) {
					acc_ms = acc_ms % penetrate_time;
					var penetrate_num = ~~(acc_ms / 200);
					do {
						self.emit("penetrate", wall, config.damage * wall.config.bulletproof);
						penetrate_num -= 1;
					} while (penetrate_num > 0)
				}
			};
			in_wall_updater.push(_update);
			self.on("update", _update);
		});
		self.on("out-wall", function(wall: Wall) {
			var _update = in_wall_updater.pop();
			if (_update) {
				self.off("update", _update);
			}
		});
		if (_isNode) { //NODEJS
			self.once("explode", function() {
				// console.log("explode", self._id);
				// 不要马上执行销毁，这个时间可能是从P2中执行出来的，可能还没运算完成
				// self.update = (delay) => {
				//	 self.emit("destroy");
				// }
				self.once("update", function() {
					self.emit("destroy");
				})
			});
		} else {
			self.once("explode", function() {

				var ani_time = B_ANI_TIME;
				var ani_progress = 0;
				var _to = {
					scaleXY: 2,
					alpha: 1
				}
				self.on("update", function(delay) {
					ani_progress += delay;
					var progress = Math.min(ani_progress / ani_time, 1);
					var easing_progress = Easing.Quartic.Out(progress);
					self.scale.x = self.scale.y = _to.scaleXY * easing_progress;
					self.alpha = 1 - _to.alpha * easing_progress;

					if (progress === 1) {
						self.emit("destroy");
					}
				});
			});
		}
	}
	toJSON() {
		var res = super.toJSON();
		res["owner_id"] = this.owner && this.owner._id;
		return res
	}
	setConfig(new_config) {
		super.setConfig(new_config);
		var config = this.config;
		mix_options(config, new_config);
		if (!this.scale) {
			return
		}
		this.scale.set(config.scale, config.scale);
		if (this.body_shape instanceof p2.Circle) {
			var old_radius = this.body_shape.radius;
			var new_radius = config.scale * config.size;
			if (new_radius !== old_radius) {
				this.body_shape.radius = new_radius;
				this.body_shape.updateArea();
				this.p2_body.setDensity(config.density);
			}
		}
		this.p2_body.position = [config.x, config.y];
		this.x = config.x;
		this.y = config.y;
		this.p2_body.angle = config.rotation;
	}
	update(delay) {
		super.update(delay);
		if (!this.children) {// 被销毁
			return
		}
		this.rotation = this.p2_body.angle;
	}
}