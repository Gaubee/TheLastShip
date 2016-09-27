import {
    VIEW,
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    on,
    pt2px,
    mix_options
} from "../common";
import TWEEN, {Tween} from "../../class/Tween";
import SVGGraphics from "../../class/SVGGraphics";

export default class Dialog extends PIXI.Container {
    ani: TWEEN
    title: PIXI.Container
    bg: PIXI.Container
    content: PIXI.Container
    closeButton: PIXI.Container

    style = {
        bg: {
            color: 0xe51928,
            alpha: 1,
            paddingLR: pt2px(40),
            paddingTB: pt2px(76),
            radius: pt2px(10)
        },
        closeButton: {
            show: true,
            size: pt2px(18),
            bold: pt2px(1),
            top: 0,
            left: 0
        },
        title: {
            padding: pt2px(20)
        }
    }
    constructor(title: string | PIXI.Sprite | PIXI.Texture | PIXI.Container, content: PIXI.Container, ani_control: TWEEN, options?: any) {
        super();
        this.ani = ani_control;
        options || (options = {});
        var style = this.style;
        mix_options(style, options);

        // 焦点层: 0

        // 背景层:1
        var bg = this.bg = new PIXI.Graphics();
        this.addChild(bg);

        this._on_content_update = function () {
            this.resize();
        }.bind(this);

        // 内容层:2
        this.setContent(content);

        // 标题层:3
        if (title instanceof PIXI.Sprite) {
            this.title = title
	        title.texture.on("update", () => {
	            console.log("Dialog resize..")
	            this.resize();
	        });
        } else if (title instanceof PIXI.Texture) {
            var title_spr = this.title = new PIXI.Sprite(title)
	        title_spr.texture.on("update", () => {
	            console.log("Dialog resize..")
	            this.resize();
	        });
        } else if(title instanceof PIXI.Container){
            this.title = title;
        }else{
            this.title = PIXI.Sprite.fromImage(title)
        }
        this.addChild(this.title);
        
        // 关闭按钮:4
        let _closeButton_font_size = style.closeButton.size / 3 * 2;
        let _closeButton_font_bold = style.closeButton.bold;
        this.closeButton = SVGGraphics.importFromSVG(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle cy="0" cx="0" r="${style.closeButton.size}" fill="#ffc03a" stroke-width="0"/>
            <path d="M ${_closeButton_font_size} 0 L -${_closeButton_font_size} 0 " stroke-width="${_closeButton_font_bold}" stroke="#000"/>
            <path d="M 0 ${_closeButton_font_size} L 0 -${_closeButton_font_size}" stroke-width="${_closeButton_font_bold}" stroke="#000"/>
        </svg>`)._graphics;
        this.closeButton.rotation = Math.PI / 4;
        this.closeButton.interactive = true;
        ["tap", "click"].forEach(eventName => this.closeButton.on(eventName, this.close.bind(this)));

        if (style.closeButton.show) {
            this.addChild(this.closeButton);
        }

        this.resize();
    }
    resize() {
        var style = this.style;
        var bg = <PIXI.Graphics>this.bg;
        bg.clear();
        bg.lineStyle(0);
        bg.beginFill(style.bg.color, style.bg.alpha);
        var bg_width = Math.max(this.content.width, this.title.width + style.title.padding) + style.bg.paddingLR;//14.10 / 16.94 * VIEW.WIDTH;
        var bg_height = this.content.height + style.bg.paddingTB;
        var bg_x = (VIEW.WIDTH - bg_width) / 2;
        var bg_y = (VIEW.HEIGHT - bg_height) / 2;
        bg.drawRoundedRect(bg_x, bg_y, bg_width, bg_height, style.bg.radius);
        bg.endFill();

        this.closeButton.x = bg_x + bg_width - this.closeButton.width / 4 + style.closeButton.left;
        this.closeButton.y = bg_y + this.closeButton.height / 4 + style.closeButton.top;

        this.content.x = bg_x + style.bg.paddingLR / 2;
        this.content.y = bg_y + style.bg.paddingTB / 2;

        this.title.x = bg_width / 2 + bg_x - this.title.width / 2;
        this.title.y = bg_y - this.title.height + style.bg.paddingLR / 2;
    }
    private _on_content_update() { }
    setContent(content: PIXI.Container) {
        if (this.content) {
            this.content.off("update", this._on_content_update);
            this.removeChild(this.content)
        } else {
            this.content = content;
            content.on("update", this._on_content_update);
            this.addChild(content);
        }
    }
    private _is_anining = false
    open(parent: PIXI.Container) {
        if (this._is_anining) {
            return
        }
        this.emit("open");
        parent.addChild(this);
        this._is_anining = true;
        // 还原来计算出正确的宽高
        this.scale.set(1, 1);
        this.ani.Tween(this)
            .to({ x: this.x, y: this.y }, B_ANI_TIME)
            .set({ x: this.x + VIEW.CENTER.x, y: this.y + VIEW.CENTER.y })
            .easing(TWEEN.Easing.Quintic.Out)
            .start()
        this.ani.Tween(this.scale)
            .set({ x: 0, y: 0 })
            .to({ x: 1, y: 1 }, B_ANI_TIME)
            .easing(TWEEN.Easing.Quintic.Out)
            .start()
            .onComplete(() => { this._is_anining = false })
    }
    close() {
        if (this._is_anining) {
            return
        }
        this.emit("close");
        this._is_anining = true;
        this.ani.Tween(this.scale)
            .set({ x: 1, y: 1 })
            .to({ x: 0, y: 0 }, B_ANI_TIME)
            .easing(TWEEN.Easing.Quintic.In)
            .start();
        var cur_x = this.x;
        var cur_y = this.y;
        this.ani.Tween(this)
            .to({ x: this.x + VIEW.CENTER.x, y: this.y + VIEW.CENTER.y }, B_ANI_TIME)
            .easing(TWEEN.Easing.Quintic.In)
            .start()
            .onComplete(() => {
                this.position.set(cur_x, cur_y);
                this._is_anining = false;
                this.parent && this.parent.removeChild(this);
            })
    }
}