;(function(){

  //from seajs
  function getScriptAbsoluteSrc(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute("src", 4);
  }

  var BUI = window.BUI = window.BUI || {};
  BUI.use = seajs.use;
  BUI.config = seajs.config;

  var scripts = document.getElementsByTagName('script'),
    loaderScript = scripts[scripts.length - 1],
    src = getScriptAbsoluteSrc(loaderScript),
    loaderPath = src.substring(0, src.lastIndexOf('/'));

  BUI.loaderScript = loaderScript;

  //配置bui的路径
  seajs.config({
    paths: {
      'bui': loaderPath
    }
  });

  BUI.setDebug = function(debug){
    BUI.debug = debug;
    if (debug) {
      seajs.config({
        map : [
          [/.js$/, '-debug.js']
        ]
      });
    }
  }

  // chrome下本身就存在全局的$,所以不能判断 !window.$
  // 所以只要存在window.jQuery则就往全局上写一份
  if(window.jQuery){
    window.$ = window.jQuery;
  }
  else{
    var alias = seajs.data.alias,
      jquery = alias && (alias.$ || alias.jquery);
    jquery && seajs.use(jquery);
  }

})();
