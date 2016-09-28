import {P2I} from "../engine/Collision";
import Victor from "../engine/Victor";
import Bullet from "./Bullet";
import Flyer from "./Flyer";
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

export interface ShipConfig {
    x?: number
    y?: number
    y_speed?: number
    x_speed?: number
    // 推动力
    force?: number
    size?: number
    body_color?: number
    rotation?: number
    max_hp?: number
    cur_hp?: number
    restore_hp?: number
    // 密度，影响着子弹的穿透力
    density?: number
    //战斗相关的状态
    is_firing?: boolean
    ison_BTAR?: boolean // 是否处于攻击钱摇

    // 战斗相关的属性
    bullet_speed?: number
    bullet_damage?: number
    bullet_penetrate?: number// 穿透，意味着子弹存在时间
    overload_speed?: number// 攻速

    // 队伍标志
    team_tag?: number,
}

export default class Ship extends P2I {
    gun: PIXI.Graphics = new PIXI.Graphics()
    body: PIXI.Graphics = new PIXI.Graphics()
    config: ShipConfig = {
        x: 0,
        y: 0,
        y_speed: 0,
        x_speed: 0,
        force: 100000,
        size: pt2px(15),
        body_color: 0x2255ff,
        rotation: 0,
        max_hp: 100,
        cur_hp: 100,
        restore_hp: 1,
        density:1,
        
        is_firing: false,
        ison_BTAR: false,

        // 战斗相关的属性
        bullet_speed: 800000,
        bullet_damage: 5,
        bullet_penetrate: 0.5,
        overload_speed: 0.625,

        // 标志
        team_tag: 10,
    }
    body_shape: p2.Shape
    constructor(new_config: ShipConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        mix_options(config, new_config);

        const body = self.body;
        const body_size = config.size
        body.clear();
        body.lineStyle(pt2px(1.5), 0x000000, 1);
        body.beginFill(config.body_color);
        body.drawCircle(body_size/2, body_size/2, body_size);
        body.endFill();

        const gun = self.gun;
        const gun_height = body_size * 2 / 3;
        const gun_width = body_size;
        gun.lineStyle(pt2px(1.5), 0x000000, 1);
        gun.beginFill(0x666666);
        gun.drawRect(body_size/2+body_size * 0.8, body_size/2-gun_height / 2, gun_width, gun_height);
        gun.endFill();

        self.addChild(gun);
        self.addChild(body);
        self.pivot.set(body_size / 2, body_size / 2);
        if(_isBorwser) {
            self.cacheAsBitmap = true;
        }

        self.body_shape = new p2.Circle({
            radius: config.size,
        });
        self.body_shape.material = Ship.material;
        // self.body_shape.sensor = true;
        self.body_shape["ship_team_tag"] = config.team_tag;
   
        self.p2_body.addShape(self.body_shape);
        self.p2_body.setDensity(config.density);

        self.p2_body.force = [config.x_speed, config.y_speed];
        self.p2_body.position = [config.x, config.y];
        self.position.set(config.x, config.y);

        self.on("change-hp", function (dif_hp) {
            // console.log("change-hp-value:",dif_hp)
            if(isFinite(dif_hp)) {
                const config = self.config;
                config.cur_hp += dif_hp;
                if(dif_hp < 0 && _isBorwser) {
                    self.emit("flash")
                }
                if(config.cur_hp>config.max_hp) {
                    config.cur_hp = config.max_hp;
                }
                if (config.cur_hp <= 0) {
                    self.emit("die");
                }
            }
        });

        // 攻速限制
        (function () {
            var before_the_attack_roll_ani = 0.5;// 攻击前腰在整个动画时间的占比
            var acc_overload_time = 0;
            self.once("fire_start",function _fire_start() {
                config.is_firing = true;
                config.ison_BTAR = true;
                // 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
                // 射击钱摇枪管不可转向。 = true;
                var overload_ani = 1000 / config.overload_speed;
                var _update = function (delay){
                    acc_overload_time+=delay;
                    if(acc_overload_time >= overload_ani*before_the_attack_roll_ani) {
                        config.ison_BTAR = false;
                        if(acc_overload_time >= overload_ani) {
                            self.emit("fire_end");
                            acc_overload_time -= overload_ani;
                        }
                    }
                };
                self.on("update",_update);
                self.once("fire_end",function () {
                    config.is_firing = false;
                    self.off("update", _update);
                    self.once("fire_start", _fire_start);
                });
                // 浏览器端要加动画
                if(_isBorwser) {
                    self.emit("fire_ani");
                }
            });

            // 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
            // 射击钱摇枪管不可转向。
            self.on("fire_ani",function _fire_ani() {
                self.emit("cancel_fire_ani");

                var acc_fire_time = 0;
                self.cacheAsBitmap = false;
                var overload_ani = 1000 / config.overload_speed;
                var from_gun_x = self.gun.x;
                var to_gun_x = from_gun_x - self.gun.width/2;
                var dif_gun_x = to_gun_x - from_gun_x;
                var _update = function (delay){
                    acc_fire_time+=delay;
                    var _progress = acc_fire_time/overload_ani;
                    var ani_progress = Math.min(Math.max(_progress,0),1);
                    // 动画分两段
                    if(ani_progress <= before_the_attack_roll_ani) {//第一段，缩进去
                        ani_progress /= before_the_attack_roll_ani;
                        self.gun.x = from_gun_x + dif_gun_x * Easing.Elastic.Out(ani_progress);
                    }else{//第二段，复原
                        ani_progress = (ani_progress - before_the_attack_roll_ani)/(1-before_the_attack_roll_ani);
                        self.gun.x = to_gun_x - dif_gun_x * Easing.Sinusoidal.Out(ani_progress);
                    }

                    if(_progress >= 1){
                        self.emit("cancel_fire_ani");
                    }
                };
                self.on("update",_update);
                self.once("cancel_fire_ani",function () {
                    self.gun.x = from_gun_x;
                    self.cacheAsBitmap = true;
                    self.once("fire_ani", _fire_ani);
                    self.off("update", _update);
                });
            });
        }());

        if(_isNode) {// Nodejs
            self.once("die",function () {
                self.emit("destroy");
            });

            // 生命回复、攻速限制
            self.once("add-to-world",function () {
                var acc_time = 0;
                var restore_hp_ani = 2000;
                self.on("update",function (delay) {
                    if(config.max_hp!==config.cur_hp) {
                        acc_time += delay;
                        if(acc_time >= restore_hp_ani) {
                            self.emit("change-hp", ~~(config.restore_hp*acc_time/restore_hp_ani));
                            acc_time = acc_time%restore_hp_ani;
                        }
                    }
                });
            });

        }else{// 瀏覽器
            self.once("die",function () {
                var ani_time = B_ANI_TIME;
                var ani_progress = 0;
                var _update = self.update;
                var _to = {
                    scaleXY: 2,
                    alpha: 1
                }
                if (self.world) {
                    self.world.removeBody(self.p2_body);
                    self.world = null;
                }
                self.emit("stop-flash");

                self.update = (delay) => {
                    ani_progress += delay;
                    var progress = Math.min(ani_progress / ani_time, 1);
                    var easing_progress = Easing.Quartic.Out(progress);
                    self.scale.x = self.scale.y = _to.scaleXY * easing_progress;
                    self.alpha = 1 - _to.alpha * easing_progress;

                    _update.call(self, delay);
                    if (progress === 1) {
                        self.emit("destroy");
                    }
                };
            });
        }
    }
    update(delay) {
        super.update(delay);
        this.rotation = this.p2_body["rotation"];
        this.p2_body.force = [this.config.x_speed, this.config.y_speed];
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.p2_body.position[0] = config.x;
        this.p2_body.position[1] = config.y;
        this.x = config.x;
        this.y = config.y;
        if(!config.ison_BTAR) {
            this.p2_body["rotation"] = config.rotation;
            this.rotation =  config.rotation;
        }
    }
    fire() {
        var config = this.config;
        if (config.is_firing) {
            return
        }
        this.emit("fire_start");
        var bullet_size = pt2px(5);
        var bullet_speed = new Victor(config.bullet_speed, 0);
        var bullet_start = new Victor(config.size + bullet_size/2, 0);
        bullet_speed.rotate(config.rotation);
        bullet_start.rotate(config.rotation);
        var bullet = new Bullet({
            team_tag: config.team_tag,
            x: config.x + bullet_start.x,
            y: config.y + bullet_start.y,
            start_x_speed: bullet_speed.x,
            start_y_speed: bullet_speed.y,
            size: bullet_size,
            damage: config.bullet_damage,
            penetrate: config.bullet_penetrate,
        });

        var mass_rate = bullet.p2_body.mass/this.p2_body.mass;
        // 子弹的初始移动速度受到飞船加成
        var bullet_force = bullet.p2_body.force;
        bullet_force[0] += config.x_speed / mass_rate;
        bullet_force[1] += config.y_speed / mass_rate;

        // 一旦发射，飞船受到后座力
        bullet.once("add-to-world", () => {
            this.p2_body.force[0] -= bullet_speed.x*mass_rate;
            this.p2_body.force[1] -= bullet_speed.y*mass_rate;
        });
        return bullet;
        // config.firing
    }
}