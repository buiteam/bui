/**
 * @fileOverview Overlay 模块的入口
 * @ignore
 */

var BUI = require('bui-common'),
  Overlay = BUI.namespace('Overlay');

BUI.mix(Overlay, {
  Overlay : require('./src/overlay'),
  Dialog : require('./src/dialog'),
  Message : require('./src/message')
});

BUI.mix(Overlay,{
  OverlayView : Overlay.Overlay.View,
  DialogView : Overlay.Dialog.View
});

BUI.Message = BUI.Overlay.Message;

module.exports = Overlay;
