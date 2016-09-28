import {
    P2I
} from "../engine/Collision";
import Victor from "../engine/Victor";
import Flyer from "./Flyer";
import Wall from "./Wall";
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
    x ? : number
    y ? : number
    start_y_speed ? : number
    start_x_speed ? : number
    size ? : number
    body_color ? : number

    // 生命周期
    lift_time ? : number
    density ? : number

    // 队伍标志，避免误伤
    team_tag ? : number
    // 穿透能力
    penetrate? : number

    // 伤害
    damage ? : number

    // 大小
    scale ? : number
}


export default class Bullet extends P2I {
    // static collisionMask  = 1<<1;
    body: PIXI.Graphics = new PIXI.Graphics()
    config: BulletConfig = {
        x: 0,
        y: 0,
        start_y_speed: 10,
        start_x_speed: 0,
        size: pt2px(5),
        body_color: 0x2255ff,
        lift_time: 3500,
        density: 1.5,
        penetrate : 0,

        team_tag: NaN,
        damage: 0,

        scale:1
    };

    body_shape: p2.Circle
    static material = new p2.Material()
    constructor(new_config: BulletConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        mix_options(config, new_config);

        const body = self.body;
        body.lineStyle(0, 0x000000, 1);
        body.beginFill(config.body_color);
        body.drawCircle(config.size / 2, config.size / 2, config.size);
        body.endFill();
        self.addChild(body);
        self.pivot.set(config.size / 2, config.size / 2);
        if(_isBorwser) {
            self.cacheAsBitmap = true;
        }

        self.body_shape = new p2.Circle({
            radius: config.size,
        });
        self.body_shape.material = Bullet.material;
        // self.body_shape.sensor = true;
        self.body_shape["bullet_team_tag"] = config.team_tag;

        self.p2_body.damping = self.p2_body.angularDamping = 0;// 1/config.penetrate;

        self.p2_body.addShape(self.body_shape);
        self.p2_body.setDensity(config.density);

        self.p2_body.force = [config.start_x_speed, config.start_y_speed];
        self.p2_body.position = [config.x, config.y];
        self.position.set(config.x, config.y);

        self.once("add-to-world", () => {
            var acc_time = 0
            self.on("update",function (delay) {
                acc_time += delay;
                if(acc_time >= config.lift_time) {
                    self.emit("explode");
                }
            });
        });

        var source_damage = config.damage;
        self.on("penetrate",function (obj:P2I, change_damage) {
            config.penetrate -= obj.config.density/config.density;
            if(isFinite(change_damage)) {
                var damage_rate = config.scale = change_damage/source_damage;
                self.scale.set(damage_rate, damage_rate);
                config.damage = change_damage;
            }
            if(config.penetrate <= 0) {// 穿透耗尽，子弹销毁
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
                    } while (penetrate_num>0)
                }
            };
            in_wall_updater.push(_update);
            self.on("update",_update);
        });
        self.on("out-wall",function (wall:Wall) {
            var _update = in_wall_updater.pop();
            if(_update) {
                self.off("update", _update);
            }
        });
        if (_isNode) { //NODEJS
            self.once("explode", function() {
                console.log("explode", self._id);
                // 不要马上执行销毁，这个时间可能是从P2中执行出来的，可能还没运算完成
                self.update = (delay) => {
                    self.emit("destroy");
                }
            });
        } else {
            self.once("explode", function() {

                var ani_time = B_ANI_TIME;
                var ani_progress = 0;
                var _to = {
                    scaleXY: 2,
                    alpha: 1
                }
                self.on("update",function (delay) {
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
    setConfig(new_config) {
        super.setConfig(new_config);
        var config = this.config;
        mix_options(config, new_config);

        this.scale.set(config.scale, config.scale);
        var old_radius = this.body_shape.radius;
        var new_radius = config.scale*config.size;
        if(new_radius!==old_radius) {
            this.body_shape.radius = new_radius;
            this.body_shape.updateArea();
            this.p2_body.setDensity(config.density);
        }
        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
}