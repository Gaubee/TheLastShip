import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";

import TWEEN, {Tween} from "../class/Tween";
import {
    VIEW,
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    on
} from "./common";

export function MaskFactory(ani: TWEEN, parent: PIXI.Container, renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer) {
    var mask_grap = new PIXI.Graphics();
    mask_grap.clear();
    mask_grap.lineStyle(0);
    mask_grap.beginFill(0x000);
    mask_grap.drawRect(0, 0, VIEW.WIDTH, VIEW.HEIGHT);
    mask_grap.endFill();

    parent.addChild(mask_grap);
    var mask = BackgroundGaussianBlur.ContainerToSprite(mask_grap, renderer);
    parent.removeChild(mask_grap);

    return new Mask(ani, mask.texture);
}

interface GaussianBlurOption {
    init_blur?: number
    blur?: number
    quality?: number
}

export class Mask extends PIXI.Sprite {
    ani: TWEEN
    constructor(ani: TWEEN, tex?: PIXI.Texture) {
        super(tex);
        var self = this;
        self.ani = ani;
        self.alpha = 0.5;
        on(self, "click|tap", function () {
            console.log("拦截点击事件");
        })

        self.on("resize", function () {
            self.width = VIEW.WIDTH;
            self.height = VIEW.HEIGHT;
        });
    }
    private _bg_bulr_filter: BackgroundGaussianBlur
    private _is_ani = false
    private _is_open = false
    private _blur_target: PIXI.Container
    show(blur_stage: PIXI.Container, parent: PIXI.Container, option: GaussianBlurOption = {}) {
        if (this._is_ani || this._is_open) {
            return false
        }
        this._bg_bulr_filter || (this._bg_bulr_filter = new BackgroundGaussianBlur(this, option.init_blur || 0, option.quality || 5));
        if (blur_stage.filters) {
            blur_stage.filters.push(this._bg_bulr_filter);
        } else {
            blur_stage.filters = [this._bg_bulr_filter]
        }
        this._blur_target = blur_stage;

        parent.addChild(this)
        this._is_ani = true;
        this._is_open = true;
        this.emit("show");
        this.ani.Tween(this._bg_bulr_filter)
            .to({
                blur: option.blur || 30
            }, B_ANI_TIME)
            .start()
            .onComplete(() => {
                this._is_ani = false;
            });
    }
    hide() {
        if (this._is_ani || !this._is_open) {
            return false
        }

        this._is_open = false;
        this._is_ani = true;

        this.emit("hide");
        this.ani.Tween(this._bg_bulr_filter)
            .to({
                blur: 0
            }, B_ANI_TIME)
            .start()
            .onComplete(() => {
                this._is_ani = false;
                this._blur_target.filters = this._blur_target.filters.filter(f => f !== this._bg_bulr_filter);
                if (this._blur_target.filters.length == 0) {
                    this._blur_target.filters = null;
                }
                this._blur_target = null;
                this.parent.removeChild(this);
            });
    }
}