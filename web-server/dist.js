var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("app/engine/Collision", ["require", "exports"], function (require, exports) {
    "use strict";
    var uuid = 0;
    // import TWEEN from "../../class/Tween";
    // const Easing = TWEEN.Easing;
    var P2I = (function (_super) {
        __extends(P2I, _super);
        function P2I(world) {
            var _this = this;
            _super.call(this);
            this._id = "ID_" + ((uuid++) / 1000000).toFixed(6).substr(2);
            this.p2_body = new p2.Body({ mass: 1 });
            this.world = null;
            this.config = {
                x: 0,
                y: 0,
                density: 1,
            };
            var self = this;
            this.conName = this.constructor["name"];
            this.world = world;
            world && world.addBody(this.p2_body);
            this.on("add-to-world", function (new_world) {
                new_world.addBody(_this.p2_body);
                _this.world = new_world;
            });
            this.on("destroy", function () {
                _this.world && _this.world.removeBody(_this.p2_body);
                _this.parent && _this.parent.removeChild(_this);
                _this.destroy();
            });
            // 闪动动画
            this.once("flash", function _flash() {
                var acc_delay = 0;
                var dif_alpha = 0.5;
                var flash_ani = 250;
                var flash_time = 3;
                var total_ani = flash_ani * flash_time;
                function _update(delay) {
                    acc_delay += delay;
                    var progress = (acc_delay % flash_ani) / flash_ani;
                    if (progress > 0.5) {
                        progress = 1 - progress;
                    }
                    progress *= 2;
                    // /\/\/\
                    self.alpha = 1 - progress * dif_alpha;
                    if (acc_delay >= total_ani) {
                        self.emit("stop-flash");
                    }
                }
                self.on("update", _update);
                self.once("stop-flash", function () {
                    self.alpha = 1;
                    self.off("update", _update);
                    self.once("flash", _flash);
                });
            });
        }
        P2I.prototype.update = function (delay) {
            var p2_body = this.p2_body;
            var config = this.config;
            this.x = config.x = p2_body.interpolatedPosition[0];
            this.y = config.y = p2_body.interpolatedPosition[1];
            this.emit("update", delay);
        };
        P2I.prototype.changeMass = function (mass) {
            this.p2_body.mass = mass;
            this.p2_body.updateMassProperties();
        };
        P2I.prototype.setConfig = function (new_config) {
            this.p2_body["__changed"] = true;
        };
        P2I.prototype.toJSON = function () {
            return {
                id: this._id,
                type: this["constructor"]["name"],
                config: this.config
            };
        };
        P2I.prototype.setTimeout = function (cb, time) {
            var self = this;
            self.on("update", function _(delay) {
                time -= delay;
                if (time <= 0) {
                    self.off("update", _);
                    cb();
                }
            });
        };
        P2I.material = new p2.Material();
        return P2I;
    }(PIXI.Container));
    exports.P2I = P2I;
});
/*!
MIT License

Copyright (c) 2011 Max Kueng, George Crabtree
 
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define("app/engine/Victor", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * # Victor - A JavaScript 2D vector class with methods for common vector operations
     */
    var Victor = (function () {
        /**
         * Constructor. Will also work without the `new` keyword
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = Victor(42, 1337);
         *
         * @param x Value of the x axis
         * @param y Value of the y axis
         * @return {Victor}
         * @api public
         */
        function Victor(x, y) {
            this.norm = Victor.prototype.normalize;
            this.angle = Victor.prototype.horizontalAngle;
            this.angleDeg = Victor.prototype.horizontalAngleDeg;
            this.direction = Victor.prototype.horizontalAngle;
            this.magnitude = Victor.prototype.length;
            if (!(this instanceof Victor)) {
                return new Victor(x, y);
            }
            /**
             * The X axis
             *
             * ### Examples:
             *     var vec = new Victor.fromArray(42, 21);
             *
             *     vec.x;
             *     // => 42
             *
             * @api public
             */
            this.x = x || 0;
            /**
             * The Y axis
             *
             * ### Examples:
             *     var vec = new Victor.fromArray(42, 21);
             *
             *     vec.y;
             *     // => 21
             *
             * @api public
             */
            this.y = y || 0;
        }
        ;
        /**
         * # Static
         */
        /**
         * Creates a new instance from an array
         *
         * ### Examples:
         *     var vec = Victor.fromArray([42, 21]);
         *
         *     vec.toString();
         *     // => x:42, y:21
         *
         * @param arr Array with the x and y values at index 0 and 1 respectively
         * @name Victor.fromArray
         * @return {Victor} The new instance
         * @api public
         */
        Victor.fromArray = function (arr) {
            return new Victor(arr[0] || 0, arr[1] || 0);
        };
        ;
        /**
         * Creates a new instance from an object
         *
         * ### Examples:
         *     var vec = Victor.fromObject({ x: 42, y: 21 });
         *
         *     vec.toString();
         *     // => x:42, y:21
         *
         * @name Victor.fromObject
         * @param obj Object with the values for x and y
         * @return {Victor} The new instance
         * @api public
         */
        Victor.fromObject = function (obj) {
            return new Victor(obj.x || 0, obj.y || 0);
        };
        ;
        /**
         * # Manipulation
         *
         * These functions are chainable.
         */
        /**
         * Adds another vector's X axis to this one
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.addX(vec2);
         *     vec1.toString();
         *     // => x:30, y:10
         *
         * @param vec The other vector you want to add to this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.addX = function (vec) {
            this.x += vec.x;
            return this;
        };
        ;
        /**
         * Adds another vector's Y axis to this one
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.addY(vec2);
         *     vec1.toString();
         *     // => x:10, y:40
         *
         * @param vec The other vector you want to add to this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.addY = function (vec) {
            this.y += vec.y;
            return this;
        };
        ;
        /**
         * Adds another vector to this one
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.add(vec2);
         *     vec1.toString();
         *     // => x:30, y:40
         *
         * @param vec The other vector you want to add to this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.add = function (vec) {
            this.x += vec.x;
            this.y += vec.y;
            return this;
        };
        ;
        /**
         * Adds the given scalar to both vector axis
         *
         * ### Examples:
         *     var vec = new Victor(1, 2);
         *
         *     vec.addScalar(2);
         *     vec.toString();
         *     // => x: 3, y: 4
         *
         * @param scalar The scalar to add
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.addScalar = function (scalar) {
            this.x += scalar;
            this.y += scalar;
            return this;
        };
        ;
        /**
         * Adds the given scalar to the X axis
         *
         * ### Examples:
         *     var vec = new Victor(1, 2);
         *
         *     vec.addScalarX(2);
         *     vec.toString();
         *     // => x: 3, y: 2
         *
         * @param scalar The scalar to add
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.addScalarX = function (scalar) {
            this.x += scalar;
            return this;
        };
        ;
        /**
         * Adds the given scalar to the Y axis
         *
         * ### Examples:
         *     var vec = new Victor(1, 2);
         *
         *     vec.addScalarY(2);
         *     vec.toString();
         *     // => x: 1, y: 4
         *
         * @param scalar The scalar to add
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.addScalarY = function (scalar) {
            this.y += scalar;
            return this;
        };
        ;
        /**
         * Subtracts the X axis of another vector from this one
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.subtractX(vec2);
         *     vec1.toString();
         *     // => x:80, y:50
         *
         * @param vec The other vector you want subtract from this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtractX = function (vec) {
            this.x -= vec.x;
            return this;
        };
        ;
        /**
         * Subtracts the Y axis of another vector from this one
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.subtractY(vec2);
         *     vec1.toString();
         *     // => x:100, y:20
         *
         * @param vec The other vector you want subtract from this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtractY = function (vec) {
            this.y -= vec.y;
            return this;
        };
        ;
        /**
         * Subtracts another vector from this one
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(20, 30);
         *
         *     vec1.subtract(vec2);
         *     vec1.toString();
         *     // => x:80, y:20
         *
         * @param vec The other vector you want subtract from this one
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtract = function (vec) {
            this.x -= vec.x;
            this.y -= vec.y;
            return this;
        };
        ;
        /**
         * Subtracts the given scalar from both axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 200);
         *
         *     vec.subtractScalar(20);
         *     vec.toString();
         *     // => x: 80, y: 180
         *
         * @param scalar The scalar to subtract
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtractScalar = function (scalar) {
            this.x -= scalar;
            this.y -= scalar;
            return this;
        };
        ;
        /**
         * Subtracts the given scalar from the X axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 200);
         *
         *     vec.subtractScalarX(20);
         *     vec.toString();
         *     // => x: 80, y: 200
         *
         * @param {Number} scalar The scalar to subtract
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtractScalarX = function (scalar) {
            this.x -= scalar;
            return this;
        };
        ;
        /**
         * Subtracts the given scalar from the Y axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 200);
         *
         *     vec.subtractScalarY(20);
         *     vec.toString();
         *     // => x: 100, y: 180
         *
         * @param {Number} scalar The scalar to subtract
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.subtractScalarY = function (scalar) {
            this.y -= scalar;
            return this;
        };
        ;
        /**
         * Divides the X axis by the x component of given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(2, 0);
         *
         *     vec.divideX(vec2);
         *     vec.toString();
         *     // => x:50, y:50
         *
         * @param {Victor} vector The other vector you want divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divideX = function (vector) {
            this.x /= vector.x;
            return this;
        };
        ;
        /**
         * Divides the Y axis by the y component of given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(0, 2);
         *
         *     vec.divideY(vec2);
         *     vec.toString();
         *     // => x:100, y:25
         *
         * @param {Victor} vector The other vector you want divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divideY = function (vector) {
            this.y /= vector.y;
            return this;
        };
        ;
        /**
         * Divides both vector axis by a axis values of given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(2, 2);
         *
         *     vec.divide(vec2);
         *     vec.toString();
         *     // => x:50, y:25
         *
         * @param {Victor} vector The vector to divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divide = function (vector) {
            this.x /= vector.x;
            this.y /= vector.y;
            return this;
        };
        ;
        /**
         * Divides both vector axis by the given scalar value
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.divideScalar(2);
         *     vec.toString();
         *     // => x:50, y:25
         *
         * @param {Number} The scalar to divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divideScalar = function (scalar) {
            if (scalar !== 0) {
                this.x /= scalar;
                this.y /= scalar;
            }
            else {
                this.x = 0;
                this.y = 0;
            }
            return this;
        };
        ;
        /**
         * Divides the X axis by the given scalar value
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.divideScalarX(2);
         *     vec.toString();
         *     // => x:50, y:50
         *
         * @param {Number} The scalar to divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divideScalarX = function (scalar) {
            if (scalar !== 0) {
                this.x /= scalar;
            }
            else {
                this.x = 0;
            }
            return this;
        };
        ;
        /**
         * Divides the Y axis by the given scalar value
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.divideScalarY(2);
         *     vec.toString();
         *     // => x:100, y:25
         *
         * @param {Number} The scalar to divide by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.divideScalarY = function (scalar) {
            if (scalar !== 0) {
                this.y /= scalar;
            }
            else {
                this.y = 0;
            }
            return this;
        };
        ;
        /**
         * Inverts the X axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.invertX();
         *     vec.toString();
         *     // => x:-100, y:50
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.invertX = function () {
            this.x *= -1;
            return this;
        };
        ;
        /**
         * Inverts the Y axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.invertY();
         *     vec.toString();
         *     // => x:100, y:-50
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.invertY = function () {
            this.y *= -1;
            return this;
        };
        ;
        /**
         * Inverts both axis
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.invert();
         *     vec.toString();
         *     // => x:-100, y:-50
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.invert = function () {
            this.invertX();
            this.invertY();
            return this;
        };
        ;
        /**
         * Multiplies the X axis by X component of given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(2, 0);
         *
         *     vec.multiplyX(vec2);
         *     vec.toString();
         *     // => x:200, y:50
         *
         * @param {Victor} vector The vector to multiply the axis with
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiplyX = function (vector) {
            this.x *= vector.x;
            return this;
        };
        ;
        /**
         * Multiplies the Y axis by Y component of given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(0, 2);
         *
         *     vec.multiplyX(vec2);
         *     vec.toString();
         *     // => x:100, y:100
         *
         * @param {Victor} vector The vector to multiply the axis with
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiplyY = function (vector) {
            this.y *= vector.y;
            return this;
        };
        ;
        /**
         * Multiplies both vector axis by values from a given vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     var vec2 = new Victor(2, 2);
         *
         *     vec.multiply(vec2);
         *     vec.toString();
         *     // => x:200, y:100
         *
         * @param {Victor} vector The vector to multiply by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiply = function (vector) {
            this.x *= vector.x;
            this.y *= vector.y;
            return this;
        };
        ;
        /**
         * Multiplies both vector axis by the given scalar value
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.multiplyScalar(2);
         *     vec.toString();
         *     // => x:200, y:100
         *
         * @param {Number} The scalar to multiply by
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiplyScalar = function (scalar) {
            this.x *= scalar;
            this.y *= scalar;
            return this;
        };
        ;
        /**
         * Multiplies the X axis by the given scalar
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.multiplyScalarX(2);
         *     vec.toString();
         *     // => x:200, y:50
         *
         * @param {Number} The scalar to multiply the axis with
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiplyScalarX = function (scalar) {
            this.x *= scalar;
            return this;
        };
        ;
        /**
         * Multiplies the Y axis by the given scalar
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.multiplyScalarY(2);
         *     vec.toString();
         *     // => x:100, y:100
         *
         * @param {Number} The scalar to multiply the axis with
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.multiplyScalarY = function (scalar) {
            this.y *= scalar;
            return this;
        };
        ;
        /**
         * Normalize
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.normalize = function () {
            var length = this.length();
            if (length === 0) {
                this.x = 1;
                this.y = 0;
            }
            else {
                this.divide(new Victor(length, length));
            }
            return this;
        };
        ;
        /**
         * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.limit(80, 0.9);
         *     vec.toString();
         *     // => x:90, y:50
         *
         * @param {Number} max The maximum value for both x and y axis
         * @param {Number} factor Factor by which the axis are to be multiplied with
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.limit = function (max, factor) {
            if (Math.abs(this.x) > max) {
                this.x *= factor;
            }
            if (Math.abs(this.y) > max) {
                this.y *= factor;
            }
            return this;
        };
        ;
        /**
         * Randomizes both vector axis with a value between 2 vectors
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
         *     vec.toString();
         *     // => x:67, y:73
         *
         * @param {Victor} topLeft first vector
         * @param {Victor} bottomRight second vector
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.randomize = function (topLeft, bottomRight) {
            this.randomizeX(topLeft, bottomRight);
            this.randomizeY(topLeft, bottomRight);
            return this;
        };
        ;
        /**
         * Randomizes the y axis with a value between 2 vectors
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
         *     vec.toString();
         *     // => x:55, y:50
         *
         * @param {Victor} topLeft first vector
         * @param {Victor} bottomRight second vector
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.randomizeX = function (topLeft, bottomRight) {
            var min = Math.min(topLeft.x, bottomRight.x);
            var max = Math.max(topLeft.x, bottomRight.x);
            this.x = random(min, max);
            return this;
        };
        ;
        /**
         * Randomizes the y axis with a value between 2 vectors
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
         *     vec.toString();
         *     // => x:100, y:66
         *
         * @param {Victor} topLeft first vector
         * @param {Victor} bottomRight second vector
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.randomizeY = function (topLeft, bottomRight) {
            var min = Math.min(topLeft.y, bottomRight.y);
            var max = Math.max(topLeft.y, bottomRight.y);
            this.y = random(min, max);
            return this;
        };
        ;
        /**
         * Randomly randomizes either axis between 2 vectors
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
         *     vec.toString();
         *     // => x:100, y:77
         *
         * @param {Victor} topLeft first vector
         * @param {Victor} bottomRight second vector
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
            if (!!Math.round(Math.random())) {
                this.randomizeX(topLeft, bottomRight);
            }
            else {
                this.randomizeY(topLeft, bottomRight);
            }
            return this;
        };
        ;
        /**
         * Rounds both axis to an integer value
         *
         * ### Examples:
         *     var vec = new Victor(100.2, 50.9);
         *
         *     vec.unfloat();
         *     vec.toString();
         *     // => x:100, y:51
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.unfloat = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        };
        ;
        /**
         * Rounds both axis to a certain precision
         *
         * ### Examples:
         *     var vec = new Victor(100.2, 50.9);
         *
         *     vec.unfloat();
         *     vec.toString();
         *     // => x:100, y:51
         *
         * @param {Number} Precision (default: 8)
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.toFixed = function (precision) {
            if (typeof precision === 'undefined') {
                precision = 8;
            }
            this.x = parseFloat(this.x.toFixed(precision));
            this.y = parseFloat(this.y.toFixed(precision));
            return this;
        };
        ;
        /**
         * Performs a linear blend / interpolation of the X axis towards another vector
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 100);
         *     var vec2 = new Victor(200, 200);
         *
         *     vec1.mixX(vec2, 0.5);
         *     vec.toString();
         *     // => x:150, y:100
         *
         * @param {Victor} vector The other vector
         * @param {Number} amount The blend amount (optional, default: 0.5)
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.mixX = function (vec, amount) {
            if (typeof amount === 'undefined') {
                amount = 0.5;
            }
            this.x = (1 - amount) * this.x + amount * vec.x;
            return this;
        };
        ;
        /**
         * Performs a linear blend / interpolation of the Y axis towards another vector
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 100);
         *     var vec2 = new Victor(200, 200);
         *
         *     vec1.mixY(vec2, 0.5);
         *     vec.toString();
         *     // => x:100, y:150
         *
         * @param {Victor} vec The other vector
         * @param {Number} amount The blend amount (optional, default: 0.5)
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.mixY = function (vec, amount) {
            if (typeof amount === 'undefined') {
                amount = 0.5;
            }
            this.y = (1 - amount) * this.y + amount * vec.y;
            return this;
        };
        ;
        /**
         * Performs a linear blend / interpolation towards another vector
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 100);
         *     var vec2 = new Victor(200, 200);
         *
         *     vec1.mix(vec2, 0.5);
         *     vec.toString();
         *     // => x:150, y:150
         *
         * @param {Victor} vec The other vector
         * @param {Number} amount The blend amount (optional, default: 0.5)
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.mix = function (vec, amount) {
            this.mixX(vec, amount);
            this.mixY(vec, amount);
            return this;
        };
        ;
        /**
         * # Products
         */
        /**
         * Creates a clone of this vector
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = vec1.clone();
         *
         *     vec2.toString();
         *     // => x:10, y:10
         *
         * @return {Victor} A clone of the vector
         * @api public
         */
        Victor.prototype.clone = function () {
            return new Victor(this.x, this.y);
        };
        ;
        /**
         * Copies another vector's X component in to its own
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 20);
         *     var vec2 = vec1.copyX(vec1);
         *
         *     vec2.toString();
         *     // => x:20, y:10
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.copyX = function (vec) {
            this.x = vec.x;
            return this;
        };
        ;
        /**
         * Copies another vector's Y component in to its own
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 20);
         *     var vec2 = vec1.copyY(vec1);
         *
         *     vec2.toString();
         *     // => x:10, y:20
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.copyY = function (vec) {
            this.y = vec.y;
            return this;
        };
        ;
        /**
         * Copies another vector's X and Y components in to its own
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *     var vec2 = new Victor(20, 20);
         *     var vec2 = vec1.copy(vec1);
         *
         *     vec2.toString();
         *     // => x:20, y:20
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.copy = function (vec) {
            this.copyX(vec);
            this.copyY(vec);
            return this;
        };
        ;
        /**
         * Sets the vector to zero (0,0)
         *
         * ### Examples:
         *     var vec1 = new Victor(10, 10);
         *		 var1.zero();
         *     vec1.toString();
         *     // => x:0, y:0
         *
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.zero = function () {
            this.x = this.y = 0;
            return this;
        };
        ;
        /**
         * Calculates the dot product of this vector and another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.dot(vec2);
         *     // => 23000
         *
         * @param {Victor} vec2 The second vector
         * @return {Number} Dot product
         * @api public
         */
        Victor.prototype.dot = function (vec2) {
            return this.x * vec2.x + this.y * vec2.y;
        };
        ;
        Victor.prototype.cross = function (vec2) {
            return (this.x * vec2.y) - (this.y * vec2.x);
        };
        ;
        /**
         * Projects a vector onto another vector, setting itself to the result.
         *
         * ### Examples:
         *     var vec = new Victor(100, 0);
         *     var vec2 = new Victor(100, 100);
         *
         *     vec.projectOnto(vec2);
         *     vec.toString();
         *     // => x:50, y:50
         *
         * @param {Victor} vec2 The other vector you want to project this vector onto
         * @return {Victor} `this` for chaining capabilities
         * @api public
         */
        Victor.prototype.projectOnto = function (vec2) {
            var coeff = ((this.x * vec2.x) + (this.y * vec2.y)) / ((vec2.x * vec2.x) + (vec2.y * vec2.y));
            this.x = coeff * vec2.x;
            this.y = coeff * vec2.y;
            return this;
        };
        ;
        Victor.prototype.horizontalAngle = function () {
            return Math.atan2(this.y, this.x);
        };
        ;
        Victor.prototype.horizontalAngleDeg = function () {
            return radian2degrees(this.horizontalAngle());
        };
        ;
        Victor.prototype.verticalAngle = function () {
            return Math.atan2(this.x, this.y);
        };
        ;
        Victor.prototype.verticalAngleDeg = function () {
            return radian2degrees(this.verticalAngle());
        };
        ;
        Victor.prototype.rotate = function (angle) {
            var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
            var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));
            this.x = nx;
            this.y = ny;
            return this;
        };
        ;
        Victor.prototype.rotateDeg = function (angle) {
            angle = degrees2radian(angle);
            return this.rotate(angle);
        };
        ;
        Victor.prototype.rotateTo = function (rotation) {
            return this.rotate(rotation - this.angle());
        };
        ;
        Victor.prototype.rotateToDeg = function (rotation) {
            rotation = degrees2radian(rotation);
            return this.rotateTo(rotation);
        };
        ;
        Victor.prototype.rotateBy = function (rotation) {
            var angle = this.angle() + rotation;
            return this.rotate(angle);
        };
        ;
        Victor.prototype.rotateByDeg = function (rotation) {
            rotation = degrees2radian(rotation);
            return this.rotateBy(rotation);
        };
        ;
        /**
         * Calculates the distance of the X axis between this vector and another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.distanceX(vec2);
         *     // => -100
         *
         * @param {Victor} vec The second vector
         * @return {Number} Distance
         * @api public
         */
        Victor.prototype.distanceX = function (vec) {
            return this.x - vec.x;
        };
        ;
        /**
         * Same as `distanceX()` but always returns an absolute number
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.absDistanceX(vec2);
         *     // => 100
         *
         * @param {Victor} vec The second vector
         * @return {Number} Absolute distance
         * @api public
         */
        Victor.prototype.absDistanceX = function (vec) {
            return Math.abs(this.distanceX(vec));
        };
        ;
        /**
         * Calculates the distance of the Y axis between this vector and another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.distanceY(vec2);
         *     // => -10
         *
         * @param {Victor} vec The second vector
         * @return {Number} Distance
         * @api public
         */
        Victor.prototype.distanceY = function (vec) {
            return this.y - vec.y;
        };
        ;
        /**
         * Same as `distanceY()` but always returns an absolute number
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.distanceY(vec2);
         *     // => 10
         *
         * @param {Victor} vec The second vector
         * @return {Number} Absolute distance
         * @api public
         */
        Victor.prototype.absDistanceY = function (vec) {
            return Math.abs(this.distanceY(vec));
        };
        ;
        /**
         * Calculates the euclidean distance between this vector and another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.distance(vec2);
         *     // => 100.4987562112089
         *
         * @param {Victor} vec The second vector
         * @return {Number} Distance
         * @api public
         */
        Victor.prototype.distance = function (vec) {
            return Math.sqrt(this.distanceSq(vec));
        };
        ;
        /**
         * Calculates the squared euclidean distance between this vector and another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(200, 60);
         *
         *     vec1.distanceSq(vec2);
         *     // => 10100
         *
         * @param {Victor} vec The second vector
         * @return {Number} Distance
         * @api public
         */
        Victor.prototype.distanceSq = function (vec) {
            var dx = this.distanceX(vec), dy = this.distanceY(vec);
            return dx * dx + dy * dy;
        };
        ;
        /**
         * Calculates the length or magnitude of the vector
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.length();
         *     // => 111.80339887498948
         *
         * @return {Number} Length / Magnitude
         * @api public
         */
        Victor.prototype.length = function () {
            return Math.sqrt(this.lengthSq());
        };
        ;
        /**
         * Squared length / magnitude
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *
         *     vec.lengthSq();
         *     // => 12500
         *
         * @return {Number} Length / Magnitude
         * @api public
         */
        Victor.prototype.lengthSq = function () {
            return this.x * this.x + this.y * this.y;
        };
        ;
        /**
         * Returns a true if vector is (0, 0)
         *
         * ### Examples:
         *     var vec = new Victor(100, 50);
         *     vec.zero();
         *
         *     // => true
         *
         * @return {Boolean}
         * @api public
         */
        Victor.prototype.isZero = function () {
            return this.x === 0 && this.y === 0;
        };
        ;
        /**
         * Returns a true if this vector is the same as another
         *
         * ### Examples:
         *     var vec1 = new Victor(100, 50);
         *     var vec2 = new Victor(100, 50);
         *     vec1.isEqualTo(vec2);
         *
         *     // => true
         *
         * @return {Boolean}
         * @api public
         */
        Victor.prototype.isEqualTo = function (vec2) {
            return this.x === vec2.x && this.y === vec2.y;
        };
        ;
        /**
         * # Utility Methods
         */
        /**
         * Returns an string representation of the vector
         *
         * ### Examples:
         *     var vec = new Victor(10, 20);
         *
         *     vec.toString();
         *     // => x:10, y:20
         *
         * @return {String}
         * @api public
         */
        Victor.prototype.toString = function () {
            return 'x:' + this.x + ', y:' + this.y;
        };
        ;
        /**
         * Returns an array representation of the vector
         *
         * ### Examples:
         *     var vec = new Victor(10, 20);
         *
         *     vec.toArray();
         *     // => [10, 20]
         *
         * @return {Array}
         * @api public
         */
        Victor.prototype.toArray = function () {
            return [this.x, this.y];
        };
        ;
        /**
         * Returns an object representation of the vector
         *
         * ### Examples:
         *     var vec = new Victor(10, 20);
         *
         *     vec.toObject();
         *     // => { x: 10, y: 20 }
         *
         * @return {Object}
         * @api public
         */
        Victor.prototype.toObject = function () {
            return { x: this.x, y: this.y };
        };
        ;
        /**
         * 在方向不变的情况下改变矢量的长度
         */
        Victor.prototype.setLength = function (amount) {
            var length = this.length();
            var rate = amount / length;
            this.x *= rate;
            this.y *= rate;
        };
        return Victor;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Victor;
    var degrees = 180 / Math.PI;
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    function radian2degrees(rad) {
        return rad * degrees;
    }
    function degrees2radian(deg) {
        return deg / degrees;
    }
});
define("app/const", ["require", "exports"], function (require, exports) {
    "use strict";
    exports._isNode = typeof process === "object";
    exports._isBorwser = !exports._isNode;
    exports._isMobile = this._isMobile;
    var devicePixelRatio = typeof exports._isMobile === "boolean" && exports._isMobile ? 1 : 1;
    var __pt2px = devicePixelRatio * 2;
    exports.pt2px = function (pt) { return pt * __pt2px; };
    exports.L_ANI_TIME = 1225;
    exports.B_ANI_TIME = 375;
    exports.M_ANI_TIME = 225;
    exports.S_ANI_TIME = 195;
    function mix_options(tmp_options, new_options) {
        for (var key in new_options) {
            if (tmp_options.hasOwnProperty(key)) {
                if (tmp_options[key] instanceof Object) {
                    mix_options(tmp_options[key], new_options[key]);
                }
                else {
                    tmp_options[key] = new_options[key];
                }
            }
        }
    }
    exports.mix_options = mix_options;
    function assign(to_obj, from_obj) {
        for (var key in from_obj) {
            if (from_obj.hasOwnProperty(key)) {
                var value = from_obj[key];
                if (value instanceof Object && typeof value !== "function") {
                    assign(to_obj[key] || (to_obj[key] = new value.constructor()), value);
                }
                else {
                    to_obj[key] = value;
                }
            }
        }
        return to_obj;
    }
    exports.assign = assign;
    function transformJSON(JSON_str) {
        var root;
        return JSON.parse(JSON_str, function (s_key, s_value) {
            root || (root = this);
            // 处理key-value的引用继承等关系
            var _a = transformKey(s_key, s_value, root), key = _a.key, value = _a.value;
            // 对配置文件中的数量进行基本的单位换算以及动态运算
            var res = transformValue(value);
            if (key !== s_key) {
                delete this[s_key];
                this[key] = res;
            }
            else {
                return res;
            }
        });
    }
    exports.transformJSON = transformJSON;
    var _EXTEND_KEY_REG = /(.+?)\<EXTENDS\@(.+?)\>/;
    function transformKey(key, value, root) {
        var key_info = key.match(_EXTEND_KEY_REG);
        if (key_info) {
            key = key_info[1];
            var extend_key_list = key_info[2].split(".");
            var extend_value = root;
            extend_key_list.forEach(function (key) {
                extend_value = extend_value[key];
            });
            value = assign(assign({}, extend_value), value);
        }
        return { key: key, value: value };
    }
    exports.transformKey = transformKey;
    function transformValue(value, pre_value) {
        if (typeof value === "string") {
            if (value.indexOf("pt2px!") === 0) {
                return exports.pt2px(+value.substr(6));
            }
            if (value.indexOf("0x") === 0) {
                return parseInt(value, 16);
            }
            if (value.indexOf("PI!") === 0) {
                return Math.PI * (+value.substr(3));
            }
            if (value.indexOf("eval!") === 0) {
                return new Function("info", value.substr(5));
            }
            // 简单表达式模式，需要两数字值
            if (value.indexOf("exp!") === 0) {
                pre_value = parseFloat(pre_value) || 0;
                value = value.substr(4);
                var exp_type = value.charAt(0);
                var nex_value = +value.substr(1);
                if (exp_type === "*") {
                    return pre_value * nex_value;
                }
                if (exp_type === "/") {
                    return pre_value / nex_value;
                }
            }
        }
        return value;
    }
    exports.transformValue = transformValue;
    function transformMix(parent_config, cur_config) {
        return JSON.parse(JSON.stringify(cur_config), function (key, value) {
            if (typeof value === "string" && value.indexOf("mix@") === 0) {
                value = value.substr(4);
                var owner_key = key;
                if (value.charAt(0) === "(") {
                    var value_info = value.match(/\((.+)\)(.+)/);
                    if (value_info) {
                        owner_key = value_info[1];
                        value = value_info[2];
                    }
                }
                if (!parent_config.hasOwnProperty(owner_key)) {
                    throw new SyntaxError("\u5C5E\u6027\uFF1A" + owner_key + " \u4E0D\u53EF\u7528");
                }
                return parseFloat(transformValue(value, parent_config[owner_key]));
            }
            return value;
        });
    }
    exports.transformMix = transformMix;
});
define("app/class/Drawer/ShapeDrawer", ["require", "exports", "app/const"], function (require, exports, const_1) {
    "use strict";
    function ShapeDrawer(self, config, typeInfo) {
        var body = self.body;
        var typeInfoArgs = typeInfo.args || {};
        // 清空原有的绘制与物理设定
        if (self.body_shape) {
            self.p2_body.removeShape(self.body_shape);
            body.clear();
        }
        if (typeInfoArgs.lineStyle instanceof Array) {
            body.lineStyle.apply(body, typeInfoArgs.lineStyle);
        }
        else {
            body.lineStyle(const_1.pt2px(1.5), 0x000000, 1);
        }
        if (isFinite(typeInfoArgs.fill)) {
            body.beginFill(+typeInfoArgs.fill);
        }
        else {
            body.beginFill(config.body_color);
        }
        if (typeInfo.type === "Circle") {
            // 绘制外观形状
            body.drawCircle(config.size, config.size, config.size);
            self.pivot.set(config.size, config.size);
            // 绘制物理形状
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
        }
        else if (typeInfo.type === "Box") {
            // 绘制外观形状
            body.drawRect(0, 0, config.size * 2, config.size * 2);
            self.pivot.set(config.size, config.size);
            // 绘制物理形状
            self.body_shape = new p2.Box({
                width: config.size * 2,
                height: config.size * 2,
            });
        }
        else if (typeInfo.type === "Convex") {
            var vertices = [];
            for (var i = 0, N = typeInfoArgs.vertices_length; i < N; i++) {
                var a = 2 * Math.PI / N * i;
                var vertex = [config.size * Math.cos(a), config.size * Math.sin(a)]; // Note: vertices are added counter-clockwise
                vertices.push(vertex);
            }
            // 绘制外观形状
            var first_item = vertices[0];
            body.moveTo(first_item[0], first_item[1]);
            for (var i = 1, item = void 0; item = vertices[i]; i += 1) {
                body.lineTo(item[0], item[1]);
            }
            body.lineTo(first_item[0], first_item[1]);
            // 绘制物理形状
            self.body_shape = new p2.Convex({
                vertices: vertices
            });
        }
        // 收尾外观绘制
        body.endFill();
        self.addChild(body);
        // 收尾物理设定
        self.body_shape.material = self.constructor.material;
        self.p2_body.addShape(self.body_shape);
        self.p2_body.setDensity(config.density);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ShapeDrawer;
});
define("app/class/Drawer/GunDrawer", ["require", "exports", "app/const", "app/engine/Victor"], function (require, exports, const_2, Victor_1) {
    "use strict";
    function GunDrawer(self, config, typeInfo) {
        var ship = self.owner;
        var body = self.gun;
        body.clear();
        var typeInfoArgs = typeInfo.args || {};
        var lineStyle = typeInfoArgs.lineStyle;
        if (!(lineStyle instanceof Array)) {
            lineStyle = [const_2.pt2px(1.5), 0x000000, 1];
        }
        var fill = typeInfoArgs.fill;
        if (!isFinite(typeInfoArgs.fill)) {
            fill = 0x999999;
        }
        body.lineStyle.apply(body, lineStyle);
        body.beginFill(fill);
        // 绘制外观形状
        if (typeInfo.type === "rect") {
            var gun_height = typeInfoArgs.height;
            var gun_width = typeInfoArgs.width;
            body.drawRect(0, 0, gun_width, gun_height);
            var dir = new Victor_1.default(ship.config.size, 0);
            var offset = new Victor_1.default(isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0, isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);
            self.pivot.set(0, gun_height / 2);
            self.rotation = config.rotation;
            dir.rotate(config.rotation);
            offset.rotate(config.rotation);
            self.x = dir.x + offset.x + ship.config.size;
            self.y = dir.y + offset.y + ship.config.size;
        }
        else if (typeInfo.type === "trapezoid") {
            var gun_height = typeInfoArgs.height;
            var gun_width = typeInfoArgs.width;
            var gun_end_height = typeInfoArgs.endHeight;
            var gun_dif_height = (gun_height - gun_end_height) / 2;
            body.drawPolygon([
                0, 0,
                gun_width, gun_dif_height,
                gun_width, gun_dif_height + gun_end_height,
                0, gun_height
            ]);
            var dir = new Victor_1.default(ship.config.size, 0);
            var offset = new Victor_1.default(isFinite(typeInfoArgs.x) ? +typeInfoArgs.x : 0, isFinite(typeInfoArgs.y) ? +typeInfoArgs.y : 0);
            self.pivot.set(0, gun_height / 2);
            self.rotation = config.rotation;
            dir.rotate(config.rotation);
            offset.rotate(config.rotation);
            self.x = dir.x + offset.x + ship.config.size;
            self.y = dir.y + offset.y + ship.config.size;
        }
        else if (typeInfo.type === "circle+rect") {
            var rect_width = typeInfoArgs.rect_width;
            var rect_height = typeInfoArgs.rect_height;
            var rect_x = typeInfoArgs.rect_x;
            var rect_y = typeInfoArgs.rect_y;
            var circle_radius = typeInfoArgs.circle_radius;
            var circle_x = typeInfoArgs.circle_x;
            var circle_y = typeInfoArgs.circle_y;
            var circle_config_rotation = typeInfoArgs.circle_config_rotation;
            var circle_dir = new Victor_1.default(ship.config.size, 0);
            var circle_offset = new Victor_1.default(circle_x, circle_y);
            circle_dir.rotate(circle_config_rotation);
            circle_offset.rotate(circle_config_rotation);
            if (!body["__gun_helper"]) {
                body["__gun_helper"] = new PIXI.Graphics();
                // 紧跟body下面
                ship.addChildAt(body["__gun_helper"], ship.children.indexOf(ship.body));
                body.on("destroy", function () {
                    ship.removeChild(body["__gun_helper"]);
                    body["__gun_helper"].destroy();
                });
            }
            var ship_gun_helper = body["__gun_helper"];
            ship_gun_helper.clear();
            ship_gun_helper.lineStyle.apply(ship_gun_helper, lineStyle);
            ship_gun_helper.beginFill(fill);
            ship_gun_helper.drawCircle(0, 0, circle_radius);
            ship_gun_helper.endFill();
            ship_gun_helper.x = circle_dir.x + circle_offset.x + ship.config.size;
            ship_gun_helper.y = circle_dir.y + circle_offset.y + ship.config.size;
            body.drawRect(0, 0, rect_width, rect_height);
            var rect_dir = new Victor_1.default(ship.config.size, 0);
            var rect_offset = new Victor_1.default(rect_x, rect_y);
            rect_dir.rotate(config.rotation);
            rect_offset.rotate(config.rotation);
            body.pivot.set(0, rect_height / 2);
            self.rotation = config.rotation;
            self.x = rect_dir.x + rect_offset.x + ship.config.size;
            self.y = rect_dir.y + rect_offset.y + ship.config.size;
            setInterval(function () {
                self.setConfig({
                    rotation: self.config.rotation + Math.PI * 0.001
                });
            });
        }
        else if (typeInfo.type === "rect+trapezoid") {
            var rect_x = typeInfoArgs.rect_x;
            var rect_y = typeInfoArgs.rect_y;
            var rect_width = typeInfoArgs.rect_width;
            var rect_height = typeInfoArgs.rect_height;
            var trapezoid_width = typeInfoArgs.trapezoid_width;
            var trapezoid_endHeight = typeInfoArgs.trapezoid_endHeight;
            var trapezoid_dif_height = (rect_height - trapezoid_endHeight) / 2;
            body.drawPolygon([
                0, 0,
                rect_width, 0,
                rect_width + trapezoid_width, trapezoid_dif_height,
                rect_width + trapezoid_width, trapezoid_dif_height + trapezoid_endHeight,
                rect_width, rect_height,
                0, rect_height
            ]);
            body.pivot.set(0, rect_height / 2);
            var rect_dir = new Victor_1.default(ship.config.size, 0);
            var rect_offset = new Victor_1.default(rect_x, rect_y);
            rect_dir.rotate(config.rotation);
            rect_offset.rotate(config.rotation);
            self.rotation = config.rotation;
            self.x = rect_dir.x + rect_offset.x + ship.config.size;
            self.y = rect_dir.y + rect_offset.y + ship.config.size;
        }
        // 收尾外观绘制
        body.endFill();
        self.addChild(body);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GunDrawer;
});
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
define("class/Tween", ["require", "exports"], function (require, exports) {
    "use strict";
    var Easing = {
        Linear: {
            None: function (k) {
                return k;
            }
        },
        Quadratic: {
            In: function (k) {
                return k * k;
            },
            Out: function (k) {
                return k * (2 - k);
            },
            InOut: function (k) {
                if ((k *= 2) < 1) {
                    return 0.5 * k * k;
                }
                return -0.5 * (--k * (k - 2) - 1);
            }
        },
        Cubic: {
            In: function (k) {
                return k * k * k;
            },
            Out: function (k) {
                return --k * k * k + 1;
            },
            InOut: function (k) {
                if ((k *= 2) < 1) {
                    return 0.5 * k * k * k;
                }
                return 0.5 * ((k -= 2) * k * k + 2);
            }
        },
        Quartic: {
            In: function (k) {
                return k * k * k * k;
            },
            Out: function (k) {
                return 1 - (--k * k * k * k);
            },
            InOut: function (k) {
                if ((k *= 2) < 1) {
                    return 0.5 * k * k * k * k;
                }
                return -0.5 * ((k -= 2) * k * k * k - 2);
            }
        },
        Quintic: {
            In: function (k) {
                return k * k * k * k * k;
            },
            Out: function (k) {
                return --k * k * k * k * k + 1;
            },
            InOut: function (k) {
                if ((k *= 2) < 1) {
                    return 0.5 * k * k * k * k * k;
                }
                return 0.5 * ((k -= 2) * k * k * k * k + 2);
            }
        },
        Sinusoidal: {
            In: function (k) {
                return 1 - Math.cos(k * Math.PI / 2);
            },
            Out: function (k) {
                return Math.sin(k * Math.PI / 2);
            },
            InOut: function (k) {
                return 0.5 * (1 - Math.cos(Math.PI * k));
            }
        },
        Exponential: {
            In: function (k) {
                return k === 0 ? 0 : Math.pow(1024, k - 1);
            },
            Out: function (k) {
                return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
            },
            InOut: function (k) {
                if (k === 0) {
                    return 0;
                }
                if (k === 1) {
                    return 1;
                }
                if ((k *= 2) < 1) {
                    return 0.5 * Math.pow(1024, k - 1);
                }
                return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
            }
        },
        Circular: {
            In: function (k) {
                return 1 - Math.sqrt(1 - k * k);
            },
            Out: function (k) {
                return Math.sqrt(1 - (--k * k));
            },
            InOut: function (k) {
                if ((k *= 2) < 1) {
                    return -0.5 * (Math.sqrt(1 - k * k) - 1);
                }
                return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
            }
        },
        Elastic: {
            In: function (k) {
                var s;
                var a = 0.1;
                var p = 0.4;
                if (k === 0) {
                    return 0;
                }
                if (k === 1) {
                    return 1;
                }
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                }
                else {
                    s = p * Math.asin(1 / a) / (2 * Math.PI);
                }
                return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            },
            Out: function (k) {
                var s;
                var a = 0.1;
                var p = 0.4;
                if (k === 0) {
                    return 0;
                }
                if (k === 1) {
                    return 1;
                }
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                }
                else {
                    s = p * Math.asin(1 / a) / (2 * Math.PI);
                }
                return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
            },
            InOut: function (k) {
                var s;
                var a = 0.1;
                var p = 0.4;
                if (k === 0) {
                    return 0;
                }
                if (k === 1) {
                    return 1;
                }
                if (!a || a < 1) {
                    a = 1;
                    s = p / 4;
                }
                else {
                    s = p * Math.asin(1 / a) / (2 * Math.PI);
                }
                if ((k *= 2) < 1) {
                    return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
                }
                return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
            }
        },
        Back: {
            In: function (k) {
                var s = 1.70158;
                return k * k * ((s + 1) * k - s);
            },
            Out: function (k) {
                var s = 1.70158;
                return --k * k * ((s + 1) * k + s) + 1;
            },
            InOut: function (k) {
                var s = 1.70158 * 1.525;
                if ((k *= 2) < 1) {
                    return 0.5 * (k * k * ((s + 1) * k - s));
                }
                return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
            }
        },
        Bounce: {
            In: function (k) {
                return 1 - TWEEN.Easing.Bounce.Out(1 - k);
            },
            Out: function (k) {
                if (k < (1 / 2.75)) {
                    return 7.5625 * k * k;
                }
                else if (k < (2 / 2.75)) {
                    return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
                }
                else if (k < (2.5 / 2.75)) {
                    return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
                }
                else {
                    return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
                }
            },
            InOut: function (k) {
                if (k < 0.5) {
                    return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
                }
                return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
            }
        }
    };
    var Interpolation = {
        Linear: function (v, k) {
            var m = v.length - 1;
            var f = m * k;
            var i = Math.floor(f);
            var fn = TWEEN.Interpolation.Utils.Linear;
            if (k < 0) {
                return fn(v[0], v[1], f);
            }
            if (k > 1) {
                return fn(v[m], v[m - 1], m - f);
            }
            return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
        },
        Bezier: function (v, k) {
            var b = 0;
            var n = v.length - 1;
            var pw = Math.pow;
            var bn = TWEEN.Interpolation.Utils.Bernstein;
            for (var i = 0; i <= n; i++) {
                b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
            }
            return b;
        },
        CatmullRom: function (v, k) {
            var m = v.length - 1;
            var f = m * k;
            var i = Math.floor(f);
            var fn = TWEEN.Interpolation.Utils.CatmullRom;
            if (v[0] === v[m]) {
                if (k < 0) {
                    i = Math.floor(f = m * (1 + k));
                }
                return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
            }
            else {
                if (k < 0) {
                    return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
                }
                if (k > 1) {
                    return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
                }
                return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
            }
        },
        Utils: {
            Linear: function (p0, p1, t) {
                return (p1 - p0) * t + p0;
            },
            Bernstein: function (n, i) {
                var fc = TWEEN.Interpolation.Utils.Factorial;
                return fc(n) / fc(i) / fc(n - i);
            },
            Factorial: (function () {
                var a = [1];
                return function (n) {
                    var s = 1;
                    if (a[n]) {
                        return a[n];
                    }
                    for (var i = n; i > 1; i--) {
                        s *= i;
                    }
                    a[n] = s;
                    return s;
                };
            })(),
            CatmullRom: function (p0, p1, p2, p3, t) {
                var v0 = (p2 - p0) * 0.5;
                var v1 = (p3 - p1) * 0.5;
                var t2 = t * t;
                var t3 = t * t2;
                return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
            }
        }
    };
    var Tween = (function () {
        function Tween(t, object) {
            this._valuesStart = {};
            this._valuesEnd = {};
            this._valuesStartRepeat = {};
            this._duration = 1000;
            this._repeat = 0;
            this._yoyo = false;
            this._isPlaying = false;
            this._reversed = false;
            this._delayTime = 0;
            this._easingFunction = TWEEN.Easing.Linear.None;
            this._interpolationFunction /*(v: number, k: number): number*/ = TWEEN.Interpolation.Linear;
            this._chainedTweens = [];
            this._siblingTweens = [];
            this._onStartCallback = null;
            this._onStartCallbackFired = null;
            this._onUpdateCallback = null;
            this._onCompleteCallback = null;
            this._onStopCallback = null;
            this._debug = false;
            this._t = t;
            this._object = object;
            var _valuesStart = this._valuesStart;
            for (var field in object) {
                try {
                    _valuesStart[field] = parseFloat(object[field]);
                }
                catch (e) { }
            }
            t.addToWait(this);
        }
        Tween.prototype.set = function (properties) {
            var _valuesStart = this._valuesStart;
            var object = this._object;
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    _valuesStart[key] = object[key] = properties[key];
                }
            }
            return this;
        };
        Tween.prototype.to = function (properties, duration) {
            if (duration !== undefined) {
                this._duration = duration;
            }
            var _valuesEnd = this._valuesEnd = properties;
            var _valuesStart = this._valuesStart;
            var object = this._object;
            for (var key in _valuesEnd) {
                if (!_valuesStart.hasOwnProperty(key)) {
                    _valuesStart[key] = parseFloat(object[key]);
                }
            }
            return this;
        };
        Tween.prototype.start = function (time) {
            this._t.add(this);
            this._isPlaying = true;
            this._onStartCallbackFired = false;
            this._startTime = time !== undefined ? time : performance.now();
            this._startTime += this._delayTime;
            var _valuesEnd = this._valuesEnd;
            var _object = this._object;
            var _valuesStart = this._valuesStart;
            var _valuesStartRepeat = this._valuesStartRepeat;
            var _siblingTweens = this._siblingTweens;
            for (var property in _valuesEnd) {
                // Check if an Array was provided as property value
                if (_valuesEnd[property] instanceof Array) {
                    if (_valuesEnd[property].length === 0) {
                        continue;
                    }
                    // Create a local copy of the Array with the start value at the front
                    _valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);
                }
                // If `to()` specifies a property that doesn't exist in the source object,
                // we should not set that property in the object
                if (_valuesStart[property] === undefined) {
                    continue;
                }
                _valuesStart[property] = _object[property];
                if ((_valuesStart[property] instanceof Array) === false) {
                    _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                }
                _valuesStartRepeat[property] = _valuesStart[property] || 0;
            }
            for (var i = 0, len = _siblingTweens.length; i < len; i++) {
                _siblingTweens[i].start(time);
            }
            return this;
        };
        Tween.prototype.stop = function () {
            if (!this._isPlaying) {
                return this;
            }
            this._t.remove(this);
            this._isPlaying = false;
            if (this._onStopCallback !== null) {
                this._onStopCallback.call(this._object);
            }
            this.stopChainedTweens();
            var _siblingTweens = this._siblingTweens;
            for (var i = 0, len = _siblingTweens.length; i < len; i++) {
                _siblingTweens[i].stop();
            }
            return this;
        };
        ;
        Tween.prototype.stopChainedTweens = function () {
            var _chainedTweens = this._chainedTweens;
            for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
                _chainedTweens[i].stop();
            }
        };
        ;
        Tween.prototype.delay = function (amount) {
            this._delayTime = amount;
            return this;
        };
        Tween.prototype.repeat = function (times) {
            this._repeat = times;
            return this;
        };
        ;
        Tween.prototype.yoyo = function (yoyo) {
            this._yoyo = yoyo;
            return this;
        };
        ;
        Tween.prototype.easing = function (easing) {
            this._easingFunction = easing;
            return this;
        };
        ;
        Tween.prototype.interpolation = function (interpolation) {
            this._interpolationFunction = interpolation;
            return this;
        };
        ;
        Tween.prototype.chain = function () {
            var tweens = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tweens[_i - 0] = arguments[_i];
            }
            this._chainedTweens = Array.prototype.slice.call(arguments);
            return this;
        };
        ;
        Tween.prototype.with = function () {
            var tweens = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                tweens[_i - 0] = arguments[_i];
            }
            this._siblingTweens = tweens.slice();
            return this;
        };
        ;
        Tween.prototype.onStart = function (callback) {
            this._onStartCallback = callback;
            return this;
        };
        ;
        Tween.prototype.onUpdate = function (callback) {
            this._onUpdateCallback = callback;
            return this;
        };
        ;
        Tween.prototype.onComplete = function (callback) {
            this._onCompleteCallback = callback;
            return this;
        };
        ;
        Tween.prototype.onStop = function (callback) {
            this._onStopCallback = callback;
            return this;
        };
        ;
        Tween.prototype.debug = function (debug) {
            this._debug = debug;
            return this;
        };
        ;
        Tween.prototype.update = function (time) {
            var property;
            var elapsed;
            var value;
            if (time < this._startTime) {
                return true;
            }
            if (this._debug) {
                debugger;
            }
            var _object = this._object;
            var _valuesEnd = this._valuesEnd;
            var _valuesStart = this._valuesStart;
            var _duration = this._duration;
            var _easingFunction = this._easingFunction;
            var _interpolationFunction = this._interpolationFunction;
            var _onUpdateCallback = this._onUpdateCallback;
            var _valuesStartRepeat = this._valuesStartRepeat;
            var _onCompleteCallback = this._onCompleteCallback;
            var _chainedTweens = this._chainedTweens;
            if (this._onStartCallbackFired === false) {
                if (this._onStartCallback !== null) {
                    this._onStartCallback.call(_object);
                }
                this._onStartCallbackFired = true;
            }
            elapsed = (time - this._startTime) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;
            value = _easingFunction(elapsed);
            for (property in _valuesEnd) {
                // Don't update properties that do not exist in the source object
                if (_valuesStart[property] === undefined) {
                    continue;
                }
                var start = _valuesStart[property] || 0;
                var end = _valuesEnd[property];
                if (end instanceof Array) {
                    _object[property] = _interpolationFunction(end, value);
                }
                else {
                    // Parses relative end values with start as base (e.g.: +10, -3)
                    if (typeof end === 'string') {
                        if (end.indexOf('+') === 0 || end.indexOf('-') === 0) {
                            end = start + parseFloat(end);
                        }
                        else {
                            end = parseFloat(end);
                        }
                    }
                    // Protect against non numeric properties.
                    if (typeof (end) === 'number') {
                        _object[property] = start + (end - start) * value;
                    }
                }
            }
            if (_onUpdateCallback !== null) {
                _onUpdateCallback.call(_object, value);
            }
            if (elapsed === 1) {
                if (this._repeat > 0) {
                    if (isFinite(this._repeat)) {
                        this._repeat--;
                    }
                    // Reassign starting values, restart by making startTime = now
                    for (property in _valuesStartRepeat) {
                        if (typeof (_valuesEnd[property]) === 'string') {
                            _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
                        }
                        if (this._yoyo) {
                            var tmp = _valuesStartRepeat[property];
                            _valuesStartRepeat[property] = _valuesEnd[property];
                            _valuesEnd[property] = tmp;
                        }
                        _valuesStart[property] = _valuesStartRepeat[property];
                    }
                    if (this._yoyo) {
                        this._reversed = !this._reversed;
                    }
                    this._startTime = time + this._delayTime;
                    return true;
                }
                else {
                    if (_onCompleteCallback !== null) {
                        _onCompleteCallback.call(_object);
                    }
                    for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
                        // Make the chained tweens start exactly at the time they should,
                        // even if the `update()` method was called way past the duration of the tween
                        _chainedTweens[i].start(this._startTime + _duration);
                    }
                    return false;
                }
            }
            return true;
        };
        ;
        return Tween;
    }());
    exports.Tween = Tween;
    var TWEEN = (function () {
        function TWEEN() {
            this._wait_tweens = [];
            this._tweens = [];
            this._is_stop = false;
            this._is_lock = false;
            this._map = {};
        }
        TWEEN.prototype.getAll = function () {
            return this._tweens;
        };
        TWEEN.prototype.removeAll = function () {
            this._tweens = [];
        };
        TWEEN.prototype.add = function (tween) {
            if (this._is_lock) {
                return;
            }
            if (this._tweens.indexOf(tween) === -1) {
                this._tweens.push(tween);
            }
        };
        TWEEN.prototype.addToWait = function (tween) {
            this._wait_tweens.push(tween);
        };
        TWEEN.prototype.remove = function (tween) {
            var i = this._tweens.indexOf(tween);
            if (i !== -1) {
                this._tweens.splice(i, 1);
            }
        };
        TWEEN.prototype.clear = function (id) {
            if (id) {
                var map = this._map;
                var remover_tween = map.hasOwnProperty(id) && map[id];
                if (remover_tween) {
                    remover_tween.stop();
                    this.remove(remover_tween);
                    delete map[id];
                }
            }
            else {
                var _tweens = this._tweens.slice();
                for (var i = 0, len = _tweens.length; i < len; i += 1) {
                    _tweens[i].stop();
                }
            }
        };
        TWEEN.prototype.update = function (time) {
            if (this._is_stop) {
                return false;
            }
            if (this._tweens.length === 0) {
                return false;
            }
            var i = 0;
            time = time !== undefined ? time : performance.now();
            while (i < this._tweens.length) {
                if (this._tweens[i].update(time)) {
                    i++;
                }
                else {
                    this._tweens.splice(i, 1);
                }
            }
            return true;
        };
        /** 开始当前队列中的动画 */
        TWEEN.prototype.start = function () {
            this._wait_tweens.forEach(function (tween) {
                tween.start();
            });
            this._wait_tweens = [];
        };
        /** 停止当前动画 */
        TWEEN.prototype.stop = function (is_stop) {
            return this._is_stop = is_stop;
        };
        /** 停止新动画的添加，但不停止当前动画 */
        TWEEN.prototype.lock = function (is_lock) {
            return this._is_lock = is_lock;
        };
        TWEEN.prototype.Tween = function (id_or_obj, obj, is_cover) {
            if (obj || typeof id_or_obj === "string") {
                var map = this._map;
                if (map.hasOwnProperty(id_or_obj)) {
                    var res = map[id_or_obj];
                    if (!(is_cover && res._object !== obj)) {
                        return res;
                    }
                }
                return map[id_or_obj] = new Tween(this, obj);
            }
            return new Tween(this, id_or_obj);
        };
        TWEEN.prototype.isAnimatting = function (obj) {
            return this._tweens.some(function (tween) {
                return tween._object === obj;
            });
        };
        TWEEN.Easing = Easing;
        TWEEN.Interpolation = Interpolation;
        TWEEN.Tween = Tween;
        return TWEEN;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TWEEN;
    ;
});
define("app/class/Gun", ["require", "exports", "app/engine/Collision", "app/class/Drawer/GunDrawer", "app/engine/Victor", "app/class/Bullet", "class/Tween", "app/const", "./gunShape.json"], function (require, exports, Collision_1, GunDrawer_1, Victor_2, Bullet_1, Tween_1, const_3, gunShape) {
    "use strict";
    var Easing = Tween_1.default.Easing;
    if (const_3._isNode) {
        Object.assign(gunShape, const_3.transformJSON(JSON.stringify(gunShape)));
    }
    var Gun = (function (_super) {
        __extends(Gun, _super);
        function Gun(new_config, owner) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            this.owner = null;
            this.gun = new PIXI.Graphics();
            this.config = {
                rotation: 0,
                //战斗相关的状态
                is_firing: false,
                ison_BTAR: false,
                BTAR_rate: 0.5,
                delay: 0,
                // 战斗相关的属性
                bullet_size: const_3.pt2px(5),
                bullet_density: const_3.pt2px(1),
                bullet_force: 1,
                bullet_damage: 1,
                bullet_penetrate: 1,
                overload_speed: 1,
                // 枪基本形状
                type: "NONE"
            };
            this._is_waiting_delay = false;
            var self = this;
            self.owner = owner;
            // const config = self.config;
            self.setConfig(new_config, !!owner);
            if (owner) {
                owner.guns.push(self);
                owner.addChildAt(self, 0);
            }
            // if (_isBorwser) {
            // 	self.gun.cacheAsBitmap = true;
            // }
            // 攻速限制
            (function () {
                var acc_overload_time = 0;
                self.once("fire_start", function _fire_start() {
                    var config = self.config;
                    var before_the_attack_roll_ani = config.BTAR_rate;
                    config.is_firing = true;
                    config.ison_BTAR = true;
                    // 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
                    // 射击钱摇枪管不可转向。 = true;
                    var overload_ani = 1000 / config.overload_speed;
                    var _update = function (delay) {
                        acc_overload_time += delay;
                        if (acc_overload_time >= overload_ani * before_the_attack_roll_ani) {
                            config.ison_BTAR = false;
                            if (acc_overload_time >= overload_ani) {
                                self.emit("fire_end");
                                acc_overload_time -= overload_ani;
                            }
                            var config_delay = config.delay > 1 ? config.delay : config.delay * 1000 / config.overload_speed;
                            if (acc_overload_time >= overload_ani - config_delay) {
                                config.is_firing = false;
                            }
                        }
                    };
                    self.on("update", _update);
                    self.once("fire_end", function () {
                        config.is_firing = false;
                        self.off("update", _update);
                        self.once("fire_start", _fire_start);
                    });
                    // 浏览器端要加动画
                    if (const_3._isBorwser) {
                        self.emit("fire_ani");
                    }
                });
                // 射击相关的动画，不加锁，但可以取消（暂时没有想到取消前腰会有什么隐患，所以目前做成可以直接取消）
                // 射击钱摇枪管不可转向。
                self.on("fire_ani", function _fire_ani() {
                    self.emit("cancel_fire_ani");
                    var config = self.config;
                    var before_the_attack_roll_ani = config.BTAR_rate;
                    var acc_fire_time = 0;
                    var overload_ani = 1000 / config.overload_speed;
                    var from_gun_x = self.x;
                    var from_gun_y = self.y;
                    var dif_gun_x = -self.width * 0.2;
                    var dif_gun_y = 0;
                    if (config.rotation) {
                        var dir_vic = new Victor_2.default(dif_gun_x, dif_gun_y);
                        dir_vic.rotate(config.rotation);
                        dif_gun_x = dir_vic.x;
                        dif_gun_y = dir_vic.y;
                    }
                    var to_gun_x = from_gun_x + dif_gun_x;
                    var to_gun_y = from_gun_y + dif_gun_y;
                    var _update = function (delay) {
                        acc_fire_time += delay;
                        var _progress = acc_fire_time / overload_ani;
                        var ani_progress = Math.min(Math.max(_progress, 0), 1);
                        // 动画分两段
                        if (ani_progress <= before_the_attack_roll_ani) {
                            ani_progress /= before_the_attack_roll_ani;
                            ani_progress = Easing.Elastic.Out(ani_progress);
                            self.x = from_gun_x + dif_gun_x * ani_progress;
                            self.y = from_gun_y + dif_gun_y * ani_progress;
                        }
                        else {
                            ani_progress = (ani_progress - before_the_attack_roll_ani) / (1 - before_the_attack_roll_ani);
                            ani_progress = Easing.Sinusoidal.Out(ani_progress);
                            self.x = to_gun_x - dif_gun_x * ani_progress;
                            self.y = to_gun_y - dif_gun_y * ani_progress;
                        }
                        if (_progress >= 1) {
                            self.emit("cancel_fire_ani");
                        }
                    };
                    self.on("update", _update);
                    self.once("cancel_fire_ani", function () {
                        self.x = from_gun_x;
                        self.y = from_gun_y;
                        self.once("fire_ani", _fire_ani);
                        self.off("update", _update);
                    });
                });
            }());
        }
        Gun.prototype.setConfig = function (new_config, is_from_owner) {
            var self = this;
            var config = self.config;
            // const cache_config = assign({},config);
            var typeInfo = gunShape[new_config.type] || gunShape[config.type];
            if (!typeInfo) {
                throw new TypeError("UNKONW Gun Type: " + config.type);
            }
            var owner = self.owner;
            var owner_config = owner.config;
            // 动态合成配置
            if (owner && !is_from_owner) {
                new_config = const_3.assign(owner.getWeaponConfigById(self._id), new_config);
            }
            new_config = const_3.transformMix(owner_config, new_config);
            typeInfo = const_3.transformMix(owner_config, typeInfo);
            if (new_config["args"]) {
                typeInfo = const_3.assign(typeInfo, {
                    args: new_config["args"]
                });
            }
            // 覆盖配置
            const_3.mix_options(config, typeInfo["config"]);
            const_3.mix_options(config, new_config);
            // var _is_redraw = false;
            // for(var k in cache_config) {
            // 	if(cache_config[k]!==config[k]){
            // 		_is_redraw = true;
            // 		break;
            // 	}
            // }
            // 绘制枪体
            // if(_is_redraw) {
            GunDrawer_1.default(self, config, typeInfo);
            // }
            // 在射击动画结束的时候重置坐标，否则，原本射击的动画会影响绘制结果
            var new_x = self.x;
            var new_y = self.y;
            self.once("cancel_fire_ani", function () {
                self.x = new_x;
                self.y = new_y;
            });
        };
        Gun.prototype.update = function (delay) {
            this.emit("update", delay);
        };
        Gun.prototype._fire = function () {
            var ship = this.owner;
            var ship_config = ship.config;
            var config = this.config;
            if (config.is_firing) {
                return;
            }
            this.emit("fire_start");
            var before_the_attack_roll_ani = config.BTAR_rate;
            var bullet_size = config.bullet_size;
            var bullet_density = config.bullet_density;
            var bullet_force = new Victor_2.default(config.bullet_force, 0);
            // const bullet_start = new Victor(ship_config.size + bullet_size / 2, 0);
            var bullet_start = new Victor_2.default(this.x - ship_config.size, this.y - ship_config.size);
            var bullet_dir = ship_config.rotation + config.rotation;
            bullet_force.rotate(bullet_dir);
            bullet_start.rotate(ship_config.rotation);
            var bullet = new Bullet_1.default({
                team_tag: ship_config.team_tag,
                x: ship_config.x + bullet_start.x,
                y: ship_config.y + bullet_start.y,
                x_force: bullet_force.x,
                y_force: bullet_force.y,
                size: bullet_size,
                density: bullet_density,
                damage: config.bullet_damage,
                penetrate: config.bullet_penetrate,
            }, this);
            bullet.p2_body.velocity = ship.p2_body.velocity.slice();
            // 一旦发射，飞船受到后座力
            bullet.once("add-to-world", function () {
                var mass_rate = bullet.p2_body.mass / ship.p2_body.mass;
                // 飞船自身提供给子弹大量的初始推动力
                var init_x_force = bullet_force.x * 50;
                var init_y_force = bullet_force.y * 50;
                bullet.p2_body.force = [init_x_force, init_y_force];
                ship.p2_body.force[0] -= init_x_force * mass_rate;
                ship.p2_body.force[1] -= init_y_force * mass_rate;
            });
            // 通知父级
            this.owner && this.owner.emit("gun-fire_start", this._id, bullet);
            return bullet;
            // config.firing
        };
        Gun.prototype.fire = function (cb) {
            var _this = this;
            var config = this.config;
            if (!config.delay) {
                var bullet = this._fire();
                if (bullet) {
                    cb(bullet);
                }
            }
            else {
                if (!config.is_firing && !this._is_waiting_delay) {
                    this._is_waiting_delay = true;
                    this.setTimeout(function () {
                        _this._is_waiting_delay = false;
                        var bullet = _this._fire();
                        if (bullet) {
                            cb(bullet);
                        }
                    }, config.delay > 1 ? config.delay : config.delay * 1000 / config.overload_speed);
                }
            }
        };
        Gun.TYPES = gunShape;
        return Gun;
    }(Collision_1.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Gun;
});
define("app/class/Ship", ["require", "exports", "app/engine/Collision", "app/class/Drawer/ShapeDrawer", "app/class/Gun", "class/Tween", "app/const", "./shipShape.json"], function (require, exports, Collision_2, ShapeDrawer_1, Gun_1, Tween_2, const_4, shipShape) {
    "use strict";
    var Easing = Tween_2.default.Easing;
    if (const_4._isNode) {
        Object.assign(shipShape, const_4.transformJSON(JSON.stringify(shipShape)));
    }
    var EXPERIENCE_LEVEL_MAP = [0];
    var LEVEL_STAGE_1 = 10;
    var LEVEL_STAGE_2 = 20;
    var LEVEL_STAGE_3 = 30;
    var LEVEL_STAGE_1_RATE = 10;
    var LEVEL_STAGE_2_RATE = 20;
    var LEVEL_STAGE_3_RATE = 40;
    for (var i = 1; i <= LEVEL_STAGE_1; i += 1) {
        EXPERIENCE_LEVEL_MAP[i] = EXPERIENCE_LEVEL_MAP[i - 1] + i * LEVEL_STAGE_1_RATE;
    }
    /**第一阶段的基础增长值 */
    var LEVEL_STAGE_1_TOTAL = LEVEL_STAGE_1 * LEVEL_STAGE_1_RATE;
    for (var i = 1, len = LEVEL_STAGE_2 - LEVEL_STAGE_1; i <= len; i += 1) {
        EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_1 + i] = EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_1 + i - 1] + LEVEL_STAGE_1_TOTAL + i * LEVEL_STAGE_2_RATE;
    }
    /**第二阶段的基础增长值 */
    var LEVEL_STAGE_2_TOTAL = LEVEL_STAGE_1_TOTAL + (LEVEL_STAGE_2 - LEVEL_STAGE_1) * LEVEL_STAGE_2_RATE;
    for (var i = 1, len = LEVEL_STAGE_3 - LEVEL_STAGE_2; i <= len; i += 1) {
        EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_2 + i] = EXPERIENCE_LEVEL_MAP[LEVEL_STAGE_2 + i - 1] + LEVEL_STAGE_2_TOTAL + i * LEVEL_STAGE_3_RATE;
    }
    function experience_to_level(experience_num) {
        var res = 0;
        EXPERIENCE_LEVEL_MAP.some(function (experience, level) {
            if (experience >= experience_num) {
                if (experience === experience_num) {
                    res = level;
                }
                else {
                    res = level - 1;
                }
                return true;
            }
        });
        return res || LEVEL_STAGE_3;
    }
    function level_to_experience(level_num) {
        return EXPERIENCE_LEVEL_MAP[level_num | 0];
    }
    var FIX_GETTER_SETTER_BUG_KEYS_MAP = {
        size: "size",
        density: "density",
        proto_list_length: "proto_list_length",
        level: "level",
        type: "type",
        toJSON: "toJSON"
    };
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(new_config, id) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            this.guns = [];
            // 技能加点
            this.proto_list = [];
            this.gun = new PIXI.Graphics();
            this.body = new PIXI.Graphics();
            this.config = (_a = {
                    x: 0,
                    y: 0,
                    y_speed: 0,
                    x_speed: 0,
                    force: 100000
                },
                _a["__size"] = const_4.pt2px(15),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.size, {
                    get: function () {
                        return this.__size;
                    },
                    enumerable: true,
                    configurable: true
                }),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.size, {
                    set: function (new_size) {
                        if (new_size != this.__size) {
                            this.__size = new_size;
                            this.__self__.reDrawBody();
                        }
                    },
                    enumerable: true,
                    configurable: true
                }),
                _a.body_color = 0x2255ff,
                _a.rotation = 0,
                _a.max_hp = 100,
                _a.cur_hp = 0,
                _a.restore_hp = 1,
                _a["__density"] = 1,
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.density, {
                    get: function () {
                        return this.__density;
                    },
                    enumerable: true,
                    configurable: true
                }),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.density, {
                    set: function (new_density) {
                        if (new_density != this.__density) {
                            this.__density = new_density;
                            this.__self__.reDrawBody();
                        }
                    },
                    enumerable: true,
                    configurable: true
                }),
                _a.is_firing = false,
                _a.ison_BTAR = false,
                // 战斗相关的属性
                _a.bullet_force = 30000,
                _a.bullet_size = const_4.pt2px(5),
                _a.bullet_damage = 5,
                _a.bullet_penetrate = 0.5,
                _a.overload_speed = 1,
                // 标志
                _a.team_tag = Math.random(),
                // 经验值
                _a.experience = 0,
                // 等级
                _a["__level"] = 0,
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.level, {
                    get: function () {
                        return this.__level;
                    },
                    enumerable: true,
                    configurable: true
                }),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.level, {
                    set: function (new_level) {
                        if (new_level != this.__level) {
                            var old_level = this.__level;
                            this.__level = new_level;
                            if (const_4._isBorwser) {
                                this.__self__.emit("level-changed", old_level, new_level);
                            }
                        }
                    },
                    enumerable: true,
                    configurable: true
                }),
                _a["__self__"] = this,
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.proto_list_length, {
                    // 只读·技能加点信息
                    get: function () {
                        return this.__self__.proto_list.length * 2;
                    },
                    enumerable: true,
                    configurable: true
                }),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.proto_list_length, {
                    set: function (_) {
                        // just fix setter throw error
                    },
                    enumerable: true,
                    configurable: true
                }),
                _a["__type"] = "S-1",
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.type, {
                    get: function () {
                        return this.__type;
                    },
                    enumerable: true,
                    configurable: true
                }),
                Object.defineProperty(_a, FIX_GETTER_SETTER_BUG_KEYS_MAP.type, {
                    set: function (new_type) {
                        if (new_type != this.__type) {
                            this.__type = new_type;
                            this.__self__.reDrawBody();
                        }
                    },
                    enumerable: true,
                    configurable: true
                }),
                _a[FIX_GETTER_SETTER_BUG_KEYS_MAP.toJSON] = function () {
                    var config = this;
                    var json_config = {};
                    for (var k in config) {
                        if (k.indexOf("__") !== 0 && k !== "toJSON") {
                            json_config[k] = config[k];
                        }
                    }
                    return json_config;
                },
                _a
            );
            this.__GUNS_ID_MAP = null;
            this.is_keep_fire = false;
            var self = this;
            id && (self._id = id);
            var config = self.config;
            var typeInfo = shipShape[new_config.type] || shipShape[config.type];
            if (!typeInfo) {
                throw new TypeError("UNKONW Ship Type: " + config.type);
            }
            // 覆盖配置
            var cache_config = config["toJSON"]();
            const_4.mix_options(cache_config, typeInfo.body.config);
            const_4.mix_options(cache_config, new_config);
            const_4.mix_options(config, cache_config);
            if (config.cur_hp == 0) {
                config.cur_hp = config.max_hp;
            }
            // 绘制船体
            self.reDrawBody();
            self.body_shape["ship_team_tag"] = config.team_tag;
            self.p2_body.force = [config.x_speed, config.y_speed];
            self.p2_body.position = [config.x, config.y];
            self.position.set(config.x, config.y);
            self.on("change-hp", function (dif_hp) {
                // console.log("change-hp-value:",dif_hp)
                if (isFinite(dif_hp)) {
                    var config_1 = self.config;
                    config_1.cur_hp += dif_hp;
                    if (dif_hp < 0 && const_4._isBorwser) {
                        self.emit("flash");
                    }
                    if (config_1.cur_hp > config_1.max_hp) {
                        config_1.cur_hp = config_1.max_hp;
                    }
                    if (config_1.cur_hp <= 0) {
                        self.emit("die");
                    }
                }
            });
            // Nodejs && 浏览器
            self.once("die", function (damage_from) {
                if (damage_from) {
                    // 失去1/2的经验，剩下的1/2用于复活后的基础经验
                    damage_from.emit("change-experience", self.config.experience / 2);
                }
            });
            if (const_4._isNode) {
                self.once("die", function () {
                    self.emit("destroy");
                });
                // 生命回复、攻速限制
                self.once("add-to-world", function () {
                    var acc_time = 0;
                    var restore_hp_ani = 1000;
                    self.on("update", function (delay) {
                        if (config.max_hp !== config.cur_hp) {
                            acc_time += delay;
                            if (acc_time >= restore_hp_ani) {
                                self.emit("change-hp", ~~(config.restore_hp * acc_time / restore_hp_ani));
                                acc_time = acc_time % restore_hp_ani;
                            }
                        }
                    });
                });
            }
            else {
                self.once("die", function () {
                    var ani_time = const_4.B_ANI_TIME;
                    var ani_progress = 0;
                    var _update = self.update;
                    var _to = {
                        scaleXY: 2,
                        alpha: 1
                    };
                    if (self.world) {
                        self.world.removeBody(self.p2_body);
                        self.world = null;
                    }
                    self.emit("stop-flash");
                    self.update = function (delay) {
                        ani_progress += delay;
                        var progress = Math.min(ani_progress / ani_time, 1);
                        var easing_progress = Easing.Quartic.Out(progress);
                        self.scale.x = self.scale.y = _to.scaleXY * easing_progress;
                        self.alpha = 1 - _to.alpha * easing_progress;
                        _update.call(self, delay);
                        if (progress === 1) {
                            self.emit("destroy");
                        }
                    };
                });
            }
            // 经验奖励
            self.on("change-experience", function (dif_experience) {
                if (isFinite(dif_experience)) {
                    var config_2 = self.config;
                    config_2.experience += parseFloat(dif_experience);
                    var res_level = experience_to_level(config_2.experience);
                    if (res_level !== config_2.level) {
                        var pre_max_hp = self.config.max_hp;
                        self.emit("set-level", res_level);
                        var cur_max_hp = self.config.max_hp;
                        self.emit("change-hp", cur_max_hp - pre_max_hp);
                    }
                }
            });
            // 等级改变
            self.on("set-level", function (new_level) {
                if (isFinite(new_level)) {
                    var config_3 = self.config;
                    new_level = parseFloat(new_level);
                    config_3.level = parseFloat(new_level);
                    self._computeConfig();
                }
            });
            var _a;
        }
        // 重绘船体
        Ship.prototype.reDrawBody = function () {
            var config = this.config;
            var typeInfo = shipShape[config.type];
            const_4._isBorwser && (this.body.cacheAsBitmap = false);
            // 绘制船体
            ShapeDrawer_1.default(this, config, typeInfo.body);
            // 绘制枪支位置
            this.reloadWeapon();
            const_4._isBorwser && (this.body.cacheAsBitmap = true);
        };
        // 卸载武器
        Ship.prototype.unloadWeapon = function () {
            var _this = this;
            this.guns.forEach(function (gun) {
                _this.removeChild(gun);
                gun.destroy();
            });
        };
        // 装载武器配置
        Ship.prototype.reloadWeapon = function () {
            var self = this;
            var config = self.config;
            var typeInfo = shipShape[config.type];
            typeInfo.guns.forEach(function (_gun_config, i) {
                var gun = self.guns[i];
                var gun_config = const_4.assign({}, _gun_config);
                // 枪支继承飞船的基本配置
                [
                    "bullet_force",
                    "bullet_size",
                    "bullet_damage",
                    "bullet_penetrate",
                    "overload_speed",
                ].forEach(function (k) {
                    var ship_v = config[k];
                    if (!gun_config.hasOwnProperty(k)) {
                        gun_config[k] = ship_v;
                    }
                });
                if (gun) {
                    gun.setConfig(gun_config, true);
                }
                else {
                    self.__GUNS_ID_MAP = null; // 清除枪支缓存
                    var gun = new Gun_1.default(gun_config, self);
                }
                // 定死ID
                gun._id = self._id + "_gun_" + i;
            });
            if (self.guns.length > typeInfo.guns.length) {
                self.guns.splice(typeInfo.guns.length, self.guns.length - typeInfo.guns.length).forEach(function (gun) {
                    self.removeChild(gun);
                    gun.destroy();
                });
                self.__GUNS_ID_MAP = null; // 清除枪支缓存
            }
        };
        Ship.prototype.getWeaponConfigById = function (gun_id) {
            var self = this;
            var config = self.config;
            var typeInfo = shipShape[config.type];
            var gunindex = gun_id.substr(gun_id.indexOf("_gun_") + 5);
            var gun = self.guns[gunindex];
            if (!gun) {
                return;
            }
            var _gun_config = typeInfo.guns[gunindex];
            var gun_config = const_4.assign({}, _gun_config);
            // 枪支继承飞船的基本配置
            [
                "bullet_force",
                "bullet_size",
                "bullet_damage",
                "bullet_penetrate",
                "overload_speed",
            ].forEach(function (k) {
                var ship_v = config[k];
                if (!gun_config.hasOwnProperty(k)) {
                    gun_config[k] = ship_v;
                }
            });
            return gun_config;
        };
        Object.defineProperty(Ship.prototype, "GUNS_ID_MAP", {
            get: function () {
                var _gun_id_map = this.__GUNS_ID_MAP;
                if (!_gun_id_map) {
                    _gun_id_map = this.__GUNS_ID_MAP = {};
                    var guns = this.guns;
                    guns.forEach(function (gun) {
                        _gun_id_map[gun._id] = gun;
                    });
                }
                return _gun_id_map;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Ship.prototype, "CHANGEABLE_SHAPES", {
            get: function () {
                var res = [];
                for (var type in shipShape) {
                    var typeInfo = shipShape[type];
                    if (typeInfo.required &&
                        typeInfo.required.base_on.indexOf(this.config.type) !== -1 &&
                        typeInfo.required.level <= this.config.level) {
                        res.push(type);
                    }
                }
                return res;
            },
            enumerable: true,
            configurable: true
        });
        Ship.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.rotation = this.p2_body["rotation"];
            this.p2_body.force = [this.config.x_speed, this.config.y_speed];
            this.guns.forEach(function (gun) { return gun.update(delay); });
        };
        // 操控飞船
        Ship.prototype.operateShip = function (new_config) {
            var config = this.config;
            // 这个接口只能修改这三个参数
            var limit_config = {
                y_speed: config.y_speed,
                x_speed: config.x_speed,
                rotation: config.rotation,
            };
            const_4.mix_options(limit_config, new_config);
            if (limit_config.x_speed * limit_config.x_speed +
                limit_config.y_speed * limit_config.y_speed >
                config.force * config.force + 1 // JS小数问题，确保全速前进不会出现问题
            ) {
                console.log("非法操作，取消这次操作");
                return; //非法操作，取消这次操作
            }
            this.setConfig(limit_config);
        };
        Ship.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_4.mix_options(config, new_config);
            this.p2_body.position[0] = config.x;
            this.p2_body.position[1] = config.y;
            this.x = config.x;
            this.y = config.y;
            if (!config.ison_BTAR) {
                this.p2_body["rotation"] = config.rotation;
                this.rotation = config.rotation;
            }
        };
        // 属性加点
        Ship.prototype.addProto = function (add_proto) {
            var config = this.config;
            // 点数溢出
            if (config.level <= config.proto_list_length) {
                return;
            }
            var typeInfo = shipShape[config.type];
            var proto_grow_config = typeInfo.body.proto_grow_config;
            if (!proto_grow_config.hasOwnProperty(add_proto)) {
                throw new TypeError("UNKNOW SKILL UPGREAT: " + add_proto);
            }
            var proto_grow_config_item = proto_grow_config[add_proto];
            if (this.proto_list.filter(function (proto) { return proto == add_proto; }).length >= proto_grow_config_item.max) {
                throw new RangeError("OVERFLOW SKILL UPGREAT: " + add_proto);
            }
            this.proto_list.push(add_proto);
            this._computeConfig();
            this.reloadWeapon();
        };
        Ship.prototype.changeType = function (new_type) {
            if (this.CHANGEABLE_SHAPES.indexOf(new_type) === -1) {
                return;
            }
            this._computeConfig(new_type);
            this.config.type = new_type;
        };
        Ship.prototype._computeConfig = function (type) {
            var _this = this;
            var config = this.config;
            type || (type = config.type);
            // 用于临时替代config的对象，避免计算属性重复计算/
            var cache_config = config[FIX_GETTER_SETTER_BUG_KEYS_MAP.toJSON]();
            this.config = cache_config;
            var level = config.level;
            var typeInfo = shipShape[type];
            var type_config = typeInfo.body.config;
            var level_grow = typeInfo.body.level_grow;
            var proto_grow = typeInfo.body.proto_grow;
            /** 基础的等级带来的属性增长
             *
             */
            const_4.assign(cache_config, type_config);
            for (var config_key in level_grow) {
                var level_grow_value = level_grow[config_key];
                if (isFinite(level_grow_value)) {
                    cache_config[config_key] += level_grow_value * level;
                }
                else if (typeof level_grow_value === "object") {
                    if (level_grow_value.when instanceof Function && level_grow_value.then instanceof Function) {
                        if (level_grow_value.when.call(this, level_grow_value)) {
                            level_grow_value.then.call(this, level_grow_value);
                        }
                    }
                }
            }
            // 加点信息
            this.proto_list.forEach(function (proto) {
                var proto_grow_value = proto_grow[proto];
                if (isFinite(proto_grow_value)) {
                    cache_config[proto] += proto_grow_value;
                }
                else if (typeof proto_grow_value === "object") {
                    if (proto_grow_value.when instanceof Function && proto_grow_value.then instanceof Function) {
                        if (proto_grow_value.when.call(_this, proto_grow_value)) {
                            proto_grow_value.then.call(_this, proto_grow_value);
                        }
                    }
                }
                else {
                    throw new TypeError("UNKNOW SKILL UPGREAT: " + proto);
                }
            });
            this.config = config;
            const_4.mix_options(config, cache_config);
        };
        Ship.prototype.fire = function (cb) {
            this.guns.forEach(function (gun) {
                gun.fire(function (bullet) {
                    requestAnimationFrame(function () {
                        cb(bullet);
                    });
                });
            });
        };
        Ship.prototype.startKeepFire = function (cb) {
            var _this = this;
            this._fireBind = function () {
                _this.fire(cb);
            };
            this.on("update", this._fireBind);
        };
        Ship.prototype.stopKeepFire = function () {
            this.off("update", this._fireBind);
            this._fireBind = null;
        };
        Ship.prototype.toggleKeepFire = function (cb) {
            if (!this.is_keep_fire) {
                this.is_keep_fire = true;
                this.startKeepFire(cb);
            }
            else {
                this.is_keep_fire = false;
                this.stopKeepFire();
            }
        };
        Ship.TYPES = shipShape;
        Ship.experience_to_level = experience_to_level;
        Ship.level_to_experience = level_to_experience;
        return Ship;
    }(Collision_2.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ship;
});
define("app/class/Flyer", ["require", "exports", "app/engine/Collision", "app/class/Drawer/ShapeDrawer", "app/const", "class/Tween", "./flyerShape.json"], function (require, exports, Collision_3, ShapeDrawer_2, const_5, Tween_3, flyerShape) {
    "use strict";
    if (const_5._isNode) {
        Object.assign(flyerShape, const_5.transformJSON(JSON.stringify(flyerShape)));
    }
    var Easing = Tween_3.default.Easing;
    var Flyer = (function (_super) {
        __extends(Flyer, _super);
        function Flyer(new_config) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            // static clooisionGroup = 1<<1;
            this.body = new PIXI.Graphics();
            this.config = {
                x: 0,
                y: 0,
                y_speed: 5,
                x_speed: 0,
                size: const_5.pt2px(10),
                body_color: 0x2255ff,
                density: 1,
                rotation: 0,
                max_hp: 50,
                cur_hp: 50,
                type: "S-Box",
                // 奖励经验值
                reward_experience: 0,
            };
            var self = this;
            var config = self.config;
            const_5.mix_options(config, new_config);
            var typeInfo = flyerShape[config.type];
            if (!typeInfo) {
                throw new TypeError("UNKONW Ship Type: " + config.type);
            }
            // 覆盖配置
            const_5.mix_options(config, typeInfo.config);
            ShapeDrawer_2.default(self, config, typeInfo);
            if (const_5._isBorwser) {
                self.cacheAsBitmap = true;
            }
            self.p2_body.angularVelocity = Math.PI * Math.random();
            self.p2_body.force = [config.x_speed, config.y_speed];
            self.p2_body.position = [config.x, config.y];
            self.position.set(config.x, config.y);
            self.on("change-hp", function (dif_hp, damage_from) {
                // console.log("change-hp-value:",dif_hp)
                if (isFinite(dif_hp)) {
                    var config_4 = self.config;
                    config_4.cur_hp += dif_hp;
                    if (dif_hp < 0 && const_5._isBorwser) {
                        self.emit("flash");
                    }
                    if (config_4.cur_hp > config_4.max_hp) {
                        config_4.cur_hp = config_4.max_hp;
                    }
                    if (config_4.cur_hp <= 0) {
                        self.emit("ember", damage_from);
                    }
                }
            });
            // Nodejs && 浏览器
            self.once("ember", function (damage_from) {
                if (damage_from) {
                    damage_from.emit("change-experience", self.config.reward_experience);
                }
            });
            if (const_5._isNode) {
                self.once("ember", function () {
                    self.emit("destroy");
                });
            }
            else {
                self.once("ember", function () {
                    var ani_time = const_5.B_ANI_TIME;
                    var ani_progress = 0;
                    var _update = self.update;
                    var _to = {
                        scaleXY: 2,
                        alpha: 1
                    };
                    if (self.world) {
                        self.world.removeBody(self.p2_body);
                        self.world = null;
                    }
                    self.emit("stop-flash");
                    self.update = function (delay) {
                        ani_progress += delay;
                        var progress = Math.min(ani_progress / ani_time, 1);
                        var easing_progress = Easing.Quartic.Out(progress);
                        self.scale.x = self.scale.y = 1 + (_to.scaleXY - 1) * easing_progress;
                        self.alpha = 1 - _to.alpha * easing_progress;
                        _update.call(self, delay);
                        if (progress === 1) {
                            self.emit("destroy");
                        }
                    };
                });
            }
        }
        Flyer.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.rotation = this.config.rotation = this.p2_body.interpolatedAngle;
            // this.p2_body.force = [this.config.x_speed, this.config.y_speed];
        };
        Flyer.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_5.mix_options(config, new_config);
            this.rotation = this.p2_body.angle = config.rotation;
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        Flyer.TYPES = flyerShape;
        return Flyer;
    }(Collision_3.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Flyer;
});
define("app/class/Wall", ["require", "exports", "app/engine/Collision", "app/const"], function (require, exports, Collision_4, const_6) {
    "use strict";
    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(new_config) {
            _super.call(this);
            // static clooisionGroup = 1<<1;
            this.config = {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                rotation: 0,
                color: 0x0222222,
                density: 10,
                bulletproof: 0.9
            };
            this.p2_body = new p2.Body({
                mass: 0,
                fixedRotation: true,
                fixedX: true,
                fixedY: true,
            });
            this.body = new PIXI.Graphics();
            var self = this;
            var config = self.config;
            const_6.mix_options(config, new_config);
            var body = self.body;
            body.beginFill(config.color);
            body.drawRect(0, 0, config.width, config.height);
            body.endFill();
            self.addChild(body);
            self.pivot.set(config.width / 2, config.height / 2);
            if (const_6._isBorwser) {
                self.cacheAsBitmap = true;
            }
            self.body_shape = new p2.Box({
                width: config.width,
                height: config.height,
            });
            self.body_shape.material = Wall.material;
            self.p2_body.addShape(self.body_shape);
            self.p2_body.setDensity(config.density);
            self.p2_body.position = [config.x, config.y];
            self.position.set(config.x, config.y);
            self.rotation = config.rotation;
        }
        Wall.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_6.mix_options(config, new_config);
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        Wall.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.rotation = this.config.rotation = this.p2_body.interpolatedAngle;
        };
        Wall.material = new p2.Material();
        return Wall;
    }(Collision_4.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Wall;
});
define("app/class/Bullet", ["require", "exports", "app/engine/Collision", "class/Tween", "app/const"], function (require, exports, Collision_5, Tween_4, const_7) {
    "use strict";
    var Easing = Tween_4.default.Easing;
    var Bullet = (function (_super) {
        __extends(Bullet, _super);
        function Bullet(new_config, owner) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            // static collisionMask  = 1<<1;
            this.body = new PIXI.Graphics();
            this.config = {
                x: 0,
                y: 0,
                x_force: 0,
                y_force: 0,
                size: const_7.pt2px(5),
                body_color: 0x2255ff,
                delay: 0,
                lift_time: 3500,
                density: 2,
                penetrate: 0,
                team_tag: NaN,
                damage: 0,
                scale: 1
            };
            var self = this;
            self.owner = owner;
            var config = self.config;
            const_7.mix_options(config, new_config);
            var body = self.body;
            body.lineStyle(config.density, 0x000000, 1);
            body.beginFill(config.body_color);
            body.drawCircle(config.size / 2, config.size / 2, config.size);
            body.endFill();
            self.addChild(body);
            self.pivot.set(config.size / 2, config.size / 2);
            if (const_7._isBorwser) {
                self.cacheAsBitmap = true;
            }
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
            self.body_shape.material = Bullet.material;
            // self.body_shape.sensor = true;
            self.body_shape["bullet_team_tag"] = config.team_tag;
            // self.p2_body.damping = self.p2_body.angularDamping = 0;// 1/config.penetrate;
            self.p2_body.addShape(self.body_shape);
            self.p2_body.setDensity(config.density);
            self.p2_body.force = [config.x_force, config.y_force];
            self.p2_body.position = [config.x, config.y];
            self.position.set(config.x, config.y);
            self.once("add-to-world", function (world) {
                function _go_to_explode() {
                    var acc_time = 0;
                    self.on("update", function (delay) {
                        // 持续的推进力
                        self.p2_body.force = [config.x_force, config.y_force];
                        acc_time += delay;
                        if (acc_time >= config.lift_time) {
                            self.emit("explode");
                        }
                    });
                }
                if (self.config.delay) {
                    world.removeBody(self.p2_body);
                    var acc_delay = self.config.delay;
                    self.on("update", function _(delay) {
                        acc_delay -= delay;
                        if (acc_delay <= 0) {
                            world.addBody(self.p2_body);
                            self.off("update", _);
                            _go_to_explode();
                        }
                    });
                }
                else {
                    _go_to_explode();
                }
            });
            var source_damage = config.damage;
            self.on("penetrate", function (obj, change_damage) {
                config.penetrate -= obj.config.density / config.density;
                if (isFinite(change_damage)) {
                    var damage_rate = config.scale = change_damage / source_damage;
                    self.scale && self.scale.set(damage_rate, damage_rate);
                    config.damage = change_damage;
                }
                if (config.penetrate <= 0) {
                    self.emit("explode");
                }
            });
            var in_wall_updater = [];
            self.on("in-wall", function (wall) {
                var acc_ms = 0;
                var penetrate_time = 200;
                var _update = function (delay) {
                    // 每200ms进行一次穿透性削弱
                    acc_ms += delay;
                    if (acc_ms > penetrate_time) {
                        acc_ms = acc_ms % penetrate_time;
                        var penetrate_num = ~~(acc_ms / 200);
                        do {
                            self.emit("penetrate", wall, config.damage * wall.config.bulletproof);
                            penetrate_num -= 1;
                        } while (penetrate_num > 0);
                    }
                };
                in_wall_updater.push(_update);
                self.on("update", _update);
            });
            self.on("out-wall", function (wall) {
                var _update = in_wall_updater.pop();
                if (_update) {
                    self.off("update", _update);
                }
            });
            if (const_7._isNode) {
                self.once("explode", function () {
                    console.log("explode", self._id);
                    // 不要马上执行销毁，这个时间可能是从P2中执行出来的，可能还没运算完成
                    self.update = function (delay) {
                        self.emit("destroy");
                    };
                });
            }
            else {
                self.once("explode", function () {
                    var ani_time = const_7.B_ANI_TIME;
                    var ani_progress = 0;
                    var _to = {
                        scaleXY: 2,
                        alpha: 1
                    };
                    self.on("update", function (delay) {
                        ani_progress += delay;
                        var progress = Math.min(ani_progress / ani_time, 1);
                        var easing_progress = Easing.Quartic.Out(progress);
                        self.scale.x = self.scale.y = _to.scaleXY * easing_progress;
                        self.alpha = 1 - _to.alpha * easing_progress;
                        if (progress === 1) {
                            self.emit("destroy");
                        }
                    });
                });
            }
        }
        Bullet.prototype.toJSON = function () {
            var res = _super.prototype.toJSON.call(this);
            res["owner_id"] = this.owner && this.owner._id;
            return res;
        };
        Bullet.prototype.setConfig = function (new_config) {
            _super.prototype.setConfig.call(this, new_config);
            var config = this.config;
            const_7.mix_options(config, new_config);
            this.scale.set(config.scale, config.scale);
            var old_radius = this.body_shape.radius;
            var new_radius = config.scale * config.size;
            if (new_radius !== old_radius) {
                this.body_shape.radius = new_radius;
                this.body_shape.updateArea();
                this.p2_body.setDensity(config.density);
            }
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        Bullet.material = new p2.Material();
        return Bullet;
    }(Collision_5.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Bullet;
});
define("app/class/HP", ["require", "exports", "class/Tween", "app/const"], function (require, exports, Tween_5, const_8) {
    "use strict";
    var HP = (function (_super) {
        __extends(HP, _super);
        function HP(owner, ani) {
            _super.call(this);
            this.show_ani = null;
            this.owner = owner;
            this.ani = ani;
            this.source_width = owner.config.size * 2 || owner.width || const_8.pt2px(40);
            var owner_config = owner.config;
            this.setHP(owner_config.cur_hp / owner_config.max_hp);
        }
        HP.prototype.setHP = function (percentage) {
            var _this = this;
            this.clear();
            if (!isFinite(percentage)) {
                var owner_config = this.owner.config;
                percentage = owner_config.cur_hp / owner_config.max_hp;
            }
            percentage = Math.min(Math.max(parseFloat(percentage), 0), 1);
            var width = this.source_width;
            var height = Math.min(width / 8, const_8.pt2px(4));
            var borderWidth = height / 5;
            this.lineStyle(borderWidth, 0x000000, 1);
            this.beginFill(0xEEEEEE);
            this.drawRoundedRect(0, 0, width + borderWidth, height + borderWidth, height / 4);
            this.endFill();
            this.lineStyle(0, 0x000000, 1);
            this.beginFill(0x33EE33);
            this.drawRoundedRect(borderWidth / 2, borderWidth / 2, width * percentage, height, height / 4);
            this.endFill();
            if (this.alpha !== 1) {
                this.ani.Tween(this)
                    .to({
                    alpha: 1
                }, const_8.B_ANI_TIME)
                    .easing(Tween_5.default.Easing.Quartic.Out)
                    .start();
            }
            clearTimeout(this.show_ani);
            this.show_ani = setTimeout(function () {
                _this.ani.Tween(_this)
                    .to({
                    alpha: 0
                }, const_8.L_ANI_TIME)
                    .easing(Tween_5.default.Easing.Quartic.In)
                    .start();
            }, 5000);
        };
        HP.prototype.update = function (delay) {
            var owner_config = this.owner.config;
            this.x = owner_config.x - owner_config.size;
            this.y = owner_config.y + owner_config.size + this.height / 2;
        };
        return HP;
    }(PIXI.Graphics));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = HP;
});
/*!
 color2color v0.2.1 indyarmy.com
 by Russ Porosky
 IndyArmy Network, Inc.
 */
define("class/color2color", ["require", "exports"], function (require, exports) {
    "use strict";
    var color2color = function (color, newColor, calculateOpacity) {
        if (!newColor) {
            newColor = "rgba";
        }
        color = color.toLowerCase();
        newColor = newColor.toLowerCase();
        var namedColor = getNamedColor(color), colorDefs = [
            {
                re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                example: ["rgb(123, 234, 45)", "rgb(255,234,245)"],
                process: function (bits) {
                    return [
                        parseInt(bits[1], 10), parseInt(bits[2], 10), parseInt(bits[3], 10), 1
                    ];
                }
            },
            {
                re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
                example: ["rgba(123, 234, 45, 1)", "rgba(255,234,245, 0.5)"],
                process: function (bits) {
                    return [
                        parseInt(bits[1], 10), parseInt(bits[2], 10), parseInt(bits[3], 10), parseFloat(bits[4])
                    ];
                }
            },
            {
                re: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
                example: ["hsl(120, 100%, 25%)", "hsl(0, 100%, 50%)"],
                process: function (bits) {
                    bits[4] = 1;
                    var rgba = hslToRgb(bits);
                    return [
                        rgba.r, rgba.g, rgba.b, rgba.a
                    ];
                }
            },
            {
                re: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
                example: ["hsla(120, 100%, 25%, 1)", "hsla(0, 100%, 50%, 0.5)"],
                process: function (bits) {
                    var rgba = hslToRgb(bits);
                    return [
                        rgba.r, rgba.g, rgba.b, rgba.a
                    ];
                }
            },
            {
                re: /^hsv\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
                example: ["hsv(120, 100%, 25%)", "hsl(0, 100%, 50%)"],
                process: function (bits) {
                    var rgb = hsvToRgb(bits);
                    return [
                        rgb.r, rgb.g, rgb.b, 1
                    ];
                }
            },
            {
                re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                example: ["#00ff00", "336699"],
                process: function (bits) {
                    return [
                        parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16), 1
                    ];
                }
            },
            {
                re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                example: ["#fb0", "f0f"],
                process: function (bits) {
                    return [
                        parseInt(bits[1] + bits[1], 16), parseInt(bits[2] + bits[2], 16), parseInt(bits[3] + bits[3], 16), 1
                    ];
                }
            }
        ], r, g, b, a, i, re, processor, bits, channels, min, hsl, hsv, retcolor;
        if (namedColor) {
            color = namedColor;
        }
        else {
            color = color.replace(/^\s*#|\s*$/g, "");
            if (color.length === 3) {
                color = color.replace(/(.)/g, "$1$1");
            }
        }
        // search through the definitions to find a match
        for (i = 0; i < colorDefs.length; i += 1) {
            re = colorDefs[i].re;
            processor = colorDefs[i].process;
            bits = re.exec(color);
            if (bits) {
                channels = processor(bits);
                r = channels[0];
                g = channels[1];
                b = channels[2];
                a = channels[3];
            }
        }
        r = (r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r);
        g = (g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g);
        b = (b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b);
        a = (a < 0 || isNaN(a)) ? 0 : ((a > 1) ? 1 : a);
        switch (newColor) {
            case "rgba":
                if (calculateOpacity) {
                    a = (255 - (min = Math.min(r, g, b))) / 255;
                    r = (0 || (r - min) / a).toFixed(0);
                    g = (0 || (g - min) / a).toFixed(0);
                    b = (0 || (b - min) / a).toFixed(0);
                    a = a.toFixed(4);
                }
                retcolor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
                break;
            case "rgb":
                retcolor = "rgb(" + r + "," + g + "," + b + ")";
                break;
            case "hex":
                retcolor = "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
                break;
            case "hsl":
                hsl = rgbToHsl({ "r": r, "g": g, "b": b });
                retcolor = "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%)";
                break;
            case "hsla":
                hsl = rgbToHsl({ "r": r, "g": g, "b": b, "a": a });
                retcolor = "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%," + hsl.a + ")";
                break;
            case "hsv":
                hsv = rgbToHsv({ "r": r, "g": g, "b": b });
                retcolor = "hsv(" + hsv.h + "," + hsv.s + "%," + hsv.v + "%)";
                break;
            case "array":
                retcolor = [r, g, b, a];
                break;
        }
        return retcolor;
    };
    var hslToRgb = function (bits) {
        var rgba = {}, v, q, p, hsl = {
            h: toPercent(parseInt(bits[1], 10) % 360, 360),
            s: toPercent(parseInt(bits[2], 10) % 101, 100),
            l: toPercent(parseInt(bits[3], 10) % 101, 100),
            a: parseFloat(bits[4])
        };
        if (hsl.s === 0) {
            v = Math.round(255 * hsl.l) | 0;
            rgba = {
                r: v,
                g: v,
                b: v,
                a: hsl.a
            };
        }
        else {
            q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s;
            p = 2 * hsl.l - q;
            rgba.r = parseInt((hueToRgb(p, q, hsl.h + 1 / 3) * 256).toFixed(0), 10);
            rgba.g = parseInt((hueToRgb(p, q, hsl.h) * 256).toFixed(0), 10);
            rgba.b = parseInt((hueToRgb(p, q, hsl.h - 1 / 3) * 256).toFixed(0), 10);
            rgba.a = hsl.a;
        }
        return rgba;
    };
    var rgbToHsl = function (rgba) {
        rgba.r = toPercent(parseInt(rgba.r, 10) % 256, 256);
        rgba.g = toPercent(parseInt(rgba.g, 10) % 256, 256);
        rgba.b = toPercent(parseInt(rgba.b, 10) % 256, 256);
        var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), hsl = {}, d;
        hsl.a = rgba.a;
        hsl.l = (max + min) / 2;
        if (max === min) {
            hsl.h = 0;
            hsl.s = 0;
        }
        else {
            d = max - min;
            hsl.s = hsl.l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rgba.r:
                    hsl.h = (rgba.g - rgba.b) / d + (rgba.g < rgba.b ? 6 : 0);
                    break;
                case rgba.g:
                    hsl.h = (rgba.b - rgba.r) / d + 2;
                    break;
                case rgba.b:
                    hsl.h = (rgba.r - rgba.g) / d + 4;
                    break;
            }
            hsl.h /= 6;
        }
        hsl.h = parseInt((hsl.h * 360).toFixed(0), 10);
        hsl.s = parseInt((hsl.s * 100).toFixed(0), 10);
        hsl.l = parseInt((hsl.l * 100).toFixed(0), 10);
        return hsl;
    };
    var hsvToRgb = function (bits) {
        var rgb = {}, hsv = {
            h: toPercent(parseInt(bits[1], 10) % 360, 360),
            s: toPercent(parseInt(bits[2], 10) % 101, 100),
            v: toPercent(parseInt(bits[3], 10) % 101, 100)
        }, i = Math.floor(hsv.h * 6), f = hsv.h * 6 - i, p = hsv.v * (1 - hsv.s), q = hsv.v * (1 - f * hsv.s), t = hsv.v * (1 - (1 - f) * hsv.s);
        switch (i % 6) {
            case 0:
                rgb.r = hsv.v;
                rgb.g = t;
                rgb.b = p;
                break;
            case 1:
                rgb.r = q;
                rgb.g = hsv.v;
                rgb.b = p;
                break;
            case 2:
                rgb.r = p;
                rgb.g = hsv.v;
                rgb.b = t;
                break;
            case 3:
                rgb.r = p;
                rgb.g = q;
                rgb.b = hsv.v;
                break;
            case 4:
                rgb.r = t;
                rgb.g = p;
                rgb.b = hsv.v;
                break;
            case 5:
                rgb.r = hsv.v;
                rgb.g = p;
                rgb.b = q;
                break;
        }
        rgb.r = (rgb.r * 256) | 0;
        rgb.g = (rgb.g * 256) | 0;
        rgb.b = (rgb.b * 256) | 0;
        return {
            "r": rgb.r,
            "g": rgb.g,
            "b": rgb.b
        };
    };
    var rgbToHsv = function (rgba) {
        rgba.r = toPercent(parseInt(rgba.r, 10) % 256, 256);
        rgba.g = toPercent(parseInt(rgba.g, 10) % 256, 256);
        rgba.b = toPercent(parseInt(rgba.b, 10) % 256, 256);
        var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), d = max - min, hsv = {
            "h": 0,
            "s": max === 0 ? 0 : d / max,
            "v": max
        };
        if (max !== min) {
            switch (max) {
                case rgba.r:
                    hsv.h = (rgba.g - rgba.b) / d + (rgba.g < rgba.b ? 6 : 0);
                    break;
                case rgba.g:
                    hsv.h = (rgba.b - rgba.r) / d + 2;
                    break;
                case rgba.b:
                    hsv.h = (rgba.r - rgba.g) / d + 4;
                    break;
            }
            hsv.h /= 6;
        }
        hsv.h = parseInt((hsv.h * 360).toFixed(0), 10);
        hsv.s = parseInt((hsv.s * 100).toFixed(0), 10);
        hsv.v = parseInt((hsv.v * 100).toFixed(0), 10);
        return hsv;
    };
    var hueToRgb = function (p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    var toPercent = function (amount, limit) {
        return amount / limit;
    };
    var getNamedColor = function (color) {
        var key, namedColor = null, namedColors = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "00ffff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000000",
            blanchedalmond: "ffebcd",
            blue: "0000ff",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "00ffff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dodgerblue: "1e90ff",
            feldspar: "d19275",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "ff00ff",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgrey: "d3d3d3",
            lightgreen: "90ee90",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslateblue: "8470ff",
            lightslategray: "778899",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "00ff00",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "ff00ff",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370d8",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "d87093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "ff0000",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            violetred: "d02090",
            wheat: "f5deb3",
            white: "ffffff",
            whitesmoke: "f5f5f5",
            yellow: "ffff00",
            yellowgreen: "9acd32"
        };
        for (key in namedColors) {
            if (color === key) {
                namedColor = namedColors[key];
            }
        }
        return namedColor;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = color2color;
});
define("class/SVGGraphics", ["require", "exports", "class/color2color"], function (require, exports, color2color_1) {
    "use strict";
    var SVGGraphics = (function () {
        function SVGGraphics(graphics) {
            this._graphics = graphics;
            this._childs = {}; // save by id;
        }
        // function SVGGraphics(graphics) {
        //     this._graphics = graphics
        // }
        /**
         * Draws the given node
         * @param  {SVGElement} node
         */
        SVGGraphics.prototype.drawNode = function (node) {
            var tagName = node.tagName;
            var capitalizedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
            if (!this['draw' + capitalizedTagName + 'Node']) {
                console.warn('No drawing behavior for ' + capitalizedTagName + ' node');
            }
            else {
                this['draw' + capitalizedTagName + 'Node'](node);
            }
        };
        /**
         * Draws the given root SVG node (and handles it as a group)
         * @param  {SVGSVGElement} node
         */
        SVGGraphics.prototype.drawSvgNode = function (node) {
            this.drawGNode(node);
        };
        /**
         * Draws the given group svg node
         * @param  {SVGGroupElement} node
         */
        SVGGraphics.prototype.drawGNode = function (node) {
            var children = node.children || node.childNodes;
            var child;
            for (var i = 0, len = children.length; i < len; i++) {
                child = children[i];
                if (child.nodeType !== 1) {
                    continue;
                }
                this.drawNode(child);
            }
        };
        /**
         * Draws the given line svg node
         * @param  {SVGLineElement} node
         */
        SVGGraphics.prototype.drawLineNode = function (node) {
            this.applySvgAttributes(node);
            var x1 = parseFloat(node.getAttribute('x1'));
            var y1 = parseFloat(node.getAttribute('y1'));
            var x2 = parseFloat(node.getAttribute('x2'));
            var y2 = parseFloat(node.getAttribute('y2'));
            this._graphics.moveTo(x1, y1);
            this._graphics.lineTo(x2, y2);
        };
        /**
         * Draws the given polyline svg node
         * @param  {SVGPolylineElement} node
         */
        SVGGraphics.prototype.drawPolylineNode = function (node) {
            this.applySvgAttributes(node);
            var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)';
            var points = node.getAttribute('points').match(new RegExp(reg, 'g'));
            var point;
            for (var i = 0, len = points.length; i < len; i++) {
                point = points[i];
                var coords = point.match(new RegExp(reg));
                coords[1] = parseFloat(coords[1]);
                coords[2] = parseFloat(coords[2]);
                if (i === 0) {
                    this._graphics.moveTo(coords[1], coords[2]);
                }
                else {
                    this._graphics.lineTo(coords[1], coords[2]);
                }
            }
        };
        /**
         * Draws the given circle node
         * @param  {SVGCircleElement} node
         */
        SVGGraphics.prototype.drawCircleNode = function (node) {
            this.applySvgAttributes(node);
            var cx = parseFloat(node.getAttribute('cx'));
            var cy = parseFloat(node.getAttribute('cy'));
            var r = parseFloat(node.getAttribute('r'));
            this._graphics.drawCircle(cx, cy, r);
        };
        /**
         * Draws the given ellipse node
         * @param  {SVGCircleElement} node
         */
        SVGGraphics.prototype.drawEllipseNode = function (node) {
            this.applySvgAttributes(node);
            var cx = parseFloat(node.getAttribute('cx'));
            var cy = parseFloat(node.getAttribute('cy'));
            var rx = parseFloat(node.getAttribute('rx'));
            var ry = parseFloat(node.getAttribute('ry'));
            this._graphics.drawEllipse(cx, cy, rx, ry);
        };
        /**
         * Draws the given rect node
         * @param  {SVGRectElement} node
         */
        SVGGraphics.prototype.drawRectNode = function (node) {
            this.applySvgAttributes(node);
            var x = parseFloat(node.getAttribute('x'));
            var y = parseFloat(node.getAttribute('y'));
            var width = parseFloat(node.getAttribute('width'));
            var height = parseFloat(node.getAttribute('height'));
            this._graphics.drawRect(x, y, width, height);
        };
        /**
         * Draws the given polygon node
         * @param  {SVGPolygonElement} node
         */
        SVGGraphics.prototype.drawPolygonNode = function (node) {
            var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)';
            var points = node.getAttribute('points').match(new RegExp(reg, 'g'));
            var path = [];
            var point;
            for (var i = 0, len = points.length; i < len; i++) {
                point = points[i];
                var coords = point.match(new RegExp(reg));
                coords[1] = parseFloat(coords[1]);
                coords[2] = parseFloat(coords[2]);
                path.push(new PIXI.Point(coords[1], coords[2]));
            }
            this.applySvgAttributes(node);
            this._graphics.drawPolygon(path);
        };
        /**
         * Draws the given path svg node
         * @param  {SVGPathElement} node
         */
        SVGGraphics.prototype.drawPathNode = function (node) {
            this.applySvgAttributes(node);
            var d = node.getAttribute('d').trim();
            var commands = d.match(/[a-df-z][^a-df-z]*/ig);
            var command, firstCoord, lastCoord, lastControl;
            var pathIndex = 0;
            var triangles = [];
            var j, argslen;
            var lastPathCoord;
            for (var i = 0, len = commands.length; i < len; i++) {
                command = commands[i];
                var commandType = command[0];
                var args = command.slice(1).trim().split(/[\s,]+|(?=\s?[+\-])/);
                for (j = 0, argslen = args.length; j < argslen; j++) {
                    args[j] = parseFloat(args[j]);
                }
                var offset = {
                    x: 0,
                    y: 0
                };
                if (commandType === commandType.toLowerCase()) {
                    // Relative positions
                    offset = lastCoord;
                }
                switch (commandType.toLowerCase()) {
                    // moveto command
                    case 'm':
                        args[0] += offset.x;
                        args[1] += offset.y;
                        if (pathIndex === 0) {
                            // First path, just moveTo()
                            this._graphics.moveTo(args[0], args[1]);
                        }
                        else if (pathIndex === 1) {
                            // Second path, use lastCoord as lastPathCoord
                            lastPathCoord = {
                                x: lastCoord.x,
                                y: lastCoord.y
                            };
                        }
                        if (pathIndex > 1) {
                            // Move from lastCoord to lastPathCoord
                            this._graphics.lineTo(lastPathCoord.x, lastCoord.y);
                            this._graphics.lineTo(lastPathCoord.x, lastPathCoord.y);
                        }
                        if (pathIndex >= 1) {
                            // Move from lastPathCoord to new coord
                            this._graphics.lineTo(lastPathCoord.x, args[1]);
                            this._graphics.lineTo(args[0], args[1]);
                        }
                        if (!firstCoord) {
                            firstCoord = { x: args[0], y: args[1] };
                        }
                        lastCoord = { x: args[0], y: args[1] };
                        pathIndex++;
                        break;
                    // lineto command
                    case 'l':
                        args[0] += offset.x;
                        args[1] += offset.y;
                        this._graphics.lineTo(args[0], args[1]);
                        lastCoord = { x: args[0], y: args[1] };
                        break;
                    // curveto command
                    case 'c':
                        for (var k = 0, klen = args.length; k < klen; k += 2) {
                            args[k] += offset.x;
                            args[k + 1] += offset.y;
                        }
                        this._graphics.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
                        lastCoord = { x: args[4], y: args[5] };
                        lastControl = { x: args[2], y: args[3] };
                        break;
                    // vertial lineto command
                    case 'v':
                        args[0] += offset.y;
                        this._graphics.lineTo(lastCoord.x, args[0]);
                        lastCoord.y = args[0];
                        break;
                    // horizontal lineto command
                    case 'h':
                        args[0] += offset.x;
                        this._graphics.lineTo(args[0], lastCoord.y);
                        lastCoord.x = args[0];
                        break;
                    // quadratic curve command
                    case 's':
                        for (var l = 0, llen = args.length; l < llen; l += 2) {
                            args[l] += offset.x;
                            args[l + 1] += offset.y;
                        }
                        var rx = 2 * lastCoord.x - lastControl.x;
                        var ry = 2 * lastCoord.y - lastControl.y;
                        this._graphics.bezierCurveTo(rx, ry, args[0], args[1], args[2], args[3]);
                        lastCoord = { x: args[2], y: args[3] };
                        lastControl = { x: args[0], y: args[1] };
                        break;
                    // closepath command
                    case 'z':
                        // Z command is handled by M
                        break;
                    default:
                        throw new Error('Could not handle path command: ' + commandType + ' ' + args.join(','));
                }
            }
            if (pathIndex > 1) {
                // Move from lastCoord to lastPathCoord
                this._graphics.lineTo(lastPathCoord.x, lastCoord.y);
                this._graphics.lineTo(lastPathCoord.x, lastPathCoord.y);
            }
        };
        /**
         * Applies the given node's attributes to our PIXI.Graphics object
         * @param  {SVGElement} node
         */
        SVGGraphics.prototype.applySvgAttributes = function (node) {
            var attributes = {};
            // Get node attributes
            var i = node.attributes.length;
            var attribute;
            while (i--) {
                attribute = node.attributes[i];
                attributes[attribute.name] = attribute.value;
            }
            // CSS attributes override node attributes
            var style = node.getAttribute('style');
            var pairs, pair, split, key, value;
            if (style) {
                // Simply parse the inline css
                pairs = style.split(';');
                for (var j = 0, len = pairs.length; j < len; j++) {
                    pair = pairs[j].trim();
                    if (!pair) {
                        continue;
                    }
                    split = pair.split(':', 2);
                    key = split[0].trim();
                    value = split[1].trim();
                    attributes[key] = value;
                }
            }
            // Apply stroke style
            var strokeColor = 0x000000, strokeWidth = 1, strokeAlpha = 0;
            var color, intColor;
            if (attributes.stroke) {
                color = color2color_1.default(attributes.stroke, 'array');
                intColor = 256 * 256 * color[0] + 256 * color[1] + color[2];
                strokeColor = intColor;
                strokeAlpha = color[3];
            }
            if (attributes['stroke-width']) {
                strokeWidth = parseInt(attributes['stroke-width'], 10);
            }
            this._graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha);
            // Apply fill style
            var fillColor = 0x000000, fillAlpha = 0;
            if (attributes.fill) {
                color = color2color_1.default(attributes.fill, 'array');
                intColor = 256 * 256 * color[0] + 256 * color[1] + color[2];
                fillColor = intColor;
                fillAlpha = color[3];
                this._graphics.beginFill(fillColor, fillAlpha);
            }
        };
        /**
         * Builds a PIXI.Graphics object from the given SVG document
         * @param  {PIXI.Graphics} graphics
         * @param  {SVGDocument} svg
         */
        SVGGraphics.drawSVG = function (graphics, svg) {
            var svgGraphics = new SVGGraphics(graphics);
            var children = svg.children || svg.childNodes;
            for (var i = 0, len = children.length; i < len; i++) {
                if (children[i].nodeType !== 1) {
                    continue;
                }
                svgGraphics.drawNode(children[i]);
            }
            return svgGraphics;
        };
        SVGGraphics.importFromSVG = function (svgstr) {
            var frg = document.createElement("div");
            if (svgstr.trim().indexOf("<svg") !== 0) {
                svgstr = "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">" + svgstr + "</svg>";
            }
            frg.innerHTML = svgstr;
            var svg = frg.firstElementChild;
            return this.drawSVG(new PIXI.Graphics(), svg);
        };
        return SVGGraphics;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SVGGraphics;
});
define("app/common", ["require", "exports", "class/color2color"], function (require, exports, color2color_2) {
    "use strict";
    var _this = this;
    exports.square = function (v) { return v * v; }; // 平方
    var devicePixelRatio = window["_isMobile"] ? 1 : 1;
    var __pt2px = devicePixelRatio * 2;
    exports.pt2px = function (pt) { return pt * __pt2px; };
    var body = document.getElementById("body");
    // 禁用右键菜单
    document.oncontextmenu = function () {
        return false;
    };
    function emitReisze(con) {
        con.children.forEach(function (item) {
            item.emit("resize");
            if (item instanceof PIXI.Container && !item["_has_custom_resize"]) {
                emitReisze(item);
            }
        });
    }
    exports.emitReisze = emitReisze;
    var HALF_PI = Math.PI / 2;
    function _aniRotation(to_rotation, time) {
        var i = 0;
        var total = time || 30;
        var from_rotation = _main_stage.rotation;
        var dif_rotation = to_rotation - from_rotation;
        _main_stage.rotation = to_rotation;
    }
    function resizeView() {
        body.style.cssText = "";
        var width = body.clientWidth;
        var height = body.clientHeight;
        _main_stage.pivot.set(0, 0);
        _aniRotation(0);
        if (_current_stage && _current_stage["keep_direction"]) {
            if (_current_stage["keep_direction"] === "horizontal" && height > width //保持横屏方向
                || _current_stage["keep_direction"] === "vertical" && width > height) {
                _main_stage.pivot.set(width > height ? height : 0, width < height ? width : 0);
                var o = _current_stage["keep_direction"] === "vertical" ? -1 : 1;
                var target_rotation = o * HALF_PI;
                _aniRotation(target_rotation);
            }
        }
        if (exports.renderer.width !== width || exports.renderer.height !== height) {
            console.log(width, height);
            exports.renderer.resize(width, height);
        }
        emitReisze(_main_stage);
    }
    window.addEventListener("resize", resizeView);
    // export const renderer = window["R"] = new PIXI.lights.WebGLDeferredRenderer(body.clientWidth - 2 || 400, body.clientHeight - 2 || 300);
    exports.renderer = window["R"] = PIXI.autoDetectRenderer(body.clientWidth * devicePixelRatio, body.clientHeight * devicePixelRatio, {
        antialias: true,
        resolution: 1 / devicePixelRatio
    });
    body.appendChild(exports.renderer.view);
    exports.VIEW = {
        get WIDTH() {
            return (_main_stage.rotation % Math.PI ? exports.renderer.view.height : exports.renderer.view.width) * devicePixelRatio;
        },
        get HEIGHT() {
            return (_main_stage.rotation % Math.PI ? exports.renderer.view.width : exports.renderer.view.height) * devicePixelRatio;
        },
        get CENTER() {
            return new PIXI.Point(exports.VIEW.WIDTH / 2, exports.VIEW.HEIGHT / 2);
        },
        rotateXY: function (point) {
            if (_main_stage.rotation === -HALF_PI) {
                return { x: exports.VIEW.WIDTH - point.y, y: point.x };
            }
            else if (_main_stage.rotation === HALF_PI) {
                return { x: point.y, y: point.x };
            }
            else {
                return point;
            }
        }
    };
    exports.L_ANI_TIME = 1225;
    exports.B_ANI_TIME = 375;
    exports.M_ANI_TIME = 225;
    exports.S_ANI_TIME = 195;
    exports.on = function (obj, eventName, handle, is_once) {
        obj["interactive"] = true;
        if (is_once) {
            var _handle = handle;
            handle = function () {
                _handle.apply(this, arguments);
                register_event_res.forEach(function (register_event_info) {
                    if (register_event_info.target.removeEventListener) {
                        register_event_info.target.removeEventListener(register_event_info.eventName, register_event_info.handle);
                    }
                    else if (register_event_info.target.off) {
                        register_event_info.target.off(register_event_info.eventName, register_event_info.handle);
                    }
                });
            };
        }
        var register_event_res = eventName.split("|").map(function (en) {
            if (en === "touchenter") {
                var res_target = obj;
                var res_handle = function (e) {
                    console.log(e.target === obj);
                    if (e.target === _this) {
                        handle(e);
                    }
                };
                var res_eventName = "touchmove";
                res_target.on("touchmove", res_handle);
            }
            else if (en === "rightclick") {
                var res_target = document.body;
                var res_handle = function (e) {
                    if (e.which == 3) {
                        // alert("Disabled - do whatever you like here..");
                        handle(e);
                    }
                };
                var res_eventName = "mousedown";
                res_target.addEventListener("mousedown", res_handle);
            }
            else if (en === "keydown" || en === "keyup") {
                var res_target = document.body;
                var res_handle = handle;
                var res_eventName = en;
                res_target.addEventListener(res_eventName, res_handle);
            }
            else {
                var res_target = obj;
                var res_handle = handle;
                var res_eventName = en;
                res_target.on(res_eventName, res_handle);
            }
            return {
                target: res_target,
                handle: res_handle,
                eventName: res_eventName
            };
        });
        return register_event_res;
    };
    var _current_stage;
    var _current_stage_index = 0;
    var _stages = [];
    var _bg_color = null;
    var _main_stage = new PIXI.Container();
    var _bg;
    var DIRECTION = {
        vertical: "|",
        horizontal: "-"
    };
    exports.stageManager = {
        get DIRECTION() {
            return DIRECTION;
        },
        get direction() {
            return body.clientHeight > body.clientWidth ? DIRECTION.vertical : DIRECTION.horizontal;
        },
        get backgroundColor() {
            return _bg_color;
        },
        set backgroundColor(new_color) {
            if (_bg_color !== new_color) {
                var color = color2color_2.default(new_color, 'array');
                _bg_color = 256 * 256 * color[0] + 256 * color[1] + color[2];
                var new_bg = new PIXI.Graphics();
                new_bg.on("resize", function () {
                    var self = this;
                    self.clear();
                    self.lineStyle(0);
                    self.beginFill(_bg_color);
                    self.drawRect(0, 0, exports.VIEW.WIDTH, exports.VIEW.HEIGHT);
                    self.endFill();
                });
                new_bg.emit("resize");
                _bg && _main_stage.removeChild(_bg);
                _main_stage.addChildAt(_bg = new_bg, 0);
            }
        },
        set: function (stage) {
            if ((_current_stage_index = _stages.indexOf(stage)) === -1) {
                _current_stage_index = _stages.push(stage) - 1;
            }
            _current_stage = _stages[_current_stage_index];
            _main_stage.children[1] && _main_stage.removeChildAt(1);
            _main_stage.addChild(_current_stage);
            _current_stage.emit("active");
            resizeView();
            return exports.stageManager;
        },
        get: function () {
            if (!_current_stage["__is_inited"]) {
                _current_stage["__is_inited"] = true;
                _current_stage.emit("init");
            }
            return _main_stage;
        },
        add: function () {
            var stages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                stages[_i - 0] = arguments[_i];
            }
            _stages = _stages.concat(stages);
            return exports.stageManager;
        },
        next: function () {
            if (_current_stage_index > _stages.length - 1) {
                return;
            }
            _current_stage_index += 1;
            _current_stage = _stages[_current_stage_index];
            _main_stage.children[1] && _main_stage.removeChildAt(1);
            _main_stage.addChild(_current_stage);
            _current_stage.emit("active");
            resizeView();
            return _main_stage;
        }
    };
    exports.stageManager.backgroundColor = "#ddd";
    exports.touchManager = {
        _touchRegMap: {},
        register: function (touch) {
            var touch_id = touch.identifier;
            this._touchRegMap[touch_id] = true;
            return touch_id;
        },
        free: function (touch_id) {
            this._touchRegMap[touch_id] = false;
        },
        getFreeOne: function (touchs) {
            for (var i = 0, touch; touch = touchs[i]; i += 1) {
                if (!this._touchRegMap[touch.identifier]) {
                    return touch;
                }
            }
        },
        getById: function (touchs, touch_identifier) {
            for (var i = 0, touch; touch = touchs[i]; i += 1) {
                if (touch.identifier == touch_identifier) {
                    return touch;
                }
            }
        }
    };
    function mix_options(tmp_options, new_options) {
        for (var key in new_options) {
            if (tmp_options.hasOwnProperty(key)) {
                if (tmp_options[key] instanceof Object) {
                    if (new_options[key]) {
                        mix_options(tmp_options[key], new_options[key]);
                    }
                    else {
                        tmp_options[key] = new_options[key];
                    }
                }
                else {
                    tmp_options[key] = new_options[key];
                }
            }
        }
    }
    exports.mix_options = mix_options;
    function copy(source) {
        var res = new source.constructor();
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Object) {
                    res[key] = copy(source[key]);
                }
                else {
                    res[key] = source[key];
                }
            }
        }
        return res;
    }
    exports.copy = copy;
});
define("class/BackgroundGaussianBlur", ["require", "exports"], function (require, exports) {
    "use strict";
    var BackgroundGaussianBlur = (function (_super) {
        __extends(BackgroundGaussianBlur, _super);
        function BackgroundGaussianBlur(sprite, blur, quality, highlight) {
            if (blur === void 0) { blur = 20; }
            if (quality === void 0) { quality = 16; }
            if (highlight === void 0) { highlight = 1; }
            var maskMatrix = new PIXI.Matrix();
            /*
             * 顶点作色器
             */
            var vert = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform vec2 delta;\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vDelta;\nvarying mat3 vOtherMatrix;\n\nvoid main(void)\n{\n\tgl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\tvTextureCoord = aTextureCoord;\n\n\tvDelta = delta;\n    vOtherMatrix = otherMatrix;\n    \n    vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n\n\tvColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}";
            /*
             * 片元作色器
             */
            var frag = "precision mediump float;\n\nvarying vec2 vMapCoord;\nvarying vec2 vTextureCoord;\nvarying vec2 vDelta;\nvarying vec4 vColor;\nvarying mat3 vOtherMatrix;\n\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nfloat random(vec3 scale, float seed) {\n    /* use the fragment position for a different seed per-pixel */\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main() {\n    vec4 map = texture2D(mapSampler, vMapCoord) ;\n    if( map.a==0.0){\n        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;\n    }else{\n        vec4 color = vec4(0.0);\n        float total = 0.0;\n        \n        /* randomize the lookup values to hide the fixed number of samples */\n        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n        \n        for (float t = -" + quality + ".0; t <= " + quality + ".0; t++) {\n            float percent = (t + offset - 0.5) / " + quality + ".0;\n            float weight = 1.0 - abs(percent);\n            vec4 sample = texture2D(uSampler, vTextureCoord + vDelta * percent);\n            vec4 edge = texture2D(mapSampler, vMapCoord + vDelta * percent);\n            \n            if (edge.a > 0.0) {\n                /* switch to pre-multiplied alpha to correctly blur transparent images */\n                sample.rgb *= sample.a;\n\n                sample.rgb *= float(" + highlight + ");\n                \n                color += sample * weight;\n                total += weight;\n            }\n        }\n        \n        gl_FragColor = color / total;\n        \n        /* switch back from pre-multiplied alpha */\n        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n    }\n}";
            _super.call(this, vert, frag, {
                delta: {
                    type: 'v2',
                    value: { x: 0, y: 0 },
                },
                mapSampler: {
                    type: 'sampler2D',
                    value: sprite.texture
                },
                otherMatrix: {
                    type: 'mat3',
                    value: maskMatrix.toArray(true)
                },
            });
            this._delta = blur;
            // console.log(sprite.texture);
            this.maskSprite = sprite;
            this.maskMatrix = maskMatrix;
        }
        BackgroundGaussianBlur.Wrap = function (child) {
            var res = new PIXI.Container();
            // 创建一个有透明边缘的容器老包裹贴图对象，来规避贴图贴边引起的问题。
            child.parent && child.addChild(res);
            res.addChild(child);
            child.x = 1;
            child.y = 1;
            res.width = child.width + 2;
            res.height = child.height + 2;
            return res;
        };
        BackgroundGaussianBlur.ContainerToSprite = function (con, renderer, resolution, scaleMode) {
            var _old_cacheAsBitmap = con.cacheAsBitmap;
            con.cacheAsBitmap = true;
            var sprite = new PIXI.Sprite(con.generateTexture(renderer, resolution, scaleMode));
            con.cacheAsBitmap = _old_cacheAsBitmap;
            return sprite;
        };
        BackgroundGaussianBlur.prototype.applyFilter = function (renderer, input, output, clear) {
            var filterManager = renderer.filterManager;
            var shader = this.getShader(renderer);
            var _delta_width = this._delta / input.size.width;
            var _delta_height = this._delta / input.size.height;
            filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);
            this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
            var renderTarget = filterManager.getRenderTarget(true);
            this.uniforms.delta.value = {
                x: _delta_width,
                y: 0,
            };
            filterManager.applyFilter(shader, input, renderTarget, clear);
            this.uniforms.delta.value = {
                x: 0,
                y: _delta_height,
            };
            filterManager.applyFilter(shader, renderTarget, output, clear);
            // 很重要，不加的话会引发内存泄漏
            filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperty(BackgroundGaussianBlur.prototype, "blur", {
            // applyFilter(renderer, input, output, clear) {
            //     var filterManager = renderer.filterManager;
            //     var shader = this.getShader(renderer);
            //     // var renderTarget = filterManager.getRenderTarget(true);
            //     // filterManager.applyFilter(shader, input, renderTarget, clear);
            //     // this.blurFilter.applyFilter(renderer, renderTarget, output, clear);
            //     // filterManager.returnRenderTarget(renderTarget);
            //     // 把前面的渲染的渲染结果映射到遮罩矩阵中
            //     filterManager.calculateMappedMatrix(input.frame, this.maskSprite, this.maskMatrix);
            //     debugger
            //     this.uniforms.otherMatrix.value = this.maskMatrix.toArray(true);
            //     this.uniforms.scale.value.x = this.scale.x * (1 / input.frame.width);
            //     this.uniforms.scale.value.y = this.scale.y * (1 / input.frame.height);
            //     filterManager.applyFilter(shader, input, output);
            // }
            get: function () {
                return this._delta;
            },
            set: function (value) {
                this._delta = value;
            },
            enumerable: true,
            configurable: true
        });
        return BackgroundGaussianBlur;
    }(PIXI.AbstractFilter));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BackgroundGaussianBlur;
});
define("class/When", ["require", "exports"], function (require, exports) {
    "use strict";
    function noop() { }
    var When = (function () {
        function When(task_num, complete_cb) {
            this.task_num = null;
            this.complete_cb = null;
            this.complete_args = null;
            //创建一个密集数组
            this.task_num = Array.apply(null, { length: task_num });
            //所有子任务完成后的回调
            this.complete_cb = complete_cb instanceof Function ? complete_cb : noop;
            this.complete_args = [];
        }
        ;
        When.prototype.ok = function (task_id, arg) {
            delete this.task_num[task_id];
            this.complete_args[task_id] = arg;
            if (this.is_complete()) {
                this.complete_cb(this.complete_args);
            }
        };
        ;
        When.prototype.is_complete = function () {
            var _is_complete = true;
            //使用洗漱数组无法被遍历的特性，如果所有任务都被delete了，说明整个任务数组就是一个洗漱数组，some是无法遍历到任何对象的
            this.task_num.some(function () {
                _is_complete = false; //如果还有元素对象，则还没结束
                return true; //只执行一次
            });
            return _is_complete;
        };
        ;
        When.prototype.then = function (cb) {
            if (this.is_complete()) {
                cb(this.complete_args);
            }
            else {
                if (this.complete_cb === noop) {
                    this.complete_cb = cb;
                }
                else {
                    var before = this.complete_cb;
                    this.complete_cb = function () {
                        before.apply(this, arguments);
                        cb.apply(this, arguments);
                    };
                }
            }
        };
        ;
        return When;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = When;
});
define("app/engine/world", ["require", "exports", "app/engine/Collision", "app/class/Wall", "app/class/Bullet", "app/class/Flyer", "app/class/Ship", "app/common"], function (require, exports, Collision_6, Wall_1, Bullet_2, Flyer_1, Ship_1, common_1) {
    "use strict";
    var world = new p2.World({
        gravity: [0, 0]
    });
    var worldStep = 1 / 60;
    var _runNarrowphase = world.runNarrowphase;
    world.runNarrowphase = function (np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {
        // 如果si是飞船，无视同组的 普通子弹
        if (si["ship_team_tag"] &&
            si["ship_team_tag"] === sj["bullet_team_tag"]) {
            return;
        }
        // 同理sj
        if (sj["ship_team_tag"] &&
            sj["ship_team_tag"] === si["bullet_team_tag"]) {
            return;
        }
        // 如果是同队子弹，无视碰撞
        if (si["bullet_team_tag"] &&
            si["bullet_team_tag"] === sj["bullet_team_tag"]) {
            return;
        }
        return _runNarrowphase.call(this, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen);
    };
    // 计算穿透
    function emit_penetrate(bullet, obj) {
        if (obj.config.team_tag === bullet.config.team_tag) {
        }
        else {
            if (obj instanceof Wall_1.default) {
                bullet.emit("penetrate", obj, bullet.config.damage * obj.config.bulletproof);
                bullet.emit("in-wall", obj);
            }
            else {
                bullet.emit("penetrate", obj);
            }
        }
    }
    ;
    // world.on("impact", function(evt) {
    // });
    world.on("beginContact", function (evt) {
        var p2i_A = All_body_weakmap.get(evt.bodyA);
        var p2i_B = All_body_weakmap.get(evt.bodyB);
        if (!(p2i_A && p2i_B)) {
            return;
        }
        // console.log("beginContact",p2i_A,p2i_B);
        if (p2i_A instanceof Bullet_2.default) {
            var impact_bullet = p2i_A;
            emit_penetrate(p2i_A, p2i_B);
            var impact_obj = p2i_B;
        }
        if (p2i_B instanceof Bullet_2.default) {
            var impact_bullet = p2i_B;
            emit_penetrate(p2i_B, p2i_A);
            var impact_obj = p2i_A;
        }
        if (impact_obj) {
            // 同组判定
            if (impact_obj.config.team_tag &&
                impact_obj.config.team_tag === impact_bullet.config.team_tag) {
                return;
            }
            impact_obj.emit("change-hp", -impact_bullet.config.damage, 
            // 子弹 - 枪支 - 飞船
            impact_bullet.owner.owner);
        }
    });
    world.on("endContact", function (evt) {
        var p2i_A = All_body_weakmap.get(evt.bodyA);
        var p2i_B = All_body_weakmap.get(evt.bodyB);
        if (!(p2i_A && p2i_B)) {
            return;
        }
        if (p2i_A instanceof Bullet_2.default && p2i_B instanceof Wall_1.default) {
            p2i_A.emit("out-wall");
        }
        if (p2i_B instanceof Bullet_2.default && p2i_A instanceof Wall_1.default) {
            p2i_B.emit("out-wall");
        }
    });
    var All_body_weakmap = new WeakMap();
    var All_id_map = new Map();
    // TODO 使用数据库？
    var ship_md5_id_map = new Map();
    var ship_id_md5_map = new Map();
    var p2is = [];
    exports.engine = {
        world: world,
        listener: null,
        emit: function (eventName) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            exports.engine.listener && (_a = exports.engine.listener).emit.apply(_a, [eventName].concat(args));
            var _a;
        },
        add: function (item) {
            if (item instanceof Bullet_2.default) {
                ["explode"].forEach(function (eventName) {
                    item.on(eventName, function () {
                        exports.engine.emit(eventName, this);
                    });
                });
            }
            else if (item instanceof Ship_1.default) {
                ["die", "change-hp", "fire_start"].forEach(function (eventName) {
                    item.on(eventName, function () {
                        exports.engine.emit(eventName, this);
                    });
                });
                item.on("destroy", function () {
                    var ship_id = this._id;
                    var ship_md5_id = ship_id_md5_map.get(ship_id);
                    ship_md5_id_map.delete(ship_md5_id);
                    ship_id_md5_map.delete(ship_id);
                });
            }
            else if (item instanceof Flyer_1.default) {
                ["ember", "change-hp"].forEach(function (eventName) {
                    item.on(eventName, function () {
                        exports.engine.emit(eventName, this);
                    });
                });
            }
            p2is.push(item);
            All_body_weakmap.set(item.p2_body, item);
            All_id_map.set(item._id, item);
            item.emit("add-to-world", world);
            item.on("destroy", function () {
                console.log("destroy!!and remove!!", p2is.indexOf(this));
                p2is.splice(p2is.indexOf(this), 1);
                All_body_weakmap.delete(this.p2_body);
                All_id_map.delete(this._id);
            });
        },
        getGameBaseInfo: function () {
            return {
                rank: [],
            };
        },
        getRectangleObjects: function (x, y, width, height) {
            return p2is;
        },
        update: function (delay) {
            world.step(worldStep, delay / 100, 10);
            p2is.forEach(function (p2i) { return p2i.update(delay); });
        },
        newShip: function (ship_config) {
            var default_ship_config = {
                x: 50 + (common_1.VIEW.WIDTH - 100) * Math.random(),
                y: 50 + (common_1.VIEW.HEIGHT - 100) * Math.random(),
                body_color: 0x777777 * Math.random(),
                team_tag: Math.random()
            };
            ship_config = ship_config ? Object.assign(ship_config, default_ship_config) : default_ship_config;
            var new_ship = new Ship_1.default(ship_config);
            exports.engine.add(new_ship);
            if (ship_config["ship_md5_id"]) {
                ship_md5_id_map.set(ship_config["ship_md5_id"], new_ship._id);
                ship_id_md5_map.set(new_ship._id, ship_config["ship_md5_id"]);
            }
            return new_ship;
        },
        getShip: function (ship_md5_id) {
            var ship_id = ship_md5_id_map.get(ship_md5_id);
            return ship_id && All_id_map.get(ship_id);
        },
        setConfig: function (ship_id, new_ship_config) {
            var current_ship = All_id_map.get(ship_id);
            if (!(current_ship instanceof Ship_1.default)) {
                throw "SHIP ID NO REF INSTANCE:" + ship_id;
            }
            current_ship.operateShip(new_ship_config);
            return current_ship;
        },
        fire: function (ship_id) {
            var current_ship = All_id_map.get(ship_id);
            if (!(current_ship instanceof Ship_1.default)) {
                throw "SHIP ID NO REF INSTANCE:" + ship_id;
            }
            current_ship.fire(function (bullet) {
                exports.engine.add(bullet);
            });
        }
    };
    // 材质信息
    // 通用物体与通用物体
    world.addContactMaterial(new p2.ContactMaterial(Collision_6.P2I.material, Collision_6.P2I.material, {
        restitution: 0.0,
        stiffness: 500,
        relaxation: 0.1
    }));
    // 子弹与子弹、墙、通用物体，体现穿透性
    world.addContactMaterial(new p2.ContactMaterial(Bullet_2.default.material, Bullet_2.default.material, {
        restitution: 0.0,
        stiffness: 200,
        relaxation: 0.2
    }));
    // 子弹与子弹、墙、通用物体，体现穿透性
    world.addContactMaterial(new p2.ContactMaterial(Bullet_2.default.material, Wall_1.default.material, {
        restitution: 0.0,
        stiffness: 10,
        relaxation: 0.5
    }));
    // 子弹与子弹、墙、通用物体，体现穿透性
    world.addContactMaterial(new p2.ContactMaterial(Bullet_2.default.material, Collision_6.P2I.material, {
        restitution: 0.0,
        stiffness: 200,
        relaxation: 0.2
    }));
});
define("class/FlowLayout", ["require", "exports"], function (require, exports) {
    "use strict";
    var BaselineHandles = {
        "center": function (childs) {
            var max_height = 0;
            var height_list = childs.map(function (child) {
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
        "bottom": function (childs) {
            var max_height = 0;
            var height_list = childs.map(function (child) {
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
    };
    var default_flow_style = {};
    var FlowLayout = (function (_super) {
        __extends(FlowLayout, _super);
        function FlowLayout(childs, flow_style) {
            var _this = this;
            _super.call(this);
            this.max_width = Infinity;
            if (childs instanceof Array) {
                childs.forEach(function (child) { return _this._addFlowChildItem(child, flow_style); });
            }
            else if (childs) {
                this._addFlowChildItem(childs, flow_style);
            }
            this.reDrawFlow();
        }
        FlowLayout.prototype._addFlowChildItem = function (item, flow_style) {
            if (flow_style === void 0) { flow_style = {}; }
            item["_flow_style"] = flow_style || default_flow_style;
            this.addChild(item);
        };
        FlowLayout.prototype.reDrawFlow = function () {
            var childs = this.children;
            if (childs.length <= 1) {
                return;
            }
            var max_width = isFinite(this.max_width) ? this.max_width : (this.parent && this.parent.width);
            if (!isFinite(max_width) || !max_width) {
                max_width = document.body.clientWidth;
            }
            var pre_item = childs[0];
            var per_style = (pre_item["_flow_style"] || default_flow_style);
            var pre_bounds = pre_item.getBounds();
            // pre_item.position.set(0, 0);
            var current_line_width = pre_bounds.width; //当前行累计使用的宽度
            var current_line_childs = [pre_item];
            for (var i = 1, len = childs.length; i < len; i += 1) {
                var cur_item = childs[i];
                var cur_style = (cur_item["_flow_style"] || default_flow_style);
                var cur_bounds = cur_item.getBounds();
                var _new_line = function () {
                    cur_item.x = 0;
                    cur_item.y = pre_item.y + pre_bounds.height;
                    current_line_width = cur_bounds.width;
                    var baselineHandle = BaselineHandles[cur_style.baseline];
                    if (baselineHandle instanceof Function) {
                        baselineHandle(current_line_childs);
                    }
                    current_line_childs = [cur_item];
                };
                if (cur_style.float === "left") {
                    if (current_line_width + cur_bounds.width <= max_width) {
                        cur_item.y = pre_item.y;
                        cur_item.x = pre_item.x + pre_bounds.width;
                        current_line_width += cur_bounds.width;
                        current_line_childs.push(cur_item);
                    }
                    else {
                        _new_line();
                    }
                }
                else if (cur_style.float === "center") {
                    if (current_line_width + cur_bounds.width <= max_width) {
                        cur_item.y = pre_item.y;
                        cur_item.x = pre_item.x + (max_width - current_line_width - cur_bounds.width) / 2;
                        current_line_width += cur_bounds.width;
                        current_line_childs.push(cur_item);
                    }
                    else {
                        _new_line();
                        cur_item.x = max_width / 2 - cur_bounds.width / 2;
                    }
                }
                else {
                    _new_line();
                }
                pre_item = cur_item;
                per_style = cur_style;
                pre_bounds = cur_bounds;
            }
            // 最后一行
            var baselineHandle = BaselineHandles[cur_style.baseline];
            if (baselineHandle instanceof Function) {
                baselineHandle(current_line_childs);
            }
        };
        FlowLayout.prototype.addChildToFlow = function () {
            var _this = this;
            var childs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                childs[_i - 0] = arguments[_i];
            }
            var current_flow_style;
            childs.forEach(function (child) {
                if (child instanceof PIXI.DisplayObject) {
                    _this._addFlowChildItem(child, current_flow_style);
                }
                else {
                    current_flow_style = child;
                }
            });
            this.reDrawFlow();
            return childs[0];
        };
        return FlowLayout;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FlowLayout;
});
define("class/TextBuilder", ["require", "exports"], function (require, exports) {
    "use strict";
    var TextBuilder = (function (_super) {
        __extends(TextBuilder, _super);
        function TextBuilder(text, style) {
            _super.call(this);
            var paddingTop = parseFloat(style.paddingTop) || 0;
            var paddingBottom = parseFloat(style.paddingBottom) || 0;
            var paddingLeft = parseFloat(style.paddingLeft) || 0;
            var paddingRight = parseFloat(style.paddingRight) || 0;
            var left = parseFloat(style.left) || 0;
            var top = parseFloat(style.top) || 0;
            if (!style.font) {
                style.font = style.fontSize + "px " + style.fontFamily;
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
        Object.defineProperty(TextBuilder.prototype, "text", {
            get: function () {
                return this._textNode.text;
            },
            set: function (text) {
                this._textNode.text = text;
            },
            enumerable: true,
            configurable: true
        });
        return TextBuilder;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TextBuilder;
});
define("app/ux", ["require", "exports", "class/Tween", "class/FlowLayout", "class/TextBuilder", "app/class/Ship", "app/engine/Victor", "app/common", "app/const", "./class/shipShape.json"], function (require, exports, Tween_6, FlowLayout_1, TextBuilder_1, Ship_2, Victor_3, common_2, const_9, shipShape) {
    "use strict";
    /** 移动
     *
     */
    function moveShip(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, moveShip_cb) {
        if (const_9._isMobile) {
            var mobile_operator_1 = new PIXI.Graphics();
            (function () {
                var _size;
                var _border;
                mobile_operator_1.on("resize", function () {
                    mobile_operator_1.clear();
                    _size = Math.min(common_2.VIEW.HEIGHT, common_2.VIEW.WIDTH) / 6;
                    _border = _size / 6;
                    mobile_operator_1.lineStyle(_border, 0xFFFFFF, 0.5);
                    mobile_operator_1.beginFill(0xFFFFFF, 0.3);
                    mobile_operator_1.drawCircle(0, 0, _size);
                    mobile_operator_1.endFill();
                    mobile_operator_1.x = _border * 2 + _size;
                    mobile_operator_1.y = common_2.VIEW.HEIGHT - _size - _border * 2;
                    // handle resize
                    handle.clear();
                    var _h_size;
                    _h_size = _size / 3;
                    handle.beginFill(0xFFFFFF, 0.6);
                    handle.drawCircle(0, 0, _h_size);
                    handle.endFill();
                    handle.cacheAsBitmap = true;
                    handle.x = mobile_operator_1.x; // + _size;
                    handle.y = mobile_operator_1.y; // - _size;
                });
                var handle = new PIXI.Graphics();
                listen_stage.addChild(handle);
                // 交互
                mobile_operator_1.interactive = true;
                var handle_dir = new Victor_3.default(0, 0);
                var current_touch_id = null;
                common_2.on(mobile_operator_1, "touchstart|touchmove", function (e) {
                    var view_ship = get_view_ship();
                    var touch_list = e.data.originalEvent.touches;
                    // 多点触摸，寻找处于左下角的那个，不考虑最接近，但考虑一定要处于左下角
                    if (current_touch_id !== null) {
                        var touch = common_2.touchManager.getById(touch_list, current_touch_id);
                        var touch_point = {
                            x: touch.clientX,
                            y: touch.clientY
                        };
                    }
                    else {
                        var _touch_com = new Victor_3.default(0, 0);
                        var _control_able_size = _size + _border * 2; // 可控制的空间范围
                        for (var i = 0, touch; touch = touch_list[i]; i += 1) {
                            _touch_com.x = touch.clientX - mobile_operator_1.x;
                            _touch_com.y = touch.clientY - mobile_operator_1.y;
                            if (_touch_com.length() <= _control_able_size) {
                                var touch_point = {
                                    x: touch.clientX,
                                    y: touch.clientY
                                };
                                current_touch_id = common_2.touchManager.register(touch);
                                break;
                            }
                        }
                    }
                    if (!touch_point) {
                        current_touch_id = null;
                        return;
                    }
                    handle_dir.x = touch_point.x - mobile_operator_1.x;
                    handle_dir.y = touch_point.y - mobile_operator_1.y;
                    var _length = Math.min(handle_dir.length(), _size);
                    var force_rate = _length / _size;
                    handle_dir.setLength(force_rate * view_ship.config.force);
                    moveShip_cb({
                        x_speed: handle_dir.x,
                        y_speed: handle_dir.y,
                    });
                    // 移动handle控制球
                    handle_dir.setLength(force_rate * _size);
                    handle.x = mobile_operator_1.x + handle_dir.x;
                    handle.y = mobile_operator_1.y + handle_dir.y;
                });
                common_2.on(mobile_operator_1, "touchend|touchendoutside", function _cancel_force(e) {
                    var view_ship = get_view_ship();
                    if (current_touch_id === null) {
                        return;
                    }
                    requestAnimationFrame(function () {
                        common_2.touchManager.free(current_touch_id);
                        current_touch_id = null;
                    });
                    moveShip_cb({
                        x_speed: 0,
                        y_speed: 0,
                    });
                    handle.x = mobile_operator_1.x;
                    handle.y = mobile_operator_1.y;
                });
            }());
            // 确保操作面板处于摇柄球之上，不会音响touchendoutside事件;
            listen_stage.addChild(mobile_operator_1);
        }
        else {
            var speed_ux_1 = {
                37: "-x",
                65: "-x",
                38: "-y",
                87: "-y",
                39: "+x",
                68: "+x",
                40: "+y",
                83: "+y",
            };
            var effect_speed_keys_1 = []; // 记录按下的按钮
            var generate_speed_1 = function (force) {
                var effect_speed = new Victor_3.default(0, 0);
                if (effect_speed_keys_1.length) {
                    for (var i = 0, keyCode; keyCode = effect_speed_keys_1[i]; i += 1) {
                        var speed_info = speed_ux_1[keyCode];
                        effect_speed[speed_info.charAt(1)] = speed_info.charAt(0) === "-" ? -1 : 1;
                    }
                    effect_speed.setLength(force);
                }
                return effect_speed;
            };
            common_2.on(listen_stage, "keydown", function (e) {
                var view_ship = get_view_ship();
                if (speed_ux_1.hasOwnProperty(e.keyCode) && view_ship) {
                    move_target_point = null;
                    if (effect_speed_keys_1.indexOf(e.keyCode) === -1) {
                        effect_speed_keys_1.push(e.keyCode);
                    }
                    var effect_speed = generate_speed_1(view_ship.config.force);
                    moveShip_cb({
                        x_speed: effect_speed.x,
                        y_speed: effect_speed.y,
                    });
                }
            });
            common_2.on(listen_stage, "keyup", function (e) {
                var view_ship = get_view_ship();
                if (speed_ux_1.hasOwnProperty(e.keyCode) && view_ship) {
                    move_target_point = null;
                    effect_speed_keys_1.splice(effect_speed_keys_1.indexOf(e.keyCode), 1);
                    var effect_speed = generate_speed_1(view_ship.config.force);
                    moveShip_cb({
                        x_speed: effect_speed.x,
                        y_speed: effect_speed.y,
                    });
                }
            });
            // 电脑版本提供右键操作的支持
            // 将要去的目的点，在接近的时候改变飞船速度
            var move_target_point;
            var target_anchor = new PIXI.Graphics();
            target_anchor.lineStyle(const_9.pt2px(2), 0xff2244, 0.8);
            target_anchor.drawCircle(0, 0, const_9.pt2px(10));
            target_anchor.cacheAsBitmap = true;
            target_anchor.scale.set(0);
            view_stage.addChild(target_anchor);
            common_2.on(listen_stage, "rightclick", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    move_target_point = new Victor_3.default(e.x - view_stage.x, e.y - view_stage.y);
                    target_anchor.position.set(move_target_point.x, move_target_point.y);
                    ani_tween.Tween(target_anchor.scale)
                        .set({
                        x: 1,
                        y: 1
                    })
                        .to({
                        x: 0,
                        y: 0
                    }, const_9.B_ANI_TIME)
                        .start();
                }
            });
            ani_ticker.add(function () {
                var view_ship = get_view_ship();
                if (move_target_point) {
                    var curren_point = Victor_3.default.fromArray(view_ship.p2_body.interpolatedPosition);
                    var current_to_target_dis = curren_point.distance(move_target_point);
                    // 动力、质量、以及空间摩擦力的比例
                    var force_mass_rate = view_ship.config.force / view_ship.p2_body.mass / view_ship.p2_body.damping;
                    var force_rate = Math.min(Math.max(current_to_target_dis / force_mass_rate, 0), 1);
                    var force_vic = new Victor_3.default(move_target_point.x - view_ship.config.x, move_target_point.y - view_ship.config.y);
                    force_vic.setLength(view_ship.config.force * force_rate);
                    if (force_vic.lengthSq() <= 100) {
                        console.log("基本到达，停止自动移动");
                        move_target_point = null;
                    }
                    moveShip_cb({
                        x_speed: force_vic.x,
                        y_speed: force_vic.y
                    });
                }
            });
        }
    }
    exports.moveShip = moveShip;
    /** 旋转角度
     *
     */
    function turnHead(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, turnHead_cb) {
        if (const_9._isMobile) {
            // 旋转角度
            common_2.on(listen_stage, "touchstart|touchmove", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    var touch_list = e.data.originalEvent.touches;
                    var touch = common_2.touchManager.getFreeOne(touch_list);
                    if (!touch) {
                        return;
                    }
                    var touch_point = {
                        x: touch.clientX,
                        y: touch.clientY
                    };
                    var direction = new Victor_3.default(touch_point.x - common_2.VIEW.CENTER.x, touch_point.y - common_2.VIEW.CENTER.y);
                    turnHead_cb({
                        rotation: direction.angle()
                    });
                }
            });
        }
        else {
            common_2.on(listen_stage, "mousemove|mousedown", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    var touch_point = e.data.global;
                    var direction = new Victor_3.default(touch_point.x - common_2.VIEW.CENTER.x, touch_point.y - common_2.VIEW.CENTER.y);
                    turnHead_cb({
                        rotation: direction.angle()
                    });
                }
            });
        }
    }
    exports.turnHead = turnHead;
    /** 子弹发射
     *
     */
    function shipFire(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, shipFire_cb) {
        if (const_9._isMobile) {
            common_2.on(listen_stage, "touchstart", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    var touch_list = e.data.originalEvent.touches;
                    var touch = common_2.touchManager.getFreeOne(touch_list);
                    if (!touch) {
                        return;
                    }
                    shipFire_cb();
                }
            });
        }
        else {
            common_2.on(listen_stage, "mousedown", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    shipFire_cb();
                }
            });
        }
    }
    exports.shipFire = shipFire;
    /** 切换子弹自动发射的状态
     *
     */
    function shipAutoFire(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, shipAutoFire_cb) {
        if (const_9._isMobile) {
            var waiting_ti;
            common_2.on(listen_stage, "touchstart", function (e) {
                var view_ship = get_view_ship();
                if (view_ship) {
                    var touch_list = e.data.originalEvent.touches;
                    var touch = common_2.touchManager.getFreeOne(touch_list);
                    if (!touch) {
                        return;
                    }
                    waiting_ti = setTimeout(function () {
                        shipAutoFire_cb();
                        waiting_ti = null;
                    }, 1000);
                }
            });
            common_2.on(listen_stage, "touchend", function (e) {
                waiting_ti && clearTimeout(waiting_ti);
            });
        }
        else {
            common_2.on(listen_stage, "keydown", function (e) {
                if (e.keyCode == 69) {
                    var view_ship = get_view_ship();
                    if (view_ship) {
                        shipAutoFire_cb();
                    }
                }
            });
        }
    }
    exports.shipAutoFire = shipAutoFire;
    var proto_plan = new FlowLayout_1.default();
    var close_ProtoPlan_ti = null;
    function showProtoPlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeProto_cb) {
        var view_ship = get_view_ship();
        if (!view_ship) {
            return;
        }
        if (proto_plan["is_opened"] || proto_plan["is_ani"]) {
            return;
        }
        clearTimeout(close_ProtoPlan_ti);
        proto_plan["is_opened"] = true;
        proto_plan["is_ani"] = true;
        drawProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeProto_cb);
        ani_tween.Tween(proto_plan)
            .set({
            x: -proto_plan.width,
            y: common_2.VIEW.HEIGHT - proto_plan.height
        })
            .to({
            x: 0
        }, const_9.B_ANI_TIME)
            .easing(Tween_6.default.Easing.Quadratic.Out)
            .start()
            .onComplete(function () {
            proto_plan["is_ani"] = false;
        });
        listen_stage.addChild(proto_plan);
    }
    exports.showProtoPlan = showProtoPlan;
    /** 重绘属性加点面板
     *
     */
    function drawProtoPlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeProto_cb) {
        var view_ship = get_view_ship();
        // 销毁重绘
        proto_plan.children.slice().forEach(function (child) {
            proto_plan.removeChild(child);
            child.destroy();
        });
        var typeInfo = shipShape[view_ship.config.type];
        var proto_grow_config = typeInfo.body.proto_grow_config;
        for (var k in proto_grow_config) {
            var proto_grow_config_item = proto_grow_config[k];
            if (typeof proto_grow_config_item === "object") {
                var text_info = new TextBuilder_1.default(proto_grow_config_item.title + (" : " + view_ship.proto_list.filter(function (skill_name) { return skill_name === k; }).length + "/" + proto_grow_config_item.max), {
                    fontFamily: "微软雅黑",
                    fontSize: const_9.pt2px(10)
                });
                proto_plan.addChildToFlow(text_info, { float: "right" });
                text_info.interactive = true;
                (function (k, text_info) {
                    common_2.on(text_info, "click|tap", function () {
                        changeProto_cb(k, function () {
                            // 重绘
                            drawProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeProto_cb);
                            if (view_ship.config.level <= view_ship.config.proto_list_length) {
                                var delay_close = function () {
                                    close_ProtoPlan_ti = setTimeout(function () {
                                        hideProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker);
                                        close_ProtoPlan_ti = null;
                                    }, const_9.B_ANI_TIME);
                                };
                                // if(_isMobile) {
                                // 	delay_close();
                                // }else{
                                // 	// on(proto_plan, "mouseout", delay_close, true);
                                // 	proto_plan.once("mouseout", delay_close);
                                // }
                                delay_close();
                            }
                        });
                    });
                })(k, text_info);
            }
        }
        var bg = new PIXI.Graphics();
        bg.beginFill(0xffffff, 0.5);
        bg.drawRoundedRect(-10, -10, proto_plan.width + 20, proto_plan.height + 20, 5);
        proto_plan.addChildAt(bg, 0);
    }
    /** 关闭属性加点面板
     *
     */
    function hideProtoPlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker) {
        if (!proto_plan["is_opened"] || proto_plan["is_ani"]) {
            return;
        }
        proto_plan["is_opened"] = false;
        proto_plan["is_ani"] = true;
        ani_tween.Tween(proto_plan)
            .to({
            x: -proto_plan.width
        }, const_9.B_ANI_TIME)
            .easing(Tween_6.default.Easing.Quadratic.Out)
            .start()
            .onComplete(function () {
            proto_plan["is_ani"] = false;
            listen_stage.removeChild(proto_plan);
        });
    }
    exports.hideProtoPlan = hideProtoPlan;
    /** 切换属性加点面板的显示隐藏
     *
     */
    function toggleProtoPlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeProto_cb) {
        common_2.on(listen_stage, "keydown", function (e) {
            var view_ship = get_view_ship();
            if (!view_ship) {
                return;
            }
            if (e.keyCode == 67) {
                if (proto_plan["is_opened"]) {
                    hideProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker);
                }
                else {
                    showProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeProto_cb);
                }
            }
        });
        var view_ship = get_view_ship();
        function _init(view_ship) {
            view_ship.on("level-changed", function () {
                // 有可用属性点
                if (view_ship.config.proto_list_length < view_ship.config.level) {
                    showProtoPlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeProto_cb);
                }
            });
        }
        if (view_ship) {
            _init(view_ship);
        }
        else {
            listen_stage.on("view_ship-changed", function (view_ship) {
                _init(view_ship);
            });
        }
    }
    exports.toggleProtoPlan = toggleProtoPlan;
    /** 本地沙河模式工具
     *
     */
    function sandboxTools(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker) {
        common_2.on(listen_stage, "keydown", function (e) {
            var view_ship = get_view_ship();
            if (!view_ship) {
                return;
            }
            // 快速升级
            if (e.keyCode == 75) {
                var experience = Ship_2.default.level_to_experience(view_ship.config.level + 1);
                view_ship.emit("change-experience", experience - view_ship.config.experience);
            }
        });
    }
    exports.sandboxTools = sandboxTools;
    /** 显示形态加点面板
     *
     */
    // import * as shipShape from "./class/shipShape.json";
    var shape_plan = new FlowLayout_1.default();
    var close_ShapePlan_ti = null;
    function showShapePlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeable_shapes, changeShape_cb) {
        var view_ship = get_view_ship();
        if (!view_ship) {
            return;
        }
        drawShapePlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeable_shapes, changeShape_cb);
        if (shape_plan["is_opened"] || shape_plan["is_ani"]) {
            return;
        }
        clearTimeout(close_ShapePlan_ti);
        shape_plan["is_opened"] = true;
        shape_plan["is_ani"] = true;
        ani_tween.Tween(shape_plan)
            .set({
            x: common_2.VIEW.WIDTH,
            y: const_9.pt2px(10)
        })
            .to({
            x: common_2.VIEW.WIDTH - shape_plan.width
        }, const_9.B_ANI_TIME)
            .easing(Tween_6.default.Easing.Quadratic.Out)
            .start()
            .onComplete(function () {
            shape_plan["is_ani"] = false;
        });
        listen_stage.addChild(shape_plan);
    }
    exports.showShapePlan = showShapePlan;
    /** 重绘形态加点面板
     *
     */
    function drawShapePlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeable_shapes, changeShape_cb) {
        var view_ship = get_view_ship();
        // 销毁重绘
        shape_plan.children.slice().forEach(function (child) {
            shape_plan.removeChild(child);
            child.destroy();
        });
        // 先放到缓存中，计算出合适的布局后再搞事
        var items = [];
        var max_width = 0;
        changeable_shapes.forEach(function (type_name) {
            var typeInfo = shipShape[type_name];
            var image_info = new Ship_2.default(const_9.assign(const_9.assign({}, view_ship.config["toJSON"]()), { type: type_name }));
            image_info.x = image_info.width / 2;
            image_info.y = image_info.height;
            var text_info = new TextBuilder_1.default(typeInfo.name, {
                fontFamily: "微软雅黑",
                align: "center",
                fontSize: const_9.pt2px(10)
            });
            var item_info = new FlowLayout_1.default();
            item_info.max_width = Math.max(image_info.width, text_info.width);
            max_width = Math.max(item_info.max_width, max_width);
            item_info.addChildToFlow({ float: "center" }, image_info, text_info);
            items.push(item_info);
            item_info.interactive = true;
            common_2.on(item_info, "click|tap", function () {
                changeShape_cb(type_name, function () {
                    view_ship.emit("level-changed");
                });
            });
        });
        shape_plan.max_width = max_width * 2 + const_9.pt2px(10 + 10 + 20);
        items.forEach(function (item_info, i) {
            var item_info_bg = new PIXI.Graphics();
            // item_info_bg.lineStyle(1,0xff0000,1);
            item_info_bg.beginFill(0xffff00, 0.0);
            item_info_bg.drawRect(0, 0, max_width + const_9.pt2px(10 * (i % 2)), item_info.height + const_9.pt2px(10));
            item_info_bg.endFill();
            item_info.addChild(item_info_bg);
            item_info.width + item_info.height; // 强制调用计算属性，动态计算布局
            // 强行调用私有属性，到后面才统一计算布局绘制。
            shape_plan["_addFlowChildItem"](item_info, { float: "left" });
        });
        shape_plan.reDrawFlow();
        var bg = new PIXI.Graphics();
        bg.beginFill(0xffffff, 0.5);
        bg.drawRoundedRect(-10, -10, shape_plan.width + 20, shape_plan.height + 20, 5);
        shape_plan.addChildAt(bg, 0);
    }
    /** 关闭形态加点面板
     *
     */
    function hideShapePlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker) {
        if (!shape_plan["is_opened"] || shape_plan["is_ani"]) {
            return;
        }
        shape_plan["is_opened"] = false;
        shape_plan["is_ani"] = true;
        ani_tween.Tween(shape_plan)
            .to({
            x: common_2.VIEW.WIDTH
        }, const_9.B_ANI_TIME)
            .easing(Tween_6.default.Easing.Quadratic.Out)
            .start()
            .onComplete(function () {
            shape_plan["is_ani"] = false;
            listen_stage.removeChild(shape_plan);
        });
    }
    exports.hideShapePlan = hideShapePlan;
    /** 切换形态加点面板的显示隐藏
     *
     */
    function toggleShapePlan(
        /*事件监听层*/
        listen_stage, 
        /*视觉元素层*/
        view_stage, 
        /*动态获取运动视角对象*/
        get_view_ship, 
        /*动画控制器*/
        ani_tween, 
        /*渲染循环器*/
        ani_ticker, changeShape_cb) {
        var view_ship = get_view_ship();
        function _init(view_ship) {
            view_ship.on("level-changed", function () {
                // 有可用形态
                var changeable_shapes = view_ship.CHANGEABLE_SHAPES;
                if (changeable_shapes.length > 0) {
                    showShapePlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker, changeable_shapes, changeShape_cb);
                }
                else {
                    hideShapePlan(listen_stage, view_stage, get_view_ship, ani_tween, ani_ticker);
                }
            });
        }
        if (view_ship) {
            _init(view_ship);
        }
        else {
            listen_stage.on("view_ship-changed", function (view_ship) {
                view_ship && _init(view_ship);
            });
        }
    }
    exports.toggleShapePlan = toggleShapePlan;
});
define("app/editor", ["require", "exports", "class/Tween", "class/When", "app/class/Flyer", "app/class/Ship", "app/class/Wall", "app/class/HP", "app/engine/world", "./ediorStage.json", "app/common", "app/const", "app/ux"], function (require, exports, Tween_7, When_1, Flyer_2, Ship_3, Wall_2, HP_1, world_1, ediorStage, common_3, const_10, UX) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_7.default();
    var jump_tween = new Tween_7.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Graphics();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    // current_stage_wrap["keep_direction"] = "horizontal";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("button", "./res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("游戏加载中……", { font: const_10.pt2px(25) + "px 微软雅黑", fill: "#FFF" });
    exports.current_stage.addChild(loading_text);
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        /**素材加载
         * 初始化场景
         */
        function drawPlan() {
            exports.current_stage_wrap.clear();
            exports.current_stage_wrap.beginFill(0x999999, 1);
            exports.current_stage_wrap.drawRect(0, 0, common_3.VIEW.WIDTH, common_3.VIEW.HEIGHT);
            exports.current_stage_wrap.endFill();
        }
        exports.current_stage_wrap.on("resize", drawPlan);
        drawPlan();
        // 子弹绘图层
        var bullet_stage = new PIXI.Container();
        bullet_stage["update"] = function (delay) {
            this.children.forEach(function (bullet) {
                bullet.update(delay);
            });
        };
        exports.current_stage.addChild(bullet_stage);
        // 物体绘图层：墙、飞船等等
        var object_stage = new PIXI.Container();
        object_stage["update"] = function (delay) {
            this.children.forEach(function (obj) {
                obj.update(delay);
            });
        };
        exports.current_stage.addChild(object_stage);
        // 血量绘图层;
        var hp_stage = new PIXI.Container();
        exports.current_stage.addChild(hp_stage);
        hp_stage["update"] = function (delay) {
            this.children.forEach(function (hp) {
                hp.update(delay);
            });
        };
        if (ediorStage["flyers"] instanceof Array) {
            ediorStage["flyers"].forEach(function (flyer_config) {
                var flyer = new Flyer_2.default(const_10.assign({
                    x: 50 + Math.random() * (common_3.VIEW.WIDTH - 100),
                    y: 50 + Math.random() * (common_3.VIEW.HEIGHT - 100),
                    x_speed: 10 * 2 * (Math.random() - 0.5),
                    y_speed: 10 * 2 * (Math.random() - 0.5),
                    body_color: 0xffffff * Math.random()
                }, flyer_config));
                object_stage.addChild(flyer);
                var hp = new HP_1.default(flyer, ani_tween);
                hp_stage.addChild(hp);
                flyer.on("change-hp", function () {
                    hp.setHP();
                });
                flyer.on("ember", function () {
                    hp_stage.removeChild(hp);
                    hp.destroy();
                });
                world_1.engine.add(flyer);
            });
        }
        var EDGE_WIDTH = common_3.VIEW.WIDTH * 2;
        var EDGE_HEIGHT = common_3.VIEW.HEIGHT * 2;
        // 四边限制
        var top_edge = new Wall_2.default({
            x: EDGE_WIDTH / 2, y: 0,
            width: EDGE_WIDTH,
            height: 10
        });
        object_stage.addChild(top_edge);
        world_1.engine.add(top_edge);
        var bottom_edge = new Wall_2.default({
            x: EDGE_WIDTH / 2, y: EDGE_HEIGHT - 5,
            width: EDGE_WIDTH,
            height: 10
        });
        object_stage.addChild(bottom_edge);
        world_1.engine.add(bottom_edge);
        var left_edge = new Wall_2.default({
            x: 5, y: EDGE_HEIGHT / 2,
            width: 10,
            height: EDGE_HEIGHT
        });
        object_stage.addChild(left_edge);
        world_1.engine.add(left_edge);
        var right_edge = new Wall_2.default({
            x: EDGE_WIDTH - 5, y: EDGE_HEIGHT / 2,
            width: 10,
            height: EDGE_HEIGHT
        });
        object_stage.addChild(right_edge);
        world_1.engine.add(right_edge);
        (function () {
            var x_len = 6;
            var y_len = 6;
            var x_unit = EDGE_WIDTH / (x_len + 1);
            var y_unit = EDGE_HEIGHT / (y_len + 1);
            var width = 40;
            for (var _x = 1; _x <= x_len; _x += 1) {
                for (var _y = 1; _y <= y_len; _y += 1) {
                    var mid_edge = new Wall_2.default({
                        x: _x * x_unit - width / 2, y: _y * y_unit - width / 2,
                        width: width,
                        height: width
                    });
                    object_stage.addChild(mid_edge);
                    world_1.engine.add(mid_edge);
                }
            }
        })();
        if (ediorStage["myship"]) {
            var my_ship = new Ship_3.default(const_10.assign({
                x: common_3.VIEW.CENTER.x,
                y: common_3.VIEW.CENTER.y,
                body_color: 0x366345
            }, ediorStage["myship"]));
            object_stage.addChild(my_ship);
            world_1.engine.add(my_ship);
        }
        if (ediorStage["ships"] instanceof Array) {
            ediorStage["ships"].forEach(function (ship_config) {
                var ship = new Ship_3.default(const_10.assign({
                    x: 100 + (EDGE_WIDTH - 200) * Math.random(),
                    y: 100 + (EDGE_HEIGHT - 200) * Math.random(),
                    body_color: 0xffffff * Math.random()
                }, ship_config));
                object_stage.addChild(ship);
                var hp = new HP_1.default(ship, ani_tween);
                hp_stage.addChild(hp);
                ship.on("change-hp", function () {
                    hp.setHP();
                });
                ship.on("die", function () {
                    hp_stage.removeChild(hp);
                    hp.destroy();
                });
                world_1.engine.add(ship);
            });
        }
        // 辅助线
        (function () {
            var lines = new PIXI.Graphics();
            var x_unit = const_10.pt2px(10);
            var y_unit = const_10.pt2px(10);
            var x_len = (EDGE_WIDTH / x_unit) | 0;
            var y_len = (EDGE_HEIGHT / y_unit) | 0;
            lines.lineStyle(1, 0x333333, 0.8);
            for (var _x = 1; _x <= x_len; _x += 1) {
                lines.moveTo(_x * x_unit, 0);
                lines.lineTo(_x * x_unit, EDGE_HEIGHT);
            }
            for (var _y = 1; _y <= y_len; _y += 1) {
                lines.moveTo(0, _y * y_unit);
                lines.lineTo(EDGE_WIDTH, _y * y_unit);
            }
            exports.current_stage.addChildAt(lines, 0);
        })();
        /**初始化动画
         *
         */
        var pre_time;
        ani_ticker.add(function () {
            pre_time || (pre_time = performance.now() - 1000 / 60);
            var cur_time = performance.now();
            var dif_time = cur_time - pre_time;
            pre_time = cur_time;
            // 物理引擎运作
            world_1.engine.update(dif_time);
        });
        /**按钮事件
         *
         */
        /**交互动画
         *
         */
        // 飞船移动
        UX.moveShip(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (move_info) {
            my_ship.operateShip(move_info);
        });
        // 飞船转向
        UX.turnHead(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (turnHead_info) {
            my_ship.operateShip(turnHead_info);
        });
        // 飞船发射
        UX.shipFire(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function () {
            my_ship.fire(function (bullet) {
                bullet_stage.addChild(bullet);
                world_1.engine.add(bullet);
            });
        });
        // 飞船切换自动
        UX.shipAutoFire(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function () {
            my_ship.toggleKeepFire(function (bullet) {
                bullet_stage.addChild(bullet);
                world_1.engine.add(bullet);
            });
        });
        // 切换属性加点面板的显示隐藏
        UX.toggleProtoPlan(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (add_proto, cb_to_redraw) {
            my_ship.addProto(add_proto);
            cb_to_redraw();
        });
        // 沙盒工具
        UX.sandboxTools(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker);
        // 切换形态变化面板的显示隐藏
        UX.toggleShapePlan(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (new_shape, cb_to_redraw) {
            my_ship.changeType(new_shape);
            cb_to_redraw();
        });
        // 动画控制器
        var pre_time;
        ani_ticker.add(function () {
            ani_tween.update();
            jump_tween.update();
            if (my_ship) {
                exports.current_stage.x = common_3.VIEW.WIDTH / 2 - my_ship.x;
                exports.current_stage.y = common_3.VIEW.HEIGHT / 2 - my_ship.y;
            }
            pre_time || (pre_time = performance.now());
            var cur_time = performance.now();
            var dif_time = cur_time - pre_time;
            pre_time = cur_time;
            hp_stage["update"](dif_time);
        });
        /**帧率
         *
         */
        var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "right" });
        exports.current_stage_wrap.addChild(FPS_Text);
        FPS_ticker.add(function () {
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " W:" + common_3.VIEW.WIDTH + " H:" + common_3.VIEW.HEIGHT;
            if (my_ship) {
                var info = "\n";
                var config = my_ship.config["toJSON"]();
                for (var k in config) {
                    var val = config[k];
                    if (typeof val === "number") {
                        val = val.toFixed(2);
                    }
                    info += k + ": " + val + "\n";
                }
                info += "speed: " + Array.prototype.slice.call(my_ship.p2_body.velocity).map(function (s) { return s.toFixed(2); }) + "\n";
                FPS_Text.text += info;
            }
        });
        // 触发布局计算
        common_3.emitReisze(exports.current_stage_wrap);
        ani_tween.start();
        jump_tween.start();
        ani_ticker.start();
        FPS_ticker.start();
    }
    exports.loader.once("complete", function () {
        init_w.ok(2, []);
    });
    exports.current_stage_wrap.on("init", function () {
        init_w.ok(1, []);
    });
    exports.current_stage_wrap.on("active", function () {
        init_w.ok(0, []);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_3.emitReisze(this);
    });
    var init_w = new When_1.default(3, function () {
        renderInit(exports.loader, exports.loader.resources);
    });
});
/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */
define("app/engine/EventEmitter", ["require", "exports"], function (require, exports) {
    "use strict";
    var Emitter = (function () {
        function Emitter() {
            this._callbacks = {};
            /**
             * Listen on the given `event` with `fn`.
             *
             * @param {String} event
             * @param {Function} fn
             * @return {Emitter}
             * @api public
             */
            this.on = function (event, fn) {
                this._callbacks = this._callbacks || {};
                (this._callbacks[event] = this._callbacks[event] || [])
                    .push(fn);
                return this;
            };
            /**
             * Adds an `event` listener that will be invoked a single
             * time then automatically removed.
             *
             * @param {String} event
             * @param {Function} fn
             * @return {Emitter}
             * @api public
             */
            this.once = function (event, fn) {
                var self = this;
                function on() {
                    self.off(event, on);
                    fn.apply(this, arguments);
                }
                fn._off = on;
                this.on(event, on);
                return this;
            };
            /**
             * Remove the given callback for `event` or all
             * registered callbacks.
             *
             * @param {String} event
             * @param {Function} fn
             * @return {Emitter}
             * @api public
             */
            this.off = Emitter.prototype.removeAllListeners;
            this.removeListener = Emitter.prototype.removeAllListeners;
            /**
             * Emit `event` with the given args.
             *
             * @param {String} event
             * @param {Mixed} ...
             * @return {Emitter}
             */
            this.emit = function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var callbacks = this._callbacks[event];
                if (callbacks) {
                    callbacks = callbacks.slice(0);
                    for (var i = 0, len = callbacks.length; i < len; ++i) {
                        callbacks[i].apply(this, args);
                    }
                }
                return this;
            };
            /**
             * Return array of callbacks for `event`.
             *
             * @param {String} event
             * @return {Array}
             * @api public
             */
            this.listeners = function (event) {
                return this._callbacks[event] || [];
            };
            /**
             * Check if this emitter has `event` handlers.
             *
             * @param {String} event
             * @return {Boolean}
             * @api public
             */
            this.hasListeners = function (event) {
                return !!this.listeners(event).length;
            };
        }
        Emitter.prototype.removeAllListeners = function (event, fn) {
            // all
            if (0 == arguments.length) {
                this._callbacks = {};
                return this;
            }
            // specific event
            var callbacks = this._callbacks[event];
            if (!callbacks)
                return this;
            // remove all handlers
            if (1 == arguments.length) {
                delete this._callbacks[event];
                return this;
            }
            // remove specific handler
            var i = callbacks.indexOf(fn._off || fn);
            if (~i)
                callbacks.splice(i, 1);
            return this;
        };
        ;
        return Emitter;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Emitter;
});
define("app/engine/Protobuf", ["require", "exports"], function (require, exports) {
    "use strict";
    /* ProtocolBuffer client 0.1.0*/
    var constants = {
        TYPES: {
            uInt32: 0,
            sInt32: 0,
            int32: 0,
            double: 1,
            string: 2,
            message: 2,
            float: 5
        }
    };
    var util = {
        isSimpleType: function (type) {
            return (type === 'uInt32' ||
                type === 'sInt32' ||
                type === 'int32' ||
                type === 'uInt64' ||
                type === 'sInt64' ||
                type === 'float' ||
                type === 'double');
        },
    };
    var codec = (function () {
        var buffer = new ArrayBuffer(8);
        var float32Array = new Float32Array(buffer);
        var float64Array = new Float64Array(buffer);
        var uInt8Array = new Uint8Array(buffer);
        /**
         * Encode a unicode16 char code to utf8 bytes
         */
        function encode2UTF8(charCode) {
            if (charCode <= 0x7f) {
                return [charCode];
            }
            else if (charCode <= 0x7ff) {
                return [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
            }
            else {
                return [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
            }
        }
        function codeLength(code) {
            if (code <= 0x7f) {
                return 1;
            }
            else if (code <= 0x7ff) {
                return 2;
            }
            else {
                return 3;
            }
        }
        var Codec = {
            encodeUInt32: function (n) {
                n = parseInt(n);
                if (isNaN(n) || n < 0) {
                    return null;
                }
                var result = [];
                do {
                    var tmp = n % 128;
                    var next = Math.floor(n / 128);
                    if (next !== 0) {
                        tmp = tmp + 128;
                    }
                    result.push(tmp);
                    n = next;
                } while (n !== 0);
                return result;
            },
            encodeSInt32: function (n) {
                n = parseInt(n);
                if (isNaN(n)) {
                    return null;
                }
                n = n < 0 ? (Math.abs(n) * 2 - 1) : n * 2;
                return Codec.encodeUInt32(n);
            },
            decodeUInt32: function (bytes) {
                var n = 0;
                for (var i = 0; i < bytes.length; i++) {
                    var m = parseInt(bytes[i]);
                    n = n + ((m & 0x7f) * Math.pow(2, (7 * i)));
                    if (m < 128) {
                        return n;
                    }
                }
                return n;
            },
            decodeSInt32: function (bytes) {
                var n = this.decodeUInt32(bytes);
                var flag = ((n % 2) === 1) ? -1 : 1;
                n = ((n % 2 + n) / 2) * flag;
                return n;
            },
            encodeFloat: function (float) {
                float32Array[0] = float;
                return uInt8Array;
            },
            decodeFloat: function (bytes, offset) {
                if (!bytes || bytes.length < (offset + 4)) {
                    return null;
                }
                for (var i = 0; i < 4; i++) {
                    uInt8Array[i] = bytes[offset + i];
                }
                return float32Array[0];
            },
            encodeDouble: function (double) {
                float64Array[0] = double;
                return uInt8Array.subarray(0, 8);
            },
            decodeDouble: function (bytes, offset) {
                if (!bytes || bytes.length < (8 + offset)) {
                    return null;
                }
                for (var i = 0; i < 8; i++) {
                    uInt8Array[i] = bytes[offset + i];
                }
                return float64Array[0];
            },
            encodeStr: function (bytes, offset, str) {
                for (var i = 0; i < str.length; i++) {
                    var code = str.charCodeAt(i);
                    var codes = encode2UTF8(code);
                    for (var j = 0; j < codes.length; j++) {
                        bytes[offset] = codes[j];
                        offset++;
                    }
                }
                return offset;
            },
            /**
             * Decode string from utf8 bytes
             */
            decodeStr: function (bytes, offset, length) {
                var array = [];
                var end = offset + length;
                while (offset < end) {
                    var code = 0;
                    if (bytes[offset] < 128) {
                        code = bytes[offset];
                        offset += 1;
                    }
                    else if (bytes[offset] < 224) {
                        code = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
                        offset += 2;
                    }
                    else {
                        code = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
                        offset += 3;
                    }
                    array.push(code);
                }
                var str = '';
                for (var i = 0; i < array.length;) {
                    str += String.fromCharCode.apply(null, array.slice(i, i + 10000));
                    i += 10000;
                }
                return str;
            },
            /**
             * Return the byte length of the str use utf8
             */
            byteLength: function (str) {
                if (typeof (str) !== 'string') {
                    return -1;
                }
                var length = 0;
                for (var i = 0; i < str.length; i++) {
                    var code = str.charCodeAt(i);
                    length += codeLength(code);
                }
                return length;
            },
        };
        return Codec;
    })();
    var encoder = (function () {
        /**
         * Check if the msg follow the defination in the protos
         */
        function checkMsg(msg, protos) {
            if (!protos) {
                return false;
            }
            for (var name in protos) {
                var proto = protos[name];
                //All required element must exist
                switch (proto.option) {
                    case 'required':
                        if (typeof (msg[name]) === 'undefined') {
                            return false;
                        }
                    case 'optional':
                        if (typeof (msg[name]) !== 'undefined') {
                            if (!!protos.__messages[proto.type]) {
                                checkMsg(msg[name], protos.__messages[proto.type]);
                            }
                        }
                        break;
                    case 'repeated':
                        //Check nest message in repeated elements
                        if (!!msg[name] && !!protos.__messages[proto.type]) {
                            for (var i = 0; i < msg[name].length; i++) {
                                if (!checkMsg(msg[name][i], protos.__messages[proto.type])) {
                                    return false;
                                }
                            }
                        }
                        break;
                }
            }
            return true;
        }
        function encodeMsg(buffer, offset, protos, msg) {
            for (var name in msg) {
                if (!!protos[name]) {
                    var proto = protos[name];
                    switch (proto.option) {
                        case 'required':
                        case 'optional':
                            offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                            offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
                            break;
                        case 'repeated':
                            if (msg[name].length > 0) {
                                offset = encodeArray(msg[name], proto, offset, buffer, protos);
                            }
                            break;
                    }
                }
            }
            return offset;
        }
        function encodeProp(value, type, offset, buffer, protos) {
            switch (type) {
                case 'uInt32':
                    offset = writeBytes(buffer, offset, codec.encodeUInt32(value));
                    break;
                case 'int32':
                case 'sInt32':
                    offset = writeBytes(buffer, offset, codec.encodeSInt32(value));
                    break;
                case 'float':
                    writeBytes(buffer, offset, codec.encodeFloat(value));
                    offset += 4;
                    break;
                case 'double':
                    writeBytes(buffer, offset, codec.encodeDouble(value));
                    offset += 8;
                    break;
                case 'string':
                    var length = codec.byteLength(value);
                    //Encode length
                    offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
                    //write string
                    codec.encodeStr(buffer, offset, value);
                    offset += length;
                    break;
                default:
                    if (!!protos.__messages[type]) {
                        //Use a tmp buffer to build an internal msg
                        var tmpBuffer = new ArrayBuffer(codec.byteLength(JSON.stringify(value)));
                        var length = 0;
                        length = encodeMsg(tmpBuffer, length, protos.__messages[type], value);
                        //Encode length
                        offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
                        //contact the object
                        for (var i = 0; i < length; i++) {
                            buffer[offset] = tmpBuffer[i];
                            offset++;
                        }
                    }
                    break;
            }
            return offset;
        }
        /**
         * Encode reapeated properties, simple msg and object are decode differented
         */
        function encodeArray(array, proto, offset, buffer, protos) {
            var i = 0;
            if (util.isSimpleType(proto.type)) {
                offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));
                for (i = 0; i < array.length; i++) {
                    offset = encodeProp(array[i], proto.type, offset, buffer);
                }
            }
            else {
                for (i = 0; i < array.length; i++) {
                    offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                    offset = encodeProp(array[i], proto.type, offset, buffer, protos);
                }
            }
            return offset;
        }
        function writeBytes(buffer, offset, bytes) {
            for (var i = 0; i < bytes.length; i++, offset++) {
                buffer[offset] = bytes[i];
            }
            return offset;
        }
        function encodeTag(type, tag) {
            var value = constants.TYPES[type] || 2;
            return codec.encodeUInt32((tag << 3) | value);
        }
        var MsgEncoder = {
            init: function (protos) {
                this.protos = protos || {};
            },
            encode: function (route, msg) {
                //Get protos from protos map use the route as key
                var protos = this.protos[route];
                //Check msg
                if (!checkMsg(msg, protos)) {
                    return null;
                }
                //Set the length of the buffer 2 times bigger to prevent overflow
                var length = codec.byteLength(JSON.stringify(msg));
                //Init buffer and offset
                var buffer = new ArrayBuffer(length);
                var uInt8Array = new Uint8Array(buffer);
                var offset = 0;
                if (!!protos) {
                    offset = encodeMsg(uInt8Array, offset, protos, msg);
                    if (offset > 0) {
                        return uInt8Array.subarray(0, offset);
                    }
                }
                return null;
            },
        };
        return MsgEncoder;
    })();
    var decoder = (function () {
        var buffer;
        var offset = 0;
        function decodeMsg(msg, protos, length) {
            while (offset < length) {
                var head = getHead();
                var type = head.type;
                var tag = head.tag;
                var name = protos.__tags[tag];
                switch (protos[name].option) {
                    case 'optional':
                    case 'required':
                        msg[name] = decodeProp(protos[name].type, protos);
                        break;
                    case 'repeated':
                        if (!msg[name]) {
                            msg[name] = [];
                        }
                        decodeArray(msg[name], protos[name].type, protos);
                        break;
                }
            }
            return msg;
        }
        /**
         * Test if the given msg is finished
         */
        function isFinish(msg, protos) {
            return (!protos.__tags[peekHead().tag]);
        }
        /**
         * Get property head from protobuf
         */
        function getHead() {
            var tag = codec.decodeUInt32(getBytes());
            return {
                type: tag & 0x7,
                tag: tag >> 3
            };
        }
        /**
         * Get tag head without move the offset
         */
        function peekHead() {
            var tag = codec.decodeUInt32(peekBytes());
            return {
                type: tag & 0x7,
                tag: tag >> 3
            };
        }
        function decodeProp(type, protos) {
            switch (type) {
                case 'uInt32':
                    return codec.decodeUInt32(getBytes());
                case 'int32':
                case 'sInt32':
                    return codec.decodeSInt32(getBytes());
                case 'float':
                    var float = codec.decodeFloat(buffer, offset);
                    offset += 4;
                    return float;
                case 'double':
                    var double = codec.decodeDouble(buffer, offset);
                    offset += 8;
                    return double;
                case 'string':
                    var length = codec.decodeUInt32(getBytes());
                    var str = codec.decodeStr(buffer, offset, length);
                    offset += length;
                    return str;
                default:
                    if (!!protos && !!protos.__messages[type]) {
                        var length = codec.decodeUInt32(getBytes());
                        var msg = {};
                        decodeMsg(msg, protos.__messages[type], offset + length);
                        return msg;
                    }
                    break;
            }
        }
        function decodeArray(array, type, protos) {
            if (util.isSimpleType(type)) {
                var length = codec.decodeUInt32(getBytes());
                for (var i = 0; i < length; i++) {
                    array.push(decodeProp(type));
                }
            }
            else {
                array.push(decodeProp(type, protos));
            }
        }
        function getBytes(flag) {
            var bytes = [];
            var pos = offset;
            flag = flag || false;
            var b;
            do {
                b = buffer[pos];
                bytes.push(b);
                pos++;
            } while (b >= 128);
            if (!flag) {
                offset = pos;
            }
            return bytes;
        }
        function peekBytes() {
            return getBytes(true);
        }
        var MsgDecoder = {
            init: function (protos) {
                this.protos = protos || {};
            },
            setProtos: function (protos) {
                if (!!protos) {
                    this.protos = protos;
                }
            },
            decode: function (route, buf) {
                var protos = this.protos[route];
                buffer = buf;
                offset = 0;
                if (!!protos) {
                    return decodeMsg({}, protos, buffer.length);
                }
                return null;
            },
        };
        return MsgDecoder;
    })();
    /**
     * pomelo-protobuf
     * @author <zhang0935@gmail.com>
     */
    /**
     * Protocol buffer root
     * In browser, it will be window.protbuf
     */
    var Protobuf = {
        init: function (opts) {
            //On the serverside, use serverProtos to encode messages send to client
            Protobuf.encoder.init(opts.encoderProtos);
            //On the serverside, user clientProtos to decode messages receive from clients
            Protobuf.decoder.init(opts.decoderProtos);
        },
        encode: function (key, msg) {
            return Protobuf.encoder.encode(key, msg);
        },
        decode: function (key, msg) {
            return Protobuf.decoder.decode(key, msg);
        },
        /**
         * constants
         */
        constants: constants,
        /**
         * util module
         */
        util: util,
        /**
         * codec module
         */
        codec: codec,
        /**
         * encoder module
         */
        encoder: encoder,
        /**
         * decoder module
         */
        decoder: decoder,
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Protobuf;
});
define("app/engine/Protocol", ["require", "exports"], function (require, exports) {
    "use strict";
    var ByteArray = window["Buffer"] || window["Uint8Array"];
    var Protocol = {
        Package: {
            TYPE_HANDSHAKE: 1,
            TYPE_HANDSHAKE_ACK: 2,
            TYPE_HEARTBEAT: 3,
            TYPE_DATA: 4,
            TYPE_KICK: 5,
            /**
             * Package protocol encode.
             *
             * Pomelo package format:
             * +------+-------------+------------------+
             * | type | body length |       body       |
             * +------+-------------+------------------+
             *
             * Head: 4bytes
             *   0: package type,
             *      1 - handshake,
             *      2 - handshake ack,
             *      3 - heartbeat,
             *      4 - data
             *      5 - kick
             *   1 - 3: big-endian body length
             * Body: body length bytes
             *
             * @param  {Number}    type   package type
             * @param  {ByteArray} body   body content in bytes
             * @return {ByteArray}        new byte array that contains encode result
             */
            encode: function (type, body) {
                var length = body ? body.length : 0;
                var buffer = new ByteArray(PKG_HEAD_BYTES + length);
                var index = 0;
                buffer[index++] = type & 0xff;
                buffer[index++] = (length >> 16) & 0xff;
                buffer[index++] = (length >> 8) & 0xff;
                buffer[index++] = length & 0xff;
                if (body) {
                    copyArray(buffer, index, body, 0, length);
                }
                return buffer;
            },
            /**
             * Package protocol decode.
             * See encode for package format.
             *
             * @param  {ByteArray} buffer byte array containing package content
             * @return {Object}           {type: package type, buffer: body byte array}
             */
            decode: function (buffer) {
                var bytes = new ByteArray(buffer);
                var type = bytes[0];
                var index = 1;
                var length = ((bytes[index++]) << 16 | (bytes[index++]) << 8 | bytes[index++]) >>> 0;
                var body = length ? new ByteArray(length) : null;
                copyArray(body, 0, bytes, PKG_HEAD_BYTES, length);
                return { 'type': type, 'body': body };
            },
        },
        Message: {
            TYPE_REQUEST: 0,
            TYPE_NOTIFY: 1,
            TYPE_RESPONSE: 2,
            TYPE_PUSH: 3,
            /**
             * Message protocol encode.
             *
             * @param  {Number} id            message id
             * @param  {Number} type          message type
             * @param  {Number} compressRoute whether compress route
             * @param  {Number|String} route  route code or route string
             * @param  {Buffer} msg           message body bytes
             * @return {Buffer}               encode result
             */
            encode: function (id, type, compressRoute, route, msg) {
                // caculate message max length
                var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
                var msgLen = MSG_FLAG_BYTES + idBytes;
                if (msgHasRoute(type)) {
                    if (compressRoute) {
                        if (typeof route !== 'number') {
                            throw new Error('error flag for number route!');
                        }
                        msgLen += MSG_ROUTE_CODE_BYTES;
                    }
                    else {
                        msgLen += MSG_ROUTE_LEN_BYTES;
                        if (route) {
                            route = Protocol.strencode(route);
                            if (route.length > 255) {
                                throw new Error('route maxlength is overflow');
                            }
                            msgLen += route.length;
                        }
                    }
                }
                if (msg) {
                    msgLen += msg.length;
                }
                var buffer = new ByteArray(msgLen);
                var offset = 0;
                // add flag
                offset = encodeMsgFlag(type, compressRoute, buffer, offset);
                // add message id
                if (msgHasId(type)) {
                    offset = encodeMsgId(id, idBytes, buffer, offset);
                }
                // add route
                if (msgHasRoute(type)) {
                    offset = encodeMsgRoute(compressRoute, route, buffer, offset);
                }
                // add body
                if (msg) {
                    offset = encodeMsgBody(msg, buffer, offset);
                }
                return buffer;
            },
            /**
             * Message protocol decode.
             *
             * @param  {Buffer|Uint8Array} buffer message bytes
             * @return {Object}            message object
             */
            decode: function (buffer) {
                var bytes = new ByteArray(buffer);
                var bytesLen = bytes.length || bytes.byteLength;
                var offset = 0;
                var id = 0;
                var route = null;
                // parse flag
                var flag = bytes[offset++];
                var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
                var type = (flag >> 1) & MSG_TYPE_MASK;
                // parse id
                if (msgHasId(type)) {
                    var byte = bytes[offset++];
                    id = byte & 0x7f;
                    while (byte & 0x80) {
                        id <<= 7;
                        byte = bytes[offset++];
                        id |= byte & 0x7f;
                    }
                }
                // parse route
                if (msgHasRoute(type)) {
                    if (compressRoute) {
                        route = (bytes[offset++]) << 8 | bytes[offset++];
                    }
                    else {
                        var routeLen = bytes[offset++];
                        if (routeLen) {
                            route = new ByteArray(routeLen);
                            copyArray(route, 0, bytes, offset, routeLen);
                            route = Protocol.strdecode(route);
                        }
                        else {
                            route = '';
                        }
                        offset += routeLen;
                    }
                }
                // parse body
                var bodyLen = bytesLen - offset;
                var body = new ByteArray(bodyLen);
                copyArray(body, 0, bytes, offset, bodyLen);
                return {
                    'id': id, 'type': type, 'compressRoute': compressRoute,
                    'route': route, 'body': body
                };
            },
        },
        /**
         * pomele client encode
         * id message id;
         * route message route
         * msg message body
         * socketio current support string
         */
        strencode: function (str) {
            var byteArray = new ByteArray(str.length * 3);
            var offset = 0;
            for (var i = 0; i < str.length; i++) {
                var charCode = str.charCodeAt(i);
                var codes = null;
                if (charCode <= 0x7f) {
                    codes = [charCode];
                }
                else if (charCode <= 0x7ff) {
                    codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
                }
                else {
                    codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
                }
                for (var j = 0; j < codes.length; j++) {
                    byteArray[offset] = codes[j];
                    ++offset;
                }
            }
            var _buffer = new ByteArray(offset);
            copyArray(_buffer, 0, byteArray, 0, offset);
            return _buffer;
        },
        /**
         * client decode
         * msg String data
         * return Message Object
         */
        strdecode: function (buffer) {
            var bytes = new ByteArray(buffer);
            var array = [];
            var offset = 0;
            var charCode = 0;
            var end = bytes.length;
            while (offset < end) {
                if (bytes[offset] < 128) {
                    charCode = bytes[offset];
                    offset += 1;
                }
                else if (bytes[offset] < 224) {
                    charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
                    offset += 2;
                }
                else {
                    charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
                    offset += 3;
                }
                array.push(charCode);
            }
            var res = '';
            var chunk = 8 * 1024;
            var i;
            for (i = 0; i < array.length / chunk; i++) {
                res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
            }
            res += String.fromCharCode.apply(null, array.slice(i * chunk));
            return res;
        },
    };
    var PKG_HEAD_BYTES = 4;
    var MSG_FLAG_BYTES = 1;
    var MSG_ROUTE_CODE_BYTES = 2;
    var MSG_ID_MAX_BYTES = 5;
    var MSG_ROUTE_LEN_BYTES = 1;
    var MSG_ROUTE_CODE_MAX = 0xffff;
    var MSG_COMPRESS_ROUTE_MASK = 0x1;
    var MSG_TYPE_MASK = 0x7;
    var Package = Protocol.Package;
    var Message = Protocol.Message;
    var copyArray = function (dest, doffset, src, soffset, length) {
        if ('function' === typeof src.copy) {
            // Buffer
            src.copy(dest, doffset, soffset, soffset + length);
        }
        else {
            // Uint8Array
            for (var index = 0; index < length; index++) {
                dest[doffset++] = src[soffset++];
            }
        }
    };
    var msgHasId = function (type) {
        return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE;
    };
    var msgHasRoute = function (type) {
        return type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY ||
            type === Message.TYPE_PUSH;
    };
    var caculateMsgIdBytes = function (id) {
        var len = 0;
        do {
            len += 1;
            id >>= 7;
        } while (id > 0);
        return len;
    };
    var encodeMsgFlag = function (type, compressRoute, buffer, offset) {
        if (type !== Message.TYPE_REQUEST && type !== Message.TYPE_NOTIFY &&
            type !== Message.TYPE_RESPONSE && type !== Message.TYPE_PUSH) {
            throw new Error('unkonw message type: ' + type);
        }
        buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);
        return offset + MSG_FLAG_BYTES;
    };
    var encodeMsgId = function (id, idBytes, buffer, offset) {
        var index = offset + idBytes - 1;
        buffer[index--] = id & 0x7f;
        while (index >= offset) {
            id >>= 7;
            buffer[index--] = id & 0x7f | 0x80;
        }
        return offset + idBytes;
    };
    var encodeMsgRoute = function (compressRoute, route, buffer, offset) {
        if (compressRoute) {
            if (route > MSG_ROUTE_CODE_MAX) {
                throw new Error('route number is overflow');
            }
            buffer[offset++] = (route >> 8) & 0xff;
            buffer[offset++] = route & 0xff;
        }
        else {
            if (route) {
                buffer[offset++] = route.length & 0xff;
                copyArray(buffer, offset, route, 0, route.length);
                offset += route.length;
            }
            else {
                buffer[offset++] = 0;
            }
        }
        return offset;
    };
    var encodeMsgBody = function (msg, buffer, offset) {
        copyArray(buffer, offset, msg, 0, msg.length);
        return offset + msg.length;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Protocol;
});
define("app/engine/Pomelo", ["require", "exports", "app/engine/Protobuf", "app/engine/Protocol", "app/engine/EventEmitter"], function (require, exports, Protobuf_1, Protocol_1, EventEmitter_1) {
    "use strict";
    var JS_WS_CLIENT_TYPE = 'js-websocket';
    var JS_WS_CLIENT_VERSION = '0.0.1';
    var Package = Protocol_1.default.Package;
    var Message = Protocol_1.default.Message;
    var RES_OK = 200;
    var RES_FAIL = 500;
    var RES_OLD_CLIENT = 501;
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() { }
            F.prototype = o;
            return new F();
        };
    }
    var Pomelo = (function (_super) {
        __extends(Pomelo, _super);
        function Pomelo() {
            _super.apply(this, arguments);
            this.socket = null;
            this.reqId = 0;
            this.callbacks = {};
            //Map from request id to route
            this.routeMap = {};
            this.heartbeatInterval = 0;
            this.heartbeatTimeout = 0;
            this.nextHeartbeatTimeout = 0;
            this.gapThreshold = 100; // heartbeat gap threashold
            this.heartbeatId = null;
            this.heartbeatTimeoutId = null;
            this.handshakeCallback = null;
            this.handshakeBuffer = {
                'sys': {
                    type: JS_WS_CLIENT_TYPE,
                    version: JS_WS_CLIENT_VERSION
                },
                'user': {}
            };
            this.initCallback = null;
            this.initWebSocket = function (url, cb) {
                var _this = this;
                console.log('connect to ' + url);
                var onopen = function (event) {
                    var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol_1.default.strencode(JSON.stringify(_this.handshakeBuffer)));
                    _this.send(obj);
                };
                var onmessage = function (event) {
                    _this.processPackage(Package.decode(event.data), cb);
                    // new package arrived, update the heartbeat timeout
                    if (_this.heartbeatTimeout) {
                        _this.nextHeartbeatTimeout = Date.now() + _this.heartbeatTimeout;
                    }
                };
                var onerror = function (event) {
                    _this.emit('io-error', event);
                    console.error('socket error: ', event);
                };
                var onclose = function (event) {
                    _this.emit('close', event);
                    console.error('socket close: ', event);
                };
                var socket = this.socket = new WebSocket(url);
                socket.binaryType = 'arraybuffer';
                socket.onopen = onopen;
                socket.onmessage = onmessage;
                socket.onerror = onerror;
                socket.onclose = onclose;
            };
            this.dict = null;
            this.handler = {};
            this.handlers = (_a = {},
                _a[Package.TYPE_HANDSHAKE] = this.handshake,
                _a[Package.TYPE_HEARTBEAT] = this.heartbeat,
                _a[Package.TYPE_DATA] = this.onData,
                _a[Package.TYPE_KICK] = this.onKick,
                _a
            );
            this.data = null;
            var _a;
        }
        Pomelo.prototype.init = function (params, cb) {
            this.initCallback = cb;
            var host = params.host;
            var port = params.port;
            var url = 'ws://' + host;
            if (port) {
                url += ':' + port;
            }
            this.handshakeBuffer.user = params.user;
            this.handshakeCallback = params.handshakeCallback;
            this.initWebSocket(url, cb);
        };
        ;
        Pomelo.prototype.disconnect = function () {
            if (this.socket) {
                if (this.socket.disconnect)
                    this.socket.disconnect();
                if (this.socket.close)
                    this.socket.close();
                console.log('disconnect');
                this.socket = null;
            }
            if (this.heartbeatId) {
                clearTimeout(this.heartbeatId);
                this.heartbeatId = null;
            }
            if (this.heartbeatTimeoutId) {
                clearTimeout(this.heartbeatTimeoutId);
                this.heartbeatTimeoutId = null;
            }
        };
        ;
        Pomelo.prototype.request = function (route, msg, cb) {
            if (arguments.length === 2 && typeof msg === 'function') {
                cb = msg;
                msg = {};
            }
            else {
                msg = msg || {};
            }
            route = route || msg.route;
            if (!route) {
                return;
            }
            this.reqId++;
            this.sendMessage(this.reqId, route, msg);
            this.callbacks[this.reqId] = cb;
            this.routeMap[this.reqId] = route;
        };
        ;
        Pomelo.prototype.notify = function (route, msg) {
            msg = msg || {};
            this.sendMessage(0, route, msg);
        };
        ;
        Pomelo.prototype.sendMessage = function (reqId, route, msg) {
            var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
            //compress message by protobuf
            var protos = !!this.data.protos ? this.data.protos.client : {};
            if (!!protos[route]) {
                msg = Protobuf_1.default.encode(route, msg);
            }
            else {
                msg = Protocol_1.default.strencode(JSON.stringify(msg));
            }
            var compressRoute = 0;
            if (this.dict && this.dict[route]) {
                route = this.dict[route];
                compressRoute = 1;
            }
            msg = Message.encode(reqId, type, compressRoute, route, msg);
            var packet = Package.encode(Package.TYPE_DATA, msg);
            this.send(packet);
        };
        ;
        Pomelo.prototype.send = function (packet) {
            this.socket.send(packet.buffer);
        };
        ;
        Pomelo.prototype.heartbeat = function (data) {
            var _this = this;
            if (!this.heartbeatInterval) {
                // no heartbeat
                return;
            }
            var obj = Package.encode(Package.TYPE_HEARTBEAT);
            if (this.heartbeatTimeoutId) {
                clearTimeout(this.heartbeatTimeoutId);
                this.heartbeatTimeoutId = null;
            }
            if (this.heartbeatId) {
                // already in a heartbeat interval
                return;
            }
            this.heartbeatId = setTimeout(function () {
                _this.heartbeatId = null;
                _this.send(obj);
                _this.nextHeartbeatTimeout = Date.now() + _this.heartbeatTimeout;
                _this.heartbeatTimeoutId = setTimeout(_this.heartbeatTimeoutCb, _this.heartbeatTimeout);
            }, this.heartbeatInterval);
        };
        ;
        Pomelo.prototype.heartbeatTimeoutCb = function () {
            var gap = this.nextHeartbeatTimeout - Date.now();
            if (gap > this.gapThreshold) {
                this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb, gap);
            }
            else {
                console.error('server heartbeat timeout');
                this.emit('heartbeat timeout');
                this.disconnect();
            }
        };
        ;
        Pomelo.prototype.handshake = function (data) {
            data = JSON.parse(Protocol_1.default.strdecode(data));
            if (data.code === RES_OLD_CLIENT) {
                this.emit('error', 'client version not fullfill');
                return;
            }
            if (data.code !== RES_OK) {
                this.emit('error', 'handshake fail');
                return;
            }
            this.handshakeInit(data);
            var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
            this.send(obj);
            if (this.initCallback) {
                this.initCallback(this.socket);
                this.initCallback = null;
            }
        };
        ;
        Pomelo.prototype.onData = function (data) {
            //probuff decode
            var msg = Message.decode(data);
            if (msg.id > 0) {
                msg.route = this.routeMap[msg.id];
                delete this.routeMap[msg.id];
                if (!msg.route) {
                    return;
                }
            }
            msg.body = this.deCompose(msg);
            this.processMessage(exports.pomelo, msg);
        };
        ;
        Pomelo.prototype.onKick = function (data) {
            this.emit('onKick');
        };
        ;
        Pomelo.prototype.processPackage = function (msg) {
            this.handlers[msg.type].call(this, msg.body);
        };
        ;
        Pomelo.prototype.processMessage = function (pomelo, msg) {
            if (!msg.id) {
                // server push message
                this.emit(msg.route, msg.body);
                return;
            }
            //if have a id then find the callback function with the request
            var cb = this.callbacks[msg.id];
            delete this.callbacks[msg.id];
            if (typeof cb !== 'function') {
                return;
            }
            cb(msg.body);
            return;
        };
        ;
        Pomelo.prototype.processMessageBatch = function (pomelo, msgs) {
            for (var i = 0, l = msgs.length; i < l; i++) {
                this.processMessage(pomelo, msgs[i]);
            }
        };
        ;
        Pomelo.prototype.deCompose = function (msg) {
            var protos = !!this.data.protos ? this.data.protos.server : {};
            var abbrs = this.data.abbrs;
            var route = msg.route;
            //Decompose route from dict
            if (msg.compressRoute) {
                if (!abbrs[route]) {
                    return {};
                }
                route = msg.route = abbrs[route];
            }
            if (!!protos[route]) {
                return Protobuf_1.default.decode(route, msg.body);
            }
            else {
                return JSON.parse(Protocol_1.default.strdecode(msg.body));
            }
            // return msg;
        };
        ;
        Pomelo.prototype.handshakeInit = function (data) {
            if (data.sys && data.sys.heartbeat) {
                this.heartbeatInterval = data.sys.heartbeat * 1000; // heartbeat interval
                this.heartbeatTimeout = this.heartbeatInterval * 2; // max heartbeat timeout
            }
            else {
                this.heartbeatInterval = 0;
                this.heartbeatTimeout = 0;
            }
            this.initData(data);
            if (typeof this.handshakeCallback === 'function') {
                this.handshakeCallback(data.user);
            }
        };
        ;
        //Initilize data used in pomelo client
        Pomelo.prototype.initData = function (data) {
            if (!data || !data.sys) {
                return;
            }
            this.data = this.data || {};
            var dict = data.sys.dict;
            var protos = data.sys.protos;
            //Init compress dict
            if (dict) {
                this.data.dict = dict;
                this.data.abbrs = {};
                for (var route in dict) {
                    this.data.abbrs[dict[route]] = route;
                }
            }
            //Init protobuf protos
            if (protos) {
                this.data.protos = {
                    server: protos.server || {},
                    client: protos.client || {}
                };
                if (!!Protobuf_1.default) {
                    Protobuf_1.default.init({ encoderProtos: protos.client, decoderProtos: protos.server });
                }
            }
        };
        ;
        return Pomelo;
    }(EventEmitter_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Pomelo;
    exports.pomelo = new Pomelo;
});
/*jslint vars: true, nomen: true, plusplus: true, continue:true, forin:true */
/*global Node, BoundsNode */
define("app/engine/QuadTree", ["require", "exports"], function (require, exports) {
    /*
        The MIT License
        Copyright (c) 2011 Mike Chambers
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
    */
    /**
    * A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
    * @module QuadTree
    **/
    "use strict";
    /****************** QuadTree ****************/
    /**
    * QuadTree data structure.
    * @class QuadTree
    * @constructor
    * @param {Object} An object representing the bounds of the top level of the QuadTree. The object
    * should contain the following properties : x, y, width, height
    * @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds
    * (width / height)(false). Default value is false.
    * @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
    * @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
    **/
    var QuadTree = (function () {
        function QuadTree(bounds, pointQuad, maxDepth, maxChildren) {
            /**
            * The root node of the QuadTree which covers the entire area being segmented.
            * @property root
            * @type Node
            **/
            this.root = null;
            var node;
            if (pointQuad) {
                node = new Node(bounds, 0, maxDepth, maxChildren);
            }
            else {
                node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
            }
            this.root = node;
        }
        /**
        * Inserts an item into the QuadTree.
        * @method insert
        * @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y
        * properties that represents its position in 2D space.
        **/
        QuadTree.prototype.insert = function (item) {
            if (item instanceof Array) {
                var len = item.length;
                var i;
                for (i = 0; i < len; i++) {
                    this.root.insert(item[i]);
                }
            }
            else {
                this.root.insert(item);
            }
        };
        ;
        /**
        * Clears all nodes and children from the QuadTree
        * @method clear
        **/
        QuadTree.prototype.clear = function () {
            this.root.clear();
        };
        ;
        /**
        * Retrieves all items / points in the same node as the specified item / point. If the specified item
        * overlaps the bounds of a node, then all children in both nodes will be returned.
        * @method retrieve
        * @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
        * with dimensions (x, y, width, height) properties.
        **/
        QuadTree.prototype.retrieve = function (item) {
            //get a copy of the array of items
            var out = this.root.retrieve(item).slice(0);
            return out;
        };
        ;
        return QuadTree;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = QuadTree;
    /************** Node ********************/
    var Node = (function () {
        function Node(bounds, depth, maxDepth, maxChildren) {
            //subnodes
            this.nodes = [];
            this._classConstructor = Node;
            //children contained directly in the node
            this.children = [];
            this._bounds = null;
            //read only
            this._depth = 0;
            this._maxChildren = 4;
            this._maxDepth = 4;
            this._bounds = bounds;
            this.children = [];
            this.nodes = [];
            if (maxChildren) {
                this._maxChildren = maxChildren;
            }
            if (maxDepth) {
                this._maxDepth = maxDepth;
            }
            if (depth) {
                this._depth = depth;
            }
        }
        Node.prototype.insert = function (item) {
            if (this.nodes.length) {
                var index = this._findIndex(item);
                this.nodes[index].insert(item);
                return;
            }
            this.children.push(item);
            var len = this.children.length;
            if (!(this._depth >= this._maxDepth) &&
                len > this._maxChildren) {
                this.subdivide();
                var i;
                for (i = 0; i < len; i++) {
                    this.insert(this.children[i]);
                }
                this.children.length = 0;
            }
        };
        ;
        Node.prototype.retrieve = function (item) {
            if (this.nodes.length) {
                var index = this._findIndex(item);
                return this.nodes[index].retrieve(item);
            }
            return this.children;
        };
        ;
        Node.prototype._findIndex = function (item) {
            var b = this._bounds;
            var left = (item.x > b.x + b.width / 2) ? false : true;
            var top = (item.y > b.y + b.height / 2) ? false : true;
            //top left
            var index = Node.TOP_LEFT;
            if (left) {
                //left side
                if (!top) {
                    //bottom left
                    index = Node.BOTTOM_LEFT;
                }
            }
            else {
                //right side
                if (top) {
                    //top right
                    index = Node.TOP_RIGHT;
                }
                else {
                    //bottom right
                    index = Node.BOTTOM_RIGHT;
                }
            }
            return index;
        };
        ;
        Node.prototype.subdivide = function () {
            var depth = this._depth + 1;
            var bx = this._bounds.x;
            var by = this._bounds.y;
            //floor the values
            var b_w_h = (this._bounds.width / 2); //todo: Math.floor?
            var b_h_h = (this._bounds.height / 2);
            var bx_b_w_h = bx + b_w_h;
            var by_b_h_h = by + b_h_h;
            //top left
            this.nodes[Node.TOP_LEFT] = new this._classConstructor({
                x: bx,
                y: by,
                width: b_w_h,
                height: b_h_h
            }, depth, this._maxDepth, this._maxChildren);
            //top right
            this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
                x: bx_b_w_h,
                y: by,
                width: b_w_h,
                height: b_h_h
            }, depth, this._maxDepth, this._maxChildren);
            //bottom left
            this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
                x: bx,
                y: by_b_h_h,
                width: b_w_h,
                height: b_h_h
            }, depth, this._maxDepth, this._maxChildren);
            //bottom right
            this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
                x: bx_b_w_h,
                y: by_b_h_h,
                width: b_w_h,
                height: b_h_h
            }, depth, this._maxDepth, this._maxChildren);
        };
        ;
        Node.prototype.clear = function () {
            this.children.length = 0;
            var len = this.nodes.length;
            var i;
            for (i = 0; i < len; i++) {
                this.nodes[i].clear();
            }
            this.nodes.length = 0;
        };
        ;
        Node.TOP_LEFT = 0;
        Node.TOP_RIGHT = 1;
        Node.BOTTOM_LEFT = 2;
        Node.BOTTOM_RIGHT = 3;
        return Node;
    }());
    exports.Node = Node;
    /******************** BoundsQuadTree ****************/
    var BoundsNode = (function (_super) {
        __extends(BoundsNode, _super);
        function BoundsNode() {
            _super.apply(this, arguments);
            this._classConstructor = BoundsNode;
            this._stuckChildren = [];
            //we use this to collect and conctenate items being retrieved. This way
            //we dont have to continuously create new Array instances.
            //Note, when returned from QuadTree.retrieve, we then copy the array
            this._retrieve_out = [];
            //Returns all contents of node.
            this._allcontent_out = [];
        }
        BoundsNode.prototype.insert = function (item) {
            if (this.nodes.length) {
                var index = this._findIndex(item);
                var node = this.nodes[index];
                var item_bounds = item.getBounds();
                if (item_bounds.x >= node._bounds.x &&
                    item_bounds.x + item_bounds.width <= node._bounds.x + node._bounds.width &&
                    item_bounds.y >= node._bounds.y &&
                    item_bounds.y + item_bounds.height <= node._bounds.y + node._bounds.height) {
                    this.nodes[index].insert(item);
                }
                else {
                    this._stuckChildren.push(item);
                }
                return;
            }
            this.children.push(item);
            var len = this.children.length;
            if (!(this._depth >= this._maxDepth) &&
                len > this._maxChildren) {
                this.subdivide();
                var i;
                for (i = 0; i < len; i++) {
                    this.insert(this.children[i]);
                }
                this.children.length = 0;
            }
        };
        ;
        BoundsNode.prototype.getChildren = function () {
            return this.children.concat(this._stuckChildren);
        };
        ;
        BoundsNode.prototype.retrieve = function (child) {
            var out = this._retrieve_out;
            out.length = 0;
            if (this.nodes.length) {
                var index = this._findIndex(child);
                var node = this.nodes[index];
                var item = child.getBounds();
                item.x += child.x;
                item.y += child.y;
                var item = child;
                if (item.x >= node._bounds.x &&
                    item.x + item.width <= node._bounds.x + node._bounds.width &&
                    item.y >= node._bounds.y &&
                    item.y + item.height <= node._bounds.y + node._bounds.height) {
                    out.push.apply(out, this.nodes[index].retrieve(child));
                }
                else {
                    //Part of the item are overlapping multiple child nodes. For each of the overlapping nodes, return all containing objects.
                    if (item.x <= this.nodes[Node.TOP_RIGHT]._bounds.x) {
                        if (item.y <= this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                            out.push.apply(out, this.nodes[Node.TOP_LEFT].getAllContent());
                        }
                        if (item.y + item.height > this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                            out.push.apply(out, this.nodes[Node.BOTTOM_LEFT].getAllContent());
                        }
                    }
                    if (item.x + item.width > this.nodes[Node.TOP_RIGHT]._bounds.x) {
                        if (item.y <= this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                            out.push.apply(out, this.nodes[Node.TOP_RIGHT].getAllContent());
                        }
                        if (item.y + item.height > this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                            out.push.apply(out, this.nodes[Node.BOTTOM_RIGHT].getAllContent());
                        }
                    }
                }
            }
            out.push.apply(out, this._stuckChildren);
            out.push.apply(out, this.children);
            return out;
        };
        ;
        BoundsNode.prototype.getAllContent = function () {
            var out = this._allcontent_out;
            if (out.length === 0) {
                if (this.nodes.length) {
                    var i;
                    for (i = 0; i < this.nodes.length; i++) {
                        this.nodes[i].getAllContent();
                    }
                }
                out.push.apply(out, this._stuckChildren);
                out.push.apply(out, this.children);
            }
            return out;
        };
        ;
        BoundsNode.prototype.clear = function () {
            this._stuckChildren.length = 0;
            //array
            this.children.length = 0;
            var len = this.nodes.length;
            if (!len) {
                return;
            }
            var i;
            for (i = 0; i < len; i++) {
                this.nodes[i].clear();
            }
            //array
            this.nodes.length = 0;
            //we could call the super clear function but for now, im just going to inline it
            //call the hidden super.clear, and make sure its called with this = this instance
            //Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
        };
        ;
        return BoundsNode;
    }(Node));
    exports.BoundsNode = BoundsNode;
});
define("app/engine/shadowWorld", ["require", "exports"], function (require, exports) {
    "use strict";
    var worldStep = 1 / 60;
    var _ani_frame_num = 0;
    function body_to_config(body) {
        return {
            x: body.position[0],
            y: body.position[1],
            angle: body.angle,
            rotation: body["rotation"] || 0,
        };
    }
    var world = {
        addBody: function (body) {
            p2is_config_cache_pre[body.id] = p2is_config_cache[body.id] = body_to_config(body);
        },
        removeBody: function (body) { },
        step: function (dt, timeSinceLastCalled, isNewDataFrame) {
            if (timeSinceLastCalled === void 0) { timeSinceLastCalled = 0; }
            var step_num = timeSinceLastCalled / dt;
            if (step_num <= 1) {
                if (isNewDataFrame) {
                    p2is_config_cache_pre = p2is_config_cache;
                    p2is_config_cache = {};
                    for (var i = 0, len = p2is.length; i < len; i += 1) {
                        var body = p2is[i].p2_body;
                        p2is_config_cache[body.id] = body_to_config(body);
                    }
                }
                return;
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
                    p2is_config_cache[body.id] = body_to_config(body);
                }
                if (body["__changed"]) {
                    if (!isNewDataFrame) {
                        p2is_config_cache_pre[body.id] = p2is_config_cache[body.id];
                    }
                    p2is_config_cache[body.id] = body_to_config(body);
                    body["__changed"] = false;
                }
                var cache_config = p2is_config_cache[body.id];
                var pre_config = p2is_config_cache_pre[body.id];
                var dif_x = cache_config.x - pre_config.x;
                var dif_y = cache_config.y - pre_config.y;
                var dif_angle = cache_config.angle - pre_config.angle;
                body.interpolatedPosition[0] = pre_config.x + dif_x * ani_progress;
                body.interpolatedPosition[1] = pre_config.y + dif_y * ani_progress;
                body.interpolatedAngle = pre_config.angle + dif_angle * ani_progress;
                var cache_rotation = cache_config.rotation;
                var pre_rotation = pre_config.rotation;
                var dif_rotation = 0;
                // 旋转要特殊处理。TODO：包括angle
                if (cache_rotation <= -Math.PI / 2 && pre_rotation >= Math.PI / 2) {
                    cache_rotation = cache_rotation + Math.PI * 2;
                    dif_rotation = cache_rotation - pre_rotation;
                }
                else if (pre_rotation <= -Math.PI / 2 && cache_rotation >= Math.PI / 2) {
                    pre_rotation = pre_rotation + Math.PI * 2;
                    dif_rotation = cache_rotation - pre_rotation;
                }
                else {
                    dif_rotation = cache_rotation - pre_rotation;
                }
                body["rotation"] = pre_rotation + dif_rotation * ani_progress;
            }
        }
    };
    var p2is = [];
    var p2is_config_cache = {};
    var p2is_config_cache_pre = {};
    exports.engine = {
        world: world,
        add: function (item) {
            p2is.push(item);
            item.emit("add-to-world", world);
            item.on("destroy", function () {
                p2is.splice(p2is.indexOf(this), 1);
                var body = this.p2_body;
                p2is_config_cache_pre[body.id] = p2is_config_cache[body.id] = null;
            });
        },
        update: function (delay, timeSinceLastCalled, isNewDataFrame) {
            world.step(worldStep, timeSinceLastCalled, isNewDataFrame);
            p2is.forEach(function (p2i) { return p2i.update(delay); });
        },
    };
});
define("app/ui/Dialog", ["require", "exports", "app/common", "class/Tween", "class/SVGGraphics", "class/BackgroundGaussianBlur"], function (require, exports, common_4, Tween_8, SVGGraphics_1, BackgroundGaussianBlur_1) {
    "use strict";
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(title, content, ani_control, options) {
            var _this = this;
            _super.call(this);
            this.style = {
                blur: {
                    init_blur: 0,
                    blur: 16,
                    quality: _isMobile ? 5 : 15
                },
                bg: {
                    color: 0xeedddd,
                    alpha: 0.4,
                    paddingLR: common_4.pt2px(40),
                    paddingTB: common_4.pt2px(76),
                    radius: common_4.pt2px(10)
                },
                closeButton: {
                    show: true,
                    size: common_4.pt2px(18),
                    bold: common_4.pt2px(1),
                    top: 0,
                    left: 0
                },
                title: {
                    padding: common_4.pt2px(20)
                }
            };
            this._is_anining = false;
            this._is_open = false;
            this.ani = ani_control;
            options || (options = {});
            var style = this.style;
            common_4.mix_options(style, options);
            // 焦点层: 0
            // 背景层:1
            var bg = this.bg = new PIXI.Graphics();
            this.addChild(bg);
            this._on_content_update = function () {
                this.resize();
            }.bind(this);
            // 内容层:2
            this.setContent(content);
            // 标题层:3
            if (title instanceof PIXI.Sprite) {
                this.title = title;
                title.texture.on("update", function () {
                    console.log("Dialog resize..");
                    _this.resize();
                });
            }
            else if (title instanceof PIXI.Texture) {
                var title_spr = this.title = new PIXI.Sprite(title);
                title_spr.texture.on("update", function () {
                    console.log("Dialog resize..");
                    _this.resize();
                });
            }
            else if (title instanceof PIXI.Container) {
                this.title = title;
            }
            else {
                this.title = PIXI.Sprite.fromImage(title);
            }
            this.addChild(this.title);
            // 关闭按钮:4
            var _closeButton_font_size = style.closeButton.size / 3 * 2;
            var _closeButton_font_bold = style.closeButton.bold;
            this.closeButton = SVGGraphics_1.default.importFromSVG("<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">\n            <circle cy=\"0\" cx=\"0\" r=\"" + style.closeButton.size + "\" fill=\"#ffc03a\" stroke-width=\"0\"/>\n            <path d=\"M " + _closeButton_font_size + " 0 L -" + _closeButton_font_size + " 0 \" stroke-width=\"" + _closeButton_font_bold + "\" stroke=\"#000\"/>\n            <path d=\"M 0 " + _closeButton_font_size + " L 0 -" + _closeButton_font_size + "\" stroke-width=\"" + _closeButton_font_bold + "\" stroke=\"#000\"/>\n        </svg>")._graphics;
            this.closeButton.rotation = Math.PI / 4;
            this.closeButton.interactive = true;
            ["tap", "click"].forEach(function (eventName) { return _this.closeButton.on(eventName, _this.close.bind(_this)); });
            if (style.closeButton.show) {
                this.addChild(this.closeButton);
            }
            this.resize();
        }
        Dialog.prototype.resize = function () {
            var style = this.style;
            var bg = this.bg;
            var bg_width = Math.max(this.content.width, this.title.width + style.title.padding) + style.bg.paddingLR; //14.10 / 16.94 * VIEW.WIDTH;
            var bg_height = this.content.height + style.bg.paddingTB;
            var bg_x = (common_4.VIEW.WIDTH - bg_width) / 2;
            var bg_y = (common_4.VIEW.HEIGHT - bg_height) / 2;
            bg.clear();
            bg.lineStyle(0);
            bg.beginFill(0, 0);
            bg.drawRect(bg_x - 10, bg_y - 10, bg_width + 20, bg_height + 20);
            bg.endFill();
            bg.beginFill(style.bg.color, style.bg.alpha);
            bg.drawRoundedRect(bg_x, bg_y, bg_width, bg_height, style.bg.radius);
            bg.endFill();
            this.closeButton.x = bg_x + bg_width - this.closeButton.width / 4 + style.closeButton.left;
            this.closeButton.y = bg_y + this.closeButton.height / 4 + style.closeButton.top;
            this.content.x = bg_x + style.bg.paddingLR / 2;
            this.content.y = bg_y + style.bg.paddingTB / 2;
            this.title.x = bg_width / 2 + bg_x - this.title.width / 2;
            this.title.y = bg_y - this.title.height + style.bg.paddingLR / 2;
        };
        Dialog.prototype._on_content_update = function () { };
        Dialog.prototype.setContent = function (content) {
            if (this.content) {
                this.content.off("update", this._on_content_update);
                this.removeChild(this.content);
            }
            else {
                this.content = content;
                content.on("update", this._on_content_update);
                this.addChild(content);
            }
        };
        Dialog.prototype.open = function (parent, blur_stage, renderer) {
            var _this = this;
            if (this._is_anining) {
                return;
            }
            this.emit("open");
            parent.addChild(this);
            this._is_anining = true;
            this._is_open = true;
            // 还原来计算出正确的宽高
            this.scale.set(1, 1);
            this.ani.Tween(this)
                .to({
                x: this.x,
                y: this.y
            }, common_4.B_ANI_TIME)
                .set({
                x: this.x + common_4.VIEW.CENTER.x,
                y: this.y + common_4.VIEW.CENTER.y
            })
                .easing(Tween_8.default.Easing.Quintic.Out)
                .start();
            this.ani.Tween(this.scale)
                .set({
                x: 0,
                y: 0
            })
                .to({
                x: 1,
                y: 1
            }, common_4.B_ANI_TIME)
                .easing(Tween_8.default.Easing.Quintic.Out)
                .start()
                .onComplete(function () {
                _this._is_anining = false;
                // 设定背景模糊
                if (blur_stage) {
                    // this.cacheAsBitmap = true;
                    var bg_sprite = BackgroundGaussianBlur_1.default.ContainerToSprite(_this, renderer);
                    _this._bg_bulr_filter || (_this._bg_bulr_filter = new BackgroundGaussianBlur_1.default(bg_sprite, _this.style.blur.init_blur, _this.style.blur.quality));
                    if (blur_stage.filters) {
                        blur_stage.filters.push(_this._bg_bulr_filter);
                    }
                    else {
                        blur_stage.filters = [_this._bg_bulr_filter];
                    }
                    _this._blur_target = blur_stage;
                    _this.ani.Tween(_this._bg_bulr_filter)
                        .to({
                        blur: _this.style.blur.blur
                    }, common_4.B_ANI_TIME)
                        .start();
                }
            });
        };
        Dialog.prototype.close = function () {
            var _this = this;
            if (this._is_anining || !this._is_open) {
                return;
            }
            this.emit("close");
            this._is_open = false;
            this._is_anining = true;
            this.ani.Tween(this.scale)
                .set({
                x: 1,
                y: 1
            })
                .to({
                x: 0,
                y: 0
            }, common_4.B_ANI_TIME)
                .easing(Tween_8.default.Easing.Quintic.In)
                .start();
            var cur_x = this.x;
            var cur_y = this.y;
            this.ani.Tween(this)
                .to({
                x: this.x + common_4.VIEW.CENTER.x,
                y: this.y + common_4.VIEW.CENTER.y
            }, common_4.B_ANI_TIME)
                .easing(Tween_8.default.Easing.Quintic.In)
                .start()
                .onComplete(function () {
                _this.position.set(cur_x, cur_y);
                _this._is_anining = false;
                // 关闭背景模糊滤镜
                if (_this._blur_target) {
                    _this._blur_target.filters = _this._blur_target.filters.filter(function (f) { return f !== _this._bg_bulr_filter; });
                    if (_this._blur_target.filters.length == 0) {
                        _this._blur_target.filters = null;
                    }
                    _this._blur_target = null;
                }
                _this.parent && _this.parent.removeChild(_this);
            });
        };
        return Dialog;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Dialog;
});
define("app/ui/Button", ["require", "exports", "app/common"], function (require, exports, common_5) {
    "use strict";
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(text_or_proto) {
            var _this = this;
            _super.call(this);
            this.style = (function () {
                var baseStyle = {
                    width: 0,
                    height: 0,
                    backgrounColor: 0x4444ff,
                    backgrounAlpha: 1,
                    color: 0,
                    value: "",
                    paddingTop: 0,
                    paddingLeft: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                    borderColor: 0x333333,
                    borderAlpha: 1,
                    borderWidth: 0,
                    fontSize: common_5.pt2px(10),
                    fontFamily: "微软雅黑",
                    radius: common_5.pt2px(2)
                };
                return baseStyle;
            })();
            this.text = new PIXI.Text("");
            var style = this.style;
            if (typeof text_or_proto === "string") {
                style.value = text_or_proto;
            }
            else if (typeof text_or_proto === "object") {
                common_5.mix_options(style, text_or_proto);
            }
            this.addChild(this.text);
            this.redraw();
            this.interactive = true;
            common_5.on(this, "mouseover", function () {
                var baseStyle = _this.style;
                var hoverStyle = common_5.copy(baseStyle);
                baseStyle.hoverStyle = hoverStyle;
                hoverStyle.backgrounColor = (hoverStyle.backgrounColor * 0.8) | 0;
                hoverStyle && _this.redraw(hoverStyle);
            });
            common_5.on(this, "mouseout", function () {
                _this.redraw(_this.style);
            });
            common_5.on(this, "touchstart|mousedown", function () {
                var baseStyle = _this.style;
                var activeStyle = common_5.copy(baseStyle);
                baseStyle.activeStyle = activeStyle;
                activeStyle.backgrounColor = Math.min((activeStyle.backgrounColor * 1.1) | 0, 0xffffff);
                _this.redraw(activeStyle);
            });
            common_5.on(this, "touchend|mouseup", function () {
                _this.redraw(_this.style);
            });
        }
        Button.prototype.redraw = function (style) {
            style || (style = this.style);
            var text = this.text;
            text.text = style.value || this.style.value;
            // if(style.width&&style.height) {// 使用宽高等算出字体大小
            // }else{//使用字体大小算出宽高
            // }
            text.style = {
                fill: style.color,
                font: style.fontSize + " " + style.fontFamily
            };
            text.x = style.paddingLeft;
            text.y = style.paddingTop;
            var text_width = text.width;
            var text_height = text.height;
            this.clear();
            this.beginFill(style.backgrounColor, style.backgrounAlpha);
            this.lineStyle(style.borderWidth, style.borderColor, style.borderAlpha);
            var button_width = text_width + style.paddingLeft + style.paddingRight;
            var button_height = text_height + style.paddingTop + style.paddingBottom;
            this.drawRoundedRect(0, 0, button_width, button_height, style.radius);
        };
        return Button;
    }(PIXI.Graphics));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Button;
});
define("app/game-oline", ["require", "exports", "class/Tween", "class/When", "app/class/Flyer", "app/class/Wall", "app/class/Ship", "app/class/Bullet", "app/class/HP", "app/ui/Dialog", "app/ui/Button", "class/TextBuilder", "class/FlowLayout", "app/engine/shadowWorld", "app/engine/Pomelo", "app/common", "app/const", "app/ux"], function (require, exports, Tween_9, When_2, Flyer_3, Wall_3, Ship_4, Bullet_3, HP_2, Dialog_1, Button_1, TextBuilder_2, FlowLayout_2, shadowWorld_1, Pomelo_1, common_6, const_11, UX) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_9.default();
    var jump_tween = new Tween_9.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Graphics();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    // current_stage_wrap["keep_direction"] = "horizontal";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("button", "./res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("游戏加载中……", {
        font: const_11.pt2px(25) + "px 微软雅黑",
        fill: "#FFF"
    });
    exports.current_stage.addChild(loading_text);
    exports.loader.once("complete", renderInit);
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        /**素材加载
         * 初始化场景
         */
        function drawPlan() {
            exports.current_stage_wrap.clear();
            exports.current_stage_wrap.beginFill(0x333ddd, 0.5);
            exports.current_stage_wrap.drawRect(0, 0, common_6.VIEW.WIDTH, common_6.VIEW.HEIGHT);
            exports.current_stage_wrap.endFill();
        }
        exports.current_stage_wrap.on("resize", drawPlan);
        var ObjectMap = {
            "Flyer": Flyer_3.default,
            "Wall": Wall_3.default,
            "Ship": Ship_4.default,
            "Bullet": Bullet_3.default,
        };
        var instanceMap = {};
        var view_ship;
        function set_view_ship(ship) {
            view_ship = ship;
            exports.current_stage_wrap.emit("view_ship-changed", view_ship);
        }
        // 子弹绘图层
        var bullet_stage = new PIXI.Container();
        bullet_stage["update"] = function (delay) {
            this.children.forEach(function (bullet) {
                bullet.update(delay);
            });
        };
        exports.current_stage.addChild(bullet_stage);
        // 物体绘图层：墙、飞船等等
        var object_stage = new PIXI.Container();
        object_stage["update"] = function (delay) {
            this.children.forEach(function (obj) {
                obj.update(delay);
            });
        };
        exports.current_stage.addChild(object_stage);
        // 血量绘图层;
        var hp_stage = new PIXI.Container();
        hp_stage["update"] = function (delay) {
            this.children.forEach(function (hp) {
                hp.update(delay);
            });
        };
        exports.current_stage.addChild(hp_stage);
        var HP_WEAKMAP = {};
        function showViewData(objects) {
            objects.forEach(function (obj_info) {
                if (instanceMap.hasOwnProperty(obj_info.id)) {
                    var _ins = instanceMap[obj_info.id];
                    if (_ins) {
                        _ins.setConfig(obj_info.config);
                    }
                }
                else {
                    var Con = ObjectMap[obj_info.type];
                    if (!Con) {
                        console.error("UNKONW TYPE:", obj_info);
                        return;
                    }
                    var ins = instanceMap[obj_info.id] = new Con(obj_info.config, obj_info.id);
                    ins._id = obj_info.id;
                    if (view_ship_info.id === obj_info.id) {
                        // view_ship = ins;
                        set_view_ship(ins);
                    }
                    if (obj_info.type === "Bullet") {
                        bullet_stage.addChild(ins);
                    }
                    else {
                        object_stage.addChild(ins);
                        if (obj_info.type === "Ship" || obj_info.type === "Flyer") {
                            var hp = HP_WEAKMAP[obj_info.id] = new HP_2.default(ins, ani_tween);
                            hp_stage.addChild(hp);
                        }
                    }
                    shadowWorld_1.engine.add(ins);
                }
            });
        }
        ;
        var ping = 0;
        var timeSinceLastCalled = 0;
        var timeSinceLastCalledMS = 0;
        var isNewDataFrame = false;
        var can_next = true;
        ;
        function getViewData() {
            var pre_time = performance.now();
            ani_ticker.add(function () {
                var p_now = performance.now();
                // 上一次请求到现在的时间
                var pre_req_delay = p_now - timeSinceLastCalledMS;
                if (pre_req_delay >= 100) {
                    can_next = true;
                }
                else if (pre_req_delay < 25) {
                    return;
                }
                if (can_next === false) {
                    return;
                }
                can_next = false;
                var start_ping = performance.now();
                Pomelo_1.pomelo.request("connector.worldHandler.getWorld", {
                    x: 0,
                    y: 0,
                    width: common_6.VIEW.WIDTH,
                    height: common_6.VIEW.HEIGHT
                }, function (data) {
                    var cur_time = performance.now();
                    var dif_time = cur_time - pre_time;
                    pre_time = cur_time;
                    timeSinceLastCalledMS = cur_time;
                    timeSinceLastCalled = dif_time / 1000;
                    isNewDataFrame = true;
                    ping = cur_time - start_ping;
                    showViewData(data.objects);
                    can_next = true;
                });
            });
        }
        ;
        exports.current_stage_wrap.on("active", getViewData);
        // 当前视角飞车，不一定是自己的飞船，在死亡后视角会进行切换
        var view_ship_info;
        exports.current_stage_wrap.on("before-active", function (game_init_info) {
            view_ship_info = game_init_info.ship;
            is_my_ship_live = true;
        });
        /**初始化动画
         *
         */
        /**按钮事件
         *
         */
        /**交互动画
         *
         */
        // 飞船移动
        UX.moveShip(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function (move_info) {
            Pomelo_1.pomelo.request("connector.worldHandler.setConfig", {
                config: move_info
            }, function (data) { });
        });
        // 飞船转向
        UX.turnHead(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function (turnHead_info) {
            Pomelo_1.pomelo.request("connector.worldHandler.setConfig", {
                config: turnHead_info
            }, function (data) { });
        });
        // 飞船发射
        UX.shipFire(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function () {
            Pomelo_1.pomelo.request("connector.worldHandler.fire", {}, function (data) {
                // showViewData(data);
                // var guns_id_map = view_ship.GUNS_ID_MAP;
                // // 根据发射的子弹触发发射动画
                // data.forEach(function (bullet_info) {
                //     var gun = guns_id_map[bullet_info.owner_id];
                //     if (!gun) {
                //         console.error("No Found Gun Id:", bullet_info.owner_id);
                //     }
                //     gun.emit("fire_ani");
                // });
            });
        });
        // 飞船切换自动
        UX.shipAutoFire(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function () {
            Pomelo_1.pomelo.request("connector.worldHandler.autoFire", {}, function (data) {
            });
        });
        // 切换属性加点面板的显示隐藏
        UX.toggleProtoPlan(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function (add_proto, cb_to_redraw) {
            // view_ship._computeConfig();
            // view_ship.reloadWeapon();
            Pomelo_1.pomelo.request("connector.worldHandler.addProto", {
                proto: add_proto
            }, function (data) {
                view_ship.proto_list = data;
                cb_to_redraw();
            });
        });
        // 切换形态变化面板的显示隐藏
        UX.toggleShapePlan(exports.current_stage_wrap, exports.current_stage, function () { return view_ship; }, ani_tween, ani_ticker, function (new_shape, cb_to_redraw) {
            Pomelo_1.pomelo.request("connector.worldHandler.changeType", {
                type: new_shape
            }, function (data) {
                view_ship.setConfig(data.config);
                cb_to_redraw();
            });
        });
        /**响应服务端事件
         *
         */
        Pomelo_1.pomelo.on("explode", function (arg) {
            var bullet_info = arg.data;
            console.log("explode:", bullet_info);
            var bullet = instanceMap[bullet_info.id];
            if (bullet) {
                bullet.setConfig(bullet_info.config);
                bullet.emit("explode");
                instanceMap[bullet_info.id] = null;
            }
        });
        Pomelo_1.pomelo.on("gun-fire_start", function (arg) {
            var fire_start_info = arg.data;
            console.log("gun-fire_start:", fire_start_info);
            var bullet_info = fire_start_info.bullet;
            var ship_id = fire_start_info.ship_id;
            var ship = instanceMap[ship_id];
            if (ship) {
                var gun = ship.GUNS_ID_MAP[fire_start_info.gun_id];
                if (gun) {
                    gun.emit("fire_ani");
                }
            }
            showViewData([bullet_info]);
        });
        Pomelo_1.pomelo.on("change-hp", function (arg) {
            var ship_info = arg.data;
            console.log("change-hp:", ship_info);
            var ship = instanceMap[ship_info.id];
            if (ship) {
                if (ship_info.config.cur_hp < ship.config.cur_hp) {
                    ship.emit("flash");
                }
                var ship_config = ship_info.config;
                ship.setConfig(ship_config);
                var hp = HP_WEAKMAP[ship_info.id];
                if (hp) {
                    hp.setHP(ship_config.cur_hp / ship_config.max_hp);
                }
            }
        });
        Pomelo_1.pomelo.on("ember", function (arg) {
            var flyer_info = arg.data;
            console.log("ember:", flyer_info);
            var flyer = instanceMap[flyer_info.id];
            if (flyer) {
                var hp = HP_WEAKMAP[flyer_info.id];
                hp.parent.removeChild(hp);
                hp.destroy();
                flyer.setConfig(flyer_info.config);
                flyer.emit("ember");
                instanceMap[flyer_info.id] = null;
            }
        });
        var is_my_ship_live = false;
        // 死亡对话框
        var die_dialog = (function () {
            var title = new PIXI.Container();
            var restart_button = new Button_1.default({
                value: "重新开始",
                fontSize: const_11.pt2px(14),
                paddingTop: const_11.pt2px(4),
                paddingBottom: const_11.pt2px(4),
                paddingLeft: const_11.pt2px(4),
                paddingRight: const_11.pt2px(4),
                color: 0xffffff,
                fontFamily: "微软雅黑"
            });
            var content = new FlowLayout_2.default([
                new TextBuilder_2.default("被击杀！", {
                    fontSize: const_11.pt2px(16),
                    fontFamily: "微软雅黑"
                }),
                restart_button
            ], {
                float: "center"
            });
            content.max_width = const_11.pt2px(60);
            content.reDrawFlow();
            common_6.on(restart_button, "click|tap", function (e) {
                exports.current_stage_wrap.emit("enter", null, function (err, game_info) {
                    if (err) {
                        alert(err);
                    }
                    else {
                        exports.current_stage_wrap.emit("before-active", game_info);
                        die_dialog.close();
                        die_dialog.once("removed", function () {
                            exports.current_stage_wrap.emit("active");
                        });
                    }
                });
            });
            var dialog = new Dialog_1.default(title, content, ani_tween, {
                title: {
                    show: false
                },
                closeButton: {
                    show: false
                },
                bg: {
                    alpha: 0.4
                }
            });
            return dialog;
        })();
        Pomelo_1.pomelo.on("die", function (arg) {
            var ship_info = arg.data;
            console.log("die:", ship_info);
            var ship = instanceMap[ship_info.id];
            if (ship) {
                var hp = HP_WEAKMAP[ship_info.id];
                hp.parent.removeChild(hp);
                hp.destroy();
                ship.emit("die");
                instanceMap[ship_info.id] = null;
                if (ship._id === view_ship._id) {
                    // 玩家死亡
                    // view_ship = null;//TODO，镜头使用击杀者
                    set_view_ship(null);
                    is_my_ship_live = false;
                    // 打开对话框
                    die_dialog.open(exports.current_stage_wrap, exports.current_stage, common_6.renderer);
                }
            }
        });
        /**帧率
         *
         */
        var pre_time;
        ani_ticker.add(function () {
            // 动画控制器
            ani_tween.update();
            jump_tween.update();
            // 客户端对场景的优化渲染
            pre_time || (pre_time = performance.now());
            var cur_time = performance.now();
            var dif_time = cur_time - pre_time;
            pre_time = cur_time;
            // 更新影子世界
            shadowWorld_1.engine.update(dif_time, timeSinceLastCalled, isNewDataFrame);
            isNewDataFrame = false;
            // 跟随主角移动
            if (view_ship) {
                exports.current_stage.x = common_6.VIEW.WIDTH / 2 - view_ship.x;
                exports.current_stage.y = common_6.VIEW.HEIGHT / 2 - view_ship.y;
            }
            // 更新血量显示
            hp_stage["update"](dif_time);
        });
        var FPS_Text = new PIXI.Text("FPS:0", {
            font: '24px Arial',
            fill: 0x00ffff33,
            align: "left"
        });
        exports.current_stage_wrap.addChild(FPS_Text);
        var _native_log = console.log;
        var _noop_log = function noop() { };
        console.log = _noop_log;
        var _is_debug = false;
        var _is_ctrl_down = false;
        var _is_alt_down = false;
        var _is_f_down = false;
        common_6.on(exports.current_stage_wrap, "keydown", function (e) {
            if (e.keyCode === 17) {
                _is_ctrl_down = true;
            }
            else if (e.keyCode === 18) {
                _is_alt_down = true;
            }
            else if (e.keyCode === 70) {
                _is_f_down = true;
            }
            if (_is_ctrl_down && _is_alt_down && _is_f_down) {
                _is_debug = !_is_debug;
                if (_is_debug) {
                    console.log = _native_log;
                }
                else {
                    console.log = _noop_log;
                }
            }
        });
        common_6.on(exports.current_stage_wrap, "keyup", function (e) {
            if (_is_ctrl_down && e.keyCode === 17) {
                _is_ctrl_down = false;
            }
            if (_is_alt_down && e.keyCode === 18) {
                _is_alt_down = false;
            }
            if (_is_f_down && e.keyCode === 70) {
                _is_f_down = false;
            }
        });
        FPS_ticker.add(function () {
            var ping_info = ping.toFixed(2);
            if (ping_info.length < 6) {
                ping_info = ("000" + ping_info).substr(-6);
            }
            var net_fps = (1 / timeSinceLastCalled).toFixed(0);
            if (net_fps.length < 2) {
                ping_info = ("00" + ping_info).substr(-2);
            }
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(0) + "/" + net_fps + " W:" + common_6.VIEW.WIDTH + " H:" + common_6.VIEW.HEIGHT + " Ping:" + ping_info;
            if (view_ship && _is_debug) {
                var info = "\n";
                var config = view_ship.config["toJSON"]();
                for (var k in config) {
                    var val = config[k];
                    if (typeof val === "number") {
                        val = val.toFixed(2);
                    }
                    info += k + ": " + val + "\n";
                }
                FPS_Text.text += info;
            } /*else{
                FPS_Text.text += `
    _is_ctrl_down:${_is_ctrl_down}
    _is_alt_down:${_is_alt_down}
    _is_f_down:${_is_f_down}
                `
            }*/
        });
        // 触发布局计算
        common_6.emitReisze(exports.current_stage_wrap);
        init_w.ok(0, []);
    }
    exports.current_stage_wrap.on("init", initStage);
    exports.current_stage_wrap.on("reinit", function () {
        renderInit(exports.loader, exports.loader.resources);
        common_6.emitReisze(exports.current_stage);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_6.emitReisze(this);
    });
    // 初始化本机ID
    var mac_ship_id = localStorage.getItem("MAC-SHIP-ID");
    if (!mac_ship_id) {
        mac_ship_id = (Math.random() * Date.now()).toString().replace(".", "");
        localStorage.setItem("MAC-SHIP-ID", mac_ship_id);
    }
    var old_username;
    exports.current_stage_wrap.on("enter", function (username, cb) {
        // 发送名字，初始化角色
        Pomelo_1.pomelo.request("connector.entryHandler.enter", {
            username: username || old_username,
            mac_ship_id: mac_ship_id,
            width: common_6.VIEW.WIDTH,
            height: common_6.VIEW.HEIGHT,
        }, function (game_info) {
            if (game_info.code === 500) {
                console.log(game_info);
                if (game_info.error == "重复登录") {
                    cb("名字已被使用，请重新输入");
                }
            }
            else {
                old_username = username;
                cb(null, game_info);
            }
        });
    });
    var init_w = new When_2.default(2, function () {
        common_6.emitReisze(exports.current_stage);
        ani_tween.start();
        jump_tween.start();
        ani_ticker.start();
        FPS_ticker.start();
    });
    function initStage() {
        init_w.ok(1, []);
    }
    exports.initStage = initStage;
});
define("app/game2", ["require", "exports", "class/Tween", "class/When", "app/class/Flyer", "app/class/Ship", "app/class/Wall", "app/engine/world", "app/common", "app/const", "app/ux"], function (require, exports, Tween_10, When_3, Flyer_4, Ship_5, Wall_4, world_2, common_7, const_12, UX) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_10.default();
    var jump_tween = new Tween_10.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Graphics();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    // current_stage_wrap["keep_direction"] = "horizontal";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("button", "./res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("游戏加载中……", { font: const_12.pt2px(25) + "px 微软雅黑", fill: "#FFF" });
    exports.current_stage.addChild(loading_text);
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        /**素材加载
         * 初始化场景
         */
        function drawPlan() {
            exports.current_stage_wrap.clear();
            exports.current_stage_wrap.beginFill(0x333ddd, 0.5);
            exports.current_stage_wrap.drawRect(0, 0, common_7.VIEW.WIDTH, common_7.VIEW.HEIGHT);
            exports.current_stage_wrap.endFill();
        }
        exports.current_stage_wrap.on("resize", drawPlan);
        drawPlan();
        // 子弹绘图层
        var bullet_stage = new PIXI.Container();
        bullet_stage["update"] = function (delay) {
            this.children.forEach(function (bullet) {
                bullet.update(delay);
            });
        };
        exports.current_stage.addChild(bullet_stage);
        // 物体绘图层：墙、飞船等等
        var object_stage = new PIXI.Container();
        object_stage["update"] = function (delay) {
            this.children.forEach(function (obj) {
                obj.update(delay);
            });
        };
        exports.current_stage.addChild(object_stage);
        var flyerTypes = Object.keys(Flyer_4.default.TYPES);
        for (var i_1 = 0; i_1 < flyerTypes.length * 2; i_1 += 1) {
            var flyer = new Flyer_4.default({
                x: 50 + Math.random() * (common_7.VIEW.WIDTH - 100),
                y: 50 + Math.random() * (common_7.VIEW.HEIGHT - 100),
                x_speed: 10 * 2 * (Math.random() - 0.5),
                y_speed: 10 * 2 * (Math.random() - 0.5),
                body_color: 0xffffff * Math.random(),
                type: flyerTypes[i_1 % flyerTypes.length]
            });
            object_stage.addChild(flyer);
            world_2.engine.add(flyer);
        }
        // 四边限制
        var top_edge = new Wall_4.default({
            x: common_7.VIEW.CENTER.x, y: 0,
            width: common_7.VIEW.WIDTH,
            height: 10
        });
        object_stage.addChild(top_edge);
        world_2.engine.add(top_edge);
        var bottom_edge = new Wall_4.default({
            x: common_7.VIEW.CENTER.x, y: common_7.VIEW.HEIGHT - 5,
            width: common_7.VIEW.WIDTH,
            height: 10
        });
        object_stage.addChild(bottom_edge);
        world_2.engine.add(bottom_edge);
        var left_edge = new Wall_4.default({
            x: 5, y: common_7.VIEW.CENTER.y,
            width: 10,
            height: common_7.VIEW.HEIGHT
        });
        object_stage.addChild(left_edge);
        world_2.engine.add(left_edge);
        var right_edge = new Wall_4.default({
            x: common_7.VIEW.WIDTH - 5, y: common_7.VIEW.CENTER.y,
            width: 10,
            height: common_7.VIEW.HEIGHT
        });
        object_stage.addChild(right_edge);
        world_2.engine.add(right_edge);
        (function () {
            var x_len = 2;
            var y_len = 2;
            var x_unit = common_7.VIEW.WIDTH / (x_len + 1);
            var y_unit = common_7.VIEW.HEIGHT / (y_len + 1);
            var width = 40;
            for (var _x = 1; _x <= x_len; _x += 1) {
                for (var _y = 1; _y <= y_len; _y += 1) {
                    var mid_edge = new Wall_4.default({
                        x: _x * x_unit - width / 2, y: _y * y_unit - width / 2,
                        width: width,
                        height: width
                    });
                    object_stage.addChild(mid_edge);
                    world_2.engine.add(mid_edge);
                }
            }
        })();
        var my_ship = new Ship_5.default({
            x: common_7.VIEW.CENTER.x,
            y: common_7.VIEW.CENTER.y,
            body_color: 0x366345
        });
        object_stage.addChild(my_ship);
        world_2.engine.add(my_ship);
        var other_ship = new Ship_5.default({
            x: common_7.VIEW.CENTER.x - 200,
            y: common_7.VIEW.CENTER.y - 100,
            body_color: 0x633645,
            team_tag: 12
        });
        object_stage.addChild(other_ship);
        world_2.engine.add(other_ship);
        /**初始化动画
         *
         */
        var pre_time;
        ani_ticker.add(function () {
            pre_time || (pre_time = performance.now() - 1000 / 60);
            var cur_time = performance.now();
            var dif_time = cur_time - pre_time;
            pre_time = cur_time;
            // 物理引擎运作
            world_2.engine.update(dif_time);
        });
        /**按钮事件
         *
         */
        /**交互动画
         *
         */
        // 飞船移动
        UX.moveShip(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (move_info) {
            my_ship.operateShip(move_info);
        });
        // 飞船转向
        UX.turnHead(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (turnHead_info) {
            my_ship.operateShip(turnHead_info);
        });
        // 飞船发射
        UX.shipFire(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function () {
            my_ship.fire(function (bullet) {
                bullet_stage.addChild(bullet);
                world_2.engine.add(bullet);
            });
        });
        // 飞船切换自动
        UX.shipAutoFire(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function () {
            my_ship.toggleKeepFire(function (bullet) {
                bullet_stage.addChild(bullet);
                world_2.engine.add(bullet);
            });
        });
        // 切换属性加点面板的显示隐藏
        UX.toggleProtoPlan(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (add_proto, cb_to_redraw) {
            my_ship.addProto(add_proto);
            cb_to_redraw();
        });
        // 沙盒工具
        UX.sandboxTools(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker);
        // 切换形态变化面板的显示隐藏
        UX.toggleShapePlan(exports.current_stage_wrap, exports.current_stage, function () { return my_ship; }, ani_tween, ani_ticker, function (new_shape, cb_to_redraw) {
            my_ship.changeType(new_shape);
            cb_to_redraw();
        });
        // 动画控制器
        ani_ticker.add(function () {
            ani_tween.update();
            jump_tween.update();
            exports.current_stage.x = common_7.VIEW.WIDTH / 2 - my_ship.x;
            exports.current_stage.y = common_7.VIEW.HEIGHT / 2 - my_ship.y;
        });
        /**帧率
         *
         */
        var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "right" });
        exports.current_stage_wrap.addChild(FPS_Text);
        FPS_ticker.add(function () {
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " W:" + common_7.VIEW.WIDTH + " H:" + common_7.VIEW.HEIGHT;
            if (my_ship) {
                var info = "\n";
                var config = my_ship.config["toJSON"]();
                for (var k in config) {
                    var val = config[k];
                    if (typeof val === "number") {
                        val = val.toFixed(2);
                    }
                    info += k + ": " + val + "\n";
                }
                FPS_Text.text += info;
            }
        });
        // 触发布局计算
        common_7.emitReisze(exports.current_stage_wrap);
        ani_tween.start();
        jump_tween.start();
        ani_ticker.start();
        FPS_ticker.start();
    }
    exports.loader.once("complete", function () {
        init_w.ok(2, []);
    });
    exports.current_stage_wrap.on("init", function () {
        init_w.ok(1, []);
    });
    exports.current_stage_wrap.on("active", function () {
        init_w.ok(0, []);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_7.emitReisze(this);
    });
    var init_w = new When_3.default(3, function () {
        renderInit(exports.loader, exports.loader.resources);
    });
});
define("app/loader", ["require", "exports", "class/Tween", "class/When", "app/ui/Dialog", "app/common"], function (require, exports, Tween_11, When_4, Dialog_2, common_8) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_11.default();
    var jump_tween = new Tween_11.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Container();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    // current_stage_wrap["keep_direction"] = "vertical";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("bg", "http://cdn2.youdob.com/4.jpg?imageView2/1/w/" + common_8.VIEW.WIDTH + "/h/" + common_8.VIEW.HEIGHT);
    exports.loader.load();
    var loading_text = new PIXI.Text("加载中……", {
        font: common_8.pt2px(25) + "px 微软雅黑",
        fill: "#FFF"
    });
    exports.current_stage.addChild(loading_text);
    exports.loader.once("complete", renderInit);
    var waitting_text = new PIXI.Text("连接服务器中……", {
        font: common_8.pt2px(25) + "px 微软雅黑",
        fill: "#FFF"
    });
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        var bg_tex = resource["bg"].texture;
        var bg = new PIXI.Sprite(bg_tex);
        exports.current_stage.addChild(bg);
        if (bg_tex.width / bg_tex.height > common_8.VIEW.WIDTH / common_8.VIEW.HEIGHT) {
            var bg_rate = common_8.VIEW.HEIGHT / bg_tex.height;
        }
        else {
            var bg_rate = common_8.VIEW.WIDTH / bg_tex.width;
        }
        bg.scale.set(bg_rate, bg_rate);
        exports.current_stage.addChild(waitting_text);
        common_8.stageManager.backgroundColor = "#333";
        waitting_text.x = common_8.VIEW.CENTER.x - waitting_text.width / 2;
        waitting_text.y = common_8.VIEW.CENTER.y - waitting_text.height / 2;
        /**初始化动画
         *
         */
        var inputName_dialog = (function () {
            // var title = new TextBuilder("输入您的名字", {
            //     fontSize: pt2px(25),
            //     fontFamily: "微软雅黑",
            //     fill: "#33ee23",
            // });
            var title = new PIXI.Container();
            var content = new PIXI.Graphics();
            content.beginFill(0xffffff, 0.5);
            var _r = Math.min(common_8.VIEW.WIDTH, common_8.VIEW.HEIGHT) / 2 * 0.9;
            content.drawCircle(_r, _r, _r);
            content.endFill();
            var dialog = new Dialog_2.default(title, content, ani_tween, {
                bg: {
                    alpha: 0,
                    paddingLR: 0,
                    paddingTB: 0
                },
                closeButton: {
                    show: false
                }
            });
            return dialog;
        }());
        // 连接到服务器，用户开始命名
        exports.current_stage_wrap.on("connected", function (next, errorText) {
            exports.current_stage.removeChild(waitting_text);
            inputName_dialog.once("added", function () {
                document.body.appendChild(ui_wrap);
                ani_tween.Tween(ui_wrap.style)
                    .set({
                    opacity: 0,
                    transform: "scale(0)"
                })
                    .to({
                    opacity: 1
                }, common_8.B_ANI_TIME)
                    .onUpdate(function (p) {
                    ui_wrap.style.transform = "scale(" + p + ")";
                })
                    .start();
            });
            inputName_dialog.once("close", function () {
                ani_tween.Tween(ui_wrap.style)
                    .set({
                    opacity: 1
                })
                    .to({
                    opacity: 0
                }, common_8.B_ANI_TIME)
                    .start()
                    .onUpdate(function (p) {
                    ui_wrap.style.transform = "scale(" + (1 - p) + ")";
                })
                    .onComplete(function () {
                    document.body.removeChild(ui_wrap);
                });
            });
            var ui_wrap = exports.current_stage_wrap["ui_wrap"];
            if (!ui_wrap) {
                ui_wrap = document.createElement("div");
                ui_wrap.style.cssText = "\n                display: -webkit-flex;\n                display: flex;\n                position: absolute;\n                left:0;\n                top:0;\n                width:100%;\n                height:100%;\n                -webkit-align-items: center;\n                      align-items: center;\n                -webkit-justify-content: center;\n                      justify-content: center;\n            ";
                exports.current_stage_wrap["ui_wrap"] = ui_wrap;
                var input_width = common_8.pt2px(200);
                var input_height = common_8.pt2px(20);
                var input_placeholder = "请输入用户名";
                ui_wrap.innerHTML = "\n            <div style=\"\n                width: " + input_width + "px;\n                height: " + input_height * 3 + "px;\n                text-align:center;\n                \">\n                <input placeholder=\"" + input_placeholder + "\" style=\"display:block;\n                    width:" + input_width + "px;\n                    border-radius:" + input_height * 0.3 + "px;\n                    padding:" + input_height * 0.3 + "px;\n                    margin:0;\n                    border:0;\n                    background-color:rgba(221,221,221,0.9);\n                    outline:none;\n                    color:#333;\n                    font-size:" + input_height * 0.8 + "px;\"/>\n                <button style=\"\n                    cursor:point;\n                    border-radius:" + input_height * 0.1 + "px;\n                    min-width:" + input_width * 0.6 + "px;\n                    margin:" + input_height * 0.4 + "px 0 0 0;\n                    border:0;\n                    color:#ddd;\n                    background-color:rgba(33,33,221,0.8);\n                    outline:none;\n                    padding:" + input_height * 0.1 + "px;\n                    font-size:" + input_height * 0.8 + "px;\">\u63D0\u4EA4</button>\n            </div>\n            ";
                var ui_input = ui_wrap.firstElementChild.firstElementChild;
                ui_input["showError"] = function (errorText) {
                    ui_input.value = "";
                    ui_input.placeholder = errorText;
                    ui_input.style.boxShadow = "0 0 " + common_8.pt2px(10) + "px rgba(221,33,33,1)";
                    setTimeout(function () {
                        ui_input.placeholder = input_placeholder;
                        ui_input.style.boxShadow = "none";
                    }, 1000);
                };
                var ui_button = ui_input.nextElementSibling;
                ui_button.addEventListener("click", function () {
                    var username = ui_input.value.trim();
                    if (!username) {
                        ui_input["showError"]("用户名不可为空");
                        return;
                    }
                    inputName_dialog.close();
                    inputName_dialog.once("removed", function () {
                        next(username);
                    });
                });
            }
            if (errorText) {
                var ui_input = ui_wrap.firstElementChild.firstElementChild;
                ui_input["showError"](errorText);
            }
            inputName_dialog.open(exports.current_stage_wrap, exports.current_stage, common_8.renderer);
        });
        /**按钮事件
         *
         */
        /**交互动画
         *
         */
        // 动画控制器
        ani_ticker.add(function () {
            ani_tween.update();
            jump_tween.update();
        });
        /**帧率
         *
         */
        // 触发布局计算
        common_8.emitReisze(exports.current_stage_wrap);
        init_w.ok(0, []);
    }
    exports.current_stage_wrap.on("init", initStage);
    exports.current_stage_wrap.on("reinit", function () {
        renderInit(exports.loader, exports.loader.resources);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_8.emitReisze(this);
    });
    var init_w = new When_4.default(2, function () {
        ani_tween.start();
        jump_tween.start();
        ani_ticker.start();
        FPS_ticker.start();
    });
    function initStage() {
        init_w.ok(1, []);
    }
    exports.initStage = initStage;
});
define("app/main", ["require", "exports", "app/common", "app/game2", "app/editor", "app/game-oline", "app/loader", "app/engine/Pomelo"], function (require, exports, common_9, game2_1, editor_1, game_oline_1, loader_1, Pomelo_2) {
    "use strict";
    common_9.stageManager.add(loader_1.current_stage_wrap, game2_1.current_stage_wrap);
    common_9.stageManager.set(loader_1.current_stage_wrap);
    if (location.hash === "#game") {
        common_9.stageManager.set(game2_1.current_stage_wrap);
    }
    else if (location.hash === "#editor") {
        common_9.stageManager.set(editor_1.current_stage_wrap);
    }
    else {
        var host = location.hostname;
        var port = "3051";
        Pomelo_2.pomelo.init({
            host: host,
            port: port,
            log: true
        }, function () {
            // 随机选择服务器
            Pomelo_2.pomelo.request("gate.gateHandler.queryEntry", "hello pomelo", function (data) {
                if (data.code === 200) {
                    Pomelo_2.pomelo.init({
                        host: data.host,
                        port: data.port,
                        log: true
                    }, function () {
                        loader_1.current_stage_wrap.emit("connected", function _(username) {
                            game_oline_1.current_stage_wrap.emit("enter", username, function (err, game_info) {
                                if (err) {
                                    loader_1.current_stage_wrap.emit("connected", _, err);
                                }
                                else {
                                    game_oline_1.current_stage_wrap.emit("before-active", game_info);
                                    common_9.stageManager.set(game_oline_1.current_stage_wrap);
                                }
                            });
                        });
                    });
                }
                else {
                    console.error(data);
                }
            });
        });
    }
    function animate() {
        common_9.renderer.render(common_9.stageManager.get());
        requestAnimationFrame(animate);
    }
    animate();
});
define("class/DragAble", ["require", "exports"], function (require, exports) {
    "use strict";
    function canDragAble(obj) {
        // enable the obj to be interactive... this will allow it to respond to mouse and touch events
        obj.interactive = true;
        // this button mode will mean the hand cursor appears when you roll over the obj with your mouse
        obj.buttonMode = true;
        obj
            .on('mousedown', onDragStart)
            .on('touchstart', onDragStart)
            .on('mouseup', onDragEnd)
            .on('mouseupoutside', onDragEnd)
            .on('touchend', onDragEnd)
            .on('touchendoutside', onDragEnd)
            .on('mousemove', onDragMove)
            .on('touchmove', onDragMove);
        return obj;
    }
    exports.canDragAble = canDragAble;
    ;
    function onDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.preP = this.data.getLocalPosition(this.parent);
        this.alpha = 0.5;
        this.dragging = true;
    }
    function onDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
    }
    function onDragMove() {
        if (this.dragging) {
            var newPosition = this.data.getLocalPosition(this.parent);
            var prePosition = this.preP;
            this.position.x += (newPosition.x - prePosition.x);
            this.position.y += (newPosition.y - prePosition.y);
            this.preP = newPosition;
        }
    }
});
define("class/GaussianBlur", ["require", "exports"], function (require, exports) {
    "use strict";
    var GaussianBlur = (function (_super) {
        __extends(GaussianBlur, _super);
        function GaussianBlur() {
            var vert = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform vec2 delta;\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying vec2 vDelta;\n\nvoid main(void)\n{\n\tgl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n\tvTextureCoord = aTextureCoord;\n\n\tvDelta = delta;\n\n\tvColor = vec4(aColor.rgb * aColor.a, aColor.a);\n}";
            var frag = "precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vDelta;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nfloat random(vec3 scale, float seed) {\n    /* use the fragment position for a different seed per-pixel */\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main() {\n\tvec4 color = vec4(0.0);\n\tfloat total = 0.0;\n    float quality = 10.0;\n\t\n\t/* randomize the lookup values to hide the fixed number of samples */\n\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0)/quality;\n\t\n\tfor (float t = -10.0; t <= 10.0; t++) {\n\t\tfloat percent = (t + offset - 0.5) / quality;\n\t\tfloat weight = 1.0 - abs(percent);\n\t\tvec4 sample = texture2D(uSampler, vTextureCoord + vDelta * percent);\n\t\t\n\t\t/* switch to pre-multiplied alpha to correctly blur transparent images */\n\t\tsample.rgb *= sample.a;\n\t\t\n\t\tcolor += sample * weight;\n\t\ttotal += weight;\n\t}\n\t\n\tgl_FragColor = color / total;\n\t\n\t/* switch back from pre-multiplied alpha */\n\tgl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}";
            _super.call(this, vert, frag, {
                delta: { type: 'v2', value: { x: 0, y: 0 } }
            });
            this._delta = 0;
        }
        GaussianBlur.prototype.applyFilter = function (renderer, input, output, clear) {
            var shader = this.getShader(renderer);
            var renderTarget = renderer.filterManager.getRenderTarget(true);
            this.uniforms.delta.value = {
                x: this._delta / input.size.width,
                y: 0,
            };
            renderer.filterManager.applyFilter(shader, input, renderTarget, clear);
            this.uniforms.delta.value = {
                x: 0,
                y: this._delta / input.size.height,
            };
            renderer.filterManager.applyFilter(shader, renderTarget, output, clear);
            // 很重要，不加的话会引发内存泄漏
            renderer.filterManager.returnRenderTarget(renderTarget);
        };
        Object.defineProperty(GaussianBlur.prototype, "blur", {
            get: function () {
                return this._delta;
            },
            set: function (value) {
                this._delta = value;
            },
            enumerable: true,
            configurable: true
        });
        return GaussianBlur;
    }(PIXI.AbstractFilter));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GaussianBlur;
});
define("class/ZoomBlur", ["require", "exports"], function (require, exports) {
    "use strict";
    var ZoomBlur = (function (_super) {
        __extends(ZoomBlur, _super);
        function ZoomBlur(quality) {
            if (quality === void 0) { quality = 20; }
            _super.call(this, "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nuniform mat3 projectionMatrix;\n\nuniform vec2 center;\nuniform float strength;\nuniform vec2 texSize;\n\nvarying vec2 vCenter;\nvarying float vStrength;\nvarying vec2 vTexSize;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void)\n{\n\tgl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);\n\tvTextureCoord = aTextureCoord;\n\n\tvCenter=center;\n\tvStrength=strength;\n\tvTexSize=texSize;\n\n    // vColor = vec4(aColor.rgb * aColor.a, aColor.a);\n\n}", "precision mediump float;\n\nvarying vec2 vCenter;\nvarying float vStrength;\nvarying vec2 vTexSize;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nfloat random(vec3 scale, float seed) {\n\t/* use the fragment position for a different seed per-pixel */\n\treturn fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\nvoid main() {\n\tvec4 color = vec4(0.0);\n\tfloat total = 0.0;\n\tvec2 toCenter = vCenter - vTextureCoord * vTexSize;\n\t\n\t/* randomize the lookup values to hide the fixed number of samples */\n\tfloat offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\t\n\tfor (float t = 0.0; t <= " + (quality = Math.max(1, ~~quality)) + ".0; t++) {\n\t\tfloat percent = (t + offset) / " + quality + ".0;\n\t\tfloat weight = 4.0 * (percent - percent * percent);\n\t\tvec4 sample = texture2D(uSampler, vTextureCoord + toCenter * percent * vStrength / vTexSize);\n\t\t\n\t\t/* switch to pre-multiplied alpha to correctly blur transparent images */\n\t\tsample.rgb *= sample.a;\n\t\t\n\t\tcolor += sample * weight;\n\t\ttotal += weight;\n\t}\n\t\n\tgl_FragColor = color / total;\n\t\n\t/* switch back from pre-multiplied alpha */\n\tgl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n    // gl_FragColor = texture2D(uSampler, vTextureCoord);\n}", {
                center: { type: "v2", value: { x: 0, y: 0 } },
                strength: { type: 'f', value: 0 },
                texSize: { type: "v2", value: { x: 0, y: 0 } }
            });
            this._center = { x: 0, y: 0 };
        }
        ZoomBlur.prototype.applyFilter = function (renderer, input, output, clear) {
            var shader = this.getShader(renderer);
            this.uniforms.texSize.value = {
                x: 1,
                y: 1,
            };
            var _center = this._center;
            console.log(_center.x, input.size.width);
            this.uniforms.center.value = {
                x: _center.x / input.size.width,
                y: _center.y / input.size.height,
            };
            renderer.filterManager.applyFilter(shader, input, output, clear);
        };
        Object.defineProperty(ZoomBlur.prototype, "blur", {
            get: function () {
                return this.uniforms.strength.value;
            },
            set: function (value) {
                this.uniforms.strength.value = parseFloat(value) || 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZoomBlur.prototype, "center", {
            get: function () {
                return this._center;
            },
            set: function (value) {
                this._center.x = value.x;
                this._center.y = value.y;
            },
            enumerable: true,
            configurable: true
        });
        return ZoomBlur;
    }(PIXI.AbstractFilter));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ZoomBlur;
});
define("class/Map", ["require", "exports", "class/Tween", "class/SVGGraphics", "class/ZoomBlur"], function (require, exports, Tween_12, SVGGraphics_2, ZoomBlur_1) {
    "use strict";
    var log2 = Math["log2"] || function (x) {
        return Math.log(x) / Math.LN2;
    };
    function updateRopePoints(rope, points) {
        rope.points = points;
        rope.vertices = new Float32Array(points.length * 4);
        rope.uvs = new Float32Array(points.length * 4);
        rope.colors = new Float32Array(points.length * 2);
        rope.indices = new Uint16Array(points.length * 2);
        rope.refresh();
    }
    exports.updateRopePoints = updateRopePoints;
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(paths, map_config, renderer) {
            _super.call(this);
            /** 路径绘制的百分比*/
            this.pathpercent = 0;
            this.pathindex = -1;
            this.animateTime = 1215;
            this.max_width = 512;
            this.max_height = 512;
            this.texZoomBlur = new ZoomBlur_1.default();
            this._tween = new Tween_12.default();
            /**存储背景贴图的容器 */
            this._path_img = new PIXI.Container();
            /**存储路线的容器 */
            this._path_line = new PIXI.Container();
            /**存储路线基线的容器 */
            this._base_path_line = new PIXI.Container();
            /** 路径集合*/
            this._paths = [];
            this._paths_bounds = {
                left: Infinity,
                top: Infinity,
                right: -Infinity,
                bottom: -Infinity,
                min_zoom: Infinity,
                get width() {
                    return this.right - this.left;
                },
                get height() {
                    return this.bottom - this.top;
                }
            };
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
            this._mapbg = this._path_img.getChildAt(0);
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
        Object.defineProperty(Map.prototype, "line_texture", {
            get: function () {
                var tex = this._line_texture;
                if (!(this._cache_line_color === this.line_color && this._cache_line_width === this.line_width)) {
                    var width = this._cache_line_width = this.line_width;
                    var color = this._cache_line_color = this.line_color;
                    var _cache_renderer = this._cache_renderer;
                    var line = SVGGraphics_2.default.importFromSVG("<rect x=\"0\" y=\"0\" width=\"" + _cache_renderer.width + "\" height=\"" + _cache_renderer.height + "\" fill=\"" + color + "\" />")._graphics;
                    tex.width = tex.height = width;
                    tex.render(line);
                    this._line_texture = tex;
                }
                return tex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "base_line_texture", {
            get: function () {
                var tex = this._base_line_texture;
                if (!(this._cache_base_line_color === this.base_line_color)) {
                    var color = this._cache_base_line_color = this.base_line_color;
                    var _cache_renderer = this._cache_renderer;
                    var line = SVGGraphics_2.default.importFromSVG("<rect x=\"0\" y=\"0\" width=\"" + _cache_renderer.width + "\" height=\"" + _cache_renderer.height + "\" fill=\"" + color + "\" />")._graphics;
                    tex.width = tex.height = 1;
                    tex.render(line);
                    this._base_line_texture = tex;
                }
                return tex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "x", {
            get: function () { return this.position.x; },
            set: function (value) {
                this._mapbg && (this._mapbg.x = -value);
                this.position.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "y", {
            get: function () { return this.position.y; },
            set: function (value) {
                this._mapbg && (this._mapbg.y = -value);
                this.position.y = value;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.addPath = function (paths) {
            var _this = this;
            paths.forEach(function (path) {
                var center = {
                    x: path.center[0],
                    y: path.center[1]
                };
                var scale = Math.pow(2, path.zoom);
                /**真实坐标空间的宽 */
                var width = path.width / scale;
                /**真实坐标空间的高 */
                var height = path.height / scale;
                var left_top = {
                    x: center.x - width / 2,
                    y: center.y - height / 2
                };
                var line_width = path.line_width / scale;
                var line_height = path.line_height / scale;
                /**顶点相对的点的坐标到图像左上角坐标的差值 */
                var bound_width = (width - line_width) / 2 + left_top.x;
                var bound_height = (height - line_height) / 2 + left_top.y;
                var line = path.path.split(" ").map(function (point_info) {
                    point_info = point_info.split(",");
                    var point = new PIXI.Point(parseFloat(point_info[0].replace(/[\M\L]/, '')) / scale + bound_width, parseFloat(point_info[1]) / scale + bound_height);
                    point["_source_x"] = point.x;
                    point["_source_y"] = point.y;
                    return point;
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
                var paths_bounds = _this._paths_bounds;
                paths_bounds.left = Math.min(paths_bounds.left, left_top.x);
                paths_bounds.top = Math.min(paths_bounds.top, left_top.y);
                paths_bounds.right = Math.max(paths_bounds.right, left_top.x + width);
                paths_bounds.bottom = Math.max(paths_bounds.bottom, left_top.y + height);
                paths_bounds.min_zoom = Math.min(paths_bounds.min_zoom, path.zoom);
                var lineStrip = new PIXI.mesh.Rope(_this.line_texture, []);
                lineStrip.alpha = _this.line_alpha;
                var baseLineStrip = new PIXI.mesh.Rope(_this.base_line_texture, line);
                if (path.repeat) {
                    var bgImage = PIXI.extras.TilingSprite.fromImage(path.src);
                }
                else {
                    var bgImage = PIXI.Sprite.fromImage(path.src);
                }
                bgImage["zoom_level"] = path.zoom;
                //缩放等级越高放得越后面（高清晰度覆盖低清晰度）
                var _insert_at_index = 0;
                _this._path_img.children.some(function (bgImg, _index) {
                    if (bgImg["zoom_level"] >= path.zoom) {
                        _insert_at_index = _index;
                        return true;
                    }
                    _insert_at_index = _index + 1;
                    return false;
                });
                _this._path_img.addChildAt(bgImage, _insert_at_index);
                _this._base_path_line.addChild(baseLineStrip);
                _this._path_line.addChild(lineStrip);
                _this._paths.push({
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
        };
        /**计算出所需的显示结果 */
        Map.prototype.updateView = function (_pathindex, _viewcenter) {
            var _this = this;
            var paths_bounds = this._paths_bounds;
            var viewcenter = this.viewcenter = _viewcenter || new PIXI.Point((paths_bounds.right + paths_bounds.left) / 2, (paths_bounds.top + paths_bounds.bottom) / 2);
            var old_pathindex = this.pathindex;
            var pathindex = this.pathindex = isFinite(_pathindex) ? ~~_pathindex : this.pathindex;
            /**最终显示所需的宽（对应坐标空间的尺度） */
            var viewwidth;
            /**最终显示所需的高（对应坐标空间的尺度） */
            var viewheight;
            /**最终显示对应的视图数据 */
            var viewingpath;
            /**视图的左上角顶点坐标 */
            var viewtopleft = new PIXI.Point();
            var max_height = this.max_height;
            var max_width = this.max_width;
            if (viewingpath = this._paths[pathindex]) {
                viewwidth = viewingpath.width;
                viewheight = viewingpath.height;
                //如果没有指定center，那么使用默认的path-center
                _viewcenter || viewcenter.set(viewingpath.center.x, viewingpath.center.y);
            }
            else {
                viewwidth = paths_bounds.width;
                viewheight = paths_bounds.height;
            }
            var _pt;
            var window_proportion = max_width / max_height;
            var view_proportion = viewwidth / viewheight;
            // 对比最终显示的效果与视图窗口效果，得出最佳的显示方式
            if (!viewingpath) {
                if (view_proportion > window_proportion) {
                    /**一个单位坐标尺度对应的像素长度 */
                    var _pt = max_width / viewwidth;
                    viewtopleft.x = viewcenter.x - viewwidth / 2;
                    viewtopleft.y = viewcenter.y - max_height / 2 / _pt;
                }
                else {
                    var _pt = max_height / viewheight;
                    viewtopleft.y = viewcenter.y - viewheight / 2;
                    viewtopleft.x = viewcenter.x - max_width / 2 / _pt;
                }
            }
            else {
                // console.log(_pt, viewwidth);
                if (view_proportion > window_proportion) {
                    // 先尝试竖向完全填充，检测line部分横向是否溢出
                    _pt = max_height / viewheight;
                    if (viewingpath.line_width * _pt > max_width) {
                        var line_width = viewingpath.line_width;
                        _pt = max_width / line_width;
                        viewtopleft.x = viewcenter.x - line_width / 2;
                        viewtopleft.y = viewcenter.y - max_height / 2 / _pt;
                    }
                    else {
                        viewtopleft.y = viewcenter.y - viewheight / 2;
                        viewtopleft.x = viewcenter.x - viewheight * window_proportion / 2;
                    }
                }
                else {
                    // 先尝试横向完全填充，，检测line部分横向是否溢出
                    _pt = max_width / viewwidth;
                    if (viewingpath.line_height * _pt > max_height) {
                        var line_height = viewingpath.line_height;
                        _pt = max_height / line_height;
                        viewtopleft.y = viewcenter.y - line_height / 2;
                        viewtopleft.x = viewcenter.x - max_width / 2 / _pt;
                    }
                    else {
                        viewtopleft.x = viewcenter.x - viewwidth / 2;
                        viewtopleft.y = viewcenter.y - viewwidth * window_proportion / 2;
                    }
                }
            }
            var viewzoom = log2(_pt);
            var viewscale = _pt;
            var animateTime = this.animateTime;
            //开始转换空间坐标到视图坐标
            this._paths.forEach(function (path, index) {
                path.line.forEach(function (point) {
                    _this._tween.Tween(point)
                        .to({
                        x: (point["_source_x"] - viewtopleft.x) * viewscale,
                        y: (point["_source_y"] - viewtopleft.y) * viewscale
                    }, animateTime)
                        .easing(Tween_12.default.Easing.Quartic.Out)
                        .start();
                });
                var bgImage = path.pixi_img;
                //!!!注意：这里动画不是使用线性函数，所以在值越高的情况下，每一帧变动就越大，从而导致一个平面内的地图贴图在动画结束前会有不完全缝合的“裂缝问题”
                // 真实图片可能是高清图，宽高与设定的宽高不是1:1，所以需要手动锁定宽高
                var t = _this._tween.Tween(bgImage)
                    .to({
                    width: path.width * viewscale,
                    height: path.height * viewscale
                }, animateTime)
                    .easing(Tween_12.default.Easing.Quartic.Out)
                    .start();
                if (bgImage instanceof PIXI.extras.TilingSprite) {
                    var tileBgImage = bgImage;
                    var tileTex = tileBgImage.texture;
                    t.onUpdate(function () {
                        tileBgImage.tileScale.x = this.width / tileTex.width;
                        tileBgImage.tileScale.y = this.height / tileTex.height;
                    });
                    // 因为Map对象可能进行了位移，从而导致背景跟随反向位移，以确保全屏效果，必须把位移重新算上
                    _this._tween.Tween(tileBgImage.tilePosition)
                        .to({
                        x: (path.left_top.x - viewtopleft.x) * viewscale - tileBgImage.x,
                        y: (path.left_top.y - viewtopleft.y) * viewscale,
                    }, animateTime)
                        .easing(Tween_12.default.Easing.Quartic.Out)
                        .start();
                }
                else {
                    // 图片不需要完全显示，只需要显示核心路径部分
                    _this._tween.Tween(bgImage.position)
                        .to({
                        x: (path.left_top.x - viewtopleft.x) * viewscale,
                        y: (path.left_top.y - viewtopleft.y) * viewscale
                    }, animateTime)
                        .easing(Tween_12.default.Easing.Quartic.Out)
                        .start();
                }
                //绘制基础lineSprite
                var lineSprite = _this._path_line.children[index];
                if (lineSprite) {
                    if (index >= pathindex) {
                        updateRopePoints(lineSprite, []);
                    }
                    else {
                        updateRopePoints(lineSprite, path.line);
                    }
                }
            });
            // 图片特效
            var texZoomBlur = this.texZoomBlur;
            var path_images = this._path_img;
            path_images.filters = [texZoomBlur];
            var _tp_1 = performance.now(); //上一个时间点
            var _tp_2 = null; //当前时间点
            var _v_1 = 0; //前一个值
            // console.log(viewcenter, viewtopleft)
            this._tween.Tween({ p: 0 })
                .to({
                p: 1
            }, animateTime)
                .easing(Tween_12.default.Easing.Quartic.Out)
                .onUpdate(function (_v_2) {
                _tp_2 = performance.now();
                var t = _tp_2 - _tp_1; //花费的时间
                var a = 10 * animateTime * (_v_2 - _v_1) / t; //加速度
                //1-1/log2(x+2)
                var blur = Math.max(1 - 1 / log2(a + 2), 0.01);
                // console.log(a, blur);
                texZoomBlur.blur = blur;
                console.log(path_images.getBounds(), _this.getBounds(), max_width, _this.x);
                texZoomBlur.center = {
                    x: max_width / 2 + _this.x,
                    y: max_height / 2
                };
                _tp_1 = _tp_2;
                _v_1 = _v_2;
            })
                .onComplete(function () {
                path_images.filters = null;
            })
                .start();
        };
        Map.prototype.updatePathpercent = function (_pathpercent) {
            if (_pathpercent === void 0) { _pathpercent = 0; }
            this.pathpercent = _pathpercent;
            var currentIndex = this.pathindex;
            var path = this._paths[currentIndex];
            var lineStrip;
            if (path && (lineStrip = this._path_line.children[this.pathindex])) {
                var points = path.line.slice(0, _pathpercent * path.line.length);
                updateRopePoints(lineStrip, points);
            }
        };
        Map.prototype.update = function (time) {
            return this._tween.update(time);
        };
        return Map;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Map;
});
define("class/MouseWheel", ["require", "exports"], function (require, exports) {
    "use strict";
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
    var MouseWheel = (function () {
        function MouseWheel(fun, capture) {
            _mouseWheel(window, "mousewheel", fun, capture);
        }
        return MouseWheel;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MouseWheel;
    var _mouseWheel = function (el, type, fn, capture) { };
    if (window.addEventListener) {
        _mouseWheel = function (el, type, fn, capture) {
            if (type === "mousewheel" && document["mozHidden"] !== undefined) {
                type = "DOMMouseScroll";
            }
            el.addEventListener(type, function (event) {
                fn.call(this, _eventCompat(event));
            }, capture || false);
        };
    }
    else if (window["attachEvent"]) {
        _mouseWheel = function (el, type, fn, capture) {
            el.attachEvent("on" + type, function (event) {
                event = event || window.event;
                fn.call(el, _eventCompat(event));
            });
        };
    }
});
define("class/pixelCollision", ["require", "exports"], function (require, exports) {
    "use strict";
    var canvas = document.createElement("canvas");
    var canvas2 = document.createElement("canvas");
    // canvas.style.background = "blue";
    // canvas2.style.background = "red";
    // setTimeout(function () {
    //     document.body.appendChild(canvas);
    //     document.body.appendChild(canvas2);
    // });
    var ctx = canvas.getContext("2d");
    function drawImageTo(img, img_w, img_h, is_flip_horizontal, is_flip_vertical, can) {
        if (img_w === void 0) { img_w = 0; }
        if (img_h === void 0) { img_h = 0; }
        can || (can = canvas);
        var c_width = can.width = img_w || img.width;
        var c_height = can.height = img_h || img.height;
        var ctx = can.getContext("2d");
        ctx.clearRect(0, 0, c_width, c_height);
        ctx.clearRect(0, 0, c_width, c_height);
        if (is_flip_horizontal || is_flip_vertical) {
            ctx.translate(c_width, 0);
            ctx.scale(is_flip_horizontal ? -1 : 1, is_flip_vertical ? -1 : 1);
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, c_width, c_height);
            ctx.translate(c_width, 0);
            ctx.scale(is_flip_horizontal ? -1 : 1, is_flip_vertical ? -1 : 1);
        }
        else {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, c_width, c_height);
        }
        return ctx;
    }
    function pixelCollision(sprite_a, sprite_b) {
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
            var scale_a = sprite_a.scale;
            var scale_b = sprite_b.scale;
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
        return false;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = pixelCollision;
    function isCollisionWithRect(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x1 >= x2 && x1 >= x2 + w2) {
            return false;
        }
        else if (x1 <= x2 && x1 + w1 <= x2) {
            return false;
        }
        else if (y1 >= y2 && y1 >= y2 + h2) {
            return false;
        }
        else if (y1 <= y2 && y1 + h1 <= y2) {
            return false;
        }
        return true;
    }
    exports.isCollisionWithRect = isCollisionWithRect;
});
define("class/ScrollAble", ["require", "exports", "class/SVGGraphics", "class/MouseWheel", "class/Tween"], function (require, exports, SVGGraphics_3, MouseWheel_1, Tween_13) {
    "use strict";
    var S_ANI_TIME = 195;
    var B_ANI_TIME = 375;
    var SCROLL_BAR_BG_COLOR = "rgba(255,255,255,0.3)";
    var SCROLL_BAR_COLOR = "rgba(255,255,255,0.8)";
    /**滚动栏显示最小需要12px的高度，意味着 */
    var SCROLL_BAR_WIDTH = 12;
    var ScrollAbleContainer = (function (_super) {
        __extends(ScrollAbleContainer, _super);
        function ScrollAbleContainer(config, content) {
            var _this = this;
            _super.call(this);
            /**外层容器，用来保存this以及scroll_bar */
            this.wrap = new PIXI.Container();
            this.ANI = new Tween_13.default();
            this.speedText = new PIXI.Text("", {
                font: "16px 微软雅黑",
                fill: "#FFF",
            });
            this._max_scroll_top = 0;
            this.interactive = true;
            var onScrollStart = this.onScrollStart;
            var onScrollEnd = this.onScrollEnd;
            var onScrollMove = this.onScrollMove;
            this
                .on('mousedown', onScrollStart)
                .on('touchstart', onScrollStart)
                .on('mouseup', onScrollEnd)
                .on('mouseupoutside', onScrollEnd)
                .on('touchend', onScrollEnd)
                .on('touchendoutside', onScrollEnd)
                .on('mousemove', onScrollMove)
                .on('touchmove', onScrollMove);
            new MouseWheel_1.default(function (e) {
                var mouse_point = new PIXI.Point(0, 0);
                var event = mouseWheelEventToInteractionData(e, _this, mouse_point);
                onScrollStart.call(_this, event);
                if (e.delta > 0) {
                    mouse_point.x = mouse_point.y = 120;
                }
                else if (e.delta < 0) {
                    mouse_point.x = mouse_point.y = -120;
                }
                onScrollMove.call(_this);
                onScrollEnd.call(_this);
            });
            /**内容部分的滚动配置 */
            this.ANI.Tween("scroll_content", this.position)
                .easing(Tween_13.default.Easing.Quartic.Out)
                .onUpdate(function () {
                _this.emit("scrolling");
            })
                .onComplete(function () {
                setTimeout(function () { return _this.emit("scrolled"); }, 0);
            });
            this.on("scrolled", function () {
                // 滚动回弹
                var scroll_top = _this.y;
                var scroll_back = null;
                if (scroll_top > 0) {
                    scroll_back = 0;
                }
                else {
                    var min_scroll_top = _this._min_scroll_top;
                    if (scroll_top < min_scroll_top) {
                        scroll_back = min_scroll_top;
                    }
                }
                if (scroll_back !== null) {
                    _this.ANI.Tween("scroll_content")
                        .to({
                        y: scroll_back
                    }, B_ANI_TIME)
                        .start();
                }
                // 滚动条动画
                _this.update_scroll_handle();
            });
            this.on("scrolling", function () {
                _this.update_scroll_handle();
            });
            this.scroll_config = config;
            this._update_key = config.is_horizontal ? "x" : "y";
            if (content) {
                this.addChild(content);
            }
            this.wrap.addChild(this);
            if (config.is_debug) {
                /**滚动速度显示 */
                this.wrap.addChild(SVGGraphics_3.default.importFromSVG("<rect x=0 y=0 width=\"" + config.width + "\" height=20 stroke-width=\"0\" fill=\"rgba(0,0,0,0.8)\"/>")._graphics, this.speedText);
            }
            if (config.show_scroll_bar) {
                this.showScrollBar();
            }
            this.ANI.start();
        }
        Object.defineProperty(ScrollAbleContainer.prototype, "_min_scroll_top", {
            get: function () {
                return this.scroll_config.height - this.height;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ScrollAbleContainer.prototype, "progress", {
            get: function () {
                return Math.max(Math.min((-this.y - this.scroll_config.height) / this.height, 0), 1);
            },
            enumerable: true,
            configurable: true
        });
        /**更新高度，刷新ScrollBar */
        ScrollAbleContainer.prototype.updateHeight = function () {
            if (this.scroll_bar) {
                this.wrap.removeChild(this.scroll_bar);
                this.scroll_bar = null;
            }
            this.showScrollBar();
        };
        ScrollAbleContainer.prototype.update_scroll_handle = function () {
        };
        ScrollAbleContainer.prototype.showScrollBar = function () {
            var scroll_bar = this.scroll_bar;
            var scorll_bar_width = SCROLL_BAR_WIDTH;
            var scorll_bar_width_SQRT2 = scorll_bar_width * Math.SQRT2;
            var scorll_bar_color = SCROLL_BAR_BG_COLOR;
            var scorll_bar_height = this.scroll_config.height;
            var content_height = this.height;
            if (!content_height || content_height < scorll_bar_height) {
                return;
            }
            if (!scroll_bar) {
                var _mid_bar_height = scorll_bar_height - scorll_bar_width;
                scroll_bar = this.scroll_bar = SVGGraphics_3.default.importFromSVG("<path fill=\"" + scorll_bar_color + "\" stroke-width=\"0\" d=\"M0 " + scorll_bar_width / 2 + " C 0 " + (scorll_bar_width - scorll_bar_width_SQRT2) / 2 + ", " + scorll_bar_width + " " + (scorll_bar_width - scorll_bar_width_SQRT2) / 2 + ", " + scorll_bar_width + " " + scorll_bar_width / 2 + "\"/><rect x=\"0\" y=\"" + scorll_bar_width / 2 + "\" width=" + scorll_bar_width + " height=" + _mid_bar_height + " /><path fill=\"" + scorll_bar_color + "\" stroke-width=\"0\"  d=\"M0 " + (scorll_bar_width / 2 + _mid_bar_height) + " C 0 " + ((scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_bar_height) + ", " + scorll_bar_width + " " + ((scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_bar_height) + ", " + scorll_bar_width + " " + (scorll_bar_width / 2 + _mid_bar_height) + "\"/>")._graphics;
                scroll_bar.alpha = 0;
                scroll_bar.x = this.scroll_config.width - scorll_bar_width;
                var mask = scroll_bar.clone();
                mask.x = scroll_bar.x;
                scroll_bar.mask = mask;
                var scorll_handle_color = SCROLL_BAR_COLOR;
                var _mid_handle_height = _mid_bar_height / content_height * _mid_bar_height;
                var scroll_handle = this.scroll_handle = new PIXI.Container();
                var scroll_handle_top = SVGGraphics_3.default.importFromSVG("<path fill=\"" + scorll_handle_color + "\" stroke-width=\"0\" d=\"M0 " + scorll_bar_width / 2 + " C 0 " + (scorll_bar_width - scorll_bar_width_SQRT2) / 2 + ", " + scorll_bar_width + " " + (scorll_bar_width - scorll_bar_width_SQRT2) / 2 + ", " + scorll_bar_width + " " + scorll_bar_width / 2 + "\"/>")._graphics;
                var scroll_handle_mid = SVGGraphics_3.default.importFromSVG("<rect x=\"0\" y=\"" + scorll_bar_width / 2 + "\" stroke-width=\"0\" width=" + scorll_bar_width + " height=" + _mid_handle_height + " fill=" + scorll_handle_color + " />")._graphics;
                var scroll_handle_btm = SVGGraphics_3.default.importFromSVG("<path fill=\"" + scorll_handle_color + "\" stroke-width=\"0\"  d=\"M0 " + (scorll_bar_width / 2 + _mid_handle_height) + " C 0 " + ((scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height) + ", " + scorll_bar_width + " " + ((scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height) + ", " + scorll_bar_width + " " + (scorll_bar_width / 2 + _mid_handle_height) + "\"/>")._graphics;
                scroll_handle.addChild(scroll_handle_top, scroll_handle_mid, scroll_handle_btm);
                // SVGGraphics.importFromSVG(`<path fill="${scorll_handle_color}" stroke-width="0" d="M0 ${scorll_bar_width / 2} C 0 ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${(scorll_bar_width - scorll_bar_width_SQRT2) / 2}, ${scorll_bar_width} ${scorll_bar_width / 2}"/><rect x="0" y="${scorll_bar_width / 2}" width=${scorll_bar_width} height=${_mid_handle_height} /><path fill="${scorll_handle_color}" stroke-width="0"  d="M0 ${scorll_bar_width / 2 + _mid_handle_height} C 0 ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${(scorll_bar_width_SQRT2 + scorll_bar_width) / 2 + _mid_handle_height}, ${scorll_bar_width} ${scorll_bar_width / 2 + _mid_handle_height}"/>`)._graphics;
                this.update_scroll_handle = function () {
                    var scroll_top = this.y;
                    var res_y = (_mid_bar_height - _mid_handle_height) * (scroll_top / (this.scroll_config.height - this.height));
                    if (res_y < -_mid_handle_height) {
                        res_y = -_mid_handle_height;
                    }
                    else if (res_y > _mid_bar_height) {
                        res_y = _mid_bar_height;
                    }
                    this.ANI.Tween("scroll_handle_position", scroll_handle.position, true)
                        .to({
                        y: res_y
                    }, B_ANI_TIME)
                        .easing(Tween_13.default.Easing.Quartic.Out)
                        .start();
                };
                scroll_bar.addChild(scroll_handle);
                this.wrap.addChild(mask);
                this.wrap.addChild(scroll_bar);
            }
            this.ANI.Tween("scroll_bar_alpha", scroll_bar, true)
                .to({
                alpha: this.scroll_config.show_scroll_bar ? 1 : 0
            }, S_ANI_TIME)
                .start();
        };
        ScrollAbleContainer.prototype.appendTo = function (parent) {
            parent.addChild(this.wrap);
        };
        /**更新动画 */
        ScrollAbleContainer.prototype.update = function (time) {
            this.ANI.update(time);
        };
        ScrollAbleContainer.prototype.onScrollStart = function (event) {
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
                .stop();
        };
        ScrollAbleContainer.prototype.onScrollMove = function () {
            if (this._scrolling) {
                var newPosition = this._scroll_point_data.getLocalPosition(this.parent);
                var prePosition = this._preP;
                var _key = this._update_key;
                /**记录下三个点的时间、位移量数据 */
                this._m_a = this._m_b;
                var _current_move = this._m_b = newPosition[_key] - prePosition[_key];
                this._t_1 = this._t_2;
                this._t_2 = this._t_3;
                this._t_3 = performance.now();
                this[_key] = this[_key] + _current_move;
                this._preP = newPosition;
                this.emit("scrolling");
            }
        };
        ScrollAbleContainer.prototype.onScrollEnd = function () {
            this._scrolling = false;
            // set the interaction data to null
            var speedText = this.speedText;
            speedText.text = "A:NULL;";
            if (this._t_1) {
                var _tt_1 = this._t_2 - this._t_1;
                var _tt_2 = this._t_3 - this._t_2;
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
                    var _scroll_value = _scroll_base * _scroll_speed;
                    speedText.text = "A:" + _a.toFixed(4) + ";V:" + _scroll_value.toFixed(4);
                    var res = this.position[_key] + _scroll_value;
                    var view_height = this.scroll_config.height;
                    if (res > this._max_scroll_top || res < this._min_scroll_top) {
                        _scroll_value = S_ANI_TIME;
                        var over_v = Math.abs(_scroll_base) / (Math.abs(_scroll_base) + view_height) * view_height;
                        if (res < this._min_scroll_top) {
                            res = this._min_scroll_top - over_v;
                        }
                        else {
                            res = this._max_scroll_top + over_v;
                        }
                        speedText.text += ";O:" + over_v.toFixed(4) + ";OV:" + res.toFixed(4);
                    }
                    this.ANI.Tween("scroll_content")
                        .to((_b = {},
                        _b[_key] = res,
                        _b
                    ), Math.abs(_scroll_value))
                        .start();
                }
            }
            this._scroll_point_data = null;
            this.emit("scrolled");
            var _b;
        };
        return ScrollAbleContainer;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ScrollAbleContainer;
    function mouseWheelEventToInteractionData(e, target, point) {
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
        return eventData;
    }
});
