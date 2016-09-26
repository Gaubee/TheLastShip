import {P2I} from "../engine/Collision";

import {
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    pt2px,
    mix_options
} from "../const";

export interface FlyerConfig {
    x?: number
    y?: number
    y_speed?: number
    x_speed?: number
    size?: number,
    body_color?: number
}

export default class Flyer extends P2I {
    // static clooisionGroup = 1<<1;
    body: PIXI.Graphics = new PIXI.Graphics()
    config: FlyerConfig = {
        x: 0,
        y: 0,
        y_speed: 5,
        x_speed: 0,
        size: pt2px(10),
        body_color: 0x2255ff,
    }
    body_shape: p2.Shape
    constructor(new_config: FlyerConfig = {}) {
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
        // self.body_shape.collisionGroup = Flyer.clooisionGroup;
        // // 与任何物体都可以发生碰撞
        // self.body_shape.collisionMask = -1;
        self.p2_body.addShape(self.body_shape);

        self.p2_body.force = [config.x_speed, config.y_speed];
        self.p2_body.position = [config.x, config.y];
    }

    update(delay) {
        super.update(delay);
        this.p2_body.force = [this.config.x_speed, this.config.y_speed];
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
}