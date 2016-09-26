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
    mix_options
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

    // 队伍标志，避免误伤
    team_tag ? : number

    // 伤害
    damage ? : number
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
        lift_time: 2000,

        team_tag: NaN,
        damage: 0
    };

    body_shape: p2.Shape
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

        self.body_shape = new p2.Circle({
            radius: config.size,
        });
        self.body_shape["bullet_team_tag"] = config.team_tag;
        // self.body_shape.collisionGroup = 1<<(config.team_tag+1);
        // self.body_shape.collisionMask = ~(self.body_shape.collisionGroup|1<<config.team_tag);

        self.p2_body.damping = self.p2_body.angularDamping = 0;

        self.p2_body.addShape(self.body_shape);

        self.p2_body.force = [config.start_x_speed, config.start_y_speed];
        self.p2_body.position = [config.x, config.y];

        if (typeof process === "object") { //NODEJS
            self.on("explode", function() {
                console.log("explode", self._id);
                self.emit("destroy");
            });
        } else {
            self.on("explode", function() {
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

    setConfig(new_config) {
        super.setConfig(new_config);
        var config = this.config;
        mix_options(config, new_config);

        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
}