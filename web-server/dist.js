var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("app/engine/Collision", ["require", "exports"], function (require, exports) {
    "use strict";
    var uuid = 0;
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
                y: 0
            };
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
        }
        P2I.prototype.update = function (delay) {
            var p2_body = this.p2_body;
            var config = this.config;
            this.x = config.x = p2_body.position[0];
            this.y = config.y = p2_body.position[1];
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
    // const devicePixelRatio = window["_isMobile"] ? 2 : 1;
    exports.pt2px = function (pt) { return pt * 2; }; //((window.devicePixelRatio) || 1);//px 转 pt
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
});
define("app/class/Flyer", ["require", "exports", "app/engine/Collision", "app/const"], function (require, exports, Collision_1, const_1) {
    "use strict";
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
                size: const_1.pt2px(10),
                body_color: 0x2255ff,
            };
            var self = this;
            var config = self.config;
            const_1.mix_options(config, new_config);
            var body = self.body;
            body.lineStyle(0, 0x000000, 1);
            body.beginFill(config.body_color);
            body.drawCircle(config.size / 2, config.size / 2, config.size);
            body.endFill();
            self.addChild(body);
            self.pivot.set(config.size / 2, config.size / 2);
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
            // self.body_shape.collisionGroup = Flyer.clooisionGroup;
            // // 与任何物体都可以发生碰撞
            // self.body_shape.collisionMask = -1;
            self.p2_body.addShape(self.body_shape);
            self.p2_body.force = [config.x_speed, config.y_speed];
            self.p2_body.position = [config.x, config.y];
        }
        Flyer.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.p2_body.force = [this.config.x_speed, this.config.y_speed];
        };
        Flyer.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_1.mix_options(config, new_config);
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        return Flyer;
    }(Collision_1.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Flyer;
});
define("app/class/Wall", ["require", "exports", "app/engine/Collision", "app/const"], function (require, exports, Collision_2, const_2) {
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
                color: 0x0ff0f0
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
            const_2.mix_options(config, new_config);
            var body = self.body;
            body.beginFill(config.color);
            body.drawRect(0, 0, config.width, config.height);
            body.endFill();
            self.addChild(body);
            self.pivot.set(config.width / 2, config.height / 2);
            self.body_shape = new p2.Box({
                width: config.width,
                height: config.height,
            });
            // self.body_shape.collisionGroup = Wall.clooisionGroup;
            // // 与任何物体都可以发生碰撞
            // self.body_shape.collisionMask = -1;
            self.p2_body.addShape(self.body_shape);
            self.p2_body.position = [config.x, config.y];
            self.rotation = config.rotation;
        }
        Wall.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_2.mix_options(config, new_config);
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        Wall.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.rotation = this.config.rotation = this.p2_body.angle;
        };
        return Wall;
    }(Collision_2.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Wall;
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
define("app/class/Bullet", ["require", "exports", "app/engine/Collision", "class/Tween", "app/const"], function (require, exports, Collision_3, Tween_1, const_3) {
    "use strict";
    var Easing = Tween_1.default.Easing;
    var Bullet = (function (_super) {
        __extends(Bullet, _super);
        function Bullet(new_config) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            // static collisionMask  = 1<<1;
            this.body = new PIXI.Graphics();
            this.config = {
                x: 0,
                y: 0,
                start_y_speed: 10,
                start_x_speed: 0,
                size: const_3.pt2px(5),
                body_color: 0x2255ff,
                lift_time: 2000,
                team_tag: NaN,
                damage: 0
            };
            var self = this;
            var config = self.config;
            const_3.mix_options(config, new_config);
            var body = self.body;
            body.lineStyle(0, 0x000000, 1);
            body.beginFill(config.body_color);
            body.drawCircle(config.size / 2, config.size / 2, config.size);
            body.endFill();
            self.addChild(body);
            self.pivot.set(config.size / 2, config.size / 2);
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
            self.body_shape["bullet_team_tag"] = config.team_tag;
            // self.body_shape.collisionGroup = 1<<(config.team_tag+1);
            // self.body_shape.collisionMask = ~(self.body_shape.collisionGroup|1<<config.team_tag);
            self.p2_body.damping = self.p2_body.angularDamping = 0;
            self.p2_body.addShape(self.body_shape);
            self.p2_body.force = [config.start_x_speed, config.start_y_speed];
            self.p2_body.position = [config.x, config.y];
            if (typeof process === "object") {
                self.on("explode", function () {
                    console.log("explode", self._id);
                    self.emit("destroy");
                });
            }
            else {
                self.on("explode", function () {
                    var ani_time = const_3.B_ANI_TIME;
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
        }
        Bullet.prototype.setConfig = function (new_config) {
            _super.prototype.setConfig.call(this, new_config);
            var config = this.config;
            const_3.mix_options(config, new_config);
            this.p2_body.position = [config.x, config.y];
            this.x = config.x;
            this.y = config.y;
        };
        return Bullet;
    }(Collision_3.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Bullet;
});
define("app/class/Ship", ["require", "exports", "app/engine/Collision", "app/engine/Victor", "app/class/Bullet", "class/Tween", "app/const"], function (require, exports, Collision_4, Victor_1, Bullet_1, Tween_2, const_4) {
    "use strict";
    var Easing = Tween_2.default.Easing;
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(new_config) {
            if (new_config === void 0) { new_config = {}; }
            _super.call(this);
            this.gun = new PIXI.Graphics();
            this.body = new PIXI.Graphics();
            this.config = {
                x: 0,
                y: 0,
                y_speed: 0,
                x_speed: 0,
                force: 10000,
                size: const_4.pt2px(20),
                body_color: 0x2255ff,
                is_firing: false,
                rotation: 0,
                max_hp: 100,
                cur_hp: 100,
                restore_hp: 1,
                // 战斗相关的属性
                bullet_speed: 4000,
                bullet_damage: 5,
                // 标志
                team_tag: 10,
            };
            var self = this;
            var config = self.config;
            const_4.mix_options(config, new_config);
            var body = self.body;
            var body_size = config.size;
            body.clear();
            body.lineStyle(4, 0x000000, 1);
            body.beginFill(config.body_color);
            body.drawCircle(body_size / 2, body_size / 2, body_size);
            body.endFill();
            var gun = self.gun;
            var gun_height = body_size * 2 / 3;
            var gun_width = body_size;
            gun.lineStyle(4, 0x000000, 1);
            gun.beginFill(0x666666);
            gun.drawRect(body_size / 2 + body_size * 0.8, body_size / 2 - gun_height / 2, gun_width, gun_height);
            gun.endFill();
            self.addChild(gun);
            self.addChild(body);
            self.pivot.set(body_size / 2, body_size / 2);
            self.body_shape = new p2.Circle({
                radius: config.size,
            });
            self.body_shape["ship_team_tag"] = config.team_tag;
            // self.body_shape.collisionGroup = 1<<config.team_tag;
            // // 与任何物体都可以发生碰撞
            // self.body_shape.collisionMask = -1;
            self.p2_body.addShape(self.body_shape);
            self.changeMass(Math.PI * 2 * body_size);
            self.p2_body.force = [config.x_speed, config.y_speed];
            self.p2_body.position = [config.x, config.y];
            self.on("change-hp", function (dif_hp) {
                console.log("change-hp-value:", dif_hp);
                if (isFinite(dif_hp)) {
                    var config_1 = self.config;
                    config_1.cur_hp -= dif_hp;
                    if (config_1.cur_hp <= 0) {
                        self.emit("die");
                    }
                }
            });
            if (typeof process == "object") {
                self.on("die", function () {
                    self.emit("destroy");
                });
            }
            else {
                self.on("die", function () {
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
        }
        Ship.prototype.update = function (delay) {
            _super.prototype.update.call(this, delay);
            this.rotation = this.p2_body["rotation"];
            this.p2_body.force = [this.config.x_speed, this.config.y_speed];
        };
        Ship.prototype.setConfig = function (new_config) {
            var config = this.config;
            const_4.mix_options(config, new_config);
            this.p2_body.position[0] = config.x;
            this.p2_body.position[1] = config.y;
            this.p2_body["rotation"] = config.rotation;
            this.x = config.x;
            this.y = config.y;
            this.rotation = config.rotation;
        };
        Ship.prototype.fire = function () {
            var _this = this;
            var config = this.config;
            if (config.is_firing) {
                return;
            }
            var bullet_size = const_4.pt2px(5);
            var bullet_speed = new Victor_1.default(config.bullet_speed, 0);
            var bullet_start = new Victor_1.default(config.size + bullet_size, 0);
            bullet_speed.rotate(config.rotation);
            bullet_start.rotate(config.rotation);
            var bullet = new Bullet_1.default({
                team_tag: config.team_tag,
                x: config.x + bullet_start.x,
                y: config.y + bullet_start.y,
                start_x_speed: bullet_speed.x,
                start_y_speed: bullet_speed.y,
                size: bullet_size,
                damage: config.bullet_damage
            });
            // 一旦发射，飞船受到后座力
            bullet.once("add-to-world", function () {
                _this.p2_body.force[0] -= bullet_speed.x;
                _this.p2_body.force[1] -= bullet_speed.y;
            });
            return bullet;
            // config.firing
        };
        return Ship;
    }(Collision_4.P2I));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ship;
});
define("app/class/HP", ["require", "exports", "app/const"], function (require, exports, const_5) {
    "use strict";
    var HP = (function (_super) {
        __extends(HP, _super);
        function HP(ship) {
            _super.call(this);
            this.ship = ship;
            this.setHP(1);
        }
        HP.prototype.setHP = function (percentage) {
            this.clear();
            percentage = Math.min(Math.max(parseFloat(percentage), 0), 1);
            var width = const_5.pt2px(40);
            var height = const_5.pt2px(5);
            var borderWidth = const_5.pt2px(1);
            this.lineStyle(borderWidth, 0x000000, 1);
            this.beginFill(0xEEEEEE);
            this.drawRoundedRect(0, 0, width + borderWidth, height + borderWidth, height / 4);
            this.endFill();
            this.lineStyle(0, 0x000000, 1);
            this.beginFill(0x33EE33);
            this.drawRoundedRect(borderWidth / 2, borderWidth / 2, width * percentage, height, height / 4);
            this.endFill();
        };
        HP.prototype.update = function (delay) {
            var ship_config = this.ship.config;
            this.x = ship_config.x - ship_config.size;
            this.y = ship_config.y + ship_config.size + this.height / 2;
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
    // const devicePixelRatio = window["_isMobile"] ? 2 : 1;
    exports.pt2px = function (pt) { return pt * 2; }; //((window.devicePixelRatio) || 1);//px 转 pt
    var body = document.getElementById("body");
    function emitReisze(con) {
        con.children.forEach(function (item) {
            item.emit("resize");
            if (item instanceof PIXI.Container && !item["_has_custom_resize"]) {
                // requestAnimationFrame(function () {
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
    exports.renderer = window["R"] = PIXI.autoDetectRenderer(body.clientWidth, body.clientHeight, {
        antialias: true,
        resolution: 1
    });
    body.appendChild(exports.renderer.view);
    exports.VIEW = {
        get WIDTH() {
            return _main_stage.rotation % Math.PI ? exports.renderer.view.height : exports.renderer.view.width;
        },
        get HEIGHT() {
            return _main_stage.rotation % Math.PI ? exports.renderer.view.width : exports.renderer.view.height;
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
    exports.on = function (obj, eventName, handle) {
        obj["interactive"] = true;
        return eventName.split("|").map(function (en) {
            if (en === "touchenter") {
                return obj.on("touchmove", function (e) {
                    console.log(e.target === obj);
                    if (e.target === _this) {
                        handle(e);
                    }
                });
            }
            else if (en === "touchout") {
            }
            else if (en === "keydown" || en === "keyup") {
                document.body.addEventListener(en, function (e) {
                    handle(e);
                });
            }
            else {
                return obj.on(en, handle);
            }
        });
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
});
define("app/Dialog", ["require", "exports", "class/SVGGraphics", "class/Tween", "app/common"], function (require, exports, SVGGraphics_1, Tween_3, common_1) {
    "use strict";
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
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(title, content, ani_control, options) {
            var _this = this;
            _super.call(this);
            this.style = {
                bg: {
                    color: 0xe51928,
                    alpha: 1,
                    paddingLR: common_1.pt2px(40),
                    paddingTB: common_1.pt2px(76),
                    radius: common_1.pt2px(10)
                },
                closeButton: {
                    show: true,
                    size: common_1.pt2px(18),
                    bold: common_1.pt2px(1),
                    top: 0,
                    left: 0
                },
                title: {
                    padding: common_1.pt2px(20)
                }
            };
            this._is_anining = false;
            this.ani = ani_control;
            options || (options = {});
            var style = this.style;
            mix_options(style, options);
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
            }
            else if (title instanceof PIXI.Texture) {
                this.title = new PIXI.Sprite(title);
            }
            else {
                this.title = PIXI.Sprite.fromImage(title);
            }
            this.addChild(this.title);
            this.title.texture.on("update", function () {
                console.log("Dialog resize..");
                _this.resize();
            });
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
            bg.clear();
            bg.lineStyle(0);
            bg.beginFill(style.bg.color, style.bg.alpha);
            var bg_width = Math.max(this.content.width, this.title.width + style.title.padding) + style.bg.paddingLR; //14.10 / 16.94 * VIEW.WIDTH;
            var bg_height = this.content.height + style.bg.paddingTB;
            var bg_x = (common_1.VIEW.WIDTH - bg_width) / 2;
            var bg_y = (common_1.VIEW.HEIGHT - bg_height) / 2;
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
        Dialog.prototype.open = function (parent) {
            var _this = this;
            if (this._is_anining) {
                return;
            }
            this.emit("open");
            parent.addChild(this);
            this._is_anining = true;
            // 还原来计算出正确的宽高
            this.scale.set(1, 1);
            this.ani.Tween(this)
                .to({ x: this.x, y: this.y }, common_1.B_ANI_TIME)
                .set({ x: this.x + this.width / 2, y: this.y + this.height / 2 })
                .easing(Tween_3.default.Easing.Quintic.Out)
                .start();
            this.ani.Tween(this.scale)
                .set({ x: 0, y: 0 })
                .to({ x: 1, y: 1 }, common_1.B_ANI_TIME)
                .easing(Tween_3.default.Easing.Quintic.Out)
                .start()
                .onComplete(function () { _this._is_anining = false; });
        };
        Dialog.prototype.close = function () {
            var _this = this;
            if (this._is_anining) {
                return;
            }
            this.emit("close");
            this._is_anining = true;
            this.ani.Tween(this.scale)
                .set({ x: 1, y: 1 })
                .to({ x: 0, y: 0 }, common_1.B_ANI_TIME)
                .easing(Tween_3.default.Easing.Quintic.In)
                .start();
            var cur_x = this.x;
            var cur_y = this.y;
            this.ani.Tween(this)
                .to({ x: this.x + this.width / 2, y: this.y + this.height / 2 }, common_1.B_ANI_TIME)
                .easing(Tween_3.default.Easing.Quintic.In)
                .start()
                .onComplete(function () {
                _this.position.set(cur_x, cur_y);
                _this._is_anining = false;
                _this.parent && _this.parent.removeChild(_this);
            });
        };
        return Dialog;
    }(PIXI.Container));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Dialog;
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
    var world = {
        addBody: function (body) {
            p2is_config_cache_pre[body.id] = p2is_config_cache[body.id] = {
                x: body.position[0],
                y: body.position[1],
                angle: body.angle,
                rotation: body["rotation"] || 0,
            };
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
                        p2is_config_cache[body.id] = {
                            x: body.position[0],
                            y: body.position[1],
                            angle: body.angle,
                            rotation: body["rotation"] || 0,
                        };
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
                    p2is_config_cache[body.id] = {
                        x: body.position[0],
                        y: body.position[1],
                        angle: body.angle,
                        rotation: body["rotation"] || 0,
                    };
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
                    };
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
                var cache_rotation = cache_config.rotation;
                var pre_rotation = pre_config.rotation;
                var dif_rotation = 0;
                // 旋转要特殊处理。TODO：包括angle
                if (cache_rotation <= Math.PI / 2 && pre_rotation >= Math.PI * 3 / 2) {
                    cache_rotation = cache_rotation + Math.PI * 2;
                    dif_rotation = cache_rotation - pre_rotation;
                }
                else if (pre_rotation <= Math.PI / 2 && cache_rotation >= Math.PI * 3 / 2) {
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
define("app/engine/world", ["require", "exports", "app/class/Bullet", "app/class/Ship"], function (require, exports, Bullet_2, Ship_1) {
    "use strict";
    var world = new p2.World({
        gravity: [0, 0]
    });
    var worldStep = 1 / 60;
    var planeShape = new p2.Plane();
    var planeBody = new p2.Body({
        position: [0, 0]
    });
    planeBody.addShape(planeShape);
    world.addBody(planeBody);
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
        // 如果si、sj都是子弹，无视同组的 普通子弹
        if (si["bullet_team_tag"] &&
            si["bullet_team_tag"] === sj["bullet_team_tag"]) {
            return;
        }
        return _runNarrowphase.call(this, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen);
    };
    var All_bullets = new WeakMap();
    world.on("impact", function (evt) {
        if (All_bullets.has(evt.bodyA)) {
            var bullet = All_bullets.get(evt.bodyA);
            var maybeship = All_bullets.get(evt.bodyB);
        }
        else if (All_bullets.has(evt.bodyB)) {
            bullet = All_bullets.get(evt.bodyB);
            var maybeship = All_bullets.get(evt.bodyA);
        }
        if (bullet) {
            bullet.emit("explode");
            if (maybeship instanceof Ship_1.default) {
            }
        }
    });
    var p2is = [];
    exports.engine = {
        world: world,
        add: function (item) {
            if (item instanceof Bullet_2.default) {
                All_bullets.set(item.p2_body, item);
            }
            p2is.push(item);
            item.emit("add-to-world", world);
        },
        update: function (delay) {
            world.step(worldStep, delay / 100);
            p2is.forEach(function (p2i) { return p2i.update(delay); });
        }
    };
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
define("app/game-oline", ["require", "exports", "class/Tween", "class/When", "app/class/Flyer", "app/class/Wall", "app/class/Ship", "app/class/Bullet", "app/class/HP", "app/engine/shadowWorld", "app/engine/Victor", "app/engine/Pomelo", "app/common"], function (require, exports, Tween_4, When_1, Flyer_1, Wall_1, Ship_2, Bullet_3, HP_1, shadowWorld_1, Victor_2, Pomelo_1, common_2) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_4.default();
    var jump_tween = new Tween_4.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Graphics();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    exports.current_stage_wrap["keep_direction"] = "horizontal";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("button", "./res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("游戏加载中……", {
        font: common_2.pt2px(25) + "px 微软雅黑",
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
            exports.current_stage_wrap.drawRect(0, 0, common_2.VIEW.WIDTH, common_2.VIEW.HEIGHT);
            exports.current_stage_wrap.endFill();
        }
        exports.current_stage_wrap.on("resize", drawPlan);
        var ObjectMap = {
            "Flyer": Flyer_1.default,
            "Wall": Wall_1.default,
            "Ship": Ship_2.default,
            "Bullet": Bullet_3.default,
        };
        var instanceMap = {};
        var view_ship;
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
        var HP_SHIP_WEAKMAP = {};
        function showViewData(objects) {
            objects.map(function (obj_info) {
                if (instanceMap.hasOwnProperty(obj_info.id)) {
                    instanceMap[obj_info.id].setConfig(obj_info.config);
                }
                else {
                    var Con = ObjectMap[obj_info.type];
                    if (!Con) {
                        console.error("UNKONW TYPE:", obj_info);
                        return;
                    }
                    var ins = instanceMap[obj_info.id] = new Con(obj_info.config);
                    if (view_ship_info.id === obj_info.id) {
                        view_ship = ins;
                    }
                    if (obj_info.type === "Bullet") {
                        bullet_stage.addChild(ins);
                    }
                    else {
                        object_stage.addChild(ins);
                        if (obj_info.type === "Ship") {
                            var hp = HP_SHIP_WEAKMAP[obj_info.id] = new HP_1.default(ins);
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
        var isNewDataFrame = false;
        function getViewData() {
            var pre_time = performance.now();
            var i = -1;
            var can_next = true;
            ;
            ani_ticker.add(function () {
                i += 1;
                can_next || (can_next = i % 20 === 0);
                if (!can_next) {
                    return;
                }
                can_next = false;
                i = 0;
                var start_ping = performance.now();
                Pomelo_1.pomelo.request("connector.worldHandler.getWorld", {
                    x: 0,
                    y: 0,
                    width: common_2.VIEW.WIDTH,
                    height: common_2.VIEW.HEIGHT
                }, function (data) {
                    var cur_time = performance.now();
                    var dif_time = cur_time - pre_time;
                    pre_time = cur_time;
                    timeSinceLastCalled = dif_time / 1000;
                    isNewDataFrame = true;
                    ping = cur_time - start_ping;
                    showViewData(data.objects);
                    can_next = true;
                    i = 0;
                });
            });
        }
        ;
        exports.current_stage_wrap.on("active", getViewData);
        // 当前视角飞车，不一定是自己的飞船，在死亡后视角会进行切换
        var view_ship_info;
        exports.current_stage_wrap.on("before-active", function (game_init_info) {
            view_ship_info = game_init_info.ship;
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
        // 移动
        var speed_ux = {
            37: "-x",
            65: "-x",
            38: "-y",
            87: "-y",
            39: "+x",
            68: "+x",
            40: "+y",
            83: "+y",
        };
        var effect_speed = {};
        common_2.on(exports.current_stage_wrap, "keydown", function (e) {
            if (speed_ux.hasOwnProperty(e.keyCode)) {
                var speed_info = speed_ux[e.keyCode];
                var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
                var _dir = speed_info.charAt(1) + "_speed";
                effect_speed[_dir] = _symbol;
                var new_config = (_a = {},
                    _a[_dir] = _symbol * view_ship.config.force,
                    _a
                );
                Pomelo_1.pomelo.request("connector.worldHandler.setConfig", {
                    config: new_config
                }, function (data) {
                    // console.log("setConfig:to-move", data);
                    // 触发发射动画
                    view_ship.emit("fire-ani");
                });
            }
            var _a;
        });
        common_2.on(exports.current_stage_wrap, "keyup", function (e) {
            if (speed_ux.hasOwnProperty(e.keyCode)) {
                var speed_info = speed_ux[e.keyCode];
                var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
                var _dir = speed_info.charAt(1) + "_speed";
                if (effect_speed[_dir] === _symbol) {
                    var new_config = (_a = {},
                        _a[_dir] = 0,
                        _a
                    );
                    Pomelo_1.pomelo.request("connector.worldHandler.setConfig", {
                        config: new_config
                    }, function (data) {
                        // console.log("setConfig:stop-move", data);
                    });
                }
            }
            var _a;
        });
        // 转向
        common_2.on(exports.current_stage_wrap, "mousemove|click|tap", function (e) {
            var to_point = common_2.VIEW.rotateXY(e.data.global);
            var direction = new Victor_2.default(to_point.x - common_2.VIEW.CENTER.x, to_point.y - common_2.VIEW.CENTER.y);
            var angle_value = direction.angle();
            if (angle_value < 0) {
                angle_value += PIXI.PI_2;
            }
            var new_config = {
                rotation: angle_value
            };
            Pomelo_1.pomelo.request("connector.worldHandler.setConfig", {
                config: new_config
            }, function (data) {
                // console.log("setConfig:turn-head", data);
            });
        });
        // 发射
        common_2.on(exports.current_stage_wrap, "click|tap", function () {
            Pomelo_1.pomelo.request("connector.worldHandler.fire", {}, function (data) {
                // console.log("setConfig:fire", data);
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
        Pomelo_1.pomelo.on("change-hp", function (arg) {
            var ship_info = arg.data;
            console.log("change-hp:", ship_info);
            var ship = instanceMap[ship_info.id];
            if (ship) {
                var ship_config = ship_info.config;
                ship.setConfig(ship_config);
                var hp = HP_SHIP_WEAKMAP[ship_info.id];
                if (hp) {
                    hp.setHP(ship_config.cur_hp / ship_config.max_hp);
                }
            }
        });
        Pomelo_1.pomelo.on("die", function (arg) {
            var ship_info = arg.data;
            console.log("die:", ship_info);
            var ship = instanceMap[ship_info.id];
            if (ship) {
                var hp = HP_SHIP_WEAKMAP[ship_info.id];
                hp.parent.removeChild(hp);
                hp.destroy();
                ship.emit("die");
                instanceMap[ship_info.id] = null;
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
                exports.current_stage.x = common_2.VIEW.WIDTH / 2 - view_ship.x;
                exports.current_stage.y = common_2.VIEW.HEIGHT / 2 - view_ship.y;
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
        FPS_ticker.add(function () {
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(0) + "/" + (1 / timeSinceLastCalled).toFixed(0) + " W:" + common_2.VIEW.WIDTH + " H:" + common_2.VIEW.HEIGHT + " Ping:" + ping.toFixed(2);
            if (view_ship) {
                var info = "\n";
                for (var k in view_ship.config) {
                    var val = view_ship.config[k];
                    if (typeof val === "number") {
                        val = val.toFixed(2);
                    }
                    info += k + ": " + val + "\n";
                }
                FPS_Text.text += info;
            }
        });
        // 触发布局计算
        common_2.emitReisze(exports.current_stage_wrap);
        init_w.ok(0, []);
    }
    exports.current_stage_wrap.on("init", initStage);
    exports.current_stage_wrap.on("reinit", function () {
        renderInit(exports.loader, exports.loader.resources);
        common_2.emitReisze(exports.current_stage);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_2.emitReisze(this);
    });
    var init_w = new When_1.default(2, function () {
        common_2.emitReisze(exports.current_stage);
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
define("app/game2", ["require", "exports", "class/Tween", "class/When", "app/class/Flyer", "app/class/Ship", "app/class/Wall", "app/engine/Victor", "app/engine/world", "app/common"], function (require, exports, Tween_5, When_2, Flyer_2, Ship_3, Wall_2, Victor_3, world_1, common_3) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_5.default();
    var jump_tween = new Tween_5.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Container();
    exports.current_stage = new PIXI.Graphics();
    exports.current_stage_wrap.addChild(exports.current_stage);
    exports.current_stage_wrap["keep_direction"] = "horizontal";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("button", "./res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("游戏加载中……", { font: common_3.pt2px(25) + "px 微软雅黑", fill: "#FFF" });
    exports.current_stage.addChild(loading_text);
    exports.loader.once("complete", renderInit);
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        /**素材加载
         * 初始化场景
         */
        exports.current_stage.on("resize", function () {
            exports.current_stage.clear();
            exports.current_stage.beginFill(0x333ddd, 0.5);
            exports.current_stage.drawRect(0, 0, common_3.VIEW.WIDTH, common_3.VIEW.HEIGHT);
            exports.current_stage.endFill();
            // current_stage.scale.y = -1;
            // current_stage.position.y = VIEW.HEIGHT;
        });
        // 子弹层
        var bullets = new PIXI.Container();
        exports.current_stage.addChild(bullets);
        var flyer = new Flyer_2.default({
            x: 260,
            y: 250,
            x_speed: 10 * 2 * (Math.random() - 0.5),
            y_speed: 10 * 2 * (Math.random() - 0.5),
            body_color: 0x0f00dd
        });
        exports.current_stage.addChild(flyer);
        world_1.engine.add(flyer);
        var flyer = new Flyer_2.default({
            x: 480,
            y: 250,
            x_speed: 10 * 2 * (Math.random() - 0.5),
            y_speed: 10 * 2 * (Math.random() - 0.5),
            body_color: 0x0fdd00
        });
        exports.current_stage.addChild(flyer);
        world_1.engine.add(flyer);
        var flyer = new Flyer_2.default({
            x: 600,
            y: 250,
            x_speed: 10 * 2 * (Math.random() - 0.5),
            y_speed: 10 * 2 * (Math.random() - 0.5),
            body_color: 0xdd000f
        });
        exports.current_stage.addChild(flyer);
        world_1.engine.add(flyer);
        // 四边限制
        var top_edge = new Wall_2.default({
            x: common_3.VIEW.CENTER.x, y: 5,
            width: common_3.VIEW.WIDTH,
            height: 10
        });
        exports.current_stage.addChild(top_edge);
        world_1.engine.add(top_edge);
        var bottom_edge = new Wall_2.default({
            x: common_3.VIEW.CENTER.x, y: common_3.VIEW.HEIGHT - 5,
            width: common_3.VIEW.WIDTH,
            height: 10
        });
        exports.current_stage.addChild(bottom_edge);
        world_1.engine.add(bottom_edge);
        var left_edge = new Wall_2.default({
            x: 5, y: common_3.VIEW.CENTER.y,
            width: 10,
            height: common_3.VIEW.HEIGHT
        });
        exports.current_stage.addChild(left_edge);
        world_1.engine.add(left_edge);
        var right_edge = new Wall_2.default({
            x: common_3.VIEW.WIDTH - 5, y: common_3.VIEW.CENTER.y,
            width: 10,
            height: common_3.VIEW.HEIGHT
        });
        exports.current_stage.addChild(right_edge);
        world_1.engine.add(right_edge);
        (function () {
            var x_len = 2;
            var y_len = 2;
            var x_unit = common_3.VIEW.WIDTH / (x_len + 1);
            var y_unit = common_3.VIEW.HEIGHT / (y_len + 1);
            var width = 40;
            for (var _x = 1; _x <= x_len; _x += 1) {
                for (var _y = 1; _y <= y_len; _y += 1) {
                    var mid_edge = new Wall_2.default({
                        x: _x * x_unit - width / 2, y: _y * y_unit - width / 2,
                        width: width,
                        height: width
                    });
                    exports.current_stage.addChild(mid_edge);
                    world_1.engine.add(mid_edge);
                }
            }
        })();
        var my_ship = new Ship_3.default({
            x: common_3.VIEW.CENTER.x,
            y: common_3.VIEW.CENTER.y,
            body_color: 0x366345
        });
        exports.current_stage.addChild(my_ship);
        world_1.engine.add(my_ship);
        var other_ship = new Ship_3.default({
            x: common_3.VIEW.CENTER.x - 100,
            y: common_3.VIEW.CENTER.y - 100,
            body_color: 0x633645,
            team_tag: 12
        });
        exports.current_stage.addChild(other_ship);
        world_1.engine.add(other_ship);
        /**初始化动画
         *
         */
        var pre_time;
        ani_ticker.add(function () {
            pre_time || (pre_time = performance.now());
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
        var speed_ux = {
            37: "-x",
            65: "-x",
            38: "-y",
            87: "-y",
            39: "+x",
            68: "+x",
            40: "+y",
            83: "+y",
        };
        var effect_speed = {};
        common_3.on(exports.current_stage, "keydown", function (e) {
            if (speed_ux.hasOwnProperty(e.keyCode)) {
                var speed_info = speed_ux[e.keyCode];
                var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
                var _dir = speed_info.charAt(1) + "_speed";
                effect_speed[_dir] = _symbol;
                my_ship.setConfig((_a = {}, _a[_dir] = _symbol * my_ship.config.force, _a));
            }
            var _a;
        });
        common_3.on(exports.current_stage, "keyup", function (e) {
            if (speed_ux.hasOwnProperty(e.keyCode)) {
                var speed_info = speed_ux[e.keyCode];
                var _symbol = speed_info.charAt(0) === "-" ? -1 : 1;
                var _dir = speed_info.charAt(1) + "_speed";
                if (effect_speed[_dir] === _symbol) {
                    my_ship.setConfig((_a = {}, _a[_dir] = 0, _a));
                }
            }
            var _a;
        });
        common_3.on(exports.current_stage, "rightclick", function (e) {
            var to_point = common_3.VIEW.rotateXY(e.data.global);
        });
        common_3.on(exports.current_stage, "click|tap", function () {
            var bullet = my_ship.fire();
            bullets.addChild(bullet);
            world_1.engine.add(bullet);
        });
        common_3.on(exports.current_stage, "mousemove|click|tap", function (e) {
            var to_point = common_3.VIEW.rotateXY(e.data.global);
            var direction = new Victor_3.default(to_point.x - common_3.VIEW.CENTER.x, to_point.y - common_3.VIEW.CENTER.y);
            my_ship.setConfig({ rotation: direction.angle() });
        });
        // setTimeout(function () {
        //     rule.close();
        // }, 3000)
        // 动画控制器
        ani_ticker.add(function () {
            ani_tween.update();
            jump_tween.update();
            exports.current_stage_wrap.x = common_3.VIEW.WIDTH / 2 - my_ship.x;
            // current_stage_wrap.y = my_ship.y - VIEW.HEIGHT / 2
            exports.current_stage_wrap.y = common_3.VIEW.HEIGHT / 2 - my_ship.y;
        });
        /**帧率
         *
         */
        var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "right" });
        exports.current_stage_wrap.addChild(FPS_Text);
        FPS_ticker.add(function () {
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " W:" + common_3.VIEW.WIDTH + " H:" + common_3.VIEW.HEIGHT;
        });
        // 触发布局计算
        common_3.emitReisze(exports.current_stage_wrap);
        init_w.ok(0, []);
    }
    exports.current_stage_wrap.on("init", initStage);
    exports.current_stage_wrap.on("reinit", function () {
        renderInit(exports.loader, exports.loader.resources);
        common_3.emitReisze(exports.current_stage);
    });
    exports.current_stage_wrap["_has_custom_resize"] = true;
    exports.current_stage_wrap.on("resize", function () {
        jump_tween.clear();
        ani_tween.clear();
        common_3.emitReisze(this);
    });
    var init_w = new When_2.default(2, function () {
        common_3.emitReisze(exports.current_stage);
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
define("app/Mask", ["require", "exports", "class/BackgroundGaussianBlur", "app/common"], function (require, exports, BackgroundGaussianBlur_1, common_4) {
    "use strict";
    function MaskFactory(ani, parent, renderer) {
        var mask_grap = new PIXI.Graphics();
        mask_grap.clear();
        mask_grap.lineStyle(0);
        mask_grap.beginFill(0x000);
        mask_grap.drawRect(0, 0, common_4.VIEW.WIDTH, common_4.VIEW.HEIGHT);
        mask_grap.endFill();
        parent.addChild(mask_grap);
        var mask = BackgroundGaussianBlur_1.default.ContainerToSprite(mask_grap, renderer);
        parent.removeChild(mask_grap);
        return new Mask(ani, mask.texture);
    }
    exports.MaskFactory = MaskFactory;
    var Mask = (function (_super) {
        __extends(Mask, _super);
        function Mask(ani, tex) {
            _super.call(this, tex);
            this._is_ani = false;
            this._is_open = false;
            var self = this;
            self.ani = ani;
            self.alpha = 0.5;
            common_4.on(self, "click|tap", function () {
                console.log("拦截点击事件");
            });
            self.on("resize", function () {
                self.width = common_4.VIEW.WIDTH;
                self.height = common_4.VIEW.HEIGHT;
            });
        }
        Mask.prototype.show = function (blur_stage, parent, option) {
            var _this = this;
            if (option === void 0) { option = {}; }
            if (this._is_ani || this._is_open) {
                return false;
            }
            this._bg_bulr_filter || (this._bg_bulr_filter = new BackgroundGaussianBlur_1.default(this, option.init_blur || 0, option.quality || 5));
            if (blur_stage.filters) {
                blur_stage.filters.push(this._bg_bulr_filter);
            }
            else {
                blur_stage.filters = [this._bg_bulr_filter];
            }
            this._blur_target = blur_stage;
            parent.addChild(this);
            this._is_ani = true;
            this._is_open = true;
            this.emit("show");
            this.ani.Tween(this._bg_bulr_filter)
                .to({
                blur: option.blur || 30
            }, common_4.B_ANI_TIME)
                .start()
                .onComplete(function () {
                _this._is_ani = false;
            });
        };
        Mask.prototype.hide = function () {
            var _this = this;
            if (this._is_ani || !this._is_open) {
                return false;
            }
            this._is_open = false;
            this._is_ani = true;
            this.emit("hide");
            this.ani.Tween(this._bg_bulr_filter)
                .to({
                blur: 0
            }, common_4.B_ANI_TIME)
                .start()
                .onComplete(function () {
                _this._is_ani = false;
                _this._blur_target.filters = _this._blur_target.filters.filter(function (f) { return f !== _this._bg_bulr_filter; });
                if (_this._blur_target.filters.length == 0) {
                    _this._blur_target.filters = null;
                }
                _this._blur_target = null;
                _this.parent.removeChild(_this);
            });
        };
        return Mask;
    }(PIXI.Sprite));
    exports.Mask = Mask;
});
define("app/loader", ["require", "exports", "class/Tween", "class/When", "app/common"], function (require, exports, Tween_6, When_3, common_5) {
    "use strict";
    var ani_ticker = new PIXI.ticker.Ticker();
    var ani_tween = new Tween_6.default();
    var jump_tween = new Tween_6.default();
    var FPS_ticker = new PIXI.ticker.Ticker();
    exports.current_stage_wrap = new PIXI.Container();
    exports.current_stage = new PIXI.Container();
    exports.current_stage_wrap.addChild(exports.current_stage);
    // current_stage_wrap["keep_direction"] = "vertical";
    //加载图片资源
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("logo", "res/game_res.png");
    exports.loader.load();
    var loading_text = new PIXI.Text("加载中……", { font: common_5.pt2px(25) + "px 微软雅黑", fill: "#FFF" });
    exports.current_stage.addChild(loading_text);
    exports.loader.once("complete", renderInit);
    function renderInit(loader, resource) {
        for (var i = 0, len = exports.current_stage.children.length; i < len; i += 1) {
            exports.current_stage.removeChildAt(0);
        }
        var waitting_text = new PIXI.Text("连接服务器中……", { font: common_5.pt2px(25) + "px 微软雅黑", fill: "#FFF" });
        exports.current_stage.addChild(waitting_text);
        waitting_text.x = common_5.VIEW.CENTER.x - waitting_text.width / 2;
        waitting_text.y = common_5.VIEW.CENTER.y - waitting_text.height / 2;
        /**初始化动画
         *
         */
        /**按钮事件
         *
         */
        /**交互动画
         *
         */
        // 动画控制器
        /**帧率
         *
         */
        // 触发布局计算
        common_5.emitReisze(exports.current_stage_wrap);
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
        common_5.emitReisze(this);
    });
    var init_w = new When_3.default(2, function () {
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
define("app/main", ["require", "exports", "app/common", "app/game2", "app/game-oline", "app/loader", "app/engine/Pomelo"], function (require, exports, common_6, game2_1, game_oline_1, loader_1, Pomelo_2) {
    "use strict";
    common_6.stageManager.add(loader_1.current_stage_wrap, game2_1.current_stage_wrap);
    common_6.stageManager.set(loader_1.current_stage_wrap);
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
                    // 发送名字，初始化角色
                    Pomelo_2.pomelo.request("connector.entryHandler.enter", {
                        username: "Gaubee" + Math.random(),
                        width: document.body.clientWidth,
                        height: document.body.clientHeight,
                    }, function (game_info) {
                        console.log(game_info);
                        game_oline_1.current_stage_wrap.emit("before-active", game_info);
                        common_6.stageManager.set(game_oline_1.current_stage_wrap);
                    });
                });
            }
            else {
                console.error(data);
            }
        });
    });
    // stageManager.set(g_stage);
    function animate() {
        common_6.renderer.render(common_6.stageManager.get());
        requestAnimationFrame(animate);
    }
    animate();
});
define("app/Prop", ["require", "exports", "class/Tween", "app/common"], function (require, exports, Tween_7, common_7) {
    "use strict";
    var Prop = (function (_super) {
        __extends(Prop, _super);
        function Prop(tex) {
            _super.call(this, tex);
            this._is_effectted = false;
            this._ani_configs = [
                {
                    target: "scale",
                    to: {
                        x: 0,
                        y: 0
                    },
                    time: common_7.M_ANI_TIME,
                    easing: Tween_7.default.Easing.Back.In
                }, {
                    target: "",
                    to: {
                        alpha: 0
                    },
                    time: common_7.L_ANI_TIME,
                    easing: Tween_7.default.Easing.Linear.None
                }
            ];
            this.anchor.set(0.5, 0.5);
        }
        Prop.prototype.effectted = function (target, ani) {
            var self = this;
            self._is_effectted = true;
            var ani_configs = self._ani_configs;
            var max_time = 0;
            ani_configs.forEach((function (ani_config) {
                var target = ani_config.target ? self[ani_config.target] : self;
                max_time = Math.max(ani_config.time, max_time);
                ani.Tween(target)
                    .to(ani_config.to, ani_config.time)
                    .easing(ani_config.easing)
                    .start();
            }));
            setTimeout(function () {
                self.parent && self.parent.removeChild(self);
                self.destroy();
            }, max_time + 100);
        };
        ;
        return Prop;
    }(PIXI.Sprite));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Prop;
    var Prop_棒棒糖 = (function (_super) {
        __extends(Prop_棒棒糖, _super);
        function Prop_棒棒糖() {
            _super.apply(this, arguments);
        }
        Prop_棒棒糖.prototype.effectted = function (target, ani) {
            if (this._is_effectted) {
                return;
            }
            this._ani_configs.push({
                target: "",
                to: {
                    rotation: PIXI.PI_2
                },
                time: common_7.M_ANI_TIME,
                easing: Tween_7.default.Easing.Circular.In
            });
            target.emit("prop-effect", { score: 100 });
            _super.prototype.effectted.call(this, target, ani);
        };
        Prop_棒棒糖.tex_name = "棒棒糖";
        return Prop_棒棒糖;
    }(Prop));
    exports.Prop_棒棒糖 = Prop_棒棒糖;
    var Prop_钱 = (function (_super) {
        __extends(Prop_钱, _super);
        function Prop_钱() {
            _super.apply(this, arguments);
        }
        Prop_钱.prototype.effectted = function (target, ani) {
            if (this._is_effectted) {
                return;
            }
            this._ani_configs.push({
                target: "",
                to: {
                    y: this.y - this.height * 2
                },
                time: common_7.S_ANI_TIME,
                easing: Tween_7.default.Easing.Quartic.Out
            });
            target.emit("prop-effect", { score: 100 });
            _super.prototype.effectted.call(this, target, ani);
        };
        Prop_钱.tex_name = "钱";
        return Prop_钱;
    }(Prop));
    exports.Prop_钱 = Prop_钱;
    var Prop_路障 = (function (_super) {
        __extends(Prop_路障, _super);
        function Prop_路障() {
            _super.apply(this, arguments);
        }
        Prop_路障.prototype.effectted = function (target, ani) {
            if (this._is_effectted) {
                return;
            }
            this._ani_configs.shift();
            this._ani_configs.push({
                target: "",
                to: {
                    rotation: PIXI.PI_2 / 4,
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2
                },
                time: common_7.M_ANI_TIME,
                easing: Tween_7.default.Easing.Bounce.Out
            });
            target.emit("prop-effect", { time: -5000 });
            _super.prototype.effectted.call(this, target, ani);
        };
        Prop_路障.tex_name = "路障";
        return Prop_路障;
    }(Prop));
    exports.Prop_路障 = Prop_路障;
    var Prop_炸弹鸟 = (function (_super) {
        __extends(Prop_炸弹鸟, _super);
        function Prop_炸弹鸟() {
            _super.apply(this, arguments);
        }
        Prop_炸弹鸟.prototype.effectted = function (target, ani) {
            if (this._is_effectted) {
                return;
            }
            this._ani_configs[0].to = { x: 10, y: 10 };
            this._ani_configs[0].easing = Tween_7.default.Easing.Bounce.Out;
            this._ani_configs[1].time = common_7.M_ANI_TIME;
            this._ani_configs.push({
                target: "",
                to: {
                    rotation: PIXI.PI_2 * 2
                },
                time: common_7.M_ANI_TIME,
                easing: Tween_7.default.Easing.Quadratic.In
            });
            target.emit("prop-effect", { time: -5000 });
            _super.prototype.effectted.call(this, target, ani);
        };
        Prop_炸弹鸟.tex_name = "炸弹鸟";
        return Prop_炸弹鸟;
    }(Prop));
    exports.Prop_炸弹鸟 = Prop_炸弹鸟;
    var Prop_香蕉 = (function (_super) {
        __extends(Prop_香蕉, _super);
        function Prop_香蕉() {
            _super.apply(this, arguments);
        }
        Prop_香蕉.prototype.effectted = function (target, ani) {
            if (this._is_effectted) {
                return;
            }
            this._ani_configs.shift();
            this._ani_configs.push({
                target: "",
                to: {
                    x: this.x + this.width * 5
                },
                time: common_7.M_ANI_TIME,
                easing: Tween_7.default.Easing.Quadratic.Out
            });
            target.emit("prop-effect", { time: -5000 });
            _super.prototype.effectted.call(this, target, ani);
        };
        Prop_香蕉.tex_name = "香蕉";
        return Prop_香蕉;
    }(Prop));
    exports.Prop_香蕉 = Prop_香蕉;
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
define("app/pxCol", ["require", "exports", "class/pixelCollision", "app/common"], function (require, exports, pixelCollision_1, common_8) {
    "use strict";
    exports.current_stage = new PIXI.Container();
    exports.loader = new PIXI.loaders.Loader();
    exports.loader.add("人物", "res/game_0009_人物.png");
    exports.loader.add("道具：钱", "res/game_0005_道具：钱.png");
    exports.loader.load();
    exports.loader.once("complete", renderInit);
    function renderInit(loader, resource) {
        var info = new PIXI.Text("zz", { font: "25px 微软雅黑", fill: "#000" });
        info.position.y = common_8.VIEW.HEIGHT - info.height;
        exports.current_stage.addChild(info);
        var man = new PIXI.Sprite(resource["人物"].texture);
        man.scale.set(-1.2, 1);
        var _s = 0;
        var _a = 0;
        setInterval(function () {
            man.scale.set(Math.sin(_s), 1);
            man.anchor.set(Math.sin(_a), 0);
            _s += 0.01;
            _a += 0.001;
        });
        // man.anchor.set(0.5, 0.5);
        man.position = common_8.VIEW.CENTER;
        exports.current_stage.addChild(man);
        var prop = new PIXI.Sprite(resource["道具：钱"].texture);
        prop.anchor.set(0.5, 0.5);
        common_8.on(exports.current_stage, "mousemove", function (e) {
            prop.position.set(e.data.global.x, e.data.global.y);
            if (pixelCollision_1.default(man, prop)) {
                info.text = "!!";
            }
            else {
                info.text = "zz";
            }
        });
        exports.current_stage.addChild(prop);
        var FPS_Text = new PIXI.Text("FPS:0", { font: '24px Arial', fill: 0x00ffff33, align: "left" });
        var FPS_ticker = new PIXI.ticker.Ticker();
        exports.current_stage.addChild(FPS_Text);
        FPS_ticker.add(function () {
            FPS_Text.text = "FPS:" + FPS_ticker.FPS.toFixed(2) + " S:" + man.scale.x.toFixed(2) + " A:" + man.anchor.x.toFixed(2)
                + "\n B:" + JSON.stringify(man.getBounds())
                + "\n P:" + [man.x, man.y, man.width, man.height];
        });
        FPS_ticker.start();
    }
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
define("class/Map", ["require", "exports", "class/Tween", "class/SVGGraphics", "class/ZoomBlur"], function (require, exports, Tween_8, SVGGraphics_2, ZoomBlur_1) {
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
            this._tween = new Tween_8.default();
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
                        .easing(Tween_8.default.Easing.Quartic.Out)
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
                    .easing(Tween_8.default.Easing.Quartic.Out)
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
                        .easing(Tween_8.default.Easing.Quartic.Out)
                        .start();
                }
                else {
                    // 图片不需要完全显示，只需要显示核心路径部分
                    _this._tween.Tween(bgImage.position)
                        .to({
                        x: (path.left_top.x - viewtopleft.x) * viewscale,
                        y: (path.left_top.y - viewtopleft.y) * viewscale
                    }, animateTime)
                        .easing(Tween_8.default.Easing.Quartic.Out)
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
                .easing(Tween_8.default.Easing.Quartic.Out)
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
define("class/ScrollAble", ["require", "exports", "class/SVGGraphics", "class/MouseWheel", "class/Tween"], function (require, exports, SVGGraphics_3, MouseWheel_1, Tween_9) {
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
            this.ANI = new Tween_9.default();
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
                .easing(Tween_9.default.Easing.Quartic.Out)
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
                        .easing(Tween_9.default.Easing.Quartic.Out)
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
