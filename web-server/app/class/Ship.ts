import {P2I} from "../engine/Collision";
import ShapeDrawer from "./Drawer/ShapeDrawer";
import Victor from "../engine/Victor";
import Bullet from "./Bullet";
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
    assign,
    transformJSON,
    transformValue,
} from "../const";
import * as shipShape from "./shipShape.json";
if(_isNode) {
    Object.assign(shipShape, transformJSON(JSON.stringify(shipShape)));
}

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
    bullet_force?: number
    bullet_damage?: number
    bullet_penetrate?: number// 穿透，意味着子弹存在时间
    overload_speed?: number// 攻速

    // 队伍标志
    team_tag?: number
    // 飞船基本形状
    type?: string
}

export default class Ship extends P2I {
    static TYPES = shipShape
    guns: Gun[] = []
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
        bullet_force: 30000,//子弹的推进力
        bullet_damage: 5,
        bullet_penetrate: 0.5,
        overload_speed: 1,

        // 标志
        team_tag: Math.random(),
        type: "S-1"
    }
    body_shape: p2.Shape
    constructor(new_config: ShipConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        const typeInfo = shipShape[new_config.type]||shipShape[config.type];
        if(!typeInfo) {
            throw new TypeError("UNKONW Ship Type: " + config.type);
        }
        // 覆盖配置
        mix_options(config, typeInfo.body.config);
        mix_options(config, new_config);

        // 绘制武器
        typeInfo.guns.forEach(function (_gun_config) {
            var gun_config = assign({},_gun_config);
            // 枪支继承飞船的基本配置
            [
                "bullet_force",
                "bullet_damage",
                "bullet_penetrate",
                "overload_speed",
            ].forEach(function (k) {
                var ship_v = config[k];
                if(!gun_config.hasOwnProperty(k)){
                    gun_config[k] = ship_v;
                }
            });
            new Gun(gun_config, self)
        });

        // 绘制船体
        ShapeDrawer(self, config, typeInfo.body);
        if(_isBorwser) {
            self.body.cacheAsBitmap = true;
        }
        
        self.body_shape["ship_team_tag"] = config.team_tag;
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
        this.guns.forEach(gun=>gun.update(delay));
    }
    // 操控飞船
    operateShip(new_config:ShipConfig){
        var config = this.config;
        // 这个接口只能修改这三个参数
        var limit_config = {
            y_speed:config.y_speed,
            x_speed:config.x_speed,
            rotation:config.rotation,
        };
        mix_options(limit_config,new_config);

        if (
            limit_config.x_speed * limit_config.x_speed +
            limit_config.y_speed * limit_config.y_speed >
            config.force * config.force + 1// JS小数问题，确保全速前进不会出现问题
        ) { // 判定移动速度上限
            console.log("非法操作，取消这次操作");
            return //非法操作，取消这次操作
        }
        this.setConfig(limit_config);
    }
    setConfig(new_config:ShipConfig) {
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
    levelUp(add_proto:"HP"|"SPEED"){

    }
    fire(){
        var res_bullets = this.guns.map(gun=>gun.fire());
        return res_bullets.filter(bullet=>bullet);
    }
}