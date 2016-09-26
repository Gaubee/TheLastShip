export default class TextBuilder extends PIXI.Container {
    private _textNode: PIXI.Text
    constructor(text: string, style: any) {
        super();
        var paddingTop = parseFloat(style.paddingTop) || 0;
        var paddingBottom = parseFloat(style.paddingBottom) || 0;
        var paddingLeft = parseFloat(style.paddingLeft) || 0;
        var paddingRight = parseFloat(style.paddingRight) || 0;
        var left = parseFloat(style.left) || 0;
        var top = parseFloat(style.top) || 0;

        if (!style.font) {// 兼容3.0+的处理
            style.font = style.fontSize + "px " + style.fontFamily
        }

        var textNode = this._textNode = new PIXI.Text(text, style);
        var wrapNode = new PIXI.Graphics();
        wrapNode.lineStyle(0);
        wrapNode.drawRect(0, 0, textNode.width + paddingLeft + paddingRight + left, textNode.height + paddingTop + paddingBottom + top);
        wrapNode.alpha = 0;
        this.addChild(wrapNode);
        textNode.x = paddingLeft + left;
        textNode.y = paddingTop + top;
        this.addChild(textNode);
    }
    set text(text: any) {
        this._textNode.text = text;
    }
    get text() {
        return this._textNode.text;
    }
}