/// <reference path="../typings/pixi.js/pixi.js.d.ts" />
import BackgroundGaussianBlur from "../class/BackgroundGaussianBlur";
import SVGGraphics from "../class/SVGGraphics";
import TWEEN, {Tween} from "../class/Tween";
import When from "../class/When";

// import Dialog from "./Dialog";
// import {Mask, MaskFactory} from "./Mask";
import Flyer from "./class/Flyer";
import Ship from "./class/Ship";
import Wall from "./class/Wall";
import Bullet from "./class/Bullet";
import HP from "./class/HP";

import {P2I} from "./engine/Collision";
import Victor from "./engine/Victor";
import {engine} from "./engine/world";
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
        this.children.forEach((bullet:Bullet)=>{
            bullet.update(delay);
        });
    }
    current_stage.addChild(bullet_stage);
    // 物体绘图层：墙、飞船等等
    const object_stage = new PIXI.Container();
    object_stage["update"] = function (delay) {
        this.children.forEach((obj:Wall | Ship)=>{
            obj.update(delay);
        });
    }
    current_stage.addChild(object_stage);

    // 血量绘图层;
    var hp_stage = new PIXI.Container();
    current_stage.addChild(hp_stage);
    hp_stage["update"] = function (delay) {
        this.children.forEach((hp:HP)=>{
            hp.update(delay);
        });
    }
    if(ediorStage["flyers"] instanceof Array){
        ediorStage["flyers"].forEach(function (flyer_config) {
            let flyer = new Flyer(assign({
                x: 50+Math.random()*(VIEW.WIDTH-100),
                y: 50+Math.random()*(VIEW.HEIGHT-100),
                x_speed: 10 * 2 * (Math.random() - 0.5),
                y_speed: 10 * 2 * (Math.random() - 0.5),
                body_color: 0xffffff * Math.random()
            },flyer_config));
            object_stage.addChild(flyer);
            var hp = new HP(flyer, ani_tween);
            hp_stage.addChild(hp);
            flyer.on("change-hp",function () {
                hp.setHP()
            });
            flyer.on("ember",function () {
                hp_stage.removeChild(hp);
                hp.destroy();
            });
            engine.add(flyer);
        });
    }

    const EDGE_WIDTH = VIEW.WIDTH*2;
    const EDGE_HEIGHT = VIEW.HEIGHT*2;
    // 四边限制
    var top_edge = new Wall({
        x: EDGE_WIDTH/2, y: 0,
        width: EDGE_WIDTH,
        height: 10
    });
    object_stage.addChild(top_edge);
    engine.add(top_edge);
    var bottom_edge = new Wall({
        x: EDGE_WIDTH/2, y: EDGE_HEIGHT - 5,
        width: EDGE_WIDTH,
        height: 10
    });
    object_stage.addChild(bottom_edge);
    engine.add(bottom_edge);
    var left_edge = new Wall({
        x: 5, y: EDGE_HEIGHT/2,
        width: 10,
        height: EDGE_HEIGHT
    });
    object_stage.addChild(left_edge);
    engine.add(left_edge);
    var right_edge = new Wall({
        x: EDGE_WIDTH - 5, y: EDGE_HEIGHT/2,
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
    if(ediorStage["myship"]){
        var my_ship = new Ship(assign({
            x: VIEW.CENTER.x,
            y: VIEW.CENTER.y,
            body_color: 0x366345
        },ediorStage["myship"]));
        object_stage.addChild(my_ship);
        engine.add(my_ship);
    }
    if(ediorStage["ships"] instanceof Array) {
        ediorStage["ships"].forEach(function (ship_config) {
            var ship = new Ship(assign({
                x: 100+(EDGE_WIDTH-200)*Math.random(),
                y: 100+(EDGE_HEIGHT-200)*Math.random(),
                body_color: 0xffffff*Math.random()
            },ship_config));
            object_stage.addChild(ship);
            var hp = new HP(ship, ani_tween);
            hp_stage.addChild(hp);
            ship.on("change-hp",function () {
                hp.setHP()
            });
            ship.on("die",function () {
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
        var x_len = (EDGE_WIDTH/x_unit)|0;
        var y_len = (EDGE_HEIGHT/y_unit)|0;
        lines.lineStyle(1,0x333333,0.8);
        for (var _x = 1; _x <= x_len; _x += 1) {
            lines.moveTo(_x*x_unit,0);
            lines.lineTo(_x*x_unit,EDGE_HEIGHT);
        }
        for (var _y = 1; _y <= y_len; _y += 1) {
            lines.moveTo(0, _y*y_unit);
            lines.lineTo(EDGE_WIDTH, _y*y_unit);
        }
        current_stage.addChildAt(lines, 0);
    })();
    /**初始化动画
     * 
     */
    var pre_time
    ani_ticker.add(() => {
        pre_time || (pre_time = performance.now() - 1000/60);
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
    const speed_ux = {
        37:"-x",
        65:"-x",
        38:"-y",
        87:"-y",
        39:"+x",
        68:"+x",
        40:"+y",
        83:"+y",
    };
    const effect_speed_keys = [];// 记录按下的按钮
    function generate_speed(force) {
        var effect_speed = new Victor(0,0);
        if(effect_speed_keys.length) {
            for(var i = 0,keyCode; keyCode = effect_speed_keys[i]; i+=1){
                var speed_info = speed_ux[keyCode];
                effect_speed[speed_info.charAt(1)] = speed_info.charAt(0) === "-" ? -1 : 1
            }
            effect_speed.setLength(force);
        }
        return effect_speed;
    }
    on(current_stage_wrap, "keydown", function (e) {
        if(speed_ux.hasOwnProperty(e.keyCode)&&my_ship){
            move_target_point = null;
            if(effect_speed_keys.indexOf(e.keyCode) === -1){
                effect_speed_keys.push(e.keyCode);
            }
            var effect_speed = generate_speed(my_ship.config.force);
            my_ship.operateShip({ 
                x_speed: effect_speed.x,
                y_speed: effect_speed.y,
            });
        }
    });

    on(current_stage_wrap, "keyup", function (e) {
        if(speed_ux.hasOwnProperty(e.keyCode)&&my_ship){
            move_target_point = null;
            effect_speed_keys.splice(effect_speed_keys.indexOf(e.keyCode),1);
            var effect_speed = generate_speed(my_ship.config.force);
            my_ship.operateShip({ 
                x_speed: effect_speed.x,
                y_speed: effect_speed.y,
            });
        }
    });

    if(_isMobile) {// 手机版本添加摇柄的支持
        const mobile_operator = new PIXI.Graphics();
        (function(){
            var _size;
            var _border;
            mobile_operator.on("resize",function () {
                mobile_operator.clear();
                _size = Math.min(VIEW.HEIGHT,VIEW.WIDTH)/6;
                _border = _size/6;
                mobile_operator.lineStyle(_border,0xFFFFFF,0.5);
                mobile_operator.beginFill(0xFFFFFF,0.3);
                mobile_operator.drawCircle(0,0,_size);
                mobile_operator.endFill();
                mobile_operator.x = _border*2 + _size;
                mobile_operator.y = VIEW.HEIGHT - _size - _border*2;

                // handle resize
                handle.clear();
                var _h_size;
                _h_size = _size / 3;
                handle.beginFill(0xFFFFFF,0.6);
                handle.drawCircle(0,0,_h_size);
                handle.endFill();
                handle.cacheAsBitmap = true;
                handle.x = mobile_operator.x;// + _size;
                handle.y = mobile_operator.y;// - _size;
            });

            const handle = new PIXI.Graphics();
            current_stage_wrap.addChild(handle);

            // 交互
            mobile_operator.interactive = true;
            const handle_dir = new Victor(0,0);
            var current_touch_id = null;
            on(mobile_operator,"touchstart|touchmove",function (e) {
                var touch_list = e.data.originalEvent.touches;
                // 多点触摸，寻找处于左下角的那个，不考虑最接近，但考虑一定要处于左下角
                if(current_touch_id !== null) {
                    var touch = touchManager.getById(touch_list, current_touch_id);
                    var touch_point = {x:touch.clientX,y:touch.clientY};
                }else{
                    var _touch_com =new Victor(0,0) ;
                    var _control_able_size = _size + _border*2;// 可控制的空间范围
                    for(var i = 0,touch;touch = touch_list[i];i+=1){
                        _touch_com.x = touch.clientX-mobile_operator.x;
                        _touch_com.y = touch.clientY-mobile_operator.y;
                        if(_touch_com.length()<=_control_able_size) {
                            var touch_point = {x:touch.clientX,y:touch.clientY};
                            current_touch_id = touchManager.register(touch);
                            break
                        }
                    }
                }
                if(!touch_point) {// 找不到处于左下角的点就算了
                    current_touch_id = null
                    return
                }
              
                handle_dir.x = touch_point.x-mobile_operator.x;
                handle_dir.y = touch_point.y-mobile_operator.y;
                var _length = Math.min(handle_dir.length(),_size);
                var force_rate = _length/_size;
                handle_dir.setLength(force_rate*my_ship.config.force);
                my_ship.operateShip({ 
                    x_speed: handle_dir.x,
                    y_speed: handle_dir.y,
                });
                // 移动handle控制球
                handle_dir.setLength(force_rate*_size);
                handle.x = mobile_operator.x + handle_dir.x;
                handle.y = mobile_operator.y + handle_dir.y;
            });
            
            on(mobile_operator,"touchend|touchendoutside",function _cancel_force(e) {
                if(current_touch_id === null) {
                    return
                }
                requestAnimationFrame(function () {// 延迟释放，避免事件队列其它成员得到这个touchend
                    touchManager.free(current_touch_id);
                    current_touch_id = null;
                });
                my_ship.operateShip({ 
                    x_speed: 0,
                    y_speed: 0,
                });
                handle.x = mobile_operator.x 
                handle.y = mobile_operator.y 
            });

        }());
        // 确保操作面板处于摇柄球之上，不会音响touchendoutside事件;
        current_stage_wrap.addChild(mobile_operator);

    }else{// 电脑版本提供右键操作的支持
        // 将要去的目的点，在接近的时候改变飞船速度
        var move_target_point:Victor;
        var target_anchor = new PIXI.Graphics();
        target_anchor.lineStyle(pt2px(2),0xff2244,0.8);
        target_anchor.drawCircle(0,0,pt2px(10));
        target_anchor.cacheAsBitmap = true;
        target_anchor.scale.set(0);
        current_stage.addChild(target_anchor);

        on(current_stage_wrap, "rightclick", function (e) {
            if(my_ship) {
                move_target_point = new Victor(e.x-current_stage.x, e.y-current_stage.y);
                target_anchor.position.set(move_target_point.x,move_target_point.y);
                ani_tween.Tween(target_anchor.scale)
                    .set({x:1,y:1})
                    .to({x:0,y:0},B_ANI_TIME)
                    .start()
            }
        });

        ani_ticker.add(() => {
            if(move_target_point) {
                var curren_point = Victor.fromArray(my_ship.p2_body.interpolatedPosition);
                var current_to_target_dis = curren_point.distance(move_target_point);
                // 动力、质量、以及空间摩擦力的比例
                var force_mass_rate = my_ship.config.force/my_ship.p2_body.mass/my_ship.p2_body.damping;
                var force_rate = Math.min(Math.max(current_to_target_dis / force_mass_rate,0),1);
                var force_vic = new Victor(move_target_point.x - my_ship.config.x, move_target_point.y - my_ship.config.y);
                force_vic.setLength(my_ship.config.force*force_rate);
                if(force_vic.lengthSq() <= 100) {
                    console.log("基本到达，停止自动移动");
                    move_target_point = null;
                }
                my_ship.operateShip({ x_speed: force_vic.x, y_speed: force_vic.y });
            }
        });
    }
    if(_isMobile) {
        // 旋转角度
        on(current_stage_wrap, "touchstart|touchmove", function (e) {
            var touch_list = e.data.originalEvent.touches;
            var touch = touchManager.getFreeOne(touch_list);
            if(!touch) {
                return
            }
            var touch_point = {x:touch.clientX,y:touch.clientY};
            var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
            my_ship.operateShip({ rotation: direction.angle() })
        });
        // 发射
        on(current_stage_wrap, "touchstart", function (e) {
            var touch_list = e.data.originalEvent.touches;
            var touch = touchManager.getFreeOne(touch_list);
            if(!touch) {
                return
            }
            var bullets = my_ship.fire();
            if(bullets.length) {
                bullets.forEach(bullet=>{
                    bullet_stage.addChild(bullet);
                    engine.add(bullet);
                });
            }
        });
    }else{
        // 旋转角度
        on(current_stage_wrap, "mousemove|mousedown", function (e) {
            var touch_point = e.data.global
            var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
            my_ship.operateShip({ rotation: direction.angle() })
        });
        // 发射
        on(current_stage_wrap, "mousedown", function (e) {
            var bullets = my_ship.fire();
            if(bullets.length) {
                bullets.forEach(bullet=>{
                    bullet_stage.addChild(bullet);
                    engine.add(bullet);
                });
            }
        });
    }
    // setTimeout(function () {
    //     rule.close();
    // }, 3000)

    // 动画控制器
    var pre_time
    ani_ticker.add(() => {
        ani_tween.update();
        jump_tween.update();
        if(my_ship) {
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
    init_w.ok(2,[]);
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