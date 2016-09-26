import SVGGraphics from "./SVGGraphics";
import MouseWheel from "./MouseWheel";
import TWEEN from "./Tween";
const S_ANI_TIME = 195;
const B_ANI_TIME = 375;

const SCROLL_BAR_BG_COLOR = "rgba(255,255,255,0.3)"
const SCROLL_BAR_COLOR = "rgba(255,255,255,0.8)"
/**滚动栏显示最小需要12px的高度，意味着 */
const SCROLL_BAR_WIDTH = 12;

export interface ScrollAbleConfig {
    width: number;
    height: number;
    content_height?: number;
    show_scroll_bar?: boolean;
    is_horizontal?: boolean;
    is_debug?: boolean;
}
export default class ScrollAbleContainer extends PIXI.Container {
    scroll_config: ScrollAbleConfig
    scroll_bar: PIXI.Graphics
    scroll_handle: PIXI.Container
    /**外层容器，用来保存this以及scroll_bar */
    wrap = new PIXI.Container()
    private ANI = new TWEEN();
    private _update_key: string;
    private speedText = new PIXI.Text("", {
        font: "16px 微软雅黑",
        fill: "#FFF",
    });
    private _max_scroll_top = 0;
    private get _min_scroll_top() {
        return this.scroll_config.height - this.height;
    }
    get progress() {
        return Math.max(Math.min((-this.y - this.scroll_config.height) / this.height, 0), 1);
    }
    constructor(config: ScrollAbleConfig, content?: PIXI.DisplayObject) {
        super();
        this.interactive = true;
        var onScrollStart = this.onScrollStart;
        var onScrollEnd = this.onScrollEnd;
        var onScrollMove = this.onScrollMove;
        this
            // events for drag start
            .on('mousedown', onScrollStart)
            .on('touchstart', onScrollStart)
            // events for drag end
            .on('mouseup', onScrollEnd)
            .on('mouseupoutside', onScrollEnd)
            .on('touchend', onScrollEnd)
            .on('touchendoutside', onScrollEnd)
            // events for drag move
            .on('mousemove', onScrollMove)
            .on('touchmove', onScrollMove);

        new MouseWheel((e) => {
            var mouse_point = new PIXI.Point(0, 0);
            var event = mouseWheelEventToInteractionData(e, this, mouse_point);
            onScrollStart.call(this, event);
            if (e.delta > 0) {// 往上滚
                mouse_point.x = mouse_point.y = 120;
            } else if (e.delta < 0) {// 往下
                mouse_point.x = mouse_point.y = -120;
            }
            onScrollMove.call(this);
            onScrollEnd.call(this);
        });

        /**内容部分的滚动配置 */
        this.ANI.Tween("scroll_content", this.position)
            .easing(TWEEN.Easing.Quartic.Out)
            .onUpdate(() => {
                this.emit("scrolling")
            })
            .onComplete(() => {
                setTimeout(() => this.emit("scrolled"), 0);
            });

        this.on("scrolled", () => {
            // 滚动回弹
            var scroll_top = this.y;
            var scroll_back = null;
            if (scroll_top > 0) {
                scroll_back = 0;
            } else {
                var min_scroll_top = this._min_scroll_top;
                if (scroll_top < min_scroll_top) {
                    scroll_back = min_scroll_top;
                }
            }
            if (scroll_back !== null) {
                this.ANI.Tween("scroll_content")
                    .to({
                        y: scroll_back
                    }, B_ANI_TIME)
                    .start()
            }
            // 滚动条动画
            this.update_scroll_handle()
        });

        this.on("scrolling", () => {
            this.update_scroll_handle()
        });

        this.scroll_config = config;
        this._update_key = config.is_horizontal ? "x" : "y";


        if (content) {
            this.addChild(content);
        }

        this.wrap.addChild(this);

        if (config.is_debug) {
            /**滚动速度显示 */
            this.wrap.addChild(SVGGraphics.importFromSVG(`<rect x=0 y=0 width="${config.width}" height=20 stroke-width="0" fill="rgba(0,0,0,0.8)"/>`)._graphics, this.speedText);
        }

        if (config.show_scroll_bar) {
            this.showScrollBar();
        }

        this.ANI.start();

    }
    /**更新高度，刷新ScrollBar */
    updateHeight() {
        if (this.scroll_bar) {
            this.wrap.removeChild(this.scroll_bar);
            this.scroll_bar = null;
        }
        this.showScrollBar();
    }
    private update_scroll_handle() {
    }
    showScrollBar() {
        var scroll_bar = this.scroll_bar;
        var scorll_bar_width = SCROLL_BAR_WIDTH;
        var scorll_bar_width_SQRT2 = scorll_bar_width * Math.SQRT2;
        var scorll_bar_color = SCROLL_BAR_BG_COLOR;
        var scorll_bar_height = this.scroll_config.height;
        var content_height = this.height;
        if (!content_height || content_height < scorll_bar_height) {
            return
        }
        if (!scroll_bar) {
            var _mid_bar_height = scorll_bar_height - scorll_bar_width;
            scroll_bar = this.scroll_bar = SVGGraphics.importFromSVG(`<path fill="${scorll_bar_color}" stroke-width="0" d="M0 ${scorll_bar_width / 2} C 0 ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${scorll_bar_width / 2}"/><rect x="0" y="${scorll_bar_width / 2}" width=${scorll_bar_width} height=${_mid_bar_height} /><path fill="${scorll_bar_color}" stroke-width="0"  d="M0 ${scorll_bar_width / 2 + _mid_bar_height} C 0 ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_bar_height}, ${scorll_bar_width} ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_bar_height}, ${scorll_bar_width} ${scorll_bar_width / 2 + _mid_bar_height}"/>`)._graphics;
            scroll_bar.alpha = 0;
            scroll_bar.x = this.scroll_config.width - scorll_bar_width;

            var mask = scroll_bar.clone();
            mask.x = scroll_bar.x;
            scroll_bar.mask = mask;

            var scorll_handle_color = SCROLL_BAR_COLOR;
            var _mid_handle_height = _mid_bar_height / content_height * _mid_bar_height;
            var scroll_handle = this.scroll_handle = new PIXI.Container();

            var scroll_handle_top = SVGGraphics.importFromSVG(`<path fill="${scorll_handle_color}" stroke-width="0" d="M0 ${scorll_bar_width / 2} C 0 ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${scorll_bar_width / 2}"/>`)._graphics;
            var scroll_handle_mid = SVGGraphics.importFromSVG(`<rect x="0" y="${scorll_bar_width / 2}" stroke-width="0" width=${scorll_bar_width} height=${_mid_handle_height} fill=${scorll_handle_color} />`)._graphics;
            var scroll_handle_btm = SVGGraphics.importFromSVG(`<path fill="${scorll_handle_color}" stroke-width="0"  d="M0 ${scorll_bar_width / 2 + _mid_handle_height} C 0 ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${scorll_bar_width / 2 + _mid_handle_height}"/>`)._graphics;
            scroll_handle.addChild(scroll_handle_top, scroll_handle_mid, scroll_handle_btm);

            // SVGGraphics.importFromSVG(`<path fill="${scorll_handle_color}" stroke-width="0" d="M0 ${scorll_bar_width / 2} C 0 ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${scorll_bar_width / 2}"/><rect x="0" y="${scorll_bar_width / 2}" width=${scorll_bar_width} height=${_mid_handle_height} /><path fill="${scorll_handle_color}" stroke-width="0"  d="M0 ${scorll_bar_width / 2 + _mid_handle_height} C 0 ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${scorll_bar_width / 2 + _mid_handle_height}"/>`)._graphics;

            this.update_scroll_handle = function () {
                var scroll_top = this.y;
                var res_y = (_mid_bar_height - _mid_handle_height) * (scroll_top / (this.scroll_config.height - this.height));
                if (res_y < -_mid_handle_height) {
                    res_y = -_mid_handle_height;
                } else if (res_y > _mid_bar_height) {
                    res_y = _mid_bar_height
                }
                this.ANI.Tween("scroll_handle_position", scroll_handle.position, true)
                    .to({
                        y: res_y
                    }, B_ANI_TIME)
                    .easing(TWEEN.Easing.Quartic.Out)
                    .start();
            }

            scroll_bar.addChild(scroll_handle);

            this.wrap.addChild(mask);
            this.wrap.addChild(scroll_bar);
        }
        this.ANI.Tween("scroll_bar_alpha", scroll_bar, true)
            .to({
                alpha: this.scroll_config.show_scroll_bar ? 1 : 0
            }, S_ANI_TIME)
            .start();

    }
    appendTo(parent: PIXI.Container) {
        parent.addChild(this.wrap)
    }
    /**更新动画 */
    update(time?: number) {
        this.ANI.update(time);
    }

    private _scroll_point_data: PIXI.interaction.InteractionData
    private _preP: PIXI.Point
    private _scrolling: boolean
    /**加速度的计算需要3个时间点两段速度值 */
    private _t_1
    private _m_a
    private _t_2
    private _m_b
    private _t_3

    private onScrollStart(event: PIXI.interaction.InteractionEvent) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        var data = this._scroll_point_data = event.data;

        this._preP = data.getLocalPosition(this.parent);
        this._scrolling = true;

        this._t_1 = null;
        this._m_a = null;
        this._t_2 = null;
        this._m_b = null;
        this._t_3 = null;

        this.ANI.Tween("scroll_content")
            .stop()
    }
    private onScrollMove() {
        if (this._scrolling) {
            var newPosition = this._scroll_point_data.getLocalPosition(this.parent);
            var prePosition = this._preP;

            var _key = this._update_key;
            /**记录下三个点的时间、位移量数据 */
            this._m_a = this._m_b
            var _current_move = this._m_b = newPosition[_key] - prePosition[_key];
            this._t_1 = this._t_2
            this._t_2 = this._t_3
            this._t_3 = performance.now();
            this[_key] = this[_key] + _current_move;

            this._preP = newPosition;
            this.emit("scrolling")
        }
    }
    private onScrollEnd() {
        this._scrolling = false;
        // set the interaction data to null
        var speedText: PIXI.Text = this.speedText;
        speedText.text = `A:NULL;`;
        if (this._t_1) {//如果有途径3个点，只有触摸模式可以触发这种情况，滚轮无法触发
            var _tt_1 = this._t_2 - this._t_1
            var _tt_2 = this._t_3 - this._t_2
            var _speed_1 = this._m_a / _tt_1;
            var _speed_2 = this._m_b / _tt_2;

            var _S_P = 20;
            /**加速度 */
            var _a = _S_P * (_speed_1 + _speed_2) / (_tt_1 + _tt_2);

            var _abs_a = Math.abs(_a);
            if (_abs_a > 0) {
                var _key = this._update_key;

                var _scroll_speed = _S_P;
                var _scroll_base = Math.pow(_a, 2) * (_a < 0 ? -1 : 1);
                var _scroll_value = _scroll_base * _scroll_speed
                speedText.text = `A:${_a.toFixed(4)};V:${_scroll_value.toFixed(4)}`;

                var res: number = this.position[_key] + _scroll_value;
                var view_height = this.scroll_config.height
                if (res > this._max_scroll_top || res < this._min_scroll_top) {
                    _scroll_value = S_ANI_TIME;
                    var over_v = Math.abs(_scroll_base) / (Math.abs(_scroll_base) + view_height) * view_height
                    if (res < this._min_scroll_top) {
                        res = this._min_scroll_top - over_v
                    } else {
                        res = this._max_scroll_top + over_v
                    }
                    speedText.text += `;O:${over_v.toFixed(4)};OV:${res.toFixed(4)}`;
                }
                this.ANI.Tween("scroll_content")
                    .to({
                        [_key]: res
                    }, Math.abs(_scroll_value))
                    .start()
            }

        }
        this._scroll_point_data = null;
        this.emit("scrolled")
    }
}

function mouseWheelEventToInteractionData(e, target: PIXI.DisplayObject, point: PIXI.Point) {
    var data = new PIXI.interaction.InteractionData();
    data.originalEvent = e;
    data.target = target;
    data.global = point;
    var eventData = {
        stopped: false,
        target: null,
        type: null,
        data: data,
        stopPropagation: function () {
            this.stopped = true;
        }
    };
    return eventData
}