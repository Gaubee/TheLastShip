declare const global;
import PIXI from "./lib/PIXI";
import p2 from "./lib/p2";
import {
    engine
} from "./engine";
import Flyer from "../../../web-server/app/class/Flyer";
import Wall from "../../../web-server/app/class/Wall";
import Ship from "../../../web-server/app/class/Ship";
import {
    VIEW
} from "./common";

const ani_ticker = new PIXI.ticker.Ticker();
// const current_stage = new PIXI.Container();
const flyers: Flyer[] = []

export default engine;

var bullets = new PIXI.Container();
// current_stage.addChild(bullets);

var flyer = new Flyer({
    x: 260,
    y: 250,
    x_speed: 10 * 2 * (Math.random() - 0.5),
    y_speed: 10 * 2 * (Math.random() - 0.5),
    body_color: 0x0f00dd
});
// current_stage.addChild(flyer);
engine.add(flyer);
var flyer = new Flyer({
    x: 480,
    y: 250,
    x_speed: 10 * 2 * (Math.random() - 0.5),
    y_speed: 10 * 2 * (Math.random() - 0.5),
    body_color: 0x0fdd00
});
// current_stage.addChild(flyer);
engine.add(flyer);
var flyer = new Flyer({
    x: 600,
    y: 250,
    x_speed: 10 * 2 * (Math.random() - 0.5),
    y_speed: 10 * 2 * (Math.random() - 0.5),
    body_color: 0xdd000f
});
// current_stage.addChild(flyer);
engine.add(flyer);


// 四边限制

var top_edge = new Wall({
    x: VIEW.CENTER.x,
    y: 5,
    width: VIEW.WIDTH,
    height: 10
});
// current_stage.addChild(top_edge);
engine.add(top_edge);
var bottom_edge = new Wall({
    x: VIEW.CENTER.x,
    y: VIEW.HEIGHT - 5,
    width: VIEW.WIDTH,
    height: 10
});
// current_stage.addChild(bottom_edge);
engine.add(bottom_edge);
var left_edge = new Wall({
    x: 5,
    y: VIEW.CENTER.y,
    width: 10,
    height: VIEW.HEIGHT
});
// current_stage.addChild(left_edge);
engine.add(left_edge);
var right_edge = new Wall({
    x: VIEW.WIDTH - 5,
    y: VIEW.CENTER.y,
    width: 10,
    height: VIEW.HEIGHT
});
// current_stage.addChild(right_edge);
engine.add(right_edge);
(() => {
    var x_len = 2;
    var y_len = 2;
    var x_unit = VIEW.WIDTH / (x_len + 1)
    var y_unit = VIEW.HEIGHT / (y_len + 1)
    var width = 40;
    for (var _x = 1; _x <= x_len; _x += 1) {
        for (var _y = 1; _y <= y_len; _y += 1) {
            var mid_edge = new Wall({
                x: _x * x_unit - width / 2,
                y: _y * y_unit - width / 2,
                width: width,
                height: width
            });

            // current_stage.addChild(mid_edge);
            engine.add(mid_edge);
        }
    }
})();

// var my_ship = new Ship({
//     x: VIEW.CENTER.x,
//     y: VIEW.CENTER.y,
//     body_color: 0x366345
// });
// // current_stage.addChild(my_ship);
// engine.add(my_ship);
// setInterval(function () {
//     engine.fire(my_ship._id);
// },3000)

// var other_ship = new Ship({
//     x: VIEW.CENTER.x - 100,
//     y: VIEW.CENTER.y - 100,
//     body_color: 0x633645,
//     team_tag: 12
// });
// // current_stage.addChild(other_ship);
// engine.add(other_ship);

/**初始化动画
 * 
 */

var pre_time;
ani_ticker.add(() => {
    pre_time || (pre_time = performance.now());
    var cur_time = performance.now();
    var dif_time = cur_time - pre_time;
    pre_time = cur_time;

    // 物理引擎运作
    engine.update(dif_time);
});

ani_ticker.start();

console.log("world run ok!");
// ani_ticker.add(()=>{
//     console.log(engine.getRectangleObjects(0,0,0,0).map(item=>JSON.stringify(item)).join("\n"));
// })