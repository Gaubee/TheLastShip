import {P2I} from "../engine/Collision";
import Victor from "../engine/Victor";
import Flyer from "./Flyer";
import {
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    pt2px,
    mix_options
} from "../const";
export interface WallConfig {
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    color?: number
}
export default class Wall extends P2I {
    // static clooisionGroup = 1<<1;
    config: WallConfig = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        color: 0x0ff0f0
    }

    p2_body = new p2.Body({
        mass: 0,
        fixedRotation: true,
        fixedX: true,
        fixedY: true,
    })
    body = new PIXI.Graphics()
    body_shape: p2.Shape

    constructor(new_config: WallConfig) {
        super();
        const self = this;
        const config = self.config;
        mix_options(config, new_config);

        const body = self.body;
        body.beginFill(config.color);
        body.drawRect(0, 0, config.width, config.height);
        body.endFill();
        self.addChild(body);
        self.pivot.set(config.width / 2, config.height / 2);

        self.body_shape = new p2.Box({
            width: config.width,
            height: config.height,
        });
        // self.body_shape.collisionGroup = Wall.clooisionGroup;
        // // 与任何物体都可以发生碰撞
        // self.body_shape.collisionMask = -1;
        self.p2_body.addShape(self.body_shape);

        self.p2_body.position = [config.x, config.y];
        self.rotation = config.rotation;
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
    update(delay) {
        super.update(delay);
        this.rotation = this.config.rotation = this.p2_body.angle;
    }
} 