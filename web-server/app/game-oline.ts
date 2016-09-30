import TWEEN, {
    Tween
} from "../class/Tween";
import When from "../class/When";

import Flyer from "./class/Flyer";
import Wall from "./class/Wall";
import Ship from "./class/Ship";
import Bullet from "./class/Bullet";
import HP from "./class/HP";

// UI 
import Dialog from "./ui/Dialog";
import Button from "./ui/Button";
// UI-HELPER
import TextBuilder from "../class/TextBuilder";
import FlowLayout from "../class/FlowLayout";

import {
    engine
} from "./engine/shadowWorld";
import Victor from "./engine/Victor";
import {
    pomelo
} from "./engine/Pomelo";

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

const loading_text = new PIXI.Text("游戏加载中……", {
    font: pt2px(25) + "px 微软雅黑",
    fill: "#FFF"
});
current_stage.addChild(loading_text);

loader.once("complete", renderInit);

function renderInit(loader: PIXI.loaders.Loader, resource: PIXI.loaders.ResourceDictionary) {
    for (var i = 0, len = current_stage.children.length; i < len; i += 1) {
        current_stage.removeChildAt(0)
    }
    /**素材加载
     * 初始化场景
     */
    function drawPlan() {
        current_stage_wrap.clear();
        current_stage_wrap.beginFill(0x333ddd, 0.5);
        current_stage_wrap.drawRect(0, 0, VIEW.WIDTH, VIEW.HEIGHT);
        current_stage_wrap.endFill();
    }
    current_stage_wrap.on("resize", drawPlan);

    const ObjectMap = {
        "Flyer": Flyer,
        "Wall": Wall,
        "Ship": Ship,
        "Bullet": Bullet,
    }
    const instanceMap: {
        [key: string]: Flyer | Wall | Ship
    } = {};
    var view_ship: Ship;
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
    hp_stage["update"] = function (delay) {
        this.children.forEach((hp:HP)=>{
            hp.update(delay);
        });
    }
    current_stage.addChild(hp_stage);
    const HP_WEAKMAP:{[key:string]:HP} = {};

    function showViewData(objects) {
        objects.map(obj_info => {
            if (instanceMap.hasOwnProperty(obj_info.id)) {
                var _ins = instanceMap[obj_info.id];
                _ins&&_ins.setConfig(obj_info.config);
            } else {
                const Con = ObjectMap[obj_info.type];
                if (!Con) {
                    console.error("UNKONW TYPE:", obj_info);
                    return
                }
                var ins = instanceMap[obj_info.id] = new Con(obj_info.config);
                if (view_ship_info.id === obj_info.id) {
                    view_ship = ins;
                }
                if(obj_info.type ==="Bullet"){
                    bullet_stage.addChild(ins);
                }else{
                    object_stage.addChild(ins);
                    if (obj_info.type === "Ship"||obj_info.type === "Flyer") {
                        var hp = HP_WEAKMAP[obj_info.id] = new HP(ins, ani_tween);
                        hp_stage.addChild(hp);
                    }
                }
                engine.add(ins);
            }
        })
    };

    var ping = 0;
    var timeSinceLastCalled = 0;
    var timeSinceLastCalledMS = 0;
    var isNewDataFrame = false;
    var can_next = true;;
    function getViewData() {
        var pre_time = performance.now();
        ani_ticker.add(function() {
            var p_now = performance.now();
            // 上一次请求到现在的时间
            var pre_req_delay = p_now - timeSinceLastCalledMS;
            if(pre_req_delay >= 100) {//请求至少是10FPS，多于这个时间差，强制请求
                can_next = true
            }else if(pre_req_delay < 25){ // 封顶请求40FPS，少于这个时间差，忽略请求
                return
            }
            if (can_next === false) {
                return
            }
            can_next = false;
            var start_ping = performance.now();
            pomelo.request("connector.worldHandler.getWorld", {
                x: 0,
                y: 0,
                width: VIEW.WIDTH,
                height: VIEW.HEIGHT
            }, function(data) {
                var cur_time =  performance.now();
                var dif_time = cur_time - pre_time;
                pre_time = cur_time;
                timeSinceLastCalledMS = cur_time;
                timeSinceLastCalled = dif_time/1000;
                isNewDataFrame = true;

                ping = cur_time - start_ping;
                showViewData(data.objects);
                can_next = true;
            });
        });
    };

    current_stage_wrap.on("active", getViewData);
    // 当前视角飞车，不一定是自己的飞船，在死亡后视角会进行切换
    var view_ship_info;
    current_stage_wrap.on("before-active", (game_init_info) => {
        view_ship_info = game_init_info.ship;
        is_my_ship_live = true;
    });

    /**初始化动画
     * 
     */

    /**按钮事件
     * 
     */


    /**交互动画
     * 
     */

    // 移动
    const speed_ux = {
        37: "-x",
        65: "-x",
        38: "-y",
        87: "-y",
        39: "+x",
        68: "+x",
        40: "+y",
        83: "+y",
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
    on(current_stage_wrap, "keydown", function(e) {
        if (speed_ux.hasOwnProperty(e.keyCode)&&current_stage_wrap.parent&&view_ship) {
            move_target_point = null;
            if(effect_speed_keys.indexOf(e.keyCode) === -1){
                effect_speed_keys.push(e.keyCode);
            }
            var effect_speed = generate_speed(view_ship.config.force);
            var new_config = { 
                x_speed: effect_speed.x,
                y_speed: effect_speed.y,
            };
            pomelo.request("connector.worldHandler.setConfig", {
                config: new_config
            }, function(data) { });
        }
    });

    on(current_stage_wrap, "keyup", function(e) {
        if (speed_ux.hasOwnProperty(e.keyCode)&&current_stage_wrap.parent&&view_ship) {
            move_target_point = null;
            effect_speed_keys.splice(effect_speed_keys.indexOf(e.keyCode),1);
            var effect_speed = generate_speed(view_ship.config.force);
            var new_config = { 
                x_speed: effect_speed.x,
                y_speed: effect_speed.y,
            };
            pomelo.request("connector.worldHandler.setConfig", {
                config: new_config
            }, function(data) { });
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
                handle_dir.setLength(force_rate*view_ship.config.force);
                pomelo.request("connector.worldHandler.setConfig", {
                    config: { 
                        x_speed: handle_dir.x,
                        y_speed: handle_dir.y,
                    }
                }, function(data) {});
                // 移动handle控制球
                handle_dir.setLength(force_rate*_size);
                handle.x = mobile_operator.x + handle_dir.x;
                handle.y = mobile_operator.y + handle_dir.y;
            });
            
            on(mobile_operator,"touchend|touchendoutside",function _cancel_force(e) {
                if(current_touch_id === null) {
                    return
                }
                requestAnimationFrame(function(){
                    touchManager.free(current_touch_id);
                    current_touch_id = null;
                });
                pomelo.request("connector.worldHandler.setConfig", {
                    config: { 
                        x_speed: 0,
                        y_speed: 0,
                    }
                }, function(data) {});
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
            if(view_ship) {
                move_target_point = new Victor(e.x-current_stage.x, e.y-current_stage.y);
                target_anchor.position.set(move_target_point.x,move_target_point.y);
                ani_tween.Tween(target_anchor.scale)
                    .set({x:1,y:1})
                    .to({x:0,y:0},B_ANI_TIME)
                    .start()
            }
        });
        var origin_vic = new Victor(0,0);
        ani_ticker.add(() => {
            if(move_target_point) {
                var curren_point = Victor.fromArray(view_ship.p2_body.interpolatedPosition);
                var current_to_target_dis = curren_point.distance(move_target_point);
                // 动力、质量、以及空间摩擦力的比例
                var force_mass_rate = view_ship.config.force/view_ship.p2_body.mass/view_ship.p2_body.damping;
                var force_rate = Math.min(Math.max(current_to_target_dis / force_mass_rate,0),1);
                var force_vic = new Victor(move_target_point.x - view_ship.config.x, move_target_point.y - view_ship.config.y);
                force_vic.setLength(view_ship.config.force*force_rate);
                if(force_vic.distanceSq(origin_vic) <= 100) {
                    console.log("基本到达，停止自动移动");
                    move_target_point = null;
                }
                var new_config = { x_speed: force_vic.x, y_speed: force_vic.y }
                pomelo.request("connector.worldHandler.setConfig", {
                    config: new_config
                }, function(data) {
                    // console.log("setConfig:stop-move", data);
                });
                // view_ship.setConfig(new_config);
            }
        });
    }

    if(_isMobile) {
        // 旋转角度
        on(current_stage_wrap, "touchstart|touchmove", function (e) {
            if(view_ship) {
                var touch_list = e.data.originalEvent.touches;
                var touch = touchManager.getFreeOne(touch_list);
                if(!touch) {
                    return
                }
                var touch_point = {x:touch.clientX,y:touch.clientY};
                var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
                
                var angle_value = direction.angle();
                if (angle_value < 0) {
                    angle_value += PIXI.PI_2
                }

                var new_config = {
                    rotation: angle_value
                };

                pomelo.request("connector.worldHandler.setConfig", {
                    config: new_config
                }, function(data) {});
            }
        });
        // 发射
        on(current_stage_wrap, "touchstart", function (e) {
            if(view_ship) {
                var touch_list = e.data.originalEvent.touches;
                var touch = touchManager.getFreeOne(touch_list);
                if(!touch) {
                    return
                }
                pomelo.request("connector.worldHandler.fire", {}, function(data) {
                    // 触发发射动画
                    view_ship.guns.forEach(gun=>gun.emit("fire_ani"))
                });
            }
        });
    }else{
        // 旋转角度
        on(current_stage_wrap, "mousemove|mousedown", function (e) {
            if(view_ship) {
                var touch_point = e.data.global
                var direction = new Victor(touch_point.x - VIEW.CENTER.x, touch_point.y - VIEW.CENTER.y);
                
                var angle_value = direction.angle();
                if (angle_value < 0) {
                    angle_value += PIXI.PI_2
                }

                var new_config = {
                    rotation: angle_value
                };

                pomelo.request("connector.worldHandler.setConfig", {
                    config: new_config
                }, function(data) {});
            }
        });
        // 发射
        on(current_stage_wrap, "mousedown", function (e) {
            if(view_ship) {
                pomelo.request("connector.worldHandler.fire", {}, function(data) {
                    // 触发发射动画
                    view_ship.guns.forEach(gun=>gun.emit("fire_ani"))
                });
            }
        });
    }


    /**响应服务端事件
     *
     */
    pomelo.on("explode", function(arg) {
        var bullet_info = arg.data;
        console.log("explode:", bullet_info);
        var bullet = instanceMap[bullet_info.id];
        if (bullet) {
            bullet.setConfig(bullet_info.config);
            bullet.emit("explode");
            instanceMap[bullet_info.id] = null;
        }
    });
    pomelo.on("fire_start", function(arg) {
        var bullet_info = arg.data;
        console.log("fire_start:", bullet_info);
        var bullet = instanceMap[bullet_info.id];
        if (bullet) {
            bullet.setConfig(bullet_info.config);
            bullet.emit("fire_start");
        }
    });

    pomelo.on("change-hp",function (arg) {
        const ship_info = arg.data;
        console.log("change-hp:", ship_info);
        const ship = <Ship|Flyer>instanceMap[ship_info.id];
        if (ship) {
            if(ship_info.config.cur_hp < ship.config.cur_hp) {
                ship.emit("flash");
            }
            const ship_config = ship_info.config
            ship.setConfig(ship_config);
            var hp = HP_WEAKMAP[ship_info.id];
            if(hp) {
                hp.setHP(ship_config.cur_hp/ship_config.max_hp);
            }
        }
    });
    pomelo.on("ember",function (arg) {
        const flyer_info = arg.data;
        console.log("ember:", flyer_info);
        const flyer = instanceMap[flyer_info.id];
        if (flyer) {
            var hp = HP_WEAKMAP[flyer_info.id];
            hp.parent.removeChild(hp);
            hp.destroy();
            flyer.setConfig(flyer_info.config)
            flyer.emit("ember");
            instanceMap[flyer_info.id] = null;
        }
    });

    var is_my_ship_live = false;

    // 死亡对话框
    var die_dialog = (()=>{
        var title = new PIXI.Container();
        var restart_button = new Button({
                value: "重新开始",
                fontSize: pt2px(14),
                paddingTop:pt2px(4),
                paddingBottom:pt2px(4),
                paddingLeft:pt2px(4),
                paddingRight:pt2px(4),
                color:0xffffff,
                fontFamily: "微软雅黑"
            })
        var content = new FlowLayout([
            new TextBuilder("被击杀！", {
                fontSize: pt2px(16),
                fontFamily: "微软雅黑"
            }),
            restart_button
        ],{
            float:"center"
        });
        content.max_width = pt2px(60);
        content.reDrawFlow();

        on(restart_button,"click|tap",function (e) {
            current_stage_wrap.emit("enter",null,function (err,game_info) {
                if(err) {
                    alert(err)
                }else{
                    current_stage_wrap.emit("before-active", game_info);
                    die_dialog.close();
                    die_dialog.once("removed",function () {
                        current_stage_wrap.emit("active");
                    });
                }
            });
        });
        var dialog = new Dialog(title,content,ani_tween,{
            title:{
                show:false
            },
            closeButton:{
                show:false
            },
            bg:{
                alpha:0.4
            }
        });
        return dialog;
    })();
    pomelo.on("die",function (arg) {
        var ship_info = arg.data;
        console.log("die:", ship_info);
        var ship = instanceMap[ship_info.id];
        if (ship) {
            var hp = HP_WEAKMAP[ship_info.id];
            hp.parent.removeChild(hp);
            hp.destroy();
            ship.emit("die");
            instanceMap[ship_info.id] = null;
            if(ship._id === view_ship._id) {
                // 玩家死亡
                view_ship = null;//TODO，镜头使用击杀者
                is_my_ship_live = false;
                // 打开对话框
                die_dialog.open(current_stage_wrap,current_stage,renderer);
            }
        }
    })

    /**帧率
     * 
     */
    var pre_time
    ani_ticker.add(() => {
    // 动画控制器
        ani_tween.update();
        jump_tween.update();
        // 客户端对场景的优化渲染
        pre_time || (pre_time = performance.now());
        var cur_time = performance.now();
        var dif_time = cur_time - pre_time;
        pre_time = cur_time;

        // 更新影子世界
        engine.update(dif_time, timeSinceLastCalled, isNewDataFrame);
        isNewDataFrame = false;
        // 跟随主角移动
        if (view_ship) {
            current_stage.x = VIEW.WIDTH / 2 - view_ship.x
            current_stage.y = VIEW.HEIGHT / 2 - view_ship.y
        }
        // 更新血量显示
        hp_stage["update"](dif_time);
    });
    var FPS_Text = new PIXI.Text("FPS:0", {
        font: '24px Arial',
        fill: 0x00ffff33,
        align: "left"
    });

    current_stage_wrap.addChild(FPS_Text);
    FPS_ticker.add(function() {
        FPS_Text.text = `FPS:${FPS_ticker.FPS.toFixed(0)}/${(1/timeSinceLastCalled).toFixed(0)} W:${VIEW.WIDTH} H:${VIEW.HEIGHT} Ping:${ping.toFixed(2)}`;
        if(view_ship) {
            var info = "\n";
            for(var k in view_ship.config){
                var val = view_ship.config[k];
                if(typeof val === "number") {
                    val = val.toFixed(2);
                }
                info += `${k}: ${val}\n`;
            }
            FPS_Text.text += info;
        }
    });

    // 触发布局计算
    emitReisze(current_stage_wrap);

    init_w.ok(0, []);
}
current_stage_wrap.on("init", initStage);
current_stage_wrap.on("reinit", function() {
    renderInit(loader, loader.resources);
    emitReisze(current_stage);
});
current_stage_wrap["_has_custom_resize"] = true;
current_stage_wrap.on("resize", function() {
    jump_tween.clear();
    ani_tween.clear();
    emitReisze(this);
});

// 初始化本机ID
var mac_ship_id = localStorage.getItem("MAC-SHIP-ID");
if(!mac_ship_id){
    mac_ship_id = (Math.random()*Date.now()).toString().replace(".","");
    localStorage.setItem("MAC-SHIP-ID", mac_ship_id);
}
var old_username;
current_stage_wrap.on("enter",function (username,cb) {
    // 发送名字，初始化角色
    pomelo.request("connector.entryHandler.enter", {
        username: username||old_username,
        mac_ship_id: mac_ship_id,
        width: VIEW.WIDTH,
        height: VIEW.HEIGHT,
    }, function (game_info) {
        if(game_info.code===500) {
            console.log(game_info);
            if(game_info.error == "重复登录") {
                cb("名字已被使用，请重新输入")
            }
        }else{
            old_username = username;
            cb(null,game_info)
        }
    });
})

const init_w = new When(2, () => {
    emitReisze(current_stage);
    ani_tween.start();
    jump_tween.start();
    ani_ticker.start();
    FPS_ticker.start();
});
export function initStage() {
    init_w.ok(1, []);
}