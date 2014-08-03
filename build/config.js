(function() {
  /**
   * Sea.js mini 2.3.0 | seajs.org/LICENSE.md
   */
  var define;
  var require;
  (function(global, undefined) {
    /**
     * util-lang.js - The minimal language enhancement
     */
    function isType(type) {
      return function(obj) {
        return {}.toString.call(obj) == "[object " + type + "]"
      }
    }
    var isFunction = isType("Function")
      /**
       * module.js - The core of module loader
       */
    var cachedMods = {}

    function Module() {}
    // Execute a module
    Module.prototype.exec = function() {
      var mod = this
        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
      if (this.execed) {
        return mod.exports
      }
      this.execed = true;

      function require(id) {
        return Module.get(id).exec()
      }
      // Exec factory
      var factory = mod.factory
      var exports = isFunction(factory) ? factory(require, mod.exports = {}, mod) : factory
      if (exports === undefined) {
        exports = mod.exports
      }
      // Reduce memory leak
      delete mod.factory
      mod.exports = exports
      return exports
    }
    // Define a module
    define = function(id, deps, factory) {
      var meta = {
        id: id,
        deps: deps,
        factory: factory
      }
      Module.save(meta)
    }
    // Save meta data to cachedMods
    Module.save = function(meta) {
      var mod = Module.get(meta.id)
      mod.id = meta.id
      mod.dependencies = meta.deps
      mod.factory = meta.factory
    }
    // Get an existed module or create a new one
    Module.get = function(id) {
      return cachedMods[id] || (cachedMods[id] = new Module())
    }
    // Public API
    require = function(id) {
      var mod = Module.get(id)
      if (!mod.execed) {
        mod.exec()
      }
      return mod.exports
    }
  })(this);
  define("bui/config", [], function(require, exports, module) {
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
      debug = loaderScript.getAttribute('data') === 'true' ? true : false;
    BUI.loaderScript = loaderScript;
    //配置bui的路径
    seajs.config({
      paths: {
        'bui': loaderPath
      }
    });
    BUI.setDebug = function(debug) {
      BUI.debug = debug;
      if (!debug) {
        //只有bui目录下面的文件使用-min.js
        var regexp = new RegExp('^(' + loaderPath + '\\S*).js$');
        seajs.config({
          map: [
            [regexp, '$1-min.js']
          ]
        });
      }
    };
    BUI.setDebug(debug);
    // 所有的模块都是依赖于jquery, 所以定义一个jquery的模块，并直接返回
    if (window.jQuery) {
      window.define('jquery', [], function() {
        return window.jQuery;
      });
    }
  });
  require("bui/config");
})();