declare namespace PIXI {
    export module lights {

        export class Light extends DisplayObject {

        }
        export class LightShader extends Shader {

        }
        export class AmbientLight extends Light {
            /**
             * @class
             * @extends PIXI.lights.Light
             * @memberof PIXI.lights
             *
             * @param [color=0xFFFFFF] {number} The color of the light.
             * @param [brightness=0.5] {number} The brightness of the light.
             */
            constructor(color?: number, brightness?: number)
        }
        export class AmbientLightShader extends LightShader {

        }
        export class PointLight extends Light {
            /**
             * @class
             * @extends PIXI.lights.Light
             * @memberof PIXI.lights
             *
             * @param [color=0xFFFFFF] {number} The color of the light.
             * @param [brightness=1] {number} The intensity of the light.
             * @param [radius=Infinity] {number} The distance the light reaches. You will likely need
             *  to change the falloff of the light as well if you change this value. Infinity will
             *  use the entire viewport as the drawing surface.
             */
            constructor(color?: number, brightness?: number, radius?: number)
        }
        export class PointLightShader extends LightShader {

        }
        /**
         * @class
         * @extends PIXI.lights.Light
         * @memberof PIXI.lights
         *
         * @param [color=0xFFFFFF] {number} The color of the light.
         * @param [brightness=1] {number} The intensity of the light.
         * @param [target] {PIXI.DisplayObject|PIXI.Point} The object in the scene to target.
         */
        export class DirectionalLight extends Light {
            constructor(color: number, brightness: number, target: PIXI.DisplayObject|PIXI.Point)
        }
        export class DirectionalLightShader extends LightShader {

        }
        export class LightRenderer extends ObjectRenderer {

        }
        export class WebGLDeferredRenderer extends WebGLRenderer {

        }
        export class WireframeShader extends Shader {

        }
    }
}