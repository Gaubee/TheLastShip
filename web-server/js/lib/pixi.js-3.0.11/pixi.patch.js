PIXI.mesh.Mesh.prototype.getBounds = function (matrix) {
    if (!this._currentBounds) {
        var vertices = this.vertices;
        var n = vertices.length;

        if (n === 0) {
            return PIXI.Rectangle.EMPTY;
        }
        var worldTransform = matrix || this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var maxX = -Infinity;
        var maxY = -Infinity;

        var minX = Infinity;
        var minY = Infinity;

        for (var i = 0; i < n; i += 2) {
            var rawX = vertices[i], rawY = vertices[i + 1];
            var x = (a * rawX) + (c * rawY) + tx;
            var y = (d * rawY) + (b * rawX) + ty;

            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;

            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
        }

        if (Math.abs(minX) === Infinity || Math.abs(minY) === Infinity) {
            return PIXI.Rectangle.EMPTY;
        }

        var bounds = this._bounds;

        bounds.x = minX;
        bounds.width = maxX - minX;

        bounds.y = minY;
        bounds.height = maxY - minY;

        // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        this._currentBounds = bounds;
    }

    return this._currentBounds;
};
// PIXI.TilingSprite.prototype._renderWebGL = function (renderer)
// {
//     // tweak our texture temporarily..
//     var texture = this._texture;

//     if(!texture || !texture._uvs)
//     {
//         return;
//     }

//     var tempUvs = texture._uvs,
//         tempWidth = texture._frame.width,
//         tempHeight = texture._frame.height,
//         tw = texture.baseTexture.width,
//         th = texture.baseTexture.height;

//     texture._uvs = this._uvs;
//     texture._frame.width = this.width;
//     texture._frame.height = this.height;

//     this.shader.uniforms.uPixelSize.value[0] = 1.0/tw;
//     this.shader.uniforms.uPixelSize.value[1] = 1.0/th;

//     this.shader.uniforms.uFrame.value[0] = tempUvs.x0;
//     this.shader.uniforms.uFrame.value[1] = tempUvs.y0;
//     this.shader.uniforms.uFrame.value[2] = tempUvs.x1 - tempUvs.x0;
//     this.shader.uniforms.uFrame.value[3] = tempUvs.y2 - tempUvs.y0;

//     this.shader.uniforms.uTransform.value[0] = (this.tilePosition.x % (tempWidth * this.tileScale.x)) / this._width;
//     this.shader.uniforms.uTransform.value[1] = (this.tilePosition.y % (tempHeight * this.tileScale.y)) / this._height;
//     this.shader.uniforms.uTransform.value[2] = ( tw / this._width ) * this.tileScale.x;
//     this.shader.uniforms.uTransform.value[3] = ( th / this._height ) * this.tileScale.y;

//     if (!this._originalTexture) {
//         this._originalTexture = this._texture;
//     }

//     // unlit render pass
//     if (renderer.renderingUnlit)
//     {
//         // if it has a normal texture it is considered "lit", so skip it
//         if (this.normalTexture)
//         {
//             return;
//         }
//         // otherwise do a normal draw for unlit pass
//         else
//         {
//             this._texture = this._originalTexture;
//         }
//     }
//     // normals render pass
//     else if (renderer.renderingNormals)
//     {
//         // if it has no normal texture it is considered "unlit", so skip it
//         if (!this.normalTexture)
//         {
//             return;
//         }
//         else
//         {
//             this._texture = this.normalTexture;
//         }
//     }
//     // diffuse render pass, always just draw the texture
//     else
//     {
//         this._texture = this._originalTexture;
//     }
    
//     renderer.setObjectRenderer(renderer.plugins.sprite);
//     renderer.plugins.sprite.render(this);

//     texture._uvs = tempUvs;
//     texture._frame.width = tempWidth;
//     texture._frame.height = tempHeight;
// };