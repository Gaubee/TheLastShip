declare const global;
declare const require;
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

// 根据积分的多少，依次由周围往中心生成物品
var flyerTypes = Object.keys(Flyer.TYPES);
var max_num = 1;
var max_score = 1000;

function genFlyer() {
    for (let i = 0; i < flyerTypes.length; i += 1) {
        var flyer_typename = flyerTypes[i];
        var flyer_typeinfo = Flyer.TYPES[flyer_typename];
        var cur_score = flyer_typeinfo.config.reward_experience
        var cur_num = (max_num * max_score / cur_score) | 0;
        var position_rate = 1 - cur_score / max_score;
        var half_width = VIEW.WIDTH / 2;
        var half_height = VIEW.HEIGHT / 2;
        var range_width = position_rate * half_width;
        var range_height = position_rate * half_height;
        var type_num_info = TYPE_NUM_MAP[flyer_typename] || (TYPE_NUM_MAP[flyer_typename] = {
            cur: 0,
            max: cur_num,
            range_width: range_width,
            range_height: range_height,
        })

        var gen_num = type_num_info.max - type_num_info.cur;
        if (!gen_num) {
            return;
        }
        var ran_gen_num = Math.ceil(Math.random() * gen_num);
        console.log(`自动刷怪：`, flyer_typename, `${ran_gen_num}/${gen_num}/${cur_num}`);

        for (let j = 0; j < ran_gen_num; j += 1) {
            type_num_info.cur += 1
            var deg = j / cur_num * Math.PI * 2;
            let x = Math.cos(deg) * range_width + half_width;
            let y = Math.sin(deg) * range_height + half_height;

            var wave_x = range_width
            var wave_y = range_height
            if (y < range_height) {
                y += wave_y * Math.random()
            } else {
                y -= wave_y * Math.random()
            }
            if (x < range_width) {
                x += wave_x * Math.random()
            } else {
                x -= wave_x * Math.random()
            }
            let flyer = new Flyer({
                x: x,
                y: y,
                body_color: 0xffffff * Math.random(),
                type: flyerTypes[i % flyerTypes.length]
            });
            // console.log(x,y)
            flyer.on("destroy", function() {
                TYPE_NUM_MAP[this.config.type].cur -= 1;
            });
            setTimeout(function () {
                engine.add(flyer);
            }, j/ran_gen_num*30e3);
        }
    }
}

const TYPE_NUM_MAP = {};
genFlyer();

setInterval(genFlyer, 30e3); // 每30秒进行一波刷新


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
// engine.add(my_ship);
// my_ship.toggleKeepFire(bullet => {
//     engine.add(bullet);
// });

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

// var fps = 0;
var pre_time;
ani_ticker.add(() => {
    // fps+=1;
    pre_time || (pre_time = performance.now() - 1000 / 60);
    var cur_time = performance.now();
    var dif_time = cur_time - pre_time;
    pre_time = cur_time;

    // 物理引擎运作
    engine.update(dif_time);
});
// setInterval(function(){
//     console.log("fps:",fps)
//     fps=0;
// },1000);

ani_ticker.start();

console.log("world run ok!");
// ani_ticker.add(()=>{
//     console.log(engine.getRectangleObjects(0,0,0,0).map(item=>JSON.stringify(item)).join("\n"));
// })