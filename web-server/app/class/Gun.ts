import {
	P2I
} from "../engine/Collision";
import GunDrawer from "./Drawer/GunDrawer";
import Victor from "../engine/Victor";
import Bullet from "./Bullet";
import Ship from "./Ship";
import TWEEN from "../../class/Tween";
const Easing = TWEEN.Easing;

import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	mix_options,
	assign,
	_isBorwser,
	_isNode,
	transformJSON,
	transformValue,
	transformMix,
	formatDeg,
} from "../const";
import * as gunShape from "./gunShape.json";
if (_isNode) {
	Object.assign(gunShape, transformJSON(JSON.stringify(gunShape)));
}

export interface GunConfig {
	// 基本属性
	size?: number
	rotation?: number
	//战斗相关的状态
	is_firing?: boolean
	ison_BTAR?: boolean // 是否处于攻击钱摇
	BTAR_rate?: number // 攻击前腰在整个动画时间的占比
	delay?: number// 延迟发射

	// 战斗相关的属性
	bullet_size?: number
	bullet_density?: number
	bullet_force?: number
	bullet_damage?: number
	bullet_penetrate?: number // 穿透，意味着子弹存在时间
	bullet_type?: string
	bullet_lift_time?: number
	overload_speed?: number // 攻速

	// 枪基本形状
	type?: string
	// 最多同时存在的子弹数
	max_bullet_length?: number
	// 是否处于自动控制状态
	is_ctrl_by_AI?: boolean
}
export default class Gun extends P2I {
	static TYPES = gunShape
	owner: Ship = null
	gun: PIXI.Graphics = new PIXI.Graphics()
	config: GunConfig = {
		rotation: 0,
		//战斗相关的状态
		is_firing: false,
		ison_BTAR: false, // 是否处于攻击钱摇
		BTAR_rate: 0.5, // 攻击前腰在整个动画时间的占比
		delay: 0,

		// 战斗相关的属性
		bullet_size: pt2px(5),
		bullet_density: pt2px(1),
		bullet_force: 1,
		bullet_damage: 1,
		bullet_penetrate: 1, // 穿透，意味着子弹存在时间
		bullet_type: "normal",
		bullet_lift_time: 3500,
		overload_speed: 1, // 攻速

		// 枪基本形状
		type: "NONE",
		max_bullet_length: -1,
		is_ctrl_by_AI: false
	}
	constructor(new_config: GunConfig = {}, owner?: Ship) {
		super();
		const self = this;
		self.owner = owner;
		// const config = self.config;
		self.setConfig(new_config, !!owner);

		if (owner) {
			owner.guns.push(self);
			owner.addChildAt(self, 0);
		}

		// if (_isBorwser) {
		// 	self.gun.cacheAsBitmap = true;
		// }

		// 攻速限制
		(function() {
			var acc_overload_time = 0;
			self.once("fire_start", function _fire_start() {
				const config = self.config;
				const before_the_attack_roll_ani = config.BTAR_rate;
				config.is_firing = true;
				config.ison_BTAR = true;
				// 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
				// 射击钱摇枪管不可转向。 = true;
				var overload_ani = 1000 / config.overload_speed;
				var _update = function(delay) {
					acc_overload_time += delay;
					if (acc_overload_time >= overload_ani * before_the_attack_roll_ani) {
						config.ison_BTAR = false;
						if (acc_overload_time >= overload_ani) {
							self.emit("fire_end");
							acc_overload_time -= overload_ani;
						}
						var config_delay = config.delay > 1 ? config.delay : config.delay * 1000 / config.overload_speed
						if (acc_overload_time >= overload_ani - config_delay) {
							config.is_firing = false;
						}
					}
				};
				self.on("update", _update);
				self.once("fire_end", function() {
					config.is_firing = false;
					self.off("update", _update);
					self.once("fire_start", _fire_start);
				});
				// 浏览器端要加动画
				if (_isBorwser) {
					self.emit("fire_ani");
				}
			});

			// 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
			// 射击钱摇枪管不可转向。
			self.on("fire_ani", function _fire_ani() {
				self.emit("cancel_fire_ani");

				const config = self.config;
				const before_the_attack_roll_ani = config.BTAR_rate;
				var acc_fire_time = 0;
				var overload_ani = 1000 / config.overload_speed;
				var from_gun_x = self.x;
				var from_gun_y = self.y;
				var dif_gun_x = -self.width * 0.2;
				var dif_gun_y = 0;
				var gun_rotation = config.rotation + self.gun.rotation;
				if (gun_rotation) {
					var dir_vic = new Victor(dif_gun_x, dif_gun_y);
					dir_vic.rotate(gun_rotation);
					dif_gun_x = dir_vic.x;
					dif_gun_y = dir_vic.y;
				}
				var to_gun_x = from_gun_x + dif_gun_x;
				var to_gun_y = from_gun_y + dif_gun_y;

				var _update = function(delay) {
					acc_fire_time += delay;
					var _progress = acc_fire_time / overload_ani;
					var ani_progress = Math.min(Math.max(_progress, 0), 1);
					// 动画分两段
					if (ani_progress <= before_the_attack_roll_ani) { //第一段，缩进去
						ani_progress /= before_the_attack_roll_ani;
						ani_progress = Easing.Elastic.Out(ani_progress)
						self.x = from_gun_x + dif_gun_x * ani_progress;
						self.y = from_gun_y + dif_gun_y * ani_progress;
					} else { //第二段，复原
						ani_progress = (ani_progress - before_the_attack_roll_ani) / (1 - before_the_attack_roll_ani);
						ani_progress = Easing.Sinusoidal.Out(ani_progress)
						self.x = to_gun_x - dif_gun_x * ani_progress;
						self.y = to_gun_y - dif_gun_y * ani_progress;
					}

					if (_progress >= 1) {
						self.emit("cancel_fire_ani");
					}
				};
				self.on("update", _update);
				self.once("cancel_fire_ani", function() {
					self.x = from_gun_x;
					self.y = from_gun_y;
					self.once("fire_ani", _fire_ani);
					self.off("update", _update);
				});
			});
		} ());
	}
	setConfig(new_config, is_from_owner?) {
		super.setConfig(new_config);
		const self = this;
		const config = self.config;
		// const cache_config = assign({},config);

		var typeInfo = gunShape[new_config.type] || gunShape[config.type];
		if (!typeInfo) {
			throw new TypeError("UNKONW Gun Type: " + config.type);
		}

		const owner = self.owner;
		const owner_config = owner.config;

		// 动态合成配置
		if (owner && !is_from_owner) {
			new_config = assign(owner.getWeaponConfigById(self._id), new_config);
		}
		new_config = transformMix(owner_config, new_config)
		typeInfo = transformMix(owner_config, typeInfo)

		if (new_config["args"]) { // 飞船绘制配置强制覆盖枪杆配置
			typeInfo = assign(typeInfo, {
				args: new_config["args"]
			})
		}
		// 覆盖配置
		mix_options(config, typeInfo["config"]);
		mix_options(config, new_config);

		// var _is_redraw = false;
		// for(var k in cache_config) {
		// 	if(cache_config[k]!==config[k]){
		// 		_is_redraw = true;
		// 		break;
		// 	}
		// }
		// 绘制枪体
		// if(_is_redraw) {
		GunDrawer(self, config, typeInfo);
		// }
		// 在射击动画结束的时候重置坐标，否则，原本射击的动画会影响绘制结果
		var new_x = self.x;
		var new_y = self.y;
		self.once("cancel_fire_ani", function() {
			self.x = new_x;
			self.y = new_y;
		});
	}
	update(delay) {
		this.emit("update", delay);
	}
	bullets: Bullet[] = []
	private _fire() {
		const ship = this.owner;
		const ship_config = ship.config;
		const config = this.config;
		if (config.is_firing) {
			return
		}
		if (config.max_bullet_length > 0 && this.bullets.length >= config.max_bullet_length) {
			return
		}
		this.emit("fire_start");
		const before_the_attack_roll_ani = config.BTAR_rate;
		const bullet_size = config.bullet_size;
		const bullet_density = config.bullet_density;
		const bullet_force = new Victor(config.bullet_force, 0);
		// const bullet_start = new Victor(ship_config.size + bullet_size / 2, 0);
		const bullet_start = new Victor(this.x - ship_config.size, this.y - ship_config.size);
		const bullet_dir = ship_config.rotation + config.rotation + this.gun.rotation;
		bullet_force.rotate(bullet_dir);
		bullet_start.rotate(ship_config.rotation);
		const bullet = new Bullet({
			team_tag: ship_config.team_tag,
			x: ship_config.x + bullet_start.x,
			y: ship_config.y + bullet_start.y,
			x_force: bullet_force.x,
			y_force: bullet_force.y,
			size: bullet_size,
			density: bullet_density,
			damage: config.bullet_damage,
			type: config.bullet_type,
			lift_time: config.bullet_lift_time < 0 ? Infinity : config.bullet_lift_time,
			penetrate: config.bullet_penetrate,

			// 确保子弹的独立性，所以绘制信息直接一次性继承上去。
			body_color: ship.config.body_color,
			// delay:1000 / config.overload_speed * before_the_attack_roll_ani
		}, this);

		bullet.p2_body.velocity = ship.p2_body.velocity.slice();

		// 一旦发射，飞船受到后座力
		bullet.once("add-to-world", () => {
			var mass_rate = bullet.p2_body.mass / ship.p2_body.mass;
			// 飞船自身提供给子弹大量的初始推动力
			var init_x_force = bullet_force.x * 50;
			var init_y_force = bullet_force.y * 50;
			bullet.p2_body.force = [init_x_force, init_y_force];

			ship.p2_body.force[0] -= init_x_force * mass_rate;
			ship.p2_body.force[1] -= init_y_force * mass_rate;

			if (config.max_bullet_length > 0) {
				var dif_length = this.bullets.length - config.max_bullet_length;
				// 移除多余的子弹，引爆
				while (dif_length > 0) {
					dif_length -= 1;
					let bullet = this.bullets[0];
					bullet.emit("explode");
				}
			}
			this.bullets.push(bullet);
		});
		bullet.on("explode", () => {
			var index = this.bullets.indexOf(bullet);
			if (index !== -1) {
				this.bullets.splice(index, 1);
			}
		});
		// 通知父级
		this.owner && this.owner.emit("gun-fire_start", this._id, bullet);
		return bullet;
		// config.firing
	}
	private _is_waiting_delay = false;
	fire(cb: (bullet: Bullet) => void) {
		const config = this.config;
		if (!config.delay) {
			var bullet = this._fire();
			if (bullet) {
				cb(bullet)
			}
		} else {
			if (!config.is_firing && !this._is_waiting_delay) {
				this._is_waiting_delay = true;
				this.setTimeout(() => {
					this._is_waiting_delay = false;
					var bullet = this._fire();
					if (bullet) {
						cb(bullet)
					}
				}, config.delay > 1 ? config.delay : config.delay * 1000 / config.overload_speed);
			}
		}
	}
	toggleAI() {
		this.setConfig({
			is_ctrl_by_AI: !this.config.is_ctrl_by_AI
		});
	}
	// 指定子弹跟踪打击的点
	private __bullet_track: { x: number, y: number }
	// 子弹跟踪打击的算法
	private __ctl_track_bullets_handle: () => void
	// 自动转向权重打击点
	private __turn_gun: { x: number, y: number, to_rotation: number }
	private __ctl_turn_gun_handles: () => void
	static GUN_CONTROL_HANDLE = {
		"auto-track": function(gun: Gun, x: number, y: number) {
			if (!gun.__bullet_track) {
				gun.__bullet_track = { x, y };
				const _ctl_bullets = gun.__ctl_track_bullets_handle = function() {
					const {x, y} = gun.__bullet_track;
					const ship = gun.owner;
					const ship_x = ship.config.x;
					const ship_y = ship.config.y;
					const max_bullet_length_Sq = gun.config.max_bullet_length * gun.config.max_bullet_length;
					// 如果开启了AI打击，那么子弹会寻找以飞船为中心600px，距离自己最近的可打击目标
					var targets;
					if (gun.config.is_ctrl_by_AI) {
						const AI_dis_Sq = 600 * 600;
						const objects = ship.parent.children;
						targets = objects.filter(filyer => {
							if (filyer.constructor.name === "Flyer" || filyer.constructor.name === "Ship" && filyer !== ship) {
								var dif_x = filyer.x - ship_x;
								var dif_y = filyer.y - ship_y;
								return dif_x * dif_x + dif_y * dif_y <= AI_dis_Sq
							}
						});
					}
					const bullets_len = gun.bullets.length;
					const gun_index = ship.guns.indexOf(gun);
					const gun_index_1 = gun_index + 1;
					const unit_angle = Math.PI / 10;
					gun.bullets.forEach((bullet, i) => {
						const bullet_config = bullet.config;
						if (targets && targets.length) {
							var near_target;
							var near_target_dis_Sq = Infinity;
							targets.forEach(target => {
								var dif_x = target.x - bullet.x;
								var dif_y = target.y - bullet.y;
								var dis_Sq = dif_x * dif_x + dif_y * dif_y;
								if (dis_Sq < near_target_dis_Sq) {
									near_target_dis_Sq = dis_Sq;
									near_target = target;
								}
							});
							var to_target_dir = new Victor(near_target.x - bullet_config.x, near_target.y - bullet_config.y);
						} else {
							var to_target_dir = new Victor(x - bullet_config.x, y - bullet_config.y);
						}
						const to_target_dir_lengthSq = to_target_dir.lengthSq();
						if (to_target_dir_lengthSq < max_bullet_length_Sq) {
							return
						}
						var force = new Victor(bullet_config.x_force, bullet_config.y_force);
						var target_angle = to_target_dir.angle();
						// 附带可旋转的角速度
						target_angle += unit_angle * (/*让其无法聚集在一起*/(i + gun_index * bullets_len) / (bullets_len * gun_index_1));
						force.rotateTo(target_angle);

						bullet.setConfig({
							x_force: force.x,
							y_force: force.y,
							rotation: target_angle,
						})
					});
					gun.__ctl_track_bullets_handle && gun.setTimeout(gun.__ctl_track_bullets_handle, 100);// 默认每一秒进行一次自动控制
				};
				_ctl_bullets();
			}
			gun.__bullet_track = { x, y };
		},
		"auto-turn": function(gun: Gun, x: number, y: number) {
			if (!gun.__turn_gun) {
				gun.__turn_gun = { x, y, to_rotation: 0 };
				const _ctr_gun = gun.__ctl_turn_gun_handles = function() {
					const {x, y} = gun.__turn_gun;
					const ship = gun.owner;
					const gun_helper = gun.gun["__gun_helper"];// 基座
					const ship_x = ship.config.x;
					const ship_y = ship.config.y;
					// 打击目标相对与飞船的坐标
					var re_x = x - ship.config.x
					var re_y = y - ship.config.y
					var base_dir = new Victor(gun_helper.x - ship.config.size, gun_helper.y - ship.config.size);//基座的真实相对坐标
					base_dir.rotate(ship.config.rotation);

					var dir = new Victor(re_x - base_dir.x, re_y - base_dir.y);

					var to_rotation = formatDeg(dir.angle() - gun.rotation - ship.config.rotation);
					if (Math.abs(to_rotation) <= Math.PI / 2 && !gun.config.is_ctrl_by_AI) {// 转向角度+-PI
						// to_rotation = Math.abs(to_rotation) <= Math.PI / 2 ? to_rotation : 0;
					} else {// 枪支角度超出控制，采用自动控制或者主动声明使用自动控制
						const AI_dis_Sq = 800 * 800;
						const objects = ship.parent.children;
						var targets = objects.filter(filyer => {
							if (filyer.constructor.name === "Flyer" || filyer.constructor.name === "Ship" && filyer !== ship) {
								var dif_x = filyer.x - ship_x;
								var dif_y = filyer.y - ship_y;
								return dif_x * dif_x + dif_y * dif_y <= AI_dis_Sq
							}
						});
						// 优先打击近处的物体
						var near_target;
						var near_target_dis_Sq = Infinity;
						targets.forEach(target => {
							var dif_x = target.x - (base_dir.x + ship_x);
							var dif_y = target.y - (base_dir.y + ship_y);
							var dis_Sq = dif_x * dif_x + dif_y * dif_y;
							if (dis_Sq < near_target_dis_Sq) {
								near_target_dis_Sq = dis_Sq;
								near_target = target;
							}
						});
						if (near_target) {
							var re_x = near_target.x - ship.config.x
							var re_y = near_target.y - ship.config.y
							var dir = new Victor(re_x - base_dir.x, re_y - base_dir.y);
							var to_rotation = formatDeg(dir.angle() - gun.rotation - ship.config.rotation);
						}
					}
					to_rotation = Math.abs(to_rotation) <= Math.PI / 2 ? to_rotation : 0;
					gun.__turn_gun.to_rotation = to_rotation;

					gun.__ctl_turn_gun_handles && gun.setTimeout(gun.__ctl_turn_gun_handles, 100);
				};
				const trun_speed = Math.PI / 50;
				gun.on("update", function() {
					if (gun.config.ison_BTAR) {// 处于攻击前摇时不转向
						return
					}
					var { to_rotation} = gun.__turn_gun;
					var cur_rotation = formatDeg(gun.gun.rotation);
					const dif_rotation = to_rotation - cur_rotation;
					if (Math.abs(dif_rotation) > trun_speed) {//渐变转向
						gun.gun.rotation += (dif_rotation > 0 ? trun_speed : -trun_speed)
					} else {
						gun.gun.rotation = to_rotation
					}
				});
				_ctr_gun();
			}
			gun.__turn_gun.x = x;
			gun.__turn_gun.y = y;
		}
	}
}