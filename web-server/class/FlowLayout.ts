export interface FlowStyle {
    float?: string,
    baseline?: string
}
var BaselineHandles = {
    "center": function (childs: PIXI.DisplayObject[]) {
        var max_height = 0;
        var height_list = childs.map(child => {
            var bounds = child.getBounds();
            max_height = Math.max(bounds.height, max_height);
            return bounds.height;
        });
        // console.group("max_height:" + max_height)
        height_list.forEach(function (child_height, i) {
            if (child_height !== max_height) {
                var child = childs[i];
                // console.log(child.y, child.y + (max_height - child_height) / 2)
                child.y += (max_height - child_height) / 2;
            }
        });
        // console.groupEnd()
    },
    "bottom": function (childs: PIXI.DisplayObject[]) {
        var max_height = 0;
        var height_list = childs.map(child => {
            var bounds = child.getBounds();
            max_height = Math.max(bounds.height, max_height);
            return bounds.height;
        });
        // console.group("max_height:" + max_height)
        height_list.forEach(function (child_height, i) {
            if (child_height !== max_height) {
                var child = childs[i];
                // console.log(child.y, child.y + (max_height - child_height) / 2)
                child.y += max_height - child_height;
            }
        });
        // console.groupEnd()
    }
}

var default_flow_style = {};
export default class FlowLayout extends PIXI.Container {
    max_width: number = Infinity
    private _addFlowChildItem(item: PIXI.DisplayObject, flow_style: FlowStyle = {}) {
        item["_flow_style"] = flow_style || default_flow_style;
        this.addChild(item);
    }
    reDrawFlow() {
        var childs = this.children;
        if (childs.length <= 1) {
            return;
        }
        var max_width = isFinite(this.max_width) ? this.max_width : (this.parent && this.parent.width);
        if (!isFinite(max_width) || !max_width) {
            max_width = document.body.clientWidth;
        }
        var pre_item = childs[0];
        var per_style = <FlowStyle>(pre_item["_flow_style"] || default_flow_style);
        var pre_bounds = pre_item.getBounds();
        // pre_item.position.set(0, 0);
        var current_line_width = pre_bounds.width;//当前行累计使用的宽度
        var current_line_childs: PIXI.DisplayObject[] = [pre_item];
        for (var i = 1, len = childs.length; i < len; i += 1) {
            var cur_item = childs[i];
            var cur_style = <FlowStyle>(cur_item["_flow_style"] || default_flow_style);
            var cur_bounds = cur_item.getBounds();

            var _new_line = () => {
                cur_item.x = 0;
                cur_item.y = pre_item.y + pre_bounds.height;
                current_line_width = cur_bounds.width;
                var baselineHandle = BaselineHandles[cur_style.baseline]
                if (baselineHandle instanceof Function) {
                    baselineHandle(current_line_childs);
                }
                current_line_childs = [cur_item]
            }

            if (cur_style.float === "left") {
                if (current_line_width + cur_bounds.width <= max_width) {
                    cur_item.y = pre_item.y
                    cur_item.x = pre_item.x + pre_bounds.width;
                    current_line_width += cur_bounds.width;
                    current_line_childs.push(cur_item);
                } else {// 宽度不够，直接开始下一行
                    _new_line();
                }
            } else if (cur_style.float === "center") {
                if (current_line_width + cur_bounds.width <= max_width) {
                    cur_item.y = pre_item.y;
                    cur_item.x = pre_item.x + (max_width - current_line_width - cur_bounds.width) / 2;
                    current_line_width += cur_bounds.width;
                    current_line_childs.push(cur_item);
                } else {
                    _new_line();
                    cur_item.x = max_width / 2 - cur_bounds.width / 2;
                }
            } else {// 直接开始下一行
                _new_line();
            }

            pre_item = cur_item;
            per_style = cur_style;
            pre_bounds = cur_bounds;
        }
        // 最后一行
        var baselineHandle = BaselineHandles[cur_style.baseline]
        if (baselineHandle instanceof Function) {
            baselineHandle(current_line_childs);
        }
    }
    addChildToFlow(...childs: (PIXI.DisplayObject | FlowStyle)[]) {
        var current_flow_style: FlowStyle;
        childs.forEach(child => {
            if (child instanceof PIXI.DisplayObject) {
                this._addFlowChildItem(child, current_flow_style)
            } else {
                current_flow_style = child
            }
        });
        this.reDrawFlow();
        return childs[0];
    }
    constructor(childs?: PIXI.DisplayObject[] | PIXI.DisplayObject, flow_style?: FlowStyle) {
        super();
        if (childs instanceof Array) {
            childs.forEach(child => this._addFlowChildItem(child, flow_style));
        } else if (childs) {
            this._addFlowChildItem(childs, flow_style);
        }
        this.reDrawFlow();
    }
} 