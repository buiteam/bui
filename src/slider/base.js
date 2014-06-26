define('bui/slider',['bui/common', 'bui/slider/slider'],function (require) {

  var BUI = require('bui/common'), 
    Slider = BUI.namespace('Slider');

  BUI.mix(Slider,{
    Slider: require('bui/slider/slider')
  });

  return Slider;
});
