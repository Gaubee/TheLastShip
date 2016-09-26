/// <reference path="../typings/pixi.js/pixi.js.d.ts" />
import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";
import SVGGraphics from "../class/SVGGraphics";
import TWEEN, {Tween} from "../class/Tween";
import When from "../class/When";
import FlowLayout from "../class/FlowLayout";
import TextBuilder from "../class/TextBuilder";

import Dialog from "./Dialog";
import {Mask, MaskFactory} from "./Mask";
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


const ani_ticker = new PIXI.ticker.Ticker();
const ani_tween = new TWEEN();
const jump_tween = new TWEEN();
const FPS_ticker = new PIXI.ticker.Ticker();

export const current_stage_wrap = new PIXI.Container();
export const current_stage = new PIXI.Container();
current_stage_wrap.addChild(current_stage);
// current_stage_wrap["keep_direction"] = "vertical";
//加载图片资源
export const loader = new PIXI.loaders.Loader();
loader.add("logo", "res/dfrc_0010_logo.png");
loader.load();

const loading_text = new PIXI.Text("加载中……", { font: pt2px(25) + "px 微软雅黑", fill: "#FFF" });
current_stage.addChild(loading_text);

loader.once("complete", renderInit);


function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
    for (var i = 0, len = current_stage.children.length; i < len; i += 1) {
        current_stage.removeChildAt(0)
    }

    var waitting_text = new PIXI.Text("连接服务器中……", { font: pt2px(25) + "px 微软雅黑", fill: "#FFF" });
    current_stage.addChild(waitting_text);
    waitting_text.x = VIEW.CENTER.x - waitting_text.width / 2
    waitting_text.y = VIEW.CENTER.y - waitting_text.height / 2
    /**初始化动画
     * 
     */



    /**按钮事件
     * 
     */

    /**交互动画
     * 
     */

    // 动画控制器


    /**帧率
     * 
     */


    // 触发布局计算
    emitReisze(current_stage_wrap);

    init_w.ok(0, []);
}
current_stage_wrap.on("init", initStage);
current_stage_wrap.on("reinit", function () {
    renderInit(loader, loader.resources);
});
current_stage_wrap["_has_custom_resize"] = true;
current_stage_wrap.on("resize", function () {
    jump_tween.clear();
    ani_tween.clear();
    emitReisze(this);
});

const init_w = new When(2, () => {
    ani_tween.start();
    jump_tween.start();
    ani_ticker.start();
    FPS_ticker.start();
});
export function initStage() {
    init_w.ok(1, []);
}

