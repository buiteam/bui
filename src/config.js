;(function(){

  //from seajs
  function getScriptAbsoluteSrc(node) {
    return node.hasAttribute ? // non-IE6/7
        node.src :
      // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute("src", 4);
  }

  //根据当前config.js的引用路径来获取use的路径
  var scripts = document.getElementsByTagName('script'),
    src = getScriptAbsoluteSrc(scripts[scripts.length - 1]),
    loaderPath = src.substring(0, src.lastIndexOf('/'));

  //项目路径的配置
  seajs.config({
    paths: {
      'bui': loaderPath
    }
  });

  var BUI = window.BUI = window.BUI || {};
  BUI.use = seajs.use;
  BUI.config = seajs.config;
  
})();
