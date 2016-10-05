import SVGGraphics from "../class/SVGGraphics";
import color2color from "../class/color2color";

export const square = (v) => v * v;// 平方
const devicePixelRatio = window["_isMobile"] ? 1 : 1;
const __pt2px = devicePixelRatio * 2;
export const pt2px = (pt) => pt * __pt2px;

const body = document.getElementById("body");
// 禁用右键菜单
document.oncontextmenu = function () {
    return false;
};
export function emitReisze(con: PIXI.Container) {
    con.children.forEach(item => {
        item.emit("resize");
        if (item instanceof PIXI.Container && !item["_has_custom_resize"]) {
            emitReisze(item);
        }
    });
}
const HALF_PI = Math.PI / 2;

function _aniRotation(to_rotation: number, time?: number) {
    var i = 0;
    var total = time || 30;
    var from_rotation = _main_stage.rotation;
    var dif_rotation = to_rotation - from_rotation;

    _main_stage.rotation = to_rotation;
}
function resizeView() {
    body.style.cssText = "";
    var width = body.clientWidth
    var height = body.clientHeight;
    _main_stage.pivot.set(0, 0);
    _aniRotation(0)
    if (_current_stage && _current_stage["keep_direction"]) {
        if (_current_stage["keep_direction"] === "horizontal" && height > width//保持横屏方向
            || _current_stage["keep_direction"] === "vertical" && width > height) {//保持竖屏方向
            _main_stage.pivot.set(width > height ? height : 0, width < height ? width : 0);
            var o = _current_stage["keep_direction"] === "vertical" ? -1 : 1;

            var target_rotation = o * HALF_PI;
            _aniRotation(target_rotation)
        }
    }
    if (renderer.width !== width || renderer.height !== height) {
        console.log(width, height);
        renderer.resize(width, height);
    }
    emitReisze(_main_stage);
}
window.addEventListener("resize", resizeView);
// export const renderer = window["R"] = new PIXI.lights.WebGLDeferredRenderer(body.clientWidth - 2 || 400, body.clientHeight - 2 || 300);
export const renderer = window["R"] = PIXI.autoDetectRenderer(body.clientWidth*devicePixelRatio, body.clientHeight*devicePixelRatio, {
    antialias: true,
    resolution: 1/devicePixelRatio
});
body.appendChild(renderer.view);
export const VIEW = {
    get WIDTH() {
        return (_main_stage.rotation % Math.PI ? renderer.view.height : renderer.view.width)*devicePixelRatio
    },
    get HEIGHT() {
        return (_main_stage.rotation % Math.PI ? renderer.view.width : renderer.view.height)*devicePixelRatio
    },
    get CENTER() {
        return new PIXI.Point(VIEW.WIDTH / 2, VIEW.HEIGHT / 2);
    },
    rotateXY(point: Point) {
        if (_main_stage.rotation === -HALF_PI) {
            return { x: VIEW.WIDTH - point.y, y: point.x }
        } else if (_main_stage.rotation === HALF_PI) {
            return { x: point.y, y: point.x }
        } else {
            return point
        }

    }
}
export const L_ANI_TIME = 1225;
export const B_ANI_TIME = 375;
export const M_ANI_TIME = 225;
export const S_ANI_TIME = 195;
export const on = (obj: PIXI.EventEmitter, eventName: string, handle, is_once?:boolean) => {
    obj["interactive"] = true;
    if(is_once) {
        var _handle = handle;
        handle = function () {
            _handle.apply(this,arguments);
            register_event_res.forEach(function (register_event_info) {
                if(register_event_info.target.removeEventListener){
                    register_event_info.target.removeEventListener(register_event_info.eventName,register_event_info.handle)
                }else if(register_event_info.target.off){
                    register_event_info.target.off(register_event_info.eventName,register_event_info.handle);
                }
            })
        }
    }
    var register_event_res = eventName.split("|").map(en => {

        if (en === "touchenter") {
            var res_target:any = obj;
            var res_handle:any =  (e) => {
                console.log(e.target === obj);
                if (e.target === this) {
                    handle(e);
                }
            };
            var res_eventName = "touchmove";
            res_target.on("touchmove",res_handle);
        } else if(en === "rightclick") {
            var res_target:any = document.body;
            var res_handle:any = function (e) {
                if (e.which==3) {//righClick
                    // alert("Disabled - do whatever you like here..");
                    handle(e)
                }
            }
            var res_eventName = "mousedown";
            res_target.addEventListener("mousedown",res_handle);
        } else if (en === "keydown" || en === "keyup") {
            var res_target:any = document.body;
            var res_handle:any = handle;
            var res_eventName = en;
            res_target.addEventListener(res_eventName, res_handle);
        } else {
            var res_target:any = obj;
            var res_handle:any = handle;
            var res_eventName = en;
            res_target.on(res_eventName, res_handle);
        }
        return {
            target:res_target,
            handle:res_handle,
            eventName:res_eventName
        }
    });
    return register_event_res;
}
interface Point {
    x: number,
    y: number
}

var _current_stage: PIXI.Container;
var _current_stage_index: number = 0;
var _stages: PIXI.Container[] = [];
var _bg_color = null;
var _main_stage = new PIXI.Container();
var _bg: PIXI.Graphics;
const DIRECTION = {
    vertical: "|",
    horizontal: "-"
};
export const stageManager = {
    get DIRECTION() {
        return DIRECTION
    },
    get direction() {
        return body.clientHeight > body.clientWidth ? DIRECTION.vertical : DIRECTION.horizontal;
    },
    get backgroundColor() {
        return _bg_color
    },
    set backgroundColor(new_color) {
        if (_bg_color !== new_color) {
            var color = color2color(new_color, 'array')
            _bg_color = 256 * 256 * color[0] + 256 * color[1] + color[2];
            var new_bg = new PIXI.Graphics();
            new_bg.on("resize", function () {
                var self = <PIXI.Graphics>this;
                self.clear();
                self.lineStyle(0);
                self.beginFill(_bg_color);
                self.drawRect(0, 0, VIEW.WIDTH, VIEW.HEIGHT);
                self.endFill();
            });
            new_bg.emit("resize");

            _bg && _main_stage.removeChild(_bg);
            _main_stage.addChildAt(_bg = new_bg, 0);
        }
    },
    set(stage: PIXI.Container) {
        if ((_current_stage_index = _stages.indexOf(stage)) === -1) {
            _current_stage_index = _stages.push(stage) - 1;
        }
        _current_stage = _stages[_current_stage_index];
        _main_stage.children[1] && _main_stage.removeChildAt(1);
        _main_stage.addChild(_current_stage);
        _current_stage.emit("active")
        resizeView();
        return stageManager;
    },
    get() {
        if (!_current_stage["__is_inited"]) {
            _current_stage["__is_inited"] = true;
            _current_stage.emit("init");
        }
        return _main_stage;
    },
    add(...stages: PIXI.Container[]) {
        _stages = _stages.concat(stages);
        return stageManager;
    },
    next() {
        if (_current_stage_index > _stages.length - 1) {
            return
        }
        _current_stage_index += 1;
        _current_stage = _stages[_current_stage_index];
        _main_stage.children[1] && _main_stage.removeChildAt(1);
        _main_stage.addChild(_current_stage);
        _current_stage.emit("active")
        resizeView();
        return _main_stage;
    }
};
stageManager.backgroundColor = "#ddd";

export const touchManager = {
    _touchRegMap: {},
    register(touch){// 占用
        var touch_id = touch.identifier;
        this._touchRegMap[touch_id] = true;
        return touch_id
    },
    free(touch_id){
        this._touchRegMap[touch_id] = false;
    },
    getFreeOne(touchs){
        for(var i = 0,touch; touch = touchs[i]; i+=1){
            if(!this._touchRegMap[touch.identifier]) {
                return touch
            }
        }
    },
    getById(touchs, touch_identifier){
        for(var i = 0,touch; touch = touchs[i]; i+=1){
            if(touch.identifier == touch_identifier) {
                return touch
            }
        }
    }
}

export function mix_options(tmp_options, new_options) {
    for (var key in new_options) {
        if (tmp_options.hasOwnProperty(key)) {
            if (tmp_options[key] instanceof Object) {
                if(new_options[key]) {
                    mix_options(tmp_options[key], new_options[key])
                }else{
                    tmp_options[key] = new_options[key];
                }
            } else {
                tmp_options[key] = new_options[key]
            }
        }
    }
}
export function copy(source) {
    var res = new source.constructor();
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object) {
                res[key] = copy(source[key]);
            } else {
                res[key] = source[key];
            }
        }
    }
    return res;
}