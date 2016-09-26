export default class GaussianBlur extends PIXI.AbstractFilter {
    _delta: number;
    constructor() {
        let vert = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform vec2 delta;
uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vDelta;

void main(void)
{
	gl_Position = vec4((projectionMatrix * vec3((aVertexPosition), 1.0)).xy, 0.0, 1.0);
	vTextureCoord = aTextureCoord;

	vDelta = delta;

	vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}`
        let frag = `precision mediump float;

varying vec2 vTextureCoord;
varying vec2 vDelta;
varying vec4 vColor;

uniform sampler2D uSampler;

float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
	vec4 color = vec4(0.0);
	float total = 0.0;
    float quality = 10.0;
	
	/* randomize the lookup values to hide the fixed number of samples */
	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0)/quality;
	
	for (float t = -10.0; t <= 10.0; t++) {
		float percent = (t + offset - 0.5) / quality;
		float weight = 1.0 - abs(percent);
		vec4 sample = texture2D(uSampler, vTextureCoord + vDelta * percent);
		
		/* switch to pre-multiplied alpha to correctly blur transparent images */
		sample.rgb *= sample.a;
		
		color += sample * weight;
		total += weight;
	}
	
	gl_FragColor = color / total;
	
	/* switch back from pre-multiplied alpha */
	gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}`;
        super(vert, frag, {
            delta: { type: 'v2', value: { x: 0, y: 0 } }
        });
        this._delta = 0;
    }
    applyFilter(renderer, input, output, clear) {
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
    }
    get blur() {
        return this._delta;
    }
    set blur(value) {
        this._delta = value;
    }
}