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
    loaderPath = src.substring(0, src.lastIndexOf('/')),
    debug = loaderScript.getAttribute('data-debug') === 'true' ? true : false;

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
  BUI.setDebug(debug);

  // 所有的模块都是依赖于jquery, 所以定义一个jquery的模块，并直接返回
  if(window.jQuery){
    define('jquery', [], function(){
      return window.jQuery;
    });
  }

})();
