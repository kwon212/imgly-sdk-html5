"use strict";
/*!
 * Copyright (c) 2013-2014 9elements GmbH
 *
 * Released under Attribution-NonCommercial 3.0 Unported
 * http://creativecommons.org/licenses/by-nc/3.0/
 *
 * For commercial use, please contact us at contact@9elements.com
 */

var _ = require("lodash");
var Primitive = require("./primitive");
var Utils = require("../../../lib/utils");
var Color = require("../../../lib/color");

/**
 * SoftColorOverlay primitive
 * @class
 * @alias ImglyKit.Filter.Primitives.SoftColorOverlay
 * @extends {ImglyKit.Filter.Primitive}
 */
var SoftColorOverlay = Primitive.extend({
  constructor: function () {
    Primitive.apply(this, arguments);

    this._options = _.defaults(this._options, {
      color: new Color(1.0, 1.0, 1.0)
    });
  }
});

/**
 * The fragment shader for this primitive
 * @return {String}
 * @private
 */
SoftColorOverlay.prototype._fragmentShader = Utils.shaderString(function() {/*webgl

  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec3 u_overlay;

  void main() {
    vec4 texColor = texture2D(u_image, v_texCoord);
    vec4 overlayVec4 = vec4(u_overlay, texColor.a);
    gl_FragColor = max(overlayVec4, texColor);
  }

*/});

/**
 * Renders the primitive (WebGL)
 * @param  {WebGLRenderer} renderer
 */
/* istanbul ignore next */
SoftColorOverlay.prototype.renderWebGL = function(renderer) {
  renderer.runShader(null, this._fragmentShader, {
    uniforms: {
      u_overlay: { type: "3f", value: this._options.color.toRGBGLColor() }
    }
  });
};

/**
 * Renders the primitive (Canvas)
 * @param  {CanvasRenderer} renderer
 */
SoftColorOverlay.prototype.renderCanvas = function(renderer) {
  var canvas = renderer.getCanvas();
  var imageData = renderer.getContext().getImageData(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      var index = (canvas.width * y + x) * 4;

      imageData.data[index] = Math.max(this._options.red, imageData.data[index]);
      imageData.data[index + 1] = Math.max(this._options.green, imageData.data[index + 1]);
      imageData.data[index + 2] = Math.max(this._options.blue, imageData.data[index + 2]);
    }
  }

  renderer.getContext().putImageData(imageData, 0, 0);
};

module.exports = SoftColorOverlay;
