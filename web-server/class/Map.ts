import TWEEN, {Tween} from "../class/Tween";
import SVGGraphics from "../class/SVGGraphics";
import ZoomBlur from "../class/ZoomBlur";

const log2 = Math["log2"] || function (x) {
    return Math.log(x) / Math.LN2;
};

export function updateRopePoints(rope: PIXI.mesh.Rope, points: PIXI.Point[]) {
    rope.points = points;
    rope.vertices = new Float32Array(points.length * 4);
    rope.uvs = new Float32Array(points.length * 4);
    rope.colors = new Float32Array(points.length * 2);
    rope.indices = new Uint16Array(points.length * 2);
    rope.refresh();
}
export interface MapConfig {
    max_width: number
    max_height: number
    line_width?: number
    base_line_color?: string
    line_color?: string
    line_alpha?: number
}

export default class Map extends PIXI.Container {
    viewzoom: number
    viewcenter: PIXI.Point
    /** 路径绘制的百分比*/
    pathpercent: number = 0
    pathindex: number = -1
    animateTime: number = 1215
    max_width: number = 512
    max_height: number = 512
    private texZoomBlur = new ZoomBlur()
    private _tween = new TWEEN()
    /**存储背景贴图的容器 */
    private _path_img = new PIXI.Container()
    /**存储路线的容器 */
    private _path_line = new PIXI.Container()
    /**存储路线基线的容器 */
    private _base_path_line = new PIXI.Container()
    /** 路径集合*/
    private _paths: {
        center: { x: number, y: number, },
        left_top: { x: number, y: number, },
        width: number,
        height: number,
        line_width: number,
        line_height: number,
        line: PIXI.Point[],
        pixi_img: PIXI.Sprite,
        scale: number,
        zoom: number,
    }[] = []
    private _paths_bounds = {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
        min_zoom: Infinity,
        get width() {
            return this.right - this.left
        },
        get height() {
            return this.bottom - this.top
        }
    }
    /**绘制路径使用strip:PIXI.mesh.Rope所需的Texture */
    private _cache_renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
    private _base_line_texture: PIXI.RenderTexture
    private _line_texture: PIXI.RenderTexture
    private line_color
    private line_width
    private line_alpha
    private base_line_color
    private _cache_line_color
    private _cache_line_width
    private _cache_line_alpha
    private _cache_base_line_color
    /**世界地图背景贴图 */
    private _mapbg: PIXI.extras.TilingSprite
    map_config: MapConfig
    get line_texture() {
        var tex = this._line_texture
        if (!(this._cache_line_color === this.line_color && this._cache_line_width === this.line_width)) {
            var width = this._cache_line_width = this.line_width;
            var color = this._cache_line_color = this.line_color;
            var _cache_renderer = this._cache_renderer;

            var line = SVGGraphics.importFromSVG(`<rect x="0" y="0" width="${_cache_renderer.width}" height="${_cache_renderer.height}" fill="${color}" />`)._graphics;

            tex.width = tex.height = width;
            tex.render(line);
            this._line_texture = tex;
        }
        return tex;
    }
    get base_line_texture() {
        var tex = this._base_line_texture
        if (!(this._cache_base_line_color === this.base_line_color)) {
            var color = this._cache_base_line_color = this.base_line_color;
            var _cache_renderer = this._cache_renderer;

            var line = SVGGraphics.importFromSVG(`<rect x="0" y="0" width="${_cache_renderer.width}" height="${_cache_renderer.height}" fill="${color}" />`)._graphics;

            tex.width = tex.height = 1;
            tex.render(line);
            this._base_line_texture = tex;
        }
        return tex;
    }
    get x() { return this.position.x }
    set x(value) {
        this._mapbg && (this._mapbg.x = -value);
        this.position.x = value;
    }
    get y() { return this.position.y }
    set y(value) {
        this._mapbg && (this._mapbg.y = -value);
        this.position.y = value;
    }
    constructor(paths: any[], map_config: MapConfig, renderer?: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
        super()

        this.base_line_color = map_config.base_line_color || "rgba(202, 0, 0, 0.94)";
        this.line_color = map_config.line_color || this.base_line_color;
        this.line_width = map_config.line_width || 3;
        this.line_alpha = map_config.line_alpha || 0.5;

        this._cache_renderer = renderer;
        this._line_texture = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);
        this._base_line_texture = new PIXI.RenderTexture(renderer, renderer.width, renderer.height);

        this.addChild(this._path_img, this._base_path_line, this._path_line);

        //初始化地图背景层
        this.addPath([
            {
                "src": "https://maps.googleapis.com/maps/api/staticmap?center=-26.461131,0.358972&scale=2&zoom=1&size=512x512&language=zh-CN®ion=CN&maptype=satellite&key=AIzaSyCBKAwqAkAgxVJVvxk4i6XBzOcnyalwl7A",
                "path": "",
                "center": [
                    128.25526933333327,
                    212.70367742458043
                ],
                "width": "512",
                "height": "512",
                "zoom": 1,
                "repeat": true,
            },
        ]);

        this._mapbg = <PIXI.extras.TilingSprite>this._path_img.getChildAt(0);

        this.addPath(paths);

        this.max_width = map_config.max_width;
        this.max_height = map_config.max_height;


        this._tween.start();

        // 初始化，关闭动画
        var _bak_at = this.animateTime;
        this.animateTime = 0;

        this.updateView();

        //初始化完成，开启动画
        this.animateTime = _bak_at;
    }
    addPath(paths: any[]) {
        paths.forEach(path => {
            const center = {
                x: path.center[0],
                y: path.center[1]
            };
            const scale = Math.pow(2, path.zoom);
            /**真实坐标空间的宽 */
            const width = path.width / scale;
            /**真实坐标空间的高 */
            const height = path.height / scale;

            const left_top = {
                x: center.x - width / 2,
                y: center.y - height / 2
            };

            const line_width = path.line_width / scale;
            const line_height = path.line_height / scale;

            /**顶点相对的点的坐标到图像左上角坐标的差值 */
            const bound_width = (width - line_width) / 2 + left_top.x;
            const bound_height = (height - line_height) / 2 + left_top.y;

            const line: PIXI.Point[] = path.path.split(" ").map(point_info => {
                point_info = point_info.split(",");
                var point = new PIXI.Point(
                    parseFloat(point_info[0].replace(/[\M\L]/, '')) / scale + bound_width,
                    parseFloat(point_info[1]) / scale + bound_height
                )
                point["_source_x"] = point.x;
                point["_source_y"] = point.y;
                return point
            });
            // [
            //     [bound_width, bound_height],
            //     [bound_width + line_width, bound_height],
            //     [bound_width + line_width, bound_height + line_height],
            //     [bound_width, bound_height + line_height],
            // ].map((xy) => {
            //     var point = new PIXI.Point(xy[0], xy[1]);
            //     point["_source_x"] = point.x;
            //     point["_source_y"] = point.y;
            //     line.push(point)
            // })

            const paths_bounds = this._paths_bounds;
            paths_bounds.left = Math.min(paths_bounds.left, left_top.x);
            paths_bounds.top = Math.min(paths_bounds.top, left_top.y);
            paths_bounds.right = Math.max(paths_bounds.right, left_top.x + width);
            paths_bounds.bottom = Math.max(paths_bounds.bottom, left_top.y + height);

            paths_bounds.min_zoom = Math.min(paths_bounds.min_zoom, path.zoom);
            const lineStrip = new PIXI.mesh.Rope(this.line_texture, [/*line 默认为空*/]);
            lineStrip.alpha = this.line_alpha;

            const baseLineStrip = new PIXI.mesh.Rope(this.base_line_texture, line);

            if (path.repeat) {
                var bgImage: PIXI.Sprite = PIXI.extras.TilingSprite.fromImage(path.src);
            } else {
                var bgImage = PIXI.Sprite.fromImage(path.src);
            }

            bgImage["zoom_level"] = path.zoom;
            //缩放等级越高放得越后面（高清晰度覆盖低清晰度）
            var _insert_at_index = 0;
            this._path_img.children.some((bgImg, _index) => {
                if (bgImg["zoom_level"] >= path.zoom) {
                    _insert_at_index = _index;
                    return true;
                }
                _insert_at_index = _index + 1;
                return false;
            });

            this._path_img.addChildAt(bgImage, _insert_at_index);
            this._base_path_line.addChild(baseLineStrip);
            this._path_line.addChild(lineStrip);

            this._paths.push({
                center: center,
                left_top: left_top,
                width: width,
                height: height,
                line_width: line_width,
                line_height: line_height,
                line: line,
                pixi_img: bgImage,
                scale: scale,
                zoom: path.zoom
            });
        });
    }
    /**计算出所需的显示结果 */
    updateView(_pathindex?: number, _viewcenter?: PIXI.Point) {//, _viewzoom?: number
        const paths_bounds = this._paths_bounds;
        const viewcenter = this.viewcenter = _viewcenter || new PIXI.Point((paths_bounds.right + paths_bounds.left) / 2, (paths_bounds.top + paths_bounds.bottom) / 2)
        const old_pathindex = this.pathindex;
        const pathindex = this.pathindex = isFinite(_pathindex) ? ~~_pathindex : this.pathindex;
        /**最终显示所需的宽（对应坐标空间的尺度） */
        var viewwidth: number
        /**最终显示所需的高（对应坐标空间的尺度） */
        var viewheight: number
        /**最终显示对应的视图数据 */
        var viewingpath;
        /**视图的左上角顶点坐标 */
        const viewtopleft = new PIXI.Point();

        const max_height = this.max_height;
        const max_width = this.max_width;

        if (viewingpath = this._paths[pathindex]) {//显示某一部分
            viewwidth = viewingpath.width;
            viewheight = viewingpath.height;
            //如果没有指定center，那么使用默认的path-center
            _viewcenter || viewcenter.set(viewingpath.center.x, viewingpath.center.y);
        } else {//pathindex == -1 全局显示
            viewwidth = paths_bounds.width
            viewheight = paths_bounds.height
        }

        var _pt: number;
        var window_proportion = max_width / max_height;
        var view_proportion = viewwidth / viewheight;

        // 对比最终显示的效果与视图窗口效果，得出最佳的显示方式
        if (!viewingpath) {
            if (view_proportion > window_proportion) {// 窄屏模式，横向完全填充，竖向有多余空间
                /**一个单位坐标尺度对应的像素长度 */
                var _pt = max_width / viewwidth
                viewtopleft.x = viewcenter.x - viewwidth / 2;
                viewtopleft.y = viewcenter.y - max_height / 2 / _pt;
            } else {//宽屏模式，竖向完全填充，横向有多余空间
                var _pt = max_height / viewheight
                viewtopleft.y = viewcenter.y - viewheight / 2;
                viewtopleft.x = viewcenter.x - max_width / 2 / _pt;
            }
        } else {
            // console.log(_pt, viewwidth);
            if (view_proportion > window_proportion) {// 窄屏模式，贴图尽可能填充背景（竖向尽可能填充），前提是保证line部分完整的显示
                // 先尝试竖向完全填充，检测line部分横向是否溢出
                _pt = max_height / viewheight;
                if (viewingpath.line_width * _pt > max_width) {//溢出，则无法完全填充竖向
                    var line_width = viewingpath.line_width
                    _pt = max_width / line_width;
                    viewtopleft.x = viewcenter.x - line_width / 2;
                    viewtopleft.y = viewcenter.y - max_height / 2 / _pt;
                } else {//检测正常，计算出viewtopleft
                    viewtopleft.y = viewcenter.y - viewheight / 2;
                    viewtopleft.x = viewcenter.x - viewheight * window_proportion / 2;
                }
            } else {//宽屏模式，贴图尽可能填充背景（横向尽可能填充），前提是保证line部分完整的显示
                // 先尝试横向完全填充，，检测line部分横向是否溢出
                _pt = max_width / viewwidth;
                if (viewingpath.line_height * _pt > max_height) {//溢出，则无法完全填充横向
                    var line_height = viewingpath.line_height
                    _pt = max_height / line_height;
                    viewtopleft.y = viewcenter.y - line_height / 2;
                    viewtopleft.x = viewcenter.x - max_width / 2 / _pt;
                } else {//检测正常，计算出viewtopleft
                    viewtopleft.x = viewcenter.x - viewwidth / 2;
                    viewtopleft.y = viewcenter.y - viewwidth * window_proportion / 2;
                }
            }
        }
        const viewzoom = log2(_pt);
        const viewscale = _pt;
        const animateTime = this.animateTime

        //开始转换空间坐标到视图坐标
        this._paths.forEach((path, index) => {
            path.line.forEach((point: PIXI.Point) => {
                this._tween.Tween(point)
                    .to({
                        x: (point["_source_x"] - viewtopleft.x) * viewscale,
                        y: (point["_source_y"] - viewtopleft.y) * viewscale
                    }, animateTime)
                    .easing(TWEEN.Easing.Quartic.Out)
                    .start();
            });

            var bgImage = <PIXI.Sprite>path.pixi_img;

            //!!!注意：这里动画不是使用线性函数，所以在值越高的情况下，每一帧变动就越大，从而导致一个平面内的地图贴图在动画结束前会有不完全缝合的“裂缝问题”
            // 真实图片可能是高清图，宽高与设定的宽高不是1:1，所以需要手动锁定宽高
            var t = this._tween.Tween(bgImage)
                .to({
                    width: path.width * viewscale,
                    height: path.height * viewscale
                }, animateTime)
                .easing(TWEEN.Easing.Quartic.Out)
                .start();
            if (bgImage instanceof PIXI.extras.TilingSprite) {
                var tileBgImage = <PIXI.extras.TilingSprite>bgImage;
                var tileTex = tileBgImage.texture;
                t.onUpdate(function () {
                    tileBgImage.tileScale.x = this.width / tileTex.width;
                    tileBgImage.tileScale.y = this.height / tileTex.height;
                })
                // 因为Map对象可能进行了位移，从而导致背景跟随反向位移，以确保全屏效果，必须把位移重新算上
                this._tween.Tween(tileBgImage.tilePosition)
                    .to({
                        x: (path.left_top.x - viewtopleft.x) * viewscale - tileBgImage.x,
                        y: (path.left_top.y - viewtopleft.y) * viewscale,// - this.y
                    }, animateTime)
                    .easing(TWEEN.Easing.Quartic.Out)
                    .start();
            } else {
                // 图片不需要完全显示，只需要显示核心路径部分
                this._tween.Tween(bgImage.position)
                    .to({
                        x: (path.left_top.x - viewtopleft.x) * viewscale,
                        y: (path.left_top.y - viewtopleft.y) * viewscale
                    }, animateTime)
                    .easing(TWEEN.Easing.Quartic.Out)
                    .start();
            }


            //绘制基础lineSprite
            var lineSprite = <PIXI.mesh.Rope>this._path_line.children[index];
            if (lineSprite) {
                if (index >= pathindex) {// 清除绘制线条
                    updateRopePoints(lineSprite, []);
                } else {
                    updateRopePoints(lineSprite, path.line);
                }
            }
        });

        // 图片特效
        const texZoomBlur = this.texZoomBlur;
        const path_images = this._path_img;
        path_images.filters = [texZoomBlur];
        var _tp_1 = performance.now();//上一个时间点
        var _tp_2 = null;//当前时间点
        var _v_1 = 0;//前一个值
        // console.log(viewcenter, viewtopleft)
        this._tween.Tween({ p: 0 })
            .to({
                p: 1
            }, animateTime)
            .easing(TWEEN.Easing.Quartic.Out)
            .onUpdate((_v_2) => {
                _tp_2 = performance.now();
                var t = _tp_2 - _tp_1;//花费的时间
                var a = 10 * animateTime * (_v_2 - _v_1) / t;//加速度
                //1-1/log2(x+2)
                var blur = Math.max(1 - 1 / log2(a + 2), 0.01);

                // console.log(a, blur);
                texZoomBlur.blur = blur;

                console.log(path_images.getBounds(), this.getBounds(), max_width, this.x);

                texZoomBlur.center = {
                    x: max_width / 2 + this.x,
                    y: max_height / 2
                };

                _tp_1 = _tp_2;
                _v_1 = _v_2;
            })
            .onComplete(function () {
                path_images.filters = null
            })
            .start()
    }
    updatePathpercent(_pathpercent: number = 0) {
        this.pathpercent = _pathpercent;
        var currentIndex = this.pathindex;
        var path = this._paths[currentIndex];
        var lineStrip: PIXI.mesh.Rope;
        if (path && (lineStrip = <PIXI.mesh.Rope>this._path_line.children[this.pathindex])) {
            var points = path.line.slice(0, _pathpercent * path.line.length);
            updateRopePoints(lineStrip, points);
        }
    }
    update(time?: number) {
        return this._tween.update(time)
    }
}