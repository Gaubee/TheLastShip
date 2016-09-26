import TWEEN, {Tween, EasingFunction} from "../class/Tween";
import {
    VIEW,
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    on,
    square,
    stageManager,
    renderer,
    pt2px,
    emitReisze
} from "./common";

export interface AniConfig {
    target?: string
    to: any,
    time: number,
    easing: EasingFunction
}

export default class Prop extends PIXI.Sprite {
    static tex_name: string
    constructor(tex?: PIXI.Texture) {
        super(tex);
        this.anchor.set(0.5, 0.5);
    }
    protected _is_effectted = false
    protected _ani_configs: AniConfig[] = [
        {
            target: "scale",
            to: {
                x: 0,
                y: 0
            },
            time: M_ANI_TIME,
            easing: TWEEN.Easing.Back.In
        }, {
            target: "",
            to: {
                alpha: 0
            },
            time: L_ANI_TIME,
            easing: TWEEN.Easing.Linear.None
        }
    ]
    effectted(target: PIXI.EventEmitter, ani: TWEEN): void {
        var self = this;
        self._is_effectted = true;
        var ani_configs = self._ani_configs;
        var max_time = 0
        ani_configs.forEach((ani_config => {
            var target = ani_config.target ? self[ani_config.target] : self;
            max_time = Math.max(ani_config.time, max_time);
            ani.Tween(target)
                .to(ani_config.to, ani_config.time)
                .easing(ani_config.easing)
                .start()
        }));
        setTimeout(function () {
            self.parent && self.parent.removeChild(self);
            self.destroy();
        }, max_time + 100)
    };
}

export class Prop_棒棒糖 extends Prop {
    static tex_name = "棒棒糖"

    effectted(target, ani) {
        if (this._is_effectted) {
            return
        }
        this._ani_configs.push({
            target: "",
            to: {
                rotation: PIXI.PI_2
            },
            time: M_ANI_TIME,
            easing: TWEEN.Easing.Circular.In
        });
        target.emit("prop-effect", { score: 100 });
        super.effectted(target, ani);
    }
}
export class Prop_钱 extends Prop {
    static tex_name = "钱"

    effectted(target, ani) {
        if (this._is_effectted) {
            return
        }
        this._ani_configs.push({
            target: "",
            to: {
                y: this.y - this.height * 2
            },
            time: S_ANI_TIME,
            easing: TWEEN.Easing.Quartic.Out
        });
        target.emit("prop-effect", { score: 100 });
        super.effectted(target, ani);
    }
}
export class Prop_路障 extends Prop {
    static tex_name = "路障"
    effectted(target, ani) {
        if (this._is_effectted) {
            return
        }
        this._ani_configs.shift();
        this._ani_configs.push({
            target: "",
            to: {
                rotation: PIXI.PI_2 / 4,
                x: this.x + this.width / 2,
                y: this.y + this.height / 2
            },
            time: M_ANI_TIME,
            easing: TWEEN.Easing.Bounce.Out
        });
        target.emit("prop-effect", { time: -5000 });
        super.effectted(target, ani);
    }
}
export class Prop_炸弹鸟 extends Prop {
    static tex_name = "炸弹鸟"

    effectted(target, ani) {
        if (this._is_effectted) {
            return
        }
        this._ani_configs[0].to = { x: 10, y: 10 };
        this._ani_configs[0].easing = TWEEN.Easing.Bounce.Out
        this._ani_configs[1].time = M_ANI_TIME
        this._ani_configs.push({
            target: "",
            to: {
                rotation: PIXI.PI_2 * 2
            },
            time: M_ANI_TIME,
            easing: TWEEN.Easing.Quadratic.In
        });
        target.emit("prop-effect", { time: -5000 });
        super.effectted(target, ani);
    }
}
export class Prop_香蕉 extends Prop {
    static tex_name = "香蕉"

    effectted(target, ani) {
        if (this._is_effectted) {
            return
        }
        this._ani_configs.shift();
        this._ani_configs.push({
            target: "",
            to: {
                x: this.x + this.width * 5
            },
            time: M_ANI_TIME,
            easing: TWEEN.Easing.Quadratic.Out
        });
        target.emit("prop-effect", { time: -5000 });
        super.effectted(target, ani);
    }
}