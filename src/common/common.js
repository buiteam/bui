(function(){
  var requires = ['bui/common/util', 'bui/common/ua', 'bui/common/json', 'bui/common/date', 'bui/common/array', 'bui/common/keycode', 'bui/common/observable', 'bui/common/base', 'bui/component'];

  if(window.KISSY && (!window.KISSY.Node || !window.jQuery)){ //如果是kissy同时未加载core模块
    requires.unshift('bui/adapter');
  }

  define('bui/common', requires, function(require){

    var BUI = require('bui/common/util');

    BUI.mix(BUI, {
      UA : require('bui/common/ua'),
      JSON : require('bui/common/json'),
      Date : require('bui/common/date'),
      Array : require('bui/common/array'),
      KeyCode : require('bui/common/keycode'),
      Observable : require('bui/common/observable'),
      Base : require('bui/common/base'),
      Component : require('bui/component')
    });
    return BUI;
  });
})();
