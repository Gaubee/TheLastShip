const canvas = document.createElement("canvas");
const canvas2 = document.createElement("canvas");
// canvas.style.background = "blue";
// canvas2.style.background = "red";
// setTimeout(function () {
//     document.body.appendChild(canvas);
//     document.body.appendChild(canvas2);
// });
const ctx = canvas.getContext("2d");

function drawImageTo(img: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, img_w: number = 0, img_h: number = 0, is_flip_horizontal: boolean, is_flip_vertical: boolean, can?: HTMLCanvasElement) {
    can || (can = canvas);
    const c_width = can.width = img_w || img.width;
    const c_height = can.height = img_h || img.height;
    const ctx = can.getContext("2d");
    ctx.clearRect(0, 0, c_width, c_height);
    ctx.clearRect(0, 0, c_width, c_height);
    if (is_flip_horizontal || is_flip_vertical) {
        ctx.translate(c_width, 0);
        ctx.scale(is_flip_horizontal ? -1 : 1, is_flip_vertical ? -1 : 1);
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, c_width, c_height);
        ctx.translate(c_width, 0);
        ctx.scale(is_flip_horizontal ? -1 : 1, is_flip_vertical ? -1 : 1);
    } else {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, c_width, c_height);
    }
    return ctx
}

export default function pixelCollision(sprite_a: PIXI.Sprite | PIXI.extras.MovieClip, sprite_b: PIXI.Sprite | PIXI.extras.MovieClip) {
    var bound_a = sprite_a.getBounds();
    var bound_b = sprite_b.getBounds();

    var w1 = bound_a.width;
    var h1 = bound_a.height;
    var x1 = bound_a.x;
    var y1 = bound_a.y;
    
    var w2 = bound_b.width;
    var h2 = bound_b.height;
    var x2 = bound_b.x;
    var y2 = bound_b.y;

    if (isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2)) {
        var img_a = sprite_a.texture.source || sprite_a.texture.baseTexture.source;
        var img_b = sprite_b.texture.source || sprite_b.texture.baseTexture.source;
        // 重叠的矩形区域
        var x, y, w, h;
        x = Math.max(x1, x2);
        y = Math.max(y1, y2);
        // w = Math.min(x1 + w1, w2 + h2) - x;
        w = Math.min(x1 + w1, x2 + w2) - x;
        h = Math.min(y1 + h1, y2 + h2) - y;

    var scale_a = sprite_a.scale
    var scale_b = sprite_b.scale

        var ctx_a = drawImageTo(img_a, w1, h1, scale_a.x < 0, scale_a.y < 0);
        var ctx_b = drawImageTo(img_b, w2, h2, scale_b.x < 0, scale_b.y < 0, canvas2);

        var rgba_a = ctx_a.getImageData(x - x1, y - y1, w, h).data;
        var rgba_b = ctx_b.getImageData(x - x2, y - y2, w, h).data;

        var total = w * h * 4;
        for (var p = 0; p < total; p += 4) {
            if (rgba_a[p + 3] != 0 && rgba_b[p + 3] != 0) {
                return true;
            }
        }
    }
    return false
}

export function isCollisionWithRect(x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number) {
    if (x1 >= x2 && x1 >= x2 + w2) {
        return false;
    } else if (x1 <= x2 && x1 + w1 <= x2) {
        return false;
    } else if (y1 >= y2 && y1 >= y2 + h2) {
        return false;
    } else if (y1 <= y2 && y1 + h1 <= y2) {
        return false;
    }
    return true;
}  