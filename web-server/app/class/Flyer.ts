import {P2I} from "../engine/Collision";
import ShapeDrawer from "./Drawer/ShapeDrawer";

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
import TWEEN from "../../class/Tween";
import * as flyerShape from "./flyerShape.json";
// console.log(flyerShape);
// console.log("__dirname",require("./flyerShape.json"));
// const flyerShape =  require("./flyerShape.json");

const Easing = TWEEN.Easing;

export interface FlyerConfig {
    x?: number
    y?: number
    y_speed?: number
    x_speed?: number
    size?: number,
    body_color?: number
    density?: number
    rotation?: number
    max_hp?: number
    cur_hp?: number
    type?: string
}

export default class Flyer extends P2I {
    static TYPES = flyerShape
    // static clooisionGroup = 1<<1;
    body: PIXI.Graphics = new PIXI.Graphics()
    config: FlyerConfig = {
        x: 0,
        y: 0,
        y_speed: 5,
        x_speed: 0,
        size: pt2px(10),
        body_color: 0x2255ff,
        density: 1,
        rotation: 0,
        max_hp: 50,
        cur_hp: 50,
        type: "S-Box",
    }
    body_shape: p2.Shape
    constructor(new_config: FlyerConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        mix_options(config, new_config);
        const typeInfo = flyerShape[config.type];
        if(!typeInfo) {
            throw new TypeError("UNKONW Ship Type: " + config.type);
        }
        // 覆盖配置
        mix_options(config, typeInfo.config);

        ShapeDrawer(self,config,typeInfo);

        if(_isBorwser) {
            self.cacheAsBitmap = true;
        }

        self.p2_body.angularVelocity = Math.PI*Math.random();
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
                    self.emit("ember");
                }
            }
        });
        if(_isNode) {// Nodejs
            self.once("ember",function () {
                self.emit("destroy");
            });
        }else{// 瀏覽器
            self.once("ember",function () {
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
                    self.scale.x = self.scale.y = 1 + (_to.scaleXY - 1) * easing_progress;
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
        this.rotation = this.config.rotation = this.p2_body.interpolatedAngle;
        // this.p2_body.force = [this.config.x_speed, this.config.y_speed];
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.rotation = this.p2_body.angle = config.rotation;
        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
}