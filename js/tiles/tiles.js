
/*
 * Copyright (c) 2012 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

/*
 * This file contains a couple of self-contained camera classes. The cameras
 * handle user input internally and produce a view matrix that can be applied
 * to the rendered scene.
 */
define([
  'util/gl-util', 'glMatrix',
  'text!shaders/v_tilemap.glsl',
  'text!shaders/f_tilemap.glsl'
], function (GLUtil, glMatrix, tilemapVS, tilemapFS) {

  var TileMapLayer = function(gl) {
    this.scrollScaleX = 1;
    this.scrollScaleY = 1;
    this.tileTexture = gl.createTexture();
    this.inverseTextureSize = glMatrix.vec2.create();
    this.gl = null;
  };

  TileMapLayer.prototype.setTexture = function(gl, src, repeat, done) {
    var self = this;
    self.gl = gl;
    var image = new Image();
    image.addEventListener("load", function() {
      gl.bindTexture(gl.TEXTURE_2D, self.tileTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // MUST be filtered with NEAREST or tile lookup fails
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

      if(repeat) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      self.inverseTextureSize[0] = 1/image.width;
      self.inverseTextureSize[1] = 1/image.height;
      done();
    });
    image.src = src;
  };

  TileMapLayer.prototype.update = function(src, done) {
    var self = this;
    var gl = self.gl;
    var image = new Image();
    image.addEventListener("load", function() {
      gl.bindTexture(gl.TEXTURE_2D, self.tileTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if (done) { done(); }
    });
    image.src = src;
  };

  var TileMap = function(gl) {
    this.gl = gl;
    this.viewportSize = glMatrix.vec2.create();
    this.scaledViewportSize = glMatrix.vec2.create();
    this.inverseTileTextureSize = glMatrix.vec2.create();
    this.inverseSpriteTextureSize = glMatrix.vec2.create();

    this.tileScale = 1.0;
    this.tileSize = 16;

    this.filtered = false;

    this.spriteSheet = gl.createTexture();
    this.layers = [];

    var quadVerts = [
      //x  y  u  v
      -1, -1, 0, 1,
      1, -1, 1, 1,
      1,  1, 1, 0,

      -1, -1, 0, 1,
      1,  1, 1, 0,
      -1,  1, 0, 0
    ];

    this.quadVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);

    this.tilemapShader = GLUtil.createProgram(gl, tilemapVS, tilemapFS);
  };

  TileMap.prototype.resizeViewport = function(width, height) {
    this.viewportSize[0] = width;
    this.viewportSize[1] = height;

    this.scaledViewportSize[0] = width / this.tileScale;
    this.scaledViewportSize[1] = height / this.tileScale;
  };

  TileMap.prototype.setTileScale = function(scale) {
    this.tileScale = scale;

    this.scaledViewportSize[0] = this.viewportSize[0] / scale;
    this.scaledViewportSize[1] = this.viewportSize[1] / scale;
  };

  TileMap.prototype.setFiltered = function(filtered) {
    this.filtered = filtered;

    // TODO: Cache currently bound texture?
    gl.bindTexture(gl.TEXTURE_2D, this.spriteSheet);

    if(filtered) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Worth it to mipmap here?
    }
  };

  TileMap.prototype.setSpriteSheet = function(src) {
    var self = this;
    var gl = this.gl;
    var image = new Image();
    image.addEventListener("load", function() {
      gl.bindTexture(gl.TEXTURE_2D, self.spriteSheet);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if(!self.filtered) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // Worth it to mipmap here?
      }

      self.inverseSpriteTextureSize[0] = 1/image.width;
      self.inverseSpriteTextureSize[1] = 1/image.height;
    });
    image.src = src;
  };

  TileMap.prototype.setTileLayer = function(src, layerId, scrollScaleX, scrollScaleY, done) {
    var layer = new TileMapLayer(this.gl);
    var self = this;
    layer.setTexture(this.gl, src, false, function() {
      if(scrollScaleX) {
        layer.scrollScaleX = scrollScaleX;
      }
      if(scrollScaleY) {
        layer.scrollScaleY = scrollScaleY;
      }
      self.layers[layerId] = layer;
      if (done) { done(); }
    });
  };

  TileMap.prototype.updateTileLayer = function(src, layerId, scrollScaleX, scrollScaleY, done) {
    if (!this.layers[layerId]) {
      this.setTileLayer(src, layerId, scrollScaleX, scrollScaleY, done);
    } else {
      this.layers[layerId].update(src, done);
    }
  };

  TileMap.prototype.describeTileLayer = function(description, layerId, scrollScaleX, scrollScaleY) {
    var layer = new TileMapLayer(this.gl);
    if(scrollScaleX) {
      layer.scrollScaleX = scrollScaleX;
    }
    if(scrollScaleY) {
      layer.scrollScaleY = scrollScaleY;
    }

    this.layers[layerId] = layer;
  };

  TileMap.prototype.draw = function(x, y) {
    var gl = this.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var shader = this.tilemapShader;
    gl.useProgram(shader.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertBuffer);

    gl.enableVertexAttribArray(shader.attribute.position);
    gl.enableVertexAttribArray(shader.attribute.texture);
    gl.vertexAttribPointer(shader.attribute.position, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(shader.attribute.texture, 2, gl.FLOAT, false, 16, 8);

    gl.uniform2fv(shader.uniform.viewportSize, this.scaledViewportSize);
    gl.uniform2fv(shader.uniform.inverseSpriteTextureSize, this.inverseSpriteTextureSize);
    gl.uniform1f(shader.uniform.tileSize, this.tileSize);
    gl.uniform1f(shader.uniform.inverseTileSize, 1/this.tileSize);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(shader.uniform.sprites, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.spriteSheet);

    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(shader.uniform.tiles, 1);

    // Draw each layer of the map
    var i, layer;
    for(i = this.layers.length - 1; i >= 0; --i) {
      layer = this.layers[i];
      if(layer) {
        gl.uniform2f(shader.uniform.viewOffset, Math.floor(x * this.tileScale * layer.scrollScaleX), Math.floor(y * this.tileScale * layer.scrollScaleY));
        gl.uniform2fv(shader.uniform.inverseTileTextureSize, layer.inverseTextureSize);

        gl.bindTexture(gl.TEXTURE_2D, layer.tileTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }
  };

  return {
    TileMap: TileMap,
    TileMapLayer: TileMapLayer
  };
});