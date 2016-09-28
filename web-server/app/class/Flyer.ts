import {P2I} from "../engine/Collision";

import {
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    pt2px,
    mix_options,
    _isBorwser,
    _isNode,
} from "../const";
import TWEEN from "../../class/Tween";
import * as flyerShip from "./flyerShip.json";
// console.log(flyerShip);
// console.log("__dirname",require("./flyerShip.json"));
// const flyerShip =  require("./flyerShip.json");

const Easing = TWEEN.Easing;

export interface FlyerConfig {
    x?: number
    y?: number
    y_speed?: number
    x_speed?: number
    size?: number,
    body_color?: number
    density?: number
    rotation?: number
    max_hp?: number
    cur_hp?: number
    type?: string
}

export default class Flyer extends P2I {
    static TYPES = flyerShip
    // static clooisionGroup = 1<<1;
    body: PIXI.Graphics = new PIXI.Graphics()
    config: FlyerConfig = {
        x: 0,
        y: 0,
        y_speed: 5,
        x_speed: 0,
        size: pt2px(10),
        body_color: 0x2255ff,
        density: 1,
        rotation: 0,
        max_hp: 50,
        cur_hp: 50,
        type: "S-Box",
    }
    body_shape: p2.Shape
    constructor(new_config: FlyerConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        mix_options(config, new_config);
        const typeInfo = flyerShip[config.type];
        if(!typeInfo) {
            throw new TypeError("UNKONW Ship Type: " + config.type);
        }
        // 对配置文件中的数量进行基本的单位换算
        for(let k in typeInfo.config){
            let v = typeInfo.config[k];
            if(typeof v === "string" && v.indexOf("pt2px!")===0){
                typeInfo.config[k] = pt2px(v.substr(6));
            }
        }
        for(let k in typeInfo.args){
            let v = typeInfo.args[k];
            if(typeof v === "string" && v.indexOf("pt2px!")===0){
                typeInfo.args[k] = pt2px(typeInfo.args[k]);
            }
        }
        // 覆盖配置
        mix_options(config, typeInfo.config);

        const body = self.body;
        body.lineStyle(pt2px(1), 0x000000, 1);
        body.beginFill(config.body_color);
        if(typeInfo.type === "Circle") {
            // 绘制外观形状
            body.drawCircle(config.size / 2, config.size / 2, config.size);
            self.pivot.set(config.size / 2, config.size / 2);
            // 绘制物理形状
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
        }else if(typeInfo.type === "Box") {
            // 绘制外观形状
            body.drawRect(0, 0, config.size * 2, config.size * 2);
            self.pivot.set(config.size , config.size );
            // 绘制物理形状
            self.body_shape = new p2.Box({
                width: config.size,
                height: config.size,
            });
        }else if(typeInfo.type === "Convex"){
            var vertices = [];
            for(let i=0, N=typeInfo.args.vertices_length; i<N; i++){
                var a = 2*Math.PI / N * i;
                var vertex = [config.size*Math.cos(a), config.size*Math.sin(a)]; // Note: vertices are added counter-clockwise
                vertices.push(vertex);
            }
            // 绘制外观形状
            let first_item = vertices[0];
            body.moveTo(first_item[0],first_item[1]);
            for(let i = 1,item ; item = vertices[i]; i+=1){
                body.lineTo(item[0],item[1]);
            }
            body.lineTo(first_item[0],first_item[1]);
            // 绘制物理形状
            self.body_shape = new p2.Convex({ vertices: vertices });
        }
        // 收尾外观绘制
        body.endFill();
        self.addChild(body);
        if(_isBorwser) {
            self.cacheAsBitmap = true;
        }

        // 收尾物理设定
        self.body_shape.material = Flyer.material;
        self.p2_body.addShape(self.body_shape);
        self.p2_body.setDensity(config.density);

        self.p2_body.force = [config.x_speed, config.y_speed];
        self.p2_body.position = [config.x, config.y];
        self.position.set(config.x, config.y);


        self.on("change-hp", function (dif_hp) {
            // console.log("change-hp-value:",dif_hp)
            if(isFinite(dif_hp)) {
                const config = self.config;
                config.cur_hp += dif_hp;
                if(dif_hp < 0 && _isBorwser) {
                    self.emit("flash")
                }
                if(config.cur_hp>config.max_hp) {
                    config.cur_hp = config.max_hp;
                }
                if (config.cur_hp <= 0) {
                    self.emit("ember");
                }
            }
        });
        if(_isNode) {// Nodejs
            self.once("ember",function () {
                self.emit("destroy");
            });
        }else{// 瀏覽器
            self.once("ember",function () {
                var ani_time = B_ANI_TIME;
                var ani_progress = 0;
                var _update = self.update;
                var _to = {
                    scaleXY: 2,
                    alpha: 1
                }
                if (self.world) {
                    self.world.removeBody(self.p2_body);
                    self.world = null;
                }
                self.emit("stop-flash");

                self.update = (delay) => {
                    ani_progress += delay;
                    var progress = Math.min(ani_progress / ani_time, 1);
                    var easing_progress = Easing.Quartic.Out(progress);
                    self.scale.x = self.scale.y = 1 + (_to.scaleXY - 1) * easing_progress;
                    self.alpha = 1 - _to.alpha * easing_progress;

                    _update.call(self, delay);
                    if (progress === 1) {
                        self.emit("destroy");
                    }
                };
            });
        }
    }

    update(delay) {
        super.update(delay);
        this.rotation = this.config.rotation = this.p2_body.interpolatedAngle;
        // this.p2_body.force = [this.config.x_speed, this.config.y_speed];
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.rotation = this.p2_body.angle = config.rotation;
        this.p2_body.position = [config.x, config.y];
        this.x = config.x;
        this.y = config.y;
    }
}