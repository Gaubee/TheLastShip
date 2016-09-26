import {
    P2I
} from "./Collision";
import Bullet from "../class/Bullet";

const worldStep = 1 / 60;
var _ani_frame_num = 0;
const world = {
    addBody: function(body: p2.Body) {
        p2is_config_cache_pre[body.id] = p2is_config_cache[body.id] = {
            x: body.position[0],
            y: body.position[1],
            angle: body.angle,
            rotation: body["rotation"] || 0,
        }
    },
    removeBody: function(body: p2.Body) {},
    step: function(dt, timeSinceLastCalled = 0, isNewDataFrame) {

        var step_num = timeSinceLastCalled / dt;
        if (step_num <= 1) { // 快速帧，不用过度，直接渲染
            if (isNewDataFrame) {
                p2is_config_cache_pre = p2is_config_cache;
                p2is_config_cache = {};
                for (var i = 0, len = p2is.length; i < len; i += 1) {
                    var body = p2is[i].p2_body;
                    p2is_config_cache[body.id] = {
                        x: body.position[0],
                        y: body.position[1],
                        angle: body.angle,
                        rotation: body["rotation"] || 0,
                    }
                }
            }
            return
        }
        if (isNewDataFrame) {
            _ani_frame_num = 0;
            p2is_config_cache_pre = p2is_config_cache;
            p2is_config_cache = {};
        }

        _ani_frame_num += 1;
        var current_frame_num = Math.min(_ani_frame_num, step_num);
        var ani_progress = current_frame_num / step_num;
        // console.log(current_frame_num, step_num);
        for (var i = 0, len = p2is.length; i < len; i += 1) {
            var body = p2is[i].p2_body;
            if (isNewDataFrame) {
                p2is_config_cache[body.id] = {
                    x: body.position[0],
                    y: body.position[1],
                    angle: body.angle,
                    rotation: body["rotation"] || 0,
                }
            }
            if (body["__changed"]) {
                if (!isNewDataFrame) {
                    p2is_config_cache_pre[body.id] = p2is_config_cache[body.id];
                }
                p2is_config_cache[body.id] = {
                    x: body.position[0],
                    y: body.position[1],
                    angle: body.angle,
                    rotation: body["rotation"] || 0,
                }
                body["__changed"] = false;
            }
            var cache_config = p2is_config_cache[body.id];
            var pre_config = p2is_config_cache_pre[body.id];
            var dif_x = cache_config.x - pre_config.x;
            var dif_y = cache_config.y - pre_config.y;
            var dif_angle = cache_config.angle - pre_config.angle;
            body.position[0] = pre_config.x + dif_x * ani_progress;
            body.position[1] = pre_config.y + dif_y * ani_progress;
            body.angle = pre_config.angle + dif_angle * ani_progress;

            var cache_rotation = cache_config.rotation
            var pre_rotation = pre_config.rotation
            var dif_rotation = 0;

            // 旋转要特殊处理。TODO：包括angle
            if (cache_rotation <= Math.PI / 2 && pre_rotation >= Math.PI * 3 / 2) {
                cache_rotation = cache_rotation + Math.PI * 2;
                dif_rotation = cache_rotation - pre_rotation;
            } else if (pre_rotation <= Math.PI / 2 && cache_rotation >= Math.PI * 3 / 2) {
                pre_rotation = pre_rotation + Math.PI * 2;
                dif_rotation = cache_rotation - pre_rotation;
            } else {
                dif_rotation = cache_rotation - pre_rotation;
            }
            body["rotation"] = pre_rotation + dif_rotation * ani_progress;
            // if (p2is[i].constructor.name=="Bullet") {
            //     console.log(pre_config.x,cache_config.x,body.position[0])
            // }
        }
    }
};


const p2is = [];
var p2is_config_cache = {};
var p2is_config_cache_pre = {};
export const engine = {
    world: world,
    add(item: P2I) {
        p2is.push(item);
        item.emit("add-to-world", world);
        item.on("destroy", function() {
            p2is.splice(p2is.indexOf(this), 1);
            var body = this.p2_body;
            p2is_config_cache_pre[body.id] = p2is_config_cache[body.id] = null
        });
    },
    update(delay: number, timeSinceLastCalled: number, isNewDataFrame: boolean) {
        world.step(worldStep, timeSinceLastCalled, isNewDataFrame);
        p2is.forEach(p2i => p2i.update(delay));
    },
}