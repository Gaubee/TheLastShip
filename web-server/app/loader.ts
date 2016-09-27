import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";
import SVGGraphics from "../class/SVGGraphics";
import TWEEN, {
    Tween
} from "../class/Tween";
import When from "../class/When";
import FlowLayout from "../class/FlowLayout";
import TextBuilder from "../class/TextBuilder";

// UI 
import Dialog from "./ui/Dialog";

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
loader.add("bg", `http://cdn2.youdob.com/4.jpg?imageView2/1/w/${VIEW.WIDTH}/h/${VIEW.HEIGHT}`);
loader.load();

const loading_text = new PIXI.Text("加载中……", {
    font: pt2px(25) + "px 微软雅黑",
    fill: "#FFF"
});
current_stage.addChild(loading_text);

loader.once("complete", renderInit);

const waitting_text = new PIXI.Text("连接服务器中……", {
    font: pt2px(25) + "px 微软雅黑",
    fill: "#FFF"
});

function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
    for (var i = 0, len = current_stage.children.length; i < len; i += 1) {
        current_stage.removeChildAt(0)
    }
    const bg_tex = resource["bg"].texture;
    const bg = new PIXI.Sprite(bg_tex);
    current_stage.addChild(bg);
    if(bg_tex.width/bg_tex.height>VIEW.WIDTH/VIEW.HEIGHT) {
        var bg_rate = VIEW.HEIGHT/bg_tex.height 
    }else{
        var bg_rate = VIEW.WIDTH/bg_tex.width 
    }
    bg.scale.set(bg_rate,bg_rate);

    current_stage.addChild(waitting_text);
    stageManager.backgroundColor = "#333";

    waitting_text.x = VIEW.CENTER.x - waitting_text.width / 2;
    waitting_text.y = VIEW.CENTER.y - waitting_text.height / 2;
    /**初始化动画
     * 
     */
    var inputName_dialog = (function() {
        // var title = new TextBuilder("输入您的名字", {
        //     fontSize: pt2px(25),
        //     fontFamily: "微软雅黑",
        //     fill: "#33ee23",
        // });
        var title = new PIXI.Container();
        var content = new PIXI.Graphics();
        content.beginFill(0xffffff, 0.5);
        var _r = Math.min(VIEW.WIDTH, VIEW.HEIGHT)/2*0.9;
        content.drawCircle(_r, _r, _r);
        content.endFill();

        var dialog = new Dialog(title, content, ani_tween,{
            bg:{
                alpha: 0,
                paddingLR:0,
                paddingTB:0
            },
            closeButton:{
                show: false
            }
        });
        return dialog;
    }());
    // 连接到服务器，用户开始命名
    current_stage_wrap.on("connected", function(next,errorText) {
        current_stage.removeChild(waitting_text);
        inputName_dialog.once("added",function () {
            document.body.appendChild(ui_wrap);
            ani_tween.Tween(ui_wrap.style)
                .set({
                    opacity:0,
                    transform:"scale(0)"
                })
                .to({
                    opacity:1
                },B_ANI_TIME)
                .onUpdate(p=>{
                    ui_wrap.style.transform = `scale(${p})`;
                })
                .start();
        });
        inputName_dialog.once("close",function () {
            ani_tween.Tween(ui_wrap.style)
                .set({
                    opacity:1
                })
                .to({
                    opacity:0
                },B_ANI_TIME)
                .start()
                .onUpdate(p=>{
                    ui_wrap.style.transform = `scale(${1-p})`;
                })
                .onComplete(function () {
                    document.body.removeChild(ui_wrap);
                });
        });

        var ui_wrap =current_stage_wrap["ui_wrap"];
        if(!ui_wrap) {
            ui_wrap = document.createElement("div");
            ui_wrap.style.cssText = `
                display: -webkit-flex;
                display: flex;
                position: absolute;
                left:0;
                top:0;
                width:100%;
                height:100%;
                -webkit-align-items: center;
                      align-items: center;
                -webkit-justify-content: center;
                      justify-content: center;
            `;
            current_stage_wrap["ui_wrap"] = ui_wrap;

            var input_width = pt2px(200);
            var input_height = pt2px(20);
            var input_placeholder = "请输入用户名";
            ui_wrap.innerHTML = `
            <div style="
                width: ${input_width}px;
                height: ${input_height*3}px;
                text-align:center;
                ">
                <input placeholder="${input_placeholder}" style="display:block;
                    width:${input_width}px;
                    border-radius:${input_height*0.3}px;
                    padding:${input_height*0.3}px;
                    margin:0;
                    border:0;
                    background-color:rgba(221,221,221,0.9);
                    outline:none;
                    color:#333;
                    font-size:${input_height*0.8}px;"/>
                <button style="
                    cursor:point;
                    border-radius:${input_height*0.1}px;
                    min-width:${input_width*0.6}px;
                    margin:${input_height*0.4}px 0 0 0;
                    border:0;
                    color:#ddd;
                    background-color:rgba(33,33,221,0.8);
                    outline:none;
                    padding:${input_height*0.1}px;
                    font-size:${input_height*0.8}px;">提交</button>
            </div>
            `;
            var ui_input = <HTMLInputElement>ui_wrap.firstElementChild.firstElementChild;
            ui_input["showError"] = function (errorText:string) {
                ui_input.value = "";
                ui_input.placeholder = errorText
                ui_input.style.boxShadow = `0 0 ${pt2px(10)}px rgba(221,33,33,1)`;
                setTimeout(function () {
                    ui_input.placeholder = input_placeholder;
                    ui_input.style.boxShadow = "none";
                },1000);
            };
            var ui_button = ui_input.nextElementSibling;
            ui_button.addEventListener("click",function () {
                var username = ui_input.value.trim();
                if(!username) {
                    ui_input["showError"]("用户名不可为空")
                    return;
                }
                inputName_dialog.close();
                inputName_dialog.once("removed",function () {
                    next(username);
                });
            })
        }

        if(errorText) {
            var ui_input = <HTMLInputElement>ui_wrap.firstElementChild.firstElementChild;
            ui_input["showError"](errorText)
        }

        inputName_dialog.open(current_stage_wrap, current_stage, renderer);
    });


    /**按钮事件
     * 
     */

    /**交互动画
     * 
     */

    // 动画控制器
    ani_ticker.add(() => {
        ani_tween.update();
        jump_tween.update();
    });

    /**帧率
     * 
     */


    // 触发布局计算
    emitReisze(current_stage_wrap);

    init_w.ok(0, []);
}
current_stage_wrap.on("init", initStage);
current_stage_wrap.on("reinit", function() {
    renderInit(loader, loader.resources);
});
current_stage_wrap["_has_custom_resize"] = true;
current_stage_wrap.on("resize", function() {
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