export default class ZoomBlur extends PIXI.AbstractFilter {

    private _center: { x: number, y: number } = { x: 0, y: 0 }
    constructor(quality: number = 20) {
        super(`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

uniform vec2 center;
uniform float strength;
uniform vec2 texSize;

varying vec2 vCenter;
varying float vStrength;
varying vec2 vTexSize;

varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void)
{
	gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);
	vTextureCoord = aTextureCoord;

	vCenter=center;
	vStrength=strength;
	vTexSize=texSize;

    // vColor = vec4(aColor.rgb * aColor.a, aColor.a);

}`, `precision mediump float;

varying vec2 vCenter;
varying float vStrength;
varying vec2 vTexSize;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

float random(vec3 scale, float seed) {
	/* use the fragment position for a different seed per-pixel */
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}
void main() {
	vec4 color = vec4(0.0);
	float total = 0.0;
	vec2 toCenter = vCenter - vTextureCoord * vTexSize;
	
	/* randomize the lookup values to hide the fixed number of samples */
	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
	
	for (float t = 0.0; t <= ${quality = Math.max(1, ~~quality)}.0; t++) {
		float percent = (t + offset) / ${quality}.0;
		float weight = 4.0 * (percent - percent * percent);
		vec4 sample = texture2D(uSampler, vTextureCoord + toCenter * percent * vStrength / vTexSize);
		
		/* switch to pre-multiplied alpha to correctly blur transparent images */
		sample.rgb *= sample.a;
		
		color += sample * weight;
		total += weight;
	}
	
	gl_FragColor = color / total;
	
	/* switch back from pre-multiplied alpha */
	gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    // gl_FragColor = texture2D(uSampler, vTextureCoord);
}`, {
                center: { type: "v2", value: { x: 0, y: 0 } },
                strength: { type: 'f', value: 0 },
                texSize: { type: "v2", value: { x: 0, y: 0 } }
            });
    }
    applyFilter(renderer, input, output, clear) {
        var shader = this.getShader(renderer);
        this.uniforms.texSize.value = {
            x: 1,
            y: 1,
        };
        var _center = this._center;
        console.log(_center.x, input.size.width)
        this.uniforms.center.value = {
            x: _center.x / input.size.width,
            y: _center.y / input.size.height,
        };
        renderer.filterManager.applyFilter(shader, input, output, clear);
    }
    get blur() {
        return this.uniforms.strength.value;
    }
    set blur(value) {
        this.uniforms.strength.value = parseFloat(value) || 0;
    }
    get center() {
        return this._center;
    }
    set center(value: { x: number, y: number }) {
        this._center.x = value.x;
        this._center.y = value.y;
    }
}