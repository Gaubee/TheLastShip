import {P2I} from "../engine/Collision";
import ShapeDrawer from "./Drawer/ShapeDrawer";
import Victor from "../engine/Victor";
import Bullet from "./Bullet";
import Gun from "./Gun";
import TWEEN from "../../class/Tween";
const Easing = TWEEN.Easing;

import {
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    pt2px,
    mix_options,
    _isBorwser,
    _isNode,
    assign,
    transformJSON,
    transformValue,
} from "../const";
import * as shipShape from "./shipShape.json";
if(_isNode) {
    Object.assign(shipShape, transformJSON(JSON.stringify(shipShape)));
}

export interface ShipConfig {
    x?: number
    y?: number
    y_speed?: number
    x_speed?: number
    // 推动力
    force?: number
    size?: number
    body_color?: number
    rotation?: number
    max_hp?: number
    cur_hp?: number
    restore_hp?: number
    // 密度，影响着子弹的穿透力
    density?: number
    //战斗相关的状态
    is_firing?: boolean
    ison_BTAR?: boolean // 是否处于攻击钱摇

    // 战斗相关的属性
    bullet_force?: number
    bullet_damage?: number
    bullet_penetrate?: number// 穿透，意味着子弹存在时间
    overload_speed?: number// 攻速

    // 队伍标志
    team_tag?: number
    // 经验值
    experience?: number
    // 等级
    level?: number
    // 技能加点信息
    proto_list_length?: number
    // 飞船基本形状
    type?: string
}

const EXPERIENCE_LEVEL_MAP = [0];
const LEVEL_STAGE_1 = 10;
const LEVEL_STAGE_2 = 20;
const LEVEL_STAGE_3 = 30;
const LEVEL_STAGE_1_RATE = 10;
const LEVEL_STAGE_2_RATE = 20;
const LEVEL_STAGE_3_RATE = 40;
for(var i = 1; i <= LEVEL_STAGE_1; i += 1){
    EXPERIENCE_LEVEL_MAP[i] = EXPERIENCE_LEVEL_MAP[i-1] + i * LEVEL_STAGE_1_RATE;
}
/**第一阶段的基础增长值 */
const LEVEL_STAGE_1_TOTAL = LEVEL_STAGE_1 * LEVEL_STAGE_1_RATE;
for(var i = 1,len = LEVEL_STAGE_2 - LEVEL_STAGE_1; i <= len; i += 1){
    EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_1 + i] = EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_1 + i-1] + LEVEL_STAGE_1_TOTAL + i * LEVEL_STAGE_2_RATE;
}
/**第二阶段的基础增长值 */
const LEVEL_STAGE_2_TOTAL = LEVEL_STAGE_1_TOTAL + (LEVEL_STAGE_2 - LEVEL_STAGE_1) * LEVEL_STAGE_2_RATE;
for(var i = 1,len = LEVEL_STAGE_3 - LEVEL_STAGE_2; i <= len; i += 1){
    EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_2 + i] = EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_2 + i - 1] + LEVEL_STAGE_2_TOTAL + i * LEVEL_STAGE_3_RATE;
}

function experience_to_level(experience_num){
    var res = 0;
    EXPERIENCE_LEVEL_MAP.some(function (experience,level) {
        if(experience >= experience_num){
            if(experience === experience_num) {
                res = level
            }else{
                res = level - 1;
            }
            return true;
        }
    });
    return res
}
function level_to_experience(level_num){
    return EXPERIENCE_LEVEL_MAP[level_num|0];
}

export default class Ship extends P2I {
    static TYPES = shipShape
    static experience_to_level = experience_to_level
    static level_to_experience = level_to_experience
    guns: Gun[] = []
    // 技能加点
    proto_list: any[] = []
    gun: PIXI.Graphics = new PIXI.Graphics()
    body: PIXI.Graphics = new PIXI.Graphics()
    config: ShipConfig = {
        x: 0,
        y: 0,
        y_speed: 0,
        x_speed: 0,
        force: 100000,
        size: pt2px(15),
        body_color: 0x2255ff,
        rotation: 0,
        max_hp: 100,
        cur_hp: 100,
        restore_hp: 1,
        density:1,
        
        is_firing: false,
        ison_BTAR: false,

        // 战斗相关的属性
        bullet_force: 30000,//子弹的推进力
        bullet_damage: 5,
        bullet_penetrate: 0.5,
        overload_speed: 1,

        // 标志
        team_tag: Math.random(),
        // 经验值
        experience: 0,
        // 等级
        level: 0,
        ["__self__"] : this,
        // 只读·技能加点信息
        get proto_list_length(){
            return this.__self__.proto_list.length
        },
        type: "S-1"
    }
    toJSON(){
        const config = this.config;
        var json_config = {};
        for(var k in config){
            if(k.indexOf("__")!==0) {
                json_config[k] = config[k]
            }
        }
        return {
            id:this._id,
            type: "Ship",
            config: json_config
        }
    }
    body_shape: p2.Shape
    constructor(new_config: ShipConfig = {}) {
        super();
        const self = this;
        const config = self.config;
        const typeInfo = shipShape[new_config.type]||shipShape[config.type];
        if(!typeInfo) {
            throw new TypeError("UNKONW Ship Type: " + config.type);
        }
        // 覆盖配置
        mix_options(config, typeInfo.body.config);
        mix_options(config, new_config);

        // 绘制武器
        self.loadWeapon();

        // 绘制船体
        ShapeDrawer(self, config, typeInfo.body);
        if(_isBorwser) {
            self.body.cacheAsBitmap = true;
        }
        
        self.body_shape["ship_team_tag"] = config.team_tag;
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
                    self.emit("die");
                }
            }
        });

        // Nodejs && 浏览器
        self.once("die",function (damage_from?:Ship) {
            if(damage_from) {
                // 失去1/2的经验，剩下的1/2用于复活后的基础经验
                damage_from.emit("change-experience", self.config.experience/2)
            }
        });
        if(_isNode) {// Nodejs
            self.once("die",function () {
                self.emit("destroy");
            });

            // 生命回复、攻速限制
            self.once("add-to-world",function () {
                var acc_time = 0;
                var restore_hp_ani = 1000;
                self.on("update",function (delay) {
                    if(config.max_hp!==config.cur_hp) {
                        acc_time += delay;
                        if(acc_time >= restore_hp_ani) {
                            self.emit("change-hp", ~~(config.restore_hp*acc_time/restore_hp_ani));
                            acc_time = acc_time%restore_hp_ani;
                        }
                    }
                });
            });
        }else{// 瀏覽器
            self.once("die",function () {
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
                    self.scale.x = self.scale.y = _to.scaleXY * easing_progress;
                    self.alpha = 1 - _to.alpha * easing_progress;

                    _update.call(self, delay);
                    if (progress === 1) {
                        self.emit("destroy");
                    }
                };
            });
        }
        // 经验奖励
        self.on("change-experience",function (dif_experience) {
            if(isFinite(dif_experience)) {
                const config = self.config;
                config.experience += parseFloat(dif_experience);
                var res_level = experience_to_level(config.experience);
                if(res_level !== config.level) {
                    self.emit("set-level", res_level);
                }
            }
        });
        // 等级改变
        self.on("set-level",function (new_level) {
            if(isFinite(new_level)) {
                const config = self.config;
                new_level = parseFloat(new_level);
                config.level = parseFloat(new_level);
            }
        });
    }
    // 装载武器
    loadWeapon(){
        const self = this;
        const config = self.config;
        const typeInfo = shipShape[config.type];
        typeInfo.guns.forEach(function (_gun_config,i) {
            var gun_config = assign({},_gun_config);
            // 枪支继承飞船的基本配置
            [
                "bullet_force",
                "bullet_damage",
                "bullet_penetrate",
                "overload_speed",
            ].forEach(function (k) {
                var ship_v = config[k];
                if(!gun_config.hasOwnProperty(k)){
                    gun_config[k] = ship_v;
                }
            });
            var gun = new Gun(gun_config, self);
            // 定死ID
            gun._id = self._id+"_gun_"+i;
        });
    }
    // 卸载武器
    unloadWeapon(){
        this.guns.forEach(gun=>{
            this.removeChild(gun);
            gun.destroy()
        });
    }
    // 重载武器配置
    reloadWeapon(){
        const self = this;
        const config = self.config;
        const typeInfo = shipShape[config.type];
        typeInfo.guns.forEach(function (_gun_config,i) {
            var gun_config = assign({},_gun_config);
            // 枪支继承飞船的基本配置
            [
                "bullet_force",
                "bullet_damage",
                "bullet_penetrate",
                "overload_speed",
            ].forEach(function (k) {
                var ship_v = config[k];
                if(!gun_config.hasOwnProperty(k)){
                    gun_config[k] = ship_v;
                }
            });
            var gun = self.guns[i];
            gun.setConfig(gun_config);
        });
    }
    update(delay) {
        super.update(delay);
        this.rotation = this.p2_body["rotation"];
        this.p2_body.force = [this.config.x_speed, this.config.y_speed];
        this.guns.forEach(gun=>gun.update(delay));
    }
    // 操控飞船
    operateShip(new_config:ShipConfig){
        var config = this.config;
        // 这个接口只能修改这三个参数
        var limit_config = {
            y_speed:config.y_speed,
            x_speed:config.x_speed,
            rotation:config.rotation,
        };
        mix_options(limit_config,new_config);

        if (
            limit_config.x_speed * limit_config.x_speed +
            limit_config.y_speed * limit_config.y_speed >
            config.force * config.force + 1// JS小数问题，确保全速前进不会出现问题
        ) { // 判定移动速度上限
            console.log("非法操作，取消这次操作");
            return //非法操作，取消这次操作
        }
        this.setConfig(limit_config);
    }
    setConfig(new_config) {
        var config = this.config;
        mix_options(config, new_config);

        this.p2_body.position[0] = config.x;
        this.p2_body.position[1] = config.y;
        this.x = config.x;
        this.y = config.y;
        if(!config.ison_BTAR) {
            this.p2_body["rotation"] = config.rotation;
            this.rotation =  config.rotation;
        }
    }
    // 属性加点
    addProto(add_proto){
        const config = this.config;
        this.proto_list.push(add_proto);
        if(_isNode) {
            this._computeConfig();
            this.reloadWeapon();
        }
    }
    _computeConfig(){
        const config = this.config;
        const level = config.level;
        const typeInfo = shipShape[config.type];
        const type_config = typeInfo.body.config;
        const level_grow = typeInfo.body.level_grow;
        const proto_grow = typeInfo.body.proto_grow;
        /** 基础的等级带来的属性增长
         *
         */
        mix_options(config, type_config);
        for(var config_key in level_grow){
            var level_grow_value = level_grow[config_key];
            if(isFinite(level_grow_value)) {
                config[config_key] += level_grow_value * level;
            }else if(typeof level_grow_value === "object"){
                if(level_grow_value.when instanceof Function&&level_grow_value.then instanceof Function) {
                    if(level_grow_value.when.call(this,level_grow_value)){
                        level_grow_value.then.call(this,level_grow_value);
                    }
                }
            }
        }


        // 加点信息
        this.proto_list.forEach(proto=>{
            var proto_grow_value = proto_grow[proto];
            if(isFinite(proto_grow_value)) {
                config[proto] += proto_grow_value ;
            }else if(typeof proto_grow_value === "object"){
                if(proto_grow_value.when instanceof Function&&proto_grow_value.then instanceof Function) {
                    if(proto_grow_value.when.call(this,proto_grow_value)){
                        proto_grow_value.then.call(this,proto_grow_value);
                    }
                }
            }else{
                throw new TypeError("UNKNOW SKILL UPGREAT: "+proto);
            }
        });
    }
    fire(){
        var res_bullets = this.guns.map(gun=>gun.fire());
        return res_bullets.filter(bullet=>bullet);
    }
    private _fireBind
    is_keep_fire = false
    startKeepFire(cb:(bullets:Bullet[])=>void){
        this._fireBind = ()=>{
            var bullets = this.fire();
            requestAnimationFrame(function () {
                cb(bullets);
            });
        }
        this.on("update",this._fireBind);
    }
    stopKeepFire(){
        this.off("update",this._fireBind);
        this._fireBind = null;
    }
    toggleKeepFire(cb:(bullets:Bullet[])=>void){
        if(!this.is_keep_fire) {
            this.is_keep_fire = true;
            this.startKeepFire(cb);
        }else{
            this.is_keep_fire = false;
            this.stopKeepFire();
        }
    }
}