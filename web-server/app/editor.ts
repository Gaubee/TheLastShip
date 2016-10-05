/// <reference path="../typings/pixi.js/pixi.js.d.ts" />
import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";
import SVGGraphics from "../class/SVGGraphics";
import TWEEN, { Tween } from "../class/Tween";
import When from "../class/When";

// import Dialog from "./Dialog";
// import {Mask, MaskFactory} from "./Mask";
import Flyer from "./class/Flyer";
import Ship from "./class/Ship";
import Wall from "./class/Wall";
import Bullet from "./class/Bullet";
import HP from "./class/HP";

import { P2I } from "./engine/Collision";
import Victor from "./engine/Victor";
import { engine } from "./engine/world";
// import {pomelo} from "./engine/Pomelo";
import * as ediorStage from "./ediorStage.json";

import {
    VIEW,
    on,
    square,
    stageManager,
    renderer,
    emitReisze,
    touchManager,
} from "./common";

import {
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    pt2px,
    mix_options,
    assign,
    _isBorwser,
    _isNode,
    _isMobile,
} from "./const";
import * as UX from "./ux";


const ani_ticker = new PIXI.ticker.Ticker();
const ani_tween = new TWEEN();
const jump_tween = new TWEEN();
const FPS_ticker = new PIXI.ticker.Ticker();

export const current_stage_wrap = new PIXI.Graphics();
export const current_stage = new PIXI.Container();
current_stage_wrap.addChild(current_stage);
// current_stage_wrap["keep_direction"] = "horizontal";
//加载图片资源
export const loader = new PIXI.loaders.Loader();

loader.add("button", "./res/game_res.png")

loader.load();

const loading_text = new PIXI.Text("游戏加载中……", { font: pt2px(25) + "px 微软雅黑", fill: "#FFF" });
current_stage.addChild(loading_text);

function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
    for (var i = 0, len = current_stage.children.length; i < len; i += 1) {
        current_stage.removeChildAt(0)
    }
    /**素材加载
     * 初始化场景
     */
    function drawPlan() {
        current_stage_wrap.clear();
        current_stage_wrap.beginFill(0x999999, 1);
        current_stage_wrap.drawRect(0, 0, VIEW.WIDTH, VIEW.HEIGHT);
        current_stage_wrap.endFill();
    }
    current_stage_wrap.on("resize", drawPlan);
    drawPlan();

    // 子弹绘图层
    const bullet_stage = new PIXI.Container();
    bullet_stage["update"] = function (delay) {
        this.children.forEach((bullet: Bullet) => {
            bullet.update(delay);
        });
    }
    current_stage.addChild(bullet_stage);
    // 物体绘图层：墙、飞船等等
    const object_stage = new PIXI.Container();
    object_stage["update"] = function (delay) {
        this.children.forEach((obj: Wall | Ship) => {
            obj.update(delay);
        });
    }
    current_stage.addChild(object_stage);

    // 血量绘图层;
    var hp_stage = new PIXI.Container();
    current_stage.addChild(hp_stage);
    hp_stage["update"] = function (delay) {
        this.children.forEach((hp: HP) => {
            hp.update(delay);
        });
    }
    if (ediorStage["flyers"] instanceof Array) {
        ediorStage["flyers"].forEach(function (flyer_config) {
            let flyer = new Flyer(assign({
                x: 50 + Math.random() * (VIEW.WIDTH - 100),
                y: 50 + Math.random() * (VIEW.HEIGHT - 100),
                x_speed: 10 * 2 * (Math.random() - 0.5),
                y_speed: 10 * 2 * (Math.random() - 0.5),
                body_color: 0xffffff * Math.random()
            }, flyer_config));
            object_stage.addChild(flyer);
            var hp = new HP(flyer, ani_tween);
            hp_stage.addChild(hp);
            flyer.on("change-hp", function () {
                hp.setHP()
            });
            flyer.on("ember", function () {
                hp_stage.removeChild(hp);
                hp.destroy();
            });
            engine.add(flyer);
        });
    }

    const EDGE_WIDTH = VIEW.WIDTH * 2;
    const EDGE_HEIGHT = VIEW.HEIGHT * 2;
    // 四边限制
    var top_edge = new Wall({
        x: EDGE_WIDTH / 2, y: 0,
        width: EDGE_WIDTH,
        height: 10
    });
    object_stage.addChild(top_edge);
    engine.add(top_edge);
    var bottom_edge = new Wall({
        x: EDGE_WIDTH / 2, y: EDGE_HEIGHT - 5,
        width: EDGE_WIDTH,
        height: 10
    });
    object_stage.addChild(bottom_edge);
    engine.add(bottom_edge);
    var left_edge = new Wall({
        x: 5, y: EDGE_HEIGHT / 2,
        width: 10,
        height: EDGE_HEIGHT
    });
    object_stage.addChild(left_edge);
    engine.add(left_edge);
    var right_edge = new Wall({
        x: EDGE_WIDTH - 5, y: EDGE_HEIGHT / 2,
        width: 10,
        height: EDGE_HEIGHT
    });
    object_stage.addChild(right_edge);
    engine.add(right_edge);
    (() => {
        var x_len = 6;
        var y_len = 6;
        var x_unit = EDGE_WIDTH / (x_len + 1)
        var y_unit = EDGE_HEIGHT / (y_len + 1)
        var width = 40;
        for (var _x = 1; _x <= x_len; _x += 1) {
            for (var _y = 1; _y <= y_len; _y += 1) {
                var mid_edge = new Wall({
                    x: _x * x_unit - width / 2, y: _y * y_unit - width / 2,
                    width: width,
                    height: width
                });

                object_stage.addChild(mid_edge);
                engine.add(mid_edge);
            }
        }
    })();
    if (ediorStage["myship"]) {
        var my_ship = new Ship(assign({
            x: VIEW.CENTER.x,
            y: VIEW.CENTER.y,
            body_color: 0x366345
        }, ediorStage["myship"]));
        object_stage.addChild(my_ship);
        engine.add(my_ship);
    }
    if (ediorStage["ships"] instanceof Array) {
        ediorStage["ships"].forEach(function (ship_config) {
            var ship = new Ship(assign({
                x: 100 + (EDGE_WIDTH - 200) * Math.random(),
                y: 100 + (EDGE_HEIGHT - 200) * Math.random(),
                body_color: 0xffffff * Math.random()
            }, ship_config));
            object_stage.addChild(ship);
            var hp = new HP(ship, ani_tween);
            hp_stage.addChild(hp);
            ship.on("change-hp", function () {
                hp.setHP()
            });
            ship.on("die", function () {
                hp_stage.removeChild(hp);
                hp.destroy();
            });
            engine.add(ship);
        })
    }

    // 辅助线
    (() => {
        var lines = new PIXI.Graphics();
        var x_unit = pt2px(10);
        var y_unit = pt2px(10);
        var x_len = (EDGE_WIDTH / x_unit) | 0;
        var y_len = (EDGE_HEIGHT / y_unit) | 0;
        lines.lineStyle(1, 0x333333, 0.8);
        for (var _x = 1; _x <= x_len; _x += 1) {
            lines.moveTo(_x * x_unit, 0);
            lines.lineTo(_x * x_unit, EDGE_HEIGHT);
        }
        for (var _y = 1; _y <= y_len; _y += 1) {
            lines.moveTo(0, _y * y_unit);
            lines.lineTo(EDGE_WIDTH, _y * y_unit);
        }
        current_stage.addChildAt(lines, 0);
    })();
    /**初始化动画
     * 
     */
    var pre_time
    ani_ticker.add(() => {
        pre_time || (pre_time = performance.now() - 1000 / 60);
        var cur_time = performance.now();
        var dif_time = cur_time - pre_time;
        pre_time = cur_time;

        // 物理引擎运作
        engine.update(dif_time);

    });

    /**按钮事件
     * 
     */


    /**交互动画
     * 
     */

    // 飞船移动
    UX.moveShip(current_stage_wrap
        , current_stage
        , () => my_ship
        , ani_tween
        , ani_ticker
        , (move_info) => {
            my_ship.operateShip(move_info)
        });
    // 飞船转向
    UX.turnHead(current_stage_wrap
        , current_stage
        , () => my_ship
        , ani_tween
        , ani_ticker
        , (turnHead_info) => {
            my_ship.operateShip(turnHead_info)
        });
    // 飞船发射
    UX.shipFire(current_stage_wrap
        , current_stage
        , () => my_ship
        , ani_tween
        , ani_ticker
        , () => {
            var bullets = my_ship.fire();
            if (bullets.length) {
                bullets.forEach(bullet => {
                    bullet_stage.addChild(bullet);
                    engine.add(bullet);
                });
            }
        });
    // 飞船切换自动
    UX.shipAutoFire(current_stage_wrap
        , current_stage
        , () => my_ship
        , ani_tween
        , ani_ticker
        , () => {
            my_ship.toggleKeepFire(function (bullets) {
                bullets.forEach(bullet => {
                    bullet_stage.addChild(bullet);
                    engine.add(bullet);
                });
            });
        });

    // 动画控制器
    var pre_time
    ani_ticker.add(() => {
        ani_tween.update();
        jump_tween.update();
        if (my_ship) {
            current_stage.x = VIEW.WIDTH / 2 - my_ship.x
            current_stage.y = VIEW.HEIGHT / 2 - my_ship.y
        }
        pre_time || (pre_time = performance.now());
        var cur_time = performance.now();
        var dif_time = cur_time - pre_time;
        pre_time = cur_time;

        hp_stage["update"](dif_time)
    });

    /**帧率
     * 
     */
    var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "right" });

    current_stage_wrap.addChild(FPS_Text);
    FPS_ticker.add(function () {
        FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " W:" + VIEW.WIDTH + " H:" + VIEW.HEIGHT;
    });

    // 触发布局计算
    emitReisze(current_stage_wrap);

    ani_tween.start();
    jump_tween.start();
    ani_ticker.start();
    FPS_ticker.start();

}

loader.once("complete", function () {
    init_w.ok(2, []);
});

current_stage_wrap.on("init", function () {
    init_w.ok(1, []);
});
current_stage_wrap.on("active", function () {
    init_w.ok(0, []);
});
current_stage_wrap["_has_custom_resize"] = true;
current_stage_wrap.on("resize", function () {
    jump_tween.clear();
    ani_tween.clear();
    emitReisze(this);
});

const init_w = new When(3, () => {
    renderInit(loader, loader.resources);
});