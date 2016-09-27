import p2 from "./lib/p2";
import {
    P2I
} from "../../../web-server/app/engine/Collision";
// import Bullet from "./class/Bullet";
import Bullet from "../../../web-server/app/class/Bullet";

import Ship, {
    ShipConfig
} from "../../../web-server/app/class/Ship";
import {
    VIEW
} from "./common";

const world: p2.World = new p2.World({
    gravity: [0, 0]
});
const worldStep = 1 / 60;

var planeShape = new p2.Plane();
var planeBody = new p2.Body({
    position: [0, 0]
});
planeBody.addShape(planeShape);
world.addBody(planeBody);
const _runNarrowphase = world.runNarrowphase;
world.runNarrowphase = function(np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {
    // 如果si是飞船，无视同组的 普通子弹
    if (si["ship_team_tag"] &&
        si["ship_team_tag"] === sj["bullet_team_tag"]) {
        return;
    }
    // 同理sj
    if (sj["ship_team_tag"] &&
        sj["ship_team_tag"] === si["bullet_team_tag"]) {
        return;
    }
    // 如果si、sj都是子弹，无视同组的 普通子弹
    if (si["bullet_team_tag"] &&
        si["bullet_team_tag"] === sj["bullet_team_tag"]) {
        return;
    }
    return _runNarrowphase.call(this, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen);
};

var All_bullets_weakmap = new WeakMap<p2.Body,Bullet>();
world.on("impact", function(evt) {
    if (All_bullets_weakmap.has(evt.bodyA)) {
        var bullet_body = evt.bodyA;
        var maybe_ship_body = evt.bodyB;
    } else if (All_bullets_weakmap.has(evt.bodyB)) {
        var bullet_body = evt.bodyB;
        var maybe_ship_body = evt.bodyA;
    } else {
        return
    }
    var bullet = All_bullets_weakmap.get(bullet_body);
    bullet.emit("explode");// 執行爆炸動畫、散發爆炸通知、移除内存對象；

    var maybe_ship = All_ships_weakmap.get(maybe_ship_body);
    console.log("maybe_ship",JSON.stringify(maybe_ship));
    if(maybe_ship){
        maybe_ship.emit("change-hp", bullet.config.damage);
    }
});
const All_ships_map = new Map<string,Ship>();
const All_ships_weakmap = new WeakMap<p2.Body,Ship>();
// TODO 使用数据库？
const ship_md5_id_map = new Map<string,string>();
const ship_id_md5_map = new Map<string,string>();

const p2is = [];
export const engine = {
    world: world,
    listener:null,
    emit(eventName,...args){
        engine.listener&&engine.listener.emit(eventName,...args);
    },
    add(item: P2I) {
        if (item instanceof Bullet) {
            All_bullets_weakmap.set(item.p2_body, item);
            ["explode"].forEach(eventName=>{
                item.on(eventName,function () {
                    engine.emit(eventName, this);
                });
            })
            item.on("destroy",function () {
                All_bullets_weakmap.delete(this.p2_body);
            });
        }else if(item instanceof Ship){
            All_ships_map.set(item._id, item);
            All_ships_weakmap.set(item.p2_body, item);
            ["die", "change-hp"].forEach(eventName=>{
                item.on(eventName,function () {
                    engine.emit(eventName, this);
                });
            })
            item.on("destroy",function () {
                var ship_id = this._id;
                var ship_md5_id = ship_id_md5_map.get(ship_id);
                ship_md5_id_map.delete(ship_md5_id);
                ship_id_md5_map.delete(ship_id)
                All_ships_map.delete(ship_id);
                All_ships_weakmap.delete(this.p2_body);
            });
        }
        p2is.push(item);
        item.emit("add-to-world", world);
        item.on("destroy", function() {
            console.log("destroy!!and remove!!",p2is.indexOf(this))
            p2is.splice(p2is.indexOf(this), 1);
        });
    },
    getGameBaseInfo(){
        return {
            rank: [],
            total: All_ships_map.size
        }
    },
    getRectangleObjects(x: number, y: number, width: number, height: number) {
        return p2is;
    },
    update(delay: number) {
        world.step(worldStep, delay / 100);
        p2is.forEach(p2i => p2i.update(delay));
    },
    newShip(ship_config?: ShipConfig) {
        var default_ship_config = {
            x: VIEW.WIDTH * Math.random(),
            y: VIEW.HEIGHT * Math.random(),
            body_color: 0x777777 * Math.random(),
            team_tag: Math.random()
        };
        ship_config = ship_config ? Object.assign(ship_config, default_ship_config):default_ship_config;
        var new_ship = new Ship(ship_config);
        engine.add(new_ship);
        if(ship_config["ship_md5_id"]) {
            ship_md5_id_map.set(ship_config["ship_md5_id"],new_ship._id);
            ship_id_md5_map.set(new_ship._id, ship_config["ship_md5_id"]);
        }
        return new_ship;
    },
    getShip(ship_md5_id){
        var ship_id = ship_md5_id_map.get(ship_md5_id);
        return ship_id && All_ships_map.get(ship_id);
    },
    setConfig(ship_id, new_ship_config:ShipConfig){
        var current_ship = All_ships_map.get(ship_id);
        if(!current_ship) {
            throw `SHIP ID NO REF INSTANCE:${ship_id}`;
        }
        current_ship.setConfig(new_ship_config);
        return current_ship;
    },
    fire(ship_id){
        var current_ship = All_ships_map.get(ship_id);
         if(!current_ship) {
            throw `SHIP ID NO REF INSTANCE:${ship_id}`;
        }
        var bullet = current_ship.fire();
        engine.add(bullet)
        return bullet;
    }
}