/** 操作相关的抽象描述
 *
 */
import TWEEN, {
	Tween
} from "../class/Tween";
import FlowLayout from "../class/FlowLayout";
import TextBuilder from "../class/TextBuilder";

import Flyer from "./class/Flyer";
import Ship from "./class/Ship";
import Wall from "./class/Wall";
import Bullet from "./class/Bullet";

import {
	P2I
} from "./engine/Collision";
import Victor from "./engine/Victor";
import {
	engine
} from "./engine/world";

import {
	VIEW,
	on,
	square,
	stageManager,
	renderer,
	emitReisze,
	touchManager,
} from "./common";

import {
	L_ANI_TIME,
	B_ANI_TIME,
	M_ANI_TIME,
	S_ANI_TIME,
	pt2px,
	assign,
	mix_options,
	_isBorwser,
	_isNode,
	_isMobile,
} from "./const";

interface moveShipOperateShipInfo {
	x_speed: number,
	y_speed: number,
}
/** 移动
 *
 */
export function moveShip(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	moveShip_cb: (moveShip_info: moveShipOperateShipInfo) => void) {

	if (_isMobile) { // 手机版本使用摇柄的支持
		const mobile_operator = new PIXI.Graphics();
		(function() {
			var _size;
			var _border;
			mobile_operator.on("resize", function() {
				mobile_operator.clear();
				_size = Math.min(VIEW.HEIGHT, VIEW.WIDTH) / 6;
				_border = _size / 6;
				mobile_operator.lineStyle(_border, 0xFFFFFF, 0.5);
				mobile_operator.beginFill(0xFFFFFF, 0.3);
				mobile_operator.drawCircle(0, 0, _size);
				mobile_operator.endFill();
				mobile_operator.x = _border * 2 + _size;
				mobile_operator.y = VIEW.HEIGHT - _size - _border * 2;

				// handle resize
				handle.clear();
				var _h_size;
				_h_size = _size / 3;
				handle.beginFill(0xFFFFFF, 0.6);
				handle.drawCircle(0, 0, _h_size);
				handle.endFill();
				handle.cacheAsBitmap = true;
				handle.x = mobile_operator.x; // + _size;
				handle.y = mobile_operator.y; // - _size;
			});

			const handle = new PIXI.Graphics();
			listen_stage.addChild(handle);

			// 交互
			mobile_operator.interactive = true;
			const handle_dir = new Victor(0, 0);
			var current_touch_id = null;
			on(mobile_operator, "touchstart|touchmove", function(e) {
				const view_ship = get_view_ship();
				var touch_list = e.data.originalEvent.touches;
				// 多点触摸，寻找处于左下角的那个，不考虑最接近，但考虑一定要处于左下角
				if (current_touch_id !== null) {
					var touch = touchManager.getById(touch_list, current_touch_id);
					var touch_point = {
						x: touch.clientX,
						y: touch.clientY
					};
				} else {
					var _touch_com = new Victor(0, 0);
					var _control_able_size = _size + _border * 2; // 可控制的空间范围
					for (var i = 0, touch; touch = touch_list[i]; i += 1) {
						_touch_com.x = touch.clientX - mobile_operator.x;
						_touch_com.y = touch.clientY - mobile_operator.y;
						if (_touch_com.length() <= _control_able_size) {
							var touch_point = {
								x: touch.clientX,
								y: touch.clientY
							};
							current_touch_id = touchManager.register(touch);
							break
						}
					}
				}
				if (!touch_point) { // 找不到处于左下角的点就算了
					current_touch_id = null
					return
				}

				handle_dir.x = touch_point.x - mobile_operator.x;
				handle_dir.y = touch_point.y - mobile_operator.y;
				var _length = Math.min(handle_dir.length(), _size);
				var force_rate = _length / _size;
				handle_dir.setLength(force_rate * view_ship.config.force);
				moveShip_cb({
					x_speed: handle_dir.x,
					y_speed: handle_dir.y,
				});
				// 移动handle控制球
				handle_dir.setLength(force_rate * _size);
				handle.x = mobile_operator.x + handle_dir.x;
				handle.y = mobile_operator.y + handle_dir.y;
			});

			on(mobile_operator, "touchend|touchendoutside", function _cancel_force(e) {
				const view_ship = get_view_ship();
				if (current_touch_id === null) {
					return
				}
				requestAnimationFrame(function() { // 延迟释放，避免事件队列其它成员得到这个touchend
					touchManager.free(current_touch_id);
					current_touch_id = null;
				});
				moveShip_cb({
					x_speed: 0,
					y_speed: 0,
				});
				handle.x = mobile_operator.x
				handle.y = mobile_operator.y
			});

		} ());
		// 确保操作面板处于摇柄球之上，不会音响touchendoutside事件;
		listen_stage.addChild(mobile_operator);
	} else {

		const speed_ux = {
			37: "-x",
			65: "-x",
			38: "-y",
			87: "-y",
			39: "+x",
			68: "+x",
			40: "+y",
			83: "+y",
		};
		const effect_speed_keys = []; // 记录按下的按钮
		const generate_speed = function(force) {
			var effect_speed = new Victor(0, 0);
			if (effect_speed_keys.length) {
				for (var i = 0, keyCode; keyCode = effect_speed_keys[i]; i += 1) {
					var speed_info = speed_ux[keyCode];
					effect_speed[speed_info.charAt(1)] = speed_info.charAt(0) === "-" ? -1 : 1
				}
				effect_speed.setLength(force);
			}
			return effect_speed;
		};
		on(listen_stage, "keydown", function(e) {
			const view_ship = get_view_ship();
			if (speed_ux.hasOwnProperty(e.keyCode) && view_ship) {
				move_target_point = null;
				if (effect_speed_keys.indexOf(e.keyCode) === -1) {
					effect_speed_keys.push(e.keyCode);
				}
				var effect_speed = generate_speed(view_ship.config.force);
				moveShip_cb({
					x_speed: effect_speed.x,
					y_speed: effect_speed.y,
				});
			}
		});

		on(listen_stage, "keyup", function(e) {
			const view_ship = get_view_ship();
			if (speed_ux.hasOwnProperty(e.keyCode) && view_ship) {
				move_target_point = null;
				effect_speed_keys.splice(effect_speed_keys.indexOf(e.keyCode), 1);
				var effect_speed = generate_speed(view_ship.config.force);
				moveShip_cb({
					x_speed: effect_speed.x,
					y_speed: effect_speed.y,
				});
			}
		});
		// 电脑版本提供右键操作的支持
		// 将要去的目的点，在接近的时候改变飞船速度
		var move_target_point: Victor;
		var target_anchor = new PIXI.Graphics();
		target_anchor.lineStyle(pt2px(2), 0xff2244, 0.8);
		target_anchor.drawCircle(0, 0, pt2px(10));
		target_anchor.cacheAsBitmap = true;
		target_anchor.scale.set(0);
		view_stage.addChild(target_anchor);

		on(listen_stage, "rightclick", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				move_target_point = new Victor(e.x - view_stage.x, e.y - view_stage.y);
				target_anchor.position.set(move_target_point.x, move_target_point.y);
				ani_tween.Tween(target_anchor.scale)
					.set({
						x: 1,
						y: 1
					})
					.to({
						x: 0,
						y: 0
					}, B_ANI_TIME)
					.start()
			}
		});

		ani_ticker.add(() => {
			const view_ship = get_view_ship();
			if (move_target_point) {
				var curren_point = Victor.fromArray(view_ship.p2_body.interpolatedPosition);
				var current_to_target_dis = curren_point.distance(move_target_point);
				// 动力、质量、以及空间摩擦力的比例
				var force_mass_rate = view_ship.config.force / view_ship.p2_body.mass / view_ship.p2_body.damping;
				var force_rate = Math.min(Math.max(current_to_target_dis / force_mass_rate, 0), 1);
				var force_vic = new Victor(move_target_point.x - view_ship.config.x, move_target_point.y - view_ship.config.y);
				force_vic.setLength(view_ship.config.force * force_rate);
				if (force_vic.lengthSq() <= 100) {
					console.log("基本到达，停止自动移动");
					move_target_point = null;
				}
				moveShip_cb({
					x_speed: force_vic.x,
					y_speed: force_vic.y
				});
			}
		});
	}
}


interface turnHeadOperateShipInfo {
	rotation: number
}
/** 旋转角度
 *
 */
export function turnHead(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	turnHead_cb: (turnHead_info: turnHeadOperateShipInfo) => void) {
	if (_isMobile) {
		// 旋转角度
		on(listen_stage, "touchstart|touchmove", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var touch_list = e.data.originalEvent.touches;
				var touch = touchManager.getFreeOne(touch_list);
				if (!touch) {
					return
				}
				var touch_point = {
					x: touch.clientX,
					y: touch.clientY
				};
				var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
				turnHead_cb({
					rotation: direction.angle()
				})
			}
		});
	} else {
		on(listen_stage, "mousemove|mousedown", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var touch_point = e.data.global
				var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
				turnHead_cb({
					rotation: direction.angle()
				})
			}
		});
	}
}


/** 子弹发射
 *
 */
export function shipFire(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	shipFire_cb: (target_point: { x: number, y: number }) => void) {
	if (_isMobile) {
		on(listen_stage, "touchstart", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var touch_list = e.data.originalEvent.touches;
				var touch = touchManager.getFreeOne(touch_list);
				if (!touch) {
					return
				}
				shipFire_cb({ x: touch.clientX, y: touch.clientY });
			}
		});
	} else {
		on(listen_stage, "mousedown", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var view_staget_pos = view_stage.position;
				shipFire_cb({
					x: e.data.global.x - view_staget_pos.x,
					y: e.data.global.y - view_staget_pos.y,
				});
			}
		});
	}
}


/** AI控制
 *
 */
export function shipControlGunAI(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	shipFire_cb: (target_point: { x: number, y: number }) => void) {
	if (_isMobile) {
		on(listen_stage, "touchstart|touchmove", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var touch_list = e.data.originalEvent.touches;
				var touch = touchManager.getFreeOne(touch_list);
				if (!touch) {
					return
				}
				shipFire_cb({ x: touch.clientX, y: touch.clientY });
			}
		});
	} else {
		on(listen_stage, "mousemove", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var view_staget_pos = view_stage.position;
				shipFire_cb({
					x: e.data.global.x - view_staget_pos.x,
					y: e.data.global.y - view_staget_pos.y,
				});
			}
		});
	}
}


/** 切换子弹自动发射的状态
 *
 */
export function shipAutoFire(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	shipAutoFire_cb: () => void) {
	if (_isMobile) {
		var waiting_ti
		on(listen_stage, "touchstart", function(e) {
			const view_ship = get_view_ship();
			if (view_ship) {
				var touch_list = e.data.originalEvent.touches;
				var touch = touchManager.getFreeOne(touch_list);
				if (!touch) {
					return
				}
				waiting_ti = setTimeout(function() {
					shipAutoFire_cb();
					waiting_ti = null
				}, 1000);
			}
		});
		on(listen_stage, "touchend", function(e) {
			waiting_ti && clearTimeout(waiting_ti);
		});
	} else {
		on(listen_stage, "keydown", function(e) {
			if (e.keyCode == 69) {
				const view_ship = get_view_ship();
				if (view_ship) {
					shipAutoFire_cb();
				}
			}
		});
	}
}

/** 切换枪支的AI托管
 *
 */
export function shipGunAICtrl(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	shipGunAICtrl_cb: (gun_index: number) => void) {
	if (_isMobile) {
	} else {
		var _is_alt_down = false;
		on(listen_stage, "keydown", function(e) {
			if (e.keyCode === 18) { _is_alt_down = true; }
			if (_is_alt_down && e.keyCode >= 49 && e.keyCode <= 57) {
				shipGunAICtrl_cb(e.keyCode - 49)
			}
		});
		on(listen_stage, "keyup", function(e) {
			if (_is_alt_down && e.keyCode === 18) {
				_is_alt_down = false;
			}
		});
	}
}

/** 显示属性加点面板
 *
 */
import * as shipShape from "./class/shipShape.json";
const proto_plan = new FlowLayout();
var close_ProtoPlan_ti = null;
export function showProtoPlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeProto_cb: (add_proto: string, cb_to_redraw: () => void) => void) {
	const view_ship = get_view_ship();
	if (!view_ship) {
		return
	}
	if (proto_plan["is_opened"] || proto_plan["is_ani"]) {
		return
	}
	clearTimeout(close_ProtoPlan_ti);
	proto_plan["is_opened"] = true;
	proto_plan["is_ani"] = true;
	drawProtoPlan(listen_stage,
		view_stage,
		get_view_ship,
		ani_tween,
		ani_ticker,
		changeProto_cb);
	ani_tween.Tween(proto_plan)
		.set({
			x: -proto_plan.width,
			y: VIEW.HEIGHT - proto_plan.height
		})
		.to({
			x: 0
		}, B_ANI_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start()
		.onComplete(() => {
			proto_plan["is_ani"] = false
		});
	listen_stage.addChild(proto_plan);
}
/** 重绘属性加点面板
 *
 */
function drawProtoPlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeProto_cb: (add_proto: string, cb_to_redraw: () => void) => void) {
	const view_ship = get_view_ship();
	// 销毁重绘
	proto_plan.children.slice().forEach(child => {
		proto_plan.removeChild(child);
		child.destroy();
	})

	const typeInfo = shipShape[view_ship.config.type];
	const proto_grow_config = typeInfo.body.proto_grow_config;
	for (var k in proto_grow_config) {
		var proto_grow_config_item = proto_grow_config[k];
		if (typeof proto_grow_config_item === "object") {
			var text_info = new TextBuilder(proto_grow_config_item.title + ` : ${view_ship.proto_list.filter(skill_name => skill_name === k).length}/${proto_grow_config_item.max}`, {
				fontFamily: "微软雅黑",
				fontSize: pt2px(10)
			});
			proto_plan.addChildToFlow(text_info, { float: "right" });
			text_info.interactive = true;
			(function(k, text_info) {
				on(text_info, "click|tap", function() {
					changeProto_cb(k, function() {
						// 重绘
						drawProtoPlan(listen_stage,
							view_stage,
							get_view_ship,
							ani_tween,
							ani_ticker,
							changeProto_cb);
						if (view_ship.config.level <= view_ship.config.proto_list_length) {
							var delay_close = function() {
								close_ProtoPlan_ti = setTimeout(function() {
									hideProtoPlan(listen_stage,
										view_stage,
										get_view_ship,
										ani_tween,
										ani_ticker);
									close_ProtoPlan_ti = null;
								}, B_ANI_TIME);
							}
							// if(_isMobile) {
							// 	delay_close();
							// }else{
							// 	// on(proto_plan, "mouseout", delay_close, true);
							// 	proto_plan.once("mouseout", delay_close);
							// }
							delay_close();
						}
					});
				});
			})(k, text_info);
		}
	}
	var bg = new PIXI.Graphics();
	bg.beginFill(0xffffff, 0.5);
	bg.drawRoundedRect(-10, -10, proto_plan.width + 20, proto_plan.height + 20, 5);
	proto_plan.addChildAt(bg, 0);
}
/** 关闭属性加点面板
 *
 */
export function hideProtoPlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker) {
	if (!proto_plan["is_opened"] || proto_plan["is_ani"]) {
		return
	}
	proto_plan["is_opened"] = false;
	proto_plan["is_ani"] = true;
	ani_tween.Tween(proto_plan)
		.to({
			x: -proto_plan.width
		}, B_ANI_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start()
		.onComplete(() => {
			proto_plan["is_ani"] = false
			listen_stage.removeChild(proto_plan);
		});
}
/** 切换属性加点面板的显示隐藏
 *
 */
export function toggleProtoPlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeProto_cb: (add_proto: string, cb_to_redraw: () => void) => void) {
	on(listen_stage, "keydown", function(e) {
		const view_ship = get_view_ship();
		if (!view_ship) {
			return
		}
		if (e.keyCode == 67) {
			if (proto_plan["is_opened"]) {
				hideProtoPlan(listen_stage,
					view_stage,
					get_view_ship,
					ani_tween,
					ani_ticker)
			} else {
				showProtoPlan(listen_stage,
					view_stage,
					get_view_ship,
					ani_tween,
					ani_ticker,
					changeProto_cb)
			}
		}

	});
	const view_ship = get_view_ship();
	function _init(view_ship) {
		view_ship.on("level-changed", function() {
			// 有可用属性点
			if (view_ship.config.proto_list_length < view_ship.config.level) {
				showProtoPlan(listen_stage,
					view_stage,
					get_view_ship,
					ani_tween,
					ani_ticker,
					changeProto_cb);
			}
		});
	}
	if (view_ship) {
		_init(view_ship);
	} else {
		listen_stage.on("view_ship-changed", function(view_ship) {
			_init(view_ship);
		})
	}
}

/** 本地沙河模式工具
 *	
 */
export function sandboxTools(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker) {
	on(listen_stage, "keydown", e => {
		const view_ship = get_view_ship();
		if (!view_ship) {
			return
		}
		// 快速升级
		if (e.keyCode == 75) {
			var experience = Ship.level_to_experience(view_ship.config.level + 1);
			view_ship.emit("change-experience", experience - view_ship.config.experience);
		}
	});
}
/** 显示形态加点面板
 *
 */
// import * as shipShape from "./class/shipShape.json";

const shape_plan = new FlowLayout();
var close_ShapePlan_ti = null;
export function showShapePlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeable_shapes: string[],
	changeShape_cb: (new_shape: string, cb_to_redraw: () => void) => void) {
	const view_ship = get_view_ship();
	if (!view_ship) {
		return
	}
	drawShapePlan(listen_stage,
		view_stage,
		get_view_ship,
		ani_tween,
		ani_ticker,
		changeable_shapes,
		changeShape_cb);
	if (shape_plan["is_opened"] || shape_plan["is_ani"]) {
		return
	}
	clearTimeout(close_ShapePlan_ti);
	shape_plan["is_opened"] = true;
	shape_plan["is_ani"] = true;
	ani_tween.Tween(shape_plan)
		.set({
			x: VIEW.WIDTH,
			y: pt2px(10)
		})
		.to({
			x: VIEW.WIDTH - shape_plan.width
		}, B_ANI_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start()
		.onComplete(() => {
			shape_plan["is_ani"] = false
		});
	listen_stage.addChild(shape_plan);
}
/** 重绘形态加点面板
 *
 */
function drawShapePlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeable_shapes: string[],
	changeShape_cb: (new_shape: string, cb_to_redraw: () => void) => void) {
	const view_ship = get_view_ship();
	// 销毁重绘
	shape_plan.children.slice().forEach(child => {
		shape_plan.removeChild(child);
		child.destroy();
	});
	// 先放到缓存中，计算出合适的布局后再搞事
	var items = [];
	var max_width = 0;
	changeable_shapes.forEach(type_name => {
		var typeInfo = shipShape[type_name]
		var image_info = new Ship(assign(assign({}, view_ship.config["toJSON"]()), { type: type_name }));
		image_info.x = image_info.width / 2
		image_info.y = image_info.height
		var text_info = new TextBuilder(typeInfo.name, {
			fontFamily: "微软雅黑",
			align: "center",
			fontSize: pt2px(10)
		});
		var item_info = new FlowLayout();
		item_info.max_width = Math.max(image_info.width, text_info.width);
		max_width = Math.max(item_info.max_width, max_width);
		item_info.addChildToFlow({ float: "center" }, image_info, text_info);

		items.push(item_info);

		item_info.interactive = true;
		on(item_info, "click|tap", function() {
			changeShape_cb(type_name, function() {
				view_ship.emit("level-changed");
			});
		});
	});
	shape_plan.max_width = max_width * 2 + pt2px(10 + 10 + 20);
	items.forEach((item_info, i) => {
		var item_info_bg = new PIXI.Graphics();
		// item_info_bg.lineStyle(1,0xff0000,1);
		item_info_bg.beginFill(0xffff00, 0.0);
		item_info_bg.drawRect(0, 0, max_width + pt2px(10 * (i % 2)), item_info.height + pt2px(10));
		item_info_bg.endFill();
		item_info.addChild(item_info_bg);
		item_info.width + item_info.height// 强制调用计算属性，动态计算布局

		// 强行调用私有属性，到后面才统一计算布局绘制。
		shape_plan["_addFlowChildItem"](item_info, { float: "left" });
	});
	shape_plan.reDrawFlow();

	var bg = new PIXI.Graphics();
	bg.beginFill(0xffffff, 0.5);
	bg.drawRoundedRect(-10, -10, shape_plan.width + 20, shape_plan.height + 20, 5);
	shape_plan.addChildAt(bg, 0);
}
/** 关闭形态加点面板
 *
 */
export function hideShapePlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker) {
	if (!shape_plan["is_opened"] || shape_plan["is_ani"]) {
		return
	}
	shape_plan["is_opened"] = false;
	shape_plan["is_ani"] = true;
	ani_tween.Tween(shape_plan)
		.to({
			x: VIEW.WIDTH
		}, B_ANI_TIME)
		.easing(TWEEN.Easing.Quadratic.Out)
		.start()
		.onComplete(() => {
			shape_plan["is_ani"] = false
			listen_stage.removeChild(shape_plan);
		});
}
/** 切换形态加点面板的显示隐藏
 *
 */
export function toggleShapePlan(
	/*事件监听层*/
	listen_stage: PIXI.Container,
	/*视觉元素层*/
	view_stage: PIXI.Container,
	/*动态获取运动视角对象*/
	get_view_ship: () => Ship,
	/*动画控制器*/
	ani_tween: TWEEN,
	/*渲染循环器*/
	ani_ticker: PIXI.ticker.Ticker,
	changeShape_cb: (new_shape: string, cb_to_redraw: () => void) => void) {
	const view_ship = get_view_ship();
	function _init(view_ship) {
		view_ship.on("level-changed", function() {
			// 有可用形态
			var changeable_shapes = view_ship.CHANGEABLE_SHAPES;
			if (changeable_shapes.length > 0) {
				showShapePlan(listen_stage,
					view_stage,
					get_view_ship,
					ani_tween,
					ani_ticker,
					changeable_shapes,
					changeShape_cb);
			} else {
				hideShapePlan(listen_stage,
					view_stage,
					get_view_ship,
					ani_tween,
					ani_ticker);
			}
		});
	}
	if (view_ship) {
		_init(view_ship);
	} else {
		listen_stage.on("view_ship-changed", view_ship => {
			view_ship && _init(view_ship);
		})
	}

}