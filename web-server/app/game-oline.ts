import TWEEN, {
    Tween
} from "../class/Tween";
import When from "../class/When";

import Flyer from "./class/Flyer";
import Wall from "./class/Wall";
import Ship from "./class/Ship";
import Bullet from "./class/Bullet";
import HP from "./class/HP";

import {
    engine
} from "./engine/shadowWorld";
import Victor from "./engine/Victor";
import {
    pomelo
} from "./engine/Pomelo";

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

export const current_stage_wrap = new PIXI.Graphics();
export const current_stage = new PIXI.Container();
current_stage_wrap.addChild(current_stage);
current_stage_wrap["keep_direction"] = "horizontal";
//加载图片资源
export const loader = new PIXI.loaders.Loader();

loader.add("button", "./res/game_res_再玩一次.png")

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
    const HP_SHIP_WEAKMAP:{[key:string]:HP} = {};

    function showViewData(objects) {
        objects.map(obj_info => {
            if (instanceMap.hasOwnProperty(obj_info.id)) {
                instanceMap[obj_info.id].setConfig(obj_info.config)
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
                    if (obj_info.type === "Ship") {
                        var hp = HP_SHIP_WEAKMAP[obj_info.id] = new HP(ins);
                        hp_stage.addChild(hp);
                    }
                }
                engine.add(ins);
            }
        })
    };

    var ping = 0;
    var timeSinceLastCalled = 0;
    var isNewDataFrame = false;
    function getViewData() {
        var pre_time = performance.now();
        var i = -1;
        var can_next = true;;
        ani_ticker.add(function() {
            i += 1;
            can_next||(can_next = i % 20===0);
            if (!can_next) {
                return
            }
            can_next = false;
            i = 0;
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
                timeSinceLastCalled = dif_time/1000;
                isNewDataFrame = true;

                ping = cur_time - start_ping;
                showViewData(data.objects);
                can_next = true;
                i = 0;
            });
        });
    };

    current_stage_wrap.on("active", getViewData);
    // 当前视角飞车，不一定是自己的飞船，在死亡后视角会进行切换
    var view_ship_info;
    current_stage_wrap.on("before-active", (game_init_info) => {
        view_ship_info = game_init_info.ship;
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
    const effect_speed = {};
    on(current_stage_wrap, "keydown", function(e) {
        if (speed_ux.hasOwnProperty(e.keyCode)) {
            var speed_info = speed_ux[e.keyCode];
            var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
            var _dir = speed_info.charAt(1) + "_speed";
            effect_speed[_dir] = _symbol;

            var new_config = {
                [_dir]: _symbol * view_ship.config.force
            }
            pomelo.request("connector.worldHandler.setConfig", {
                config: new_config
            }, function(data) {
                // console.log("setConfig:to-move", data);
                // 触发发射动画
                view_ship.emit("fire-ani");
            });
        }
    });

    on(current_stage_wrap, "keyup", function(e) {
        if (speed_ux.hasOwnProperty(e.keyCode)) {
            var speed_info = speed_ux[e.keyCode];
            var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
            var _dir = speed_info.charAt(1) + "_speed";
            if (effect_speed[_dir] === _symbol) {
                var new_config = {
                    [_dir]: 0
                }
                pomelo.request("connector.worldHandler.setConfig", {
                    config: new_config
                }, function(data) {
                    // console.log("setConfig:stop-move", data);
                });
            }
        }
    });
    // 转向
    on(current_stage_wrap, "mousemove|click|tap", function(e) {
        var to_point = VIEW.rotateXY(e.data.global);
        var direction = new Victor(to_point.x - VIEW.CENTER.x, to_point.y - VIEW.CENTER.y);

        var angle_value = direction.angle();
        if (angle_value < 0) {
            angle_value += PIXI.PI_2
        }

        var new_config = {
            rotation: angle_value
        };

        pomelo.request("connector.worldHandler.setConfig", {
            config: new_config
        }, function(data) {
            // console.log("setConfig:turn-head", data);
        });
    });
    // 发射
    on(current_stage_wrap, "click|tap", function() {
        pomelo.request("connector.worldHandler.fire", {}, function(data) {
            // console.log("setConfig:fire", data);
        });
    });


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


    pomelo.on("change-hp",function (arg) {
        const ship_info = arg.data;
        console.log("change-hp:", ship_info);
        const ship = instanceMap[ship_info.id];
        if (ship) {
            const ship_config = ship_info.config
            ship.setConfig(ship_config);
            var hp = HP_SHIP_WEAKMAP[ship_info.id];
            if(hp) {
                hp.setHP(ship_config.cur_hp/ship_config.max_hp);
            }
        }
    });

    pomelo.on("die",function (arg) {
        var ship_info = arg.data;
        console.log("die:", ship_info);
        var ship = instanceMap[ship_info.id];
        if (ship) {
            var hp = HP_SHIP_WEAKMAP[ship_info.id];
            hp.parent.removeChild(hp);
            hp.destroy();
            ship.emit("die");
            instanceMap[ship_info.id] = null;
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