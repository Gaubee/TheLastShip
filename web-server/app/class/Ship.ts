declare const process;

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
    mix_options
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
    is_firing?: boolean
    rotation?: number
    max_hp?: number
    cur_hp?: number
    restore_hp?: number

    // 战斗相关的属性
    bullet_speed?: number
    bullet_damage?: number

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
        force: 10000,
        size: pt2px(20),
        body_color: 0x2255ff,
        is_firing: false,
        rotation: 0,
        max_hp: 100,
        cur_hp: 100,
        restore_hp: 1,

        // 战斗相关的属性
        bullet_speed: 4000,
        bullet_damage: 5,

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
        body.lineStyle(4, 0x000000, 1);
        body.beginFill(config.body_color);
        body.drawCircle(body_size/2, body_size/2, body_size);
        body.endFill();

        const gun = self.gun;
        const gun_height = body_size * 2 / 3;
        const gun_width = body_size;
        gun.lineStyle(4, 0x000000, 1);
        gun.beginFill(0x666666);
        gun.drawRect(body_size/2+body_size * 0.8, body_size/2-gun_height / 2, gun_width, gun_height);
        gun.endFill();

        self.addChild(gun);
        self.addChild(body);
        self.pivot.set(body_size / 2, body_size / 2);

        self.body_shape = new p2.Circle({
            radius: config.size,
        });
        self.body_shape["ship_team_tag"] = config.team_tag;
        // self.body_shape.collisionGroup = 1<<config.team_tag;
        // // 与任何物体都可以发生碰撞
        // self.body_shape.collisionMask = -1;
        self.p2_body.addShape(self.body_shape);
        self.changeMass(Math.PI*2*body_size);
        self.p2_body.force = [config.x_speed, config.y_speed];
        self.p2_body.position = [config.x, config.y];

        self.on("change-hp", function (dif_hp) {
            console.log("change-hp-value:",dif_hp)
            if(isFinite(dif_hp)) {
                const config = self.config;
                config.cur_hp -= dif_hp;
                if (config.cur_hp <= 0) {
                    self.emit("die");
                }
            }
        });
        if(typeof process == "object") {// Nodejs
            self.on("die",function () {
                self.emit("destroy");
            });
        }else{// 瀏覽器
            self.on("die",function () {
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
        this.p2_body["rotation"] = config.rotation;
        this.x = config.x;
        this.y = config.y;
        this.rotation =  config.rotation;
    }
    fire() {
        var config = this.config;
        if (config.is_firing) {
            return
        }
        var bullet_size = pt2px(5);
        var bullet_speed = new Victor(config.bullet_speed, 0);
        var bullet_start = new Victor(config.size + bullet_size, 0);
        bullet_speed.rotate(config.rotation);
        bullet_start.rotate(config.rotation);
        var bullet = new Bullet({
            team_tag: config.team_tag,
            x: config.x + bullet_start.x,
            y: config.y + bullet_start.y,
            start_x_speed: bullet_speed.x,
            start_y_speed: bullet_speed.y,
            size: bullet_size,
            damage: config.bullet_damage
        });
        // 一旦发射，飞船受到后座力
        bullet.once("add-to-world", () => {
            this.p2_body.force[0] -= bullet_speed.x;
            this.p2_body.force[1] -= bullet_speed.y;
        });
        return bullet;
        // config.firing
    }
}