var _eventCompat = function (event) {
    var type = event.type;
    if (type == 'DOMMouseScroll' || type == 'mousewheel') {
        event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
    }
    //alert(event.delta);
    if (event.srcElement && !event.target) {
        event.target = event.srcElement;
    }
    if (!event.preventDefault && event.returnValue !== undefined) {
        event.preventDefault = function () {
            event.returnValue = false;
        };
    }
    /* 
       ......其他一些兼容性处理 */
    return event;
};

export default class MouseWheel {
    constructor(fun, capture?: boolean) {
        _mouseWheel(window, "mousewheel", fun, capture);
    }
}
var _mouseWheel = function (el, type, fn, capture) { };
if (window.addEventListener) {
    _mouseWheel = function (el, type, fn, capture) {
        if (type === "mousewheel" && document["mozHidden"] !== undefined) {
            type = "DOMMouseScroll";
        }
        el.addEventListener(type, function (event) {
            fn.call(this, _eventCompat(event));
        }, capture || false);
    }
} else if (window["attachEvent"]) {

    _mouseWheel = function (el, type, fn, capture) {
        el.attachEvent("on" + type, function (event) {
            event = event || window.event;
            fn.call(el, _eventCompat(event));
        });
    }
}