/**
 * @fileOverview Picker的入口
 * @author dxq613@gmail.com
 * @ignore
 */

var BUI = require('bui-common'),
  Picker = BUI.namespace('Picker');

BUI.mix(Picker, {
  Mixin : require('./src/mixin'),
  Picker : require('./src/picker'),
  ListPicker : require('./src/listpicker')
});

module.exports = Picker;
