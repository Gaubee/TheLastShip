import SVGGraphics from "../class/SVGGraphics";
import color2color from "../class/color2color";

export const square = (v) => v * v;// 平方
// const devicePixelRatio = window["_isMobile"] ? 2 : 1;
export const pt2px = (pt) => pt * 2;//((window.devicePixelRatio) || 1);//px 转 pt

const body = document.getElementById("body");
export function emitReisze(con: PIXI.Container) {
    con.children.forEach(item => {
        item.emit("resize");
        if (item instanceof PIXI.Container && !item["_has_custom_resize"]) {
            // requestAnimationFrame(function () {
            emitReisze(item);
            // })
        }
    });
}
const HALF_PI = Math.PI / 2;

function _aniRotation(to_rotation: number, time?: number) {
    var i = 0;
    var total = time || 30;
    var from_rotation = _main_stage.rotation;
    var dif_rotation = to_rotation - from_rotation;
    // requestAnimationFrame(function _ro() {
    //     _main_stage.rotation = from_rotation + dif_rotation * i / total;
    //     i += 1;
    //     if (i <= total) {
    //         requestAnimationFrame(_ro);
    //     }
    // });
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
export const renderer = window["R"] = PIXI.autoDetectRenderer(body.clientWidth, body.clientHeight, {
    antialias: true,
    resolution: 1
});
body.appendChild(renderer.view);
export const VIEW = {
    get WIDTH() {
        return _main_stage.rotation % Math.PI ? renderer.view.height : renderer.view.width
    },
    get HEIGHT() {
        return _main_stage.rotation % Math.PI ? renderer.view.width : renderer.view.height
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
export const on = (obj: PIXI.EventEmitter, eventName: string, handle) => {
    obj["interactive"] = true;
    return eventName.split("|").map(en => {
        if (en === "touchenter") {
            return obj.on("touchmove", (e) => {
                console.log(e.target === obj);
                if (e.target === this) {
                    handle(e);
                }
            });
        } else if (en === "touchout") {
            // return obj.on("touchmove", (e) => {
            //     console.log(e.target === this);
            //     if (e.target === this) {
            //         handle(e);
            //     }
            // });
        } else if (en === "keydown" || en === "keyup") {
            document.body.addEventListener(en, function (e) {
                handle(e)
            });
        } else {
            return obj.on(en, handle)
        }
    })
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


export function mix_options(tmp_options, new_options) {
    for (var key in new_options) {
        if (tmp_options.hasOwnProperty(key)) {
            if (tmp_options[key] instanceof Object) {
                mix_options(tmp_options[key], new_options[key])
            } else {
                tmp_options[key] = new_options[key]
            }
        }
    }
}