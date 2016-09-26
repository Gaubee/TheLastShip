class BackgroundGaussianBlur extends PIXI.AbstractFilter {
    _delta: number;
    maskMatrix: PIXI.Matrix;
    maskSprite: PIXI.Sprite;
    scale: PIXI.Point;
    static Wrap(child: PIXI.Container) {
        var res = new PIXI.Container();
        // 创建一个有透明边缘的容器老包裹贴图对象，来规避贴图贴边引起的问题。
        child.parent && child.addChild(res);
        res.addChild(child)
        child.x = 1;
        child.y = 1;
        res.width = child.width + 2;
        res.height = child.height + 2;
        return res;
    }
    static ContainerToSprite(con: PIXI.Container, renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer, resolution?: number, scaleMode?: number) {
        var _old_cacheAsBitmap = con.cacheAsBitmap;
        con.cacheAsBitmap = true;
        var sprite = new PIXI.Sprite(con.generateTexture(renderer, resolution, scaleMode));
        con.cacheAsBitmap = _old_cacheAsBitmap;
        return sprite
    }
    constructor(sprite: PIXI.Sprite, blur: number = 20, quality: number = 16, highlight:number = 1) {
        var maskMatrix = new PIXI.Matrix();
        /*
         * 顶点作色器
         */
        let vert = `attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform vec2 delta;
uniform mat3 projectionMatrix;
uniform mat3 otherMatrix;

varying vec2 vMapCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vDelta;
varying mat3 vOtherMatrix;

void main(void)
{
	gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
	vTextureCoord = aTextureCoord;

	vDelta = delta;
    vOtherMatrix = otherMatrix;
    
    vMapCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;

	vColor = vec4(aColor.rgb * aColor.a, aColor.a);
}`
        /*
         * 片元作色器
         */
        let frag = `precision mediump float;

varying vec2 vMapCoord;
varying vec2 vTextureCoord;
varying vec2 vDelta;
varying vec4 vColor;
varying mat3 vOtherMatrix;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    vec4 map = texture2D(mapSampler, vMapCoord) ;
    if( map.a==0.0){
        gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;
    }else{
        vec4 color = vec4(0.0);
        float total = 0.0;
        
        /* randomize the lookup values to hide the fixed number of samples */
        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        
        for (float t = -${quality}.0; t <= ${quality}.0; t++) {
            float percent = (t + offset - 0.5) / ${quality}.0;
            float weight = 1.0 - abs(percent);
            vec4 sample = texture2D(uSampler, vTextureCoord + vDelta * percent);
            vec4 edge = texture2D(mapSampler, vMapCoord + vDelta * percent);
            
            if (edge.a > 0.0) {
                /* switch to pre-multiplied alpha to correctly blur transparent images */
                sample.rgb *= sample.a;

                sample.rgb *= float(${highlight});
                
                color += sample * weight;
                total += weight;
            }
        }
        
        gl_FragColor = color / total;
        
        /* switch back from pre-multiplied alpha */
        gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
    }
}`;
        super(vert, frag, {
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
    applyFilter(renderer, input, output, clear) {
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
    }
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
    get blur() {
        return this._delta;
    }
    set blur(value) {
        this._delta = value;
    }
}
export default BackgroundGaussianBlur;