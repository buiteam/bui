
var BUI = require('bui-common');
var Slider = BUI.namespace('Slider');

BUI.mix(Slider, {
  Slider: require('./src/slider')
});

module.exports = Slider;
