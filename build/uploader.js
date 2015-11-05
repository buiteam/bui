define("bui/uploader", ["bui/common","jquery","bui/list","bui/data","bui/swf"], function(require, exports, module){
/**
 * @fileoverview 异步文件上传组件入口文件
 * @author 索丘 yezengyue@gmail.com
 * @ignore
 **/
var BUI = require("bui/common"),
  Uploader = BUI.namespace('Uploader');

BUI.mix(Uploader, {
  Uploader: require("bui/uploader/uploader"),
  Queue: require("bui/uploader/queue"),
  Theme: require("bui/uploader/theme"),
  Factory: require("bui/uploader/factory")
});

module.exports = Uploader;

});
define("bui/uploader/uploader", ["jquery","bui/common","bui/list","bui/data","bui/swf"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 异步文件上传组件
 * @author 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common"),
  Component = BUI.Component,
  File = require("bui/uploader/file"),
  Theme = require("bui/uploader/theme"),
  Factory = require("bui/uploader/factory"),
  Validator = require("bui/uploader/validator");

//上传类型的检测函数定义
var supportMap = {
  ajax: function(){
    return !!window.FormData;
  },
  //flash上传类型默认所有浏览器都支持
  flash: function(){
    return true;
  },
  iframe: function(){
    return true;
  }
}

//是否支持该上传类型
function isSupport(type){
  return supportMap[type] && supportMap[type]();
}

//设置Controller的属性
function setControllerAttr(control, key, value) {
  if (BUI.isFunction(control.set)) {
    control.set(key, value);
  }
  else {
    control[key] = value;
  }
}

/**
 * 文件上传组组件
 * @class BUI.Uploader.Uploader
 * @extends BUI.Component.Controller
 * 
 * <pre><code>
 *
 * BUI.use('bui/uploader', function(Uploader){
 *   var uploader = new Uploader.Uploader({
 *     url: '../upload.php'
 *   }).render();
 *
 *  uploader.on('success', function(ev){
 *    //获取上传返回的结果
 *    var result = ev.result;
 *  })
 * });
 * 
 * </code></pre>
 */
var Uploader = Component.Controller.extend({
  initializer: function(){
    var _self = this;
    _self._initTheme();
    _self._initType();
  },
  renderUI: function(){
    var _self = this;
    _self._renderButton();
    _self._renderUploaderType();
    _self._renderQueue();
    _self._initValidator();
  },
  bindUI: function () {
    var _self = this;
    _self._bindButton();
    _self._bindUploaderCore();
    _self._bindQueue();
  },
  /**
   * @private
   * 初始化使用的主题
   */
  _initTheme: function(){
    var _self = this,
      theme = Theme.getTheme(_self.get('theme')),
      attrVals = _self.getAttrVals();
    BUI.each(theme, function(value, name){
      //uploader里面没有定义该配置，但是主题里面有定义
      if(attrVals[name] === undefined){
        _self.set(name, value);
      }
      else if($.isPlainObject(value)){
        BUI.mix(value, attrVals[name]);
        _self.set(name, value);
      }
    });
  },
  /**
   * 初始化上传类型
   * @private
   * @description 默认按最优处理
   */
  _initType: function(){
    var _self = this,
      types = _self.get('types'),
      type = _self.get('type');
    //没有设置时按最优处理，有则按设定的处理
    if(!type){
      BUI.each(types, function(item){
        if(isSupport(item)){
          type = item;
          return false;
        }
      })
    }
    _self.set('type', type);
  },
  /**
   * 初始化验证器
   * @private
   */
  _initValidator: function(){
    var _self = this,
      validator = _self.get('validator');
    if(!validator){
      validator = new Validator({
        queue: _self.get('queue'),
        rules: _self.get('rules')
      });
      _self.set('validator', validator);
    }
  },
  /**
   * 初始线上传类型的实例
   * @private
   */
  _renderUploaderType: function(){
    var _self = this,
      type = _self.get('type'),
      config = _self.get('uploaderType');

    var uploaderType = Factory.createUploadType(type, config);
    uploaderType.set('uploader', _self);
    _self.set('uploaderType', uploaderType);
  },
  /**
   * 初始化Button
   * @private
   */
  _renderButton: function(){
    var _self = this,
      type = _self.get('type'),
      el = _self.get('el'),
      button = _self.get('button');
    if(!button.isController){
      button.render = el;
      button.autoRender = true;
      button = Factory.createButton(type, button);
      _self.set('button', button);
    }
    button.set('uploader', _self);
  },
  /**
   * 初始化上传的对列
   * @private
   */
  _renderQueue: function(){
    var _self = this,
      el = _self.get('el'),
      queue = _self.get('queue');
    if (!queue.isController) {
      queue.render = el;
      queue.autoRender = true;
      //queue.uploader = _self;
      queue = Factory.createQueue(queue);
      _self.set('queue', queue);
    }
    queue.set('uploader', _self);
  },
  /**
   * 绑定button的事件
   * @private
   */
  _bindButton: function () {
    var _self = this,
      button = _self.get('button'),
      queue = _self.get('queue');

    button.on('change', function(ev) {
      var files = ev.files;
      _self.fire('beforechange', {items: files});
      //对添加的文件添加状态
      queue.addItems(files);
      _self.fire('change', {items: files});
    });
  },
  /**
   * 绑定上传的对列
   * @private
   */
  _bindQueue: function () {
    var _self = this,
      queue = _self.get('queue'),
      button = _self.get('button'),
      validator = _self.get('validator');

    //渲染完了之后去设置文件状态，这个是会在添加完后触发的
    queue.on('itemrendered', function(ev){
      var item = ev.item,
        //如果文件已经存在某一状态，则不再去设置add状态
        status = queue.status(item) || 'add';

      // 说明是通过addItem直接添加进来的
      if(!item.isUploaderFile){
        item.result = BUI.cloneObject(item);
        item = File.create(item);
      }

      if(!validator.valid(item)){
        status = 'error';
      }

      queue.updateFileStatus(item, status);

      if(_self.get('autoUpload')){
        _self.upload();
      }
    });

    queue.on('itemupdated', function(ev) {
      _self.uploadFiles();
    });
  },
  /**
   * 文件上传的处理函数
   * @private
   */
  _bindUploaderCore: function () {
    var _self = this,
      queue = _self.get('queue'),
      uploaderType = _self.get('uploaderType');

    //start事件
    uploaderType.on('start', function(ev){
      var item = ev.file;
      delete item.result;
      _self.fire('start', {item: item});
    });
    //上传的progress事件
    uploaderType.on('progress', function(ev){

      var curUploadItem = _self.get('curUploadItem'),
        loaded = ev.loaded,
        total = ev.total;
      BUI.mix(curUploadItem, {
        //文件总大小, 这里的单位是byte
        total: total,
        //已经上传的大小
        loaded: loaded,
        //已经上传的百分比
        loadedPercent: loaded * 100 / total
      });

      //设置当前正处于的状态
      queue.updateFileStatus(curUploadItem, 'progress');

      _self.fire('progress', {item: curUploadItem, total: total, loaded: loaded});
    });
    //上传过程中的error事件
    //一般是当校验出错时和上传接口异常时触发的
    uploaderType.on('error', function(ev){
      var curUploadItem = _self.get('curUploadItem'),
        errorFn = _self.get('error'),
        completeFn = _self.get('complete');
      //设置对列中完成的文件
      queue.updateFileStatus(curUploadItem, 'error');

      errorFn && BUI.isFunction(errorFn) && errorFn.call(_self);
      _self.fire('error', {item: curUploadItem});

      completeFn && BUI.isFunction(completeFn) && completeFn.call(_self);
      _self.fire('complete', {item: curUploadItem});

      _self.set('curUploadItem', null);
    });

    //上传完成的事件
    uploaderType.on('complete', function(ev){
      var curUploadItem = _self.get('curUploadItem'),
        result = ev.result,
        isSuccess= _self.get('isSuccess'),
        successFn = _self.get('success'),
        errorFn = _self.get('error'),
        completeFn = _self.get('complete');

      _self.set('curUploadItem', null);

      // BUI.mix(curUploadItem.result, result);
      curUploadItem.result = result;

      if(isSuccess.call(_self, result)){
        //为了兼容原来只设置了itemTpl的情况
        BUI.mix(curUploadItem, result);
        queue.updateFileStatus(curUploadItem, 'success');
        successFn && BUI.isFunction(successFn) && successFn.call(_self, result);
        _self.fire('success', {item: curUploadItem, result: result});
      }
      else{
        queue.updateFileStatus(curUploadItem, 'error');
        errorFn && BUI.isFunction(errorFn) && errorFn.call(_self, result);
        _self.fire('error', {item: curUploadItem, result: result});
      }

      completeFn && BUI.isFunction(completeFn) && completeFn.call(_self, result);
      _self.fire('complete', {item: curUploadItem, result: result});
      

      //重新上传其他等待的文件
      //_self.uploadFiles();
    });
  },
  /**
   * 开始进行上传
   * @param  {Object} item
   */
  uploadFile: function (item) {
    var _self = this,
      queue = _self.get('queue'),
      uploaderType = _self.get('uploaderType'),
      curUploadItem = _self.get('curUploadItem');

    //如果有文件正等侍上传，而且上传组件当前处理空闲状态，才进行上传
    if (item && !curUploadItem) {
      //设置正在上传的状态
      _self.set('curUploadItem', item);
      //更新文件的状态
      queue.updateFileStatus(item, 'start');
      uploaderType.upload(item);
    }
  },
  /**
   * 上传文件，只对对列中所有wait状态的文件
   */
  uploadFiles: function () {
    var _self = this,
      queue = _self.get('queue'),
      //所有文件只有在wait状态才可以上传
      items = queue.getItemsByStatus('wait');

    if (items && items.length) {
      //开始进行对列中的上传
      _self.uploadFile(items[0]);
    }
  },
  /**
   * 上传所有新添加的文件
   */
  upload: function(){
    var _self = this,
      queue = _self.get('queue'),
      //所有文件只有在wait状态才可以上传
      items = queue.getItemsByStatus('add');
    BUI.each(items, function(item){
      queue.updateFileStatus(item, 'wait');
    });
  },
  /**
   * 取消正在上传的文件 
   */
  cancel: function(item){
    var _self = this;
    if(item){
      _self._cancel(item);
      return
    }
    //只对将要进行上传的文件进行取消
    BUI.each(_self.get('queue').getItemsByStatus('wait'), function(item){
      _self._cancel(item);
    });
  },
  /**
   * 取消
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  _cancel: function(item){
    var _self = this,
      queue = _self.get('queue'),
      uploaderType = _self.get('uploaderType'),
      curUploadItem = _self.get('curUploadItem');

    //说明要取消项正在进行上传
    if (curUploadItem === item) {
      uploaderType.cancel();
      _self.set('curUploadItem', null);
    }

    queue.updateFileStatus(item, 'cancel');

    _self.fire('cancel', {item: item});
  },
  /**
   * 校验是否通过
   * @description 判断成功的数量和列表中的数量是否一致
   */
  isValid: function(){
    var _self = this,
      queue = _self.get('queue');
    return queue.getItemsByStatus('success').length === queue.getItems().length;
  }
}, {
  ATTRS: {
    /**
     * 上传的类型，会依次按这个顺序来检测，并选择第一个可用的
     * @type {Array} 上传类型
     * @default ['ajax', 'flash', 'iframe']
     */
    types: {
      value: ['ajax', 'flash', 'iframe']
    },
    /**
     * 上传的类型，有ajax,flash,iframe四种
     * @type {String}
     */
    type: {
    },
    /**
     * 主题
     * @type {BUI.Uploader.Theme}
     */
    theme: {
      value: 'default'
    },
    /**
     * 上传组件的button对像
     * @type {BUI.Uploader.Button}
     */
    button: {
      value: {},
      shared: false
    },
    /**
     * 按钮的文本
     * @type {String} text
     * @default 上传文件
     */
    text: {
      setter: function(v) {
        setControllerAttr(this.get('button'), 'text', v);
        return v;
      }
    },
    /**
     * 提交文件时的name值
     * @type {String} name
     * @default fileData
     */
    name: {
      setter: function(v) {
        setControllerAttr(this.get('button'), 'name', v);
        setControllerAttr(this.get('uploaderType'), 'fileDataName', v);
        return v;
      }
    },
    /**
     * 上传组件是否可用
     * @type {Boolean} disabled
     */
    disabled: {
      value: false,
      setter: function(v) {
        setControllerAttr(this.get('button'), 'disabled', v);
        return v;
      }
    },
    /**
     * 是否支持多选
     * @type {Boolean} multiple
     */
    multiple: {
      value: true,
      setter: function(v) {
        setControllerAttr(this.get('button'), 'multiple', v);
        return v;
      }
    },
    /**
     * 文件过滤
     * @type Array
     * @default []
     * @description
     * 在使用ajax方式上传时，不同浏览器、不同操作系统这个filter表现得都不太一致
     * 所以在使用ajax方式上传不建议使用
     * 如果已经声明使用flash方式上传，则可以使用这个
     *
     * <pre><code>
     * filter: {ext:".jpg,.jpeg,.png,.gif,.bmp"}
     * </code></pre>
     *
     */
    filter: {
      setter: function(v) {
        setControllerAttr(this.get('button'), 'filter', v);
        return v;
      }
    },
    /**
     * 用来处理上传的类
     * @type {Object}
     * @readOnly
     */
    uploaderType: {
      value: {},
      shared: false
    },
    /**
     * 文件上传的url
     * @type {String} url
     */
    url: {
      setter: function(v) {
        setControllerAttr(this.get('uploaderType'), 'url', v);
        return v;
      }
    },
    /**
     * 文件上传时，附加的数据
     * @type {Object} data
     */
    data: {
      setter: function(v) {
        setControllerAttr(this.get('uploaderType'), 'data', v);
        return v;
      }
    },
    /**
     * 上传组件的上传对列
     * @type {BUI.Uploader.Queue}
     */
    queue: {
      value: {},
      shared: false
    },
    /**
     * 上传结果的模板，可根据上传状态的不同进行设置，没有时取默认的
     * @type {Object}
     * 
     * ** 默认定义的模板结构 **
     * <pre><code>
     * 
     * 'default': '<div class="default">{name}</div>',
     * 'success': '<div data-url="{url}" class="success">{name}</div>',
     * 'error': '<div class="error"><span title="{name}">{name}</span><span class="uploader-error">{msg}</span></div>',
     * 'progress': '<div class="progress"><div class="bar" style="width:{loadedPercent}%"></div></div>'
     * 
     * </code></pre>
     */
    resultTpl: {
      setter: function(v) {
        setControllerAttr(this.get('queue'), 'resultTpl', v);
        return v;
      }
    },
    /**
     * 选中文件后是否自动上传
     * @type {Boolean}
     * @default true
     */
    autoUpload: {
      value: true
    },
    /**
     * 当前上传的状态
     * @type {String}
     */
    uploadStatus: {
    },
    /**
     * 判断上传是否已经成功，默认判断有返回，且返回的json中存在url这个字段
     * @type {Function}
     */
    isSuccess: {
      value: function(result){
        if(result && result.url){
          return true;
        }
        return false;
      }
    },
    /**
     * uploader的验证器
     * @type {BUI.Uploader.Validator}
     */
    validator: {
    },
    events : {
      value : {
        /**
         * 选中文件时
         * @event
         * @param {Object} e 事件对象
         * @param {Array} e.items 选中的文件项
         */
        'change': false,
        /**
         * 文件开始上传时
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前上传的项
         */
        'start': false,
        /**
         * 文件正在上传时
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前上传的项
         * @param {Number} e.total 文件的总大小
         * @param {Object} e.loaded 已经上传的大小
         */
        'progress': false,
        /**
         * 文件上传成功时
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前上传的项
         * @param {Object} e.result 服务端返回的结果
         */
        'success': false,
        /**
         * 文件上传失败时
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前上传的项
         * @param {Object} e.result 服务端返回的结果
         */
        'error': false,
        /**
         * 文件完成时，不管成功失败都会触发
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前上传的项
         * @param {Object} e.result 服务端返回的结果
         */
        'complete': false,
        /**
         * 取消上传时
         * @event
         * @param {Object} e 事件对象
         * @param {Object} e.item 当前取消的项
         */
        'cancel': false
      }
    }
  }
}, {
  xclass: 'uploader'
});

module.exports = Uploader;

});
define("bui/uploader/file", ["bui/common","jquery"], function(require, exports, module){
/**
 * @fileoverview 异步文件上传组件的文件对像
 * @author 索丘 yezengyue@gmail.com
 * @ignore
 **/

var BUI = require("bui/common");

/**
 * 获取文件的id
 */
function getFileId (file) {
  return file.id || BUI.guid('bui-uploader-file');
}

/**
 * 获取文件名称
 * @param {String} path 文件路径
 * @return {String}
 * @ignore
 */
function getFileName (path) {
  return path.replace(/.*(\/|\\)/, "");
}

/**
 * 获取文件扩展名
 * @param {String} filename 文件名
 * @return {String}
 * @private
 * @ignore
 */
function getFileExtName(filename){
  var result = /\.[^\.]+$/.exec(filename) || [];
  return result.join('').toLowerCase();
}

/**
 * 转换文件大小字节数
 * @param {Number} bytes 文件大小字节数
 * @return {String} 文件大小
 * @private
 * @ignore
 */
function convertByteSize(bytes) {
  var i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes > 99);
  return Math.max(bytes, 0.1).toFixed(1) + ['KB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
}

module.exports = {
  // /**
  //  * 创建一个上传对列里面的内容对象
  //  */
  // getFileAttr: function(file){
  //   return {
  //     name: file.name,
  //     size: file.size,
  //     type: file.type,
  //     textSize: file.textSize,
  //     ext: file.extName,
  //     id: file.id
  //   }
  // },
  create: function(file){
    file.id = file.id || BUI.guid('bui-uploader-file');
    // 去掉文件的前面的路径，获取一个纯粹的文件名
    file.name = getFileName(file.name);
    file.ext = getFileExtName(file.name);
    file.textSize = convertByteSize(file.size);
    
    file.isUploaderFile = true;

    //file.attr = this.getFileAttr(file);

    return file;
  }
};

});
define("bui/uploader/theme", ["bui/common","jquery"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 文件上传主题的处理
 * @author 索丘 yezengyue@gmail.com
 **/

var BUI = require("bui/common");

var themes = {};

/**
 * 文件上传的主题设置
 * @class BUI.Uploader.Theme
 * @static
 *
 * <pre><code>
 * 默认自带的题有
 * 
 * //这个是默认的
 * theme: 'defaultTheme'
 *
 * //这个带图片预览的
 * theme: 'imageView'
 * </code></pre>
 */
var Theme = {
  /**
   * 添加一个主题
   * @param {String} name   主题名称
   * @param {Object} config 主题的配置
   * 
   * <pre><code>
   * @example
   * // 添加一个主题模板
   * Theme.addTheme('imageView', {
   *  elCls: 'imageViewTheme',
   *  queue:{
   *    resultTpl: {
   *      'default': '&lt;div class="default"&gt;{name}&lt;/div&gt;',
   *      'success': '&lt;div class="success"&gt;&lt;img src="{url}" /&gt;&lt;/div&gt;'
   *      'error': '&lt;div class="error"&gt;&lt;span title="{name}"&gt;{name}&lt;/span&gt;&lt;span class="uploader-error"&gt;{msg}&lt;/span&gt;&lt;/div&gt;',
   *      'progress': '&lt;div class="progress"&gt;&lt;div class="bar" style="width:{loadedPercent}%"&gt;&lt;/div&gt;&lt;/div&gt;'
   *    }
   *  }
   *});
   * </code></pre>
   */
  addTheme: function(name, config){
    themes[name] = config;
  },
  /**
   * 获取一个主题
   * @param  {String} name [description]
   * @return {BUI.Uploader.Theme} 主题的配置
   */
  getTheme: function(name){
    //不能覆盖主题设置的
    return BUI.cloneObject(themes[name]);
  }
};

//这个默认的主题
Theme.addTheme('default', {
  elCls: 'defaultTheme'
});


//带图片预览的主题
Theme.addTheme('imageView', {
  elCls: 'imageViewTheme',
  queue:{
    resultTpl: {
      'success': '<div class="success"><img src="{url}" /></div>'
    }
  }
});

module.exports = Theme;

});
define("bui/uploader/factory", ["bui/common","jquery","bui/list","bui/data","bui/swf"], function(require, exports, module){
/**
 * @fileoverview 文件上传的工厂类
 * @author 索丘 yezengyue@gmail.com
 * @ignore
 **/

var BUI = require("bui/common"),
  Queue = require("bui/uploader/queue"),
  HtmlButton = require("bui/uploader/button/htmlButton"),
  SwfButton = require("bui/uploader/button/swfButton"),
  Ajax = require("bui/uploader/type/ajax"),
  Flash = require("bui/uploader/type/flash"),
  Iframe = require("bui/uploader/type/iframe"),
  UploadifyButton = require("bui/uploader/button/uploadify"),
  Uploadify = require("bui/uploader/type/uploadify");

/**
 * @BUI.Uploader.Factory
 * 创建上传控件的工厂类
 */
function Factory(){

}
Factory.prototype = {
  /**
   * 创建上传的类型
   * @param  {String} type   上传类型
   * @param  {Object} config 配置项
   * @return {BUI.Uploader.UploadType} 类型的实例
   */
  createUploadType: function(type, config){
    if (type === 'ajax') {
      return new Ajax(config);
    }
    else if(type === 'flash'){
      return new Flash(config);
    }
    else if (type === 'uploadify') {
      return new Uploadify(config);
    }
    else{
      return new Iframe(config);
    }
  },
  /**
   * 创建button
   * @param  {String} type   上传类型
   * @param  {Object} config button的配置项
   * @return {BUI.Uploader.Button} button的实例
   */
  createButton: function(type, config){
    if(type === 'ajax' || type === 'iframe'){
      return new HtmlButton(config);
    }
    else if (type === 'uploadify') {
      return new UploadifyButton(config);
    }
    else{
      return new SwfButton(config);
    }
  },
  /**
   * 创建上传的对队
   * @param  {Object} config 配置项
   * @return {BUI.Uploader.Queue} 队列的实例
   */
  createQueue: function(config){
    return new Queue(config);
  }
}

module.exports = new Factory();

});
define("bui/uploader/queue", ["jquery","bui/common","bui/list","bui/data"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 文件上传队列列表显示和处理
 * @author 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common"),
  SimpleList = require("bui/list").SimpleList;

var CLS_QUEUE = BUI.prefix + 'queue',
  CLS_QUEUE_ITEM = CLS_QUEUE + '-item';

/**
 * 上传文件的显示队列
 * @class BUI.Uploader.Queue
 * @extends BUI.List.SimpleList
 * <pre><code>
 *
 * BUI.use('bui/uploader', function(Uploader){
 * });
 * 
 * </code></pre>
 */
var Queue = SimpleList.extend({
  bindUI: function () {
    var _self = this,
      el = _self.get('el'),
      delCls = _self.get('delCls');

    el.delegate('.' + delCls, 'click', function (ev) {
        var itemContainer = $(ev.target).parents('.bui-queue-item'),
          item = _self.getItemByElement(itemContainer);

      if(_self.fire('beforeremove', {item: item, target: ev.target}) !== false) {
        _self.removeItem(item);
      }
    });
  },
  /**
   * 从队列中删除一项
   * @param  {Object} item
   */
  removeItem: function(item){
    var _self = this,
      uploader = _self.get('uploader');

    uploader && uploader.cancel && uploader.cancel(item);
    Queue.superclass.removeItem.call(_self, item);
  },
  /**
   * 更新文件上传的状态
   * @param  {Object} item
   * @param  {String} status  上传的状态
   * @param  {HTMLElement} element 这一项对应的dom元素
   */
  updateFileStatus: function(item, status, element){
    var _self = this,
      itemStatusFields = _self.get('itemStatusFields');
    element = element || _self.findElement(item);
      
    BUI.each(itemStatusFields, function(v,k){
      _self.setItemStatus(item,k,false,element);
    });

    _self.setItemStatus(item,status,true,element);
    _self._setResultTpl(item, status);
    _self.updateItem(item);
  },
  /**
   * 根据上传的状态设置上传列表的模板
   * @private
   * @param {Object} item
   * @param {String} status 状态名称
   */
  _setResultTpl: function(item, status){
    var _self = this,
      resultTpl = _self.get('resultTpl'),
      itemTpl = resultTpl[status] || resultTpl['default'],
      tplData = BUI.mix(item, item.result);
    item.resultTpl = BUI.substitute(itemTpl, tplData);
  },
  /**
   * 获取文件的当前状态
   * @param {Object} item
   * @return {String} status 状态名称
   */
  status: function(item){
    var _self = this,
      itemStatusFields = _self.get('itemStatusFields'),
      status;

    BUI.each(itemStatusFields, function(v, k){
      if (item[v]) {
        status = v;
        return false;
      }
    });
    return status;
  }
}, {
  ATTRS: {
    itemTpl: {
      value: '<li>{resultTpl} <span class="action"><span class="' + CLS_QUEUE_ITEM + '-del">删除</span></span></li>'
    },
    /**
     * 上传结果的模板，可根据上传状态的不同进行设置，没有时取默认的
     * @type {Object}
     * 
     * ** 默认定义的模板结构 **
     * <pre><code>
     * 
     * 'default': '<div class="default">{name}</div>',
     * 'success': '<div data-url="{url}" class="success">{name}</div>',
     * 'error': '<div class="error"><span title="{name}">{name}</span><span class="uploader-error">{msg}</span></div>',
     * 'progress': '<div class="progress"><div class="bar" style="width:{loadedPercent}%"></div></div>'
     * 
     * </code></pre>
     */
    resultTpl:{
      value: {
        'default': '<div class="default">{name}</div>',
        'success': '<div data-url="{url}" class="success">{name}</div>',
        'error': '<div class="error"><span title="{name}">{name}</span><span class="uploader-error">{msg}</span></div>',
        'progress': '<div class="progress"><div class="bar" style="width:{loadedPercent}%"></div></div>'
      },
      setter: function(v){
        return BUI.mix({}, this.get('resultTpl'), v);
      }
    },
    /**
     * 列表项的cls
     * @type {String}
     */
    itemCls: {
      value: CLS_QUEUE_ITEM
    },
    /**
     * 删除的cls
     * @protected
     * @type {String}
     */
    delCls: {
      value: CLS_QUEUE_ITEM + '-del'
    },
    /**
     * 列表项的状态
     * @protected
     * @type {Object}
     */
    itemStatusFields: {
      value: {
        add: 'add',
        wait: 'wait',
        start: 'start',
        progress: 'progress',
        success: 'success',
        cancel: 'cancel',
        error: 'error'
      }
    }
  }
}, { 
  xclass: 'queue'
});

module.exports = Queue;

});
define("bui/uploader/button/htmlButton", ["jquery","bui/common"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 文件上传按钮,使用input[type=file]
 * @author: 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common"),
  Component = BUI.Component,
  File = require("bui/uploader/file"),
  ButtonBase = require("bui/uploader/button/base"),
  UA = BUI.UA;

/**
 * 文件上传按钮，ajax和iframe上传方式使用,使用的是input[type=file]
 * @class BUI.Uploader.Button.HtmlButton
 * @extends BUI.Uploader.Button
 */
var HtmlButton = ButtonBase.extend({
  renderUI: function(){
    var _self = this;
    _self._createInput();
  },
  /**
   * 创建隐藏的表单上传域
   * @private
   * @return {HTMLElement} 文件上传域容器
   */
  _createInput: function() {
    var _self = this,
      buttonCls = _self.get('buttonCls'),
      buttonEl = _self.get('el').find('.' + buttonCls),
      inputTpl = _self.get('inputTpl'),
      name = _self.get('name'),
      fileInput;

    inputTpl = BUI.substitute(inputTpl, {
      name: name
    });

    buttonEl.append(inputTpl);

    fileInput = buttonEl.find('input');

    //TODO:IE6下只有通过脚本和内联样式才能控制按钮大小
    if(UA.ie == 6){
      fileInput.css('fontSize','400px');
    }
    _self._bindChangeHandler(fileInput);

    _self.set('fileInput', fileInput);

    //因为每选中一次文件后，input[type=file]都会重新生成一遍，所以需要重新设置这些属性
    _self._uiSetMultiple(_self.get('multiple'));
    _self._uiSetDisabled(_self.get('disabled'));
    _self._uiSetFilter(_self.get('filter'));
  },
  /**
   * 绑定input[type=file]的文件选中事件
   */
  _bindChangeHandler: function(fileInput) {
    var _self = this;
    //上传框的值改变后触发
    $(fileInput).on('change', function(ev){
      var value = $(this).val(),
        oFiles = ev.target.files,
        files = [];
        
      //IE取不到files
      if(oFiles){
        BUI.each(oFiles, function(v){
          files.push(File.create({'name': v.name, 'type': v.type, 'size': v.size, file:v, input: fileInput}));
        });
      }else{
        files.push(File.create({'name': value, input: fileInput}));
      }
      _self.fire('change', {
        files: files,
        input: this
      });
      _self.reset();
    });
  },
  reset: function () {
    var _self = this,
      fileInput = _self.get('fileInput');

    //移除表单上传域容器
    fileInput.parent().remove();
    _self.set('fileInput', null);
    //重新创建表单上传域
    _self._createInput();
    return _self;
  },
  /**
   * 设置上传组件的禁用
   * @ignore
   * @param {Boolean} multiple 是否禁用
   * @return {Boolean}
   */
  _uiSetMultiple : function(multiple){
    var _self = this,
      fileInput = _self.get('fileInput');

    if(!fileInput || !fileInput.length){
      return false;
    };
    if(multiple){
      fileInput.attr('multiple', 'multiple');
    }
    else{
      fileInput.removeAttr('multiple');
    }
    return multiple;
  },
  /**
   * @protected
   * @ignore
   */
  _uiSetDisabled: function(v){
    var _self = this,
      fileInput = _self.get('fileInput');
    if (v) {
      fileInput.hide();
    }
    else{
      fileInput.show();
    }
  },
  /**
   * 设置上传文件的类型
   * @ignore
   * @protected
   * @param {*} filter 可上传文件的类型
   */
  _uiSetFilter: function(v){
    var _self = this,
      fileInput = _self.get('fileInput'),
      filter = _self.getFilter(v);
    if(!fileInput || !fileInput.length){
      return false;
    };
    //accept是html5的属性，所以ie8以下是不支持的
    filter.type && fileInput.attr('accept', filter.type);
    return filter;
  },
  _uiSetName: function(v){
    $(this.get('fileInput')).attr('name', v)
  }
},{
  ATTRS: {
    /**
     * 隐藏的表单上传域的模板
     * @type String
     */
    inputTpl: {
      view: true,
      value: '<div class="file-input-wrapper"><input type="file" name="{name}" hidefocus="true" class="file-input" /></div>'
    },
    /**
     * 对应的表单上传域
     * @type {jQuery}
     */
    fileInput: {
    }
  }
}, {
  xclass: 'uploader-htmlButton'
});

module.exports = HtmlButton;

});
define("bui/uploader/button/base", ["bui/common","jquery"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 文件上传按钮的基类
 * @author: 索丘 yezengyue@gmail.com
 **/

var BUI = require("bui/common"),
  Component = BUI.Component,
  Filter = require("bui/uploader/button/filter"),
  PREFIX = BUI.prefix,
  CLS_UPLOADER = PREFIX + 'uploader',
  CLS_UPLOADER_BUTTON = CLS_UPLOADER + '-button',
  CLS_UPLOADER_BUTTON_TEXT = CLS_UPLOADER_BUTTON + '-text';


var ButtonView = Component.View.extend({
  _uiSetText: function (v) {
    var _self = this,
      text = _self.get('text'),
      textCls = _self.get('textCls'),
      textEl = _self.get('el').find('.' + textCls);
    textEl.text(text);
  }
},{
  ATTRS: {
  }
},{
  xclass: 'uploader-button-view'
});


/**
 * 文件上传按钮的基类
 * @class BUI.Uploader.Button
 * @extends BUI.Component.Controller
 */
var Button = Component.Controller.extend({
  
  getFilter: function(v){
    if(v){
      var desc = [],
        ext = [],
        type = [];
      if(v.desc){
        desc.push(v.desc);
        ext.push(Filter.getExtByDesc(v.desc));
        type.push(Filter.getTypeByDesc(v.desc));
      }
      if(v.ext){
        ext.push(v.ext);
        type.push(Filter.getTypeByExt(v.ext));
      }
      if(v.type){

      }
      return {
        desc: desc.join(','),
        ext: ext.join(','),
        type: type.join(',')
      }
    }
  }
},{
  ATTRS: {
    /**
     * 按钮的样式
     * @protected
     * @type {String}
     */
    buttonCls: {
      value: CLS_UPLOADER_BUTTON + '-wrap',
      view: true
    },
    /**
     * 文本的样式
     * @protected
     * @type {String}
     */
    textCls: {
      value: CLS_UPLOADER_BUTTON_TEXT,
      view: true
    },
    /**
     * 显示的文本
     * @type {String}
     */
    text: {
      view: true,
      value: '上传文件'
    },
    /**
     * 上传时，提交文件的name值
     * @type String
     * @default "Filedata"
     */
    name: {
      value: 'fileData'
    },
    tpl: {
      view: true,
      value: '<a href="javascript:void(0);" class="' + CLS_UPLOADER_BUTTON + '-wrap' + '"><span class="' + CLS_UPLOADER_BUTTON_TEXT + '">{text}</span></a>'
    },
    /**
     * 是否可用,false为可用
     * @type Boolean
     * @default false
     */
    disabled : {
      value : false
    },
    /**
     * 是否开启多选支持
     * @type Boolean
     * @default true
     */
    multiple : {
      value : true
    },
    /**
     * 文件过滤
     * @type Array
     * @default []
     */
    filter : {
      shared : false,
      value : []
    },
    events: {
      value: {
        /**
         * 选中文件时
         * @event
         * @param {Object} e 事件对象
         * @param {Array} e.files 选中的文件
         */
        'change': false
      }
    },
    xview: {
      value: ButtonView
    }
  }
},{
  xclass: 'uploader-button'
});

Button.View = ButtonView;

module.exports = Button;

});
define("bui/uploader/button/filter", ["bui/common","jquery"], function(require, exports, module){
var BUI = require("bui/common");

/**
 * @ignore
 * @class  BUI.Uploader.Filter
 * @private
 */

var filter =  {
  msexcel: {
    type: "application/msexcel",
    ext: '.xls,.xlsx'
  },
  msword: {
    type: "application/msword",
    ext: '.doc,.docx'
  },
  // {type: "application/pdf"},
  // {type: "application/poscript"},
  // {type: "application/rtf"},
  // {type: "application/x-zip-compressed"},
  // {type: "audio/basic"},
  // {type: "audio/x-aiff"},
  // {type: "audio/x-mpeg"},
  // {type: "audio/x-pn/},realaudio"
  // {type: "audio/x-waw"},
  // image: {
  //   type: "image/*",
  //   ext: '.gif,.jpg,.png,.bmp'
  // },
  gif: {
    type: "image/gif",
    ext: '.gif'
  },
  jpeg: {
    type: "image/jpeg",
    ext: '.jpg'
  },
  // {type: "image/tiff"},
  bmp: {
    type: "image/x-ms-bmp",
    ext: '.bmp'
  },
  //{type: "image/x-photo-cd"},
  png: {
    type: "image/png",
    ext: '.png'
  }
  // {type: "image/x-portablebitmap"},
  // {type: "image/x-portable-greymap"},
  // {type: "image/x-portable-pixmap"},
  // {type: "image/x-rgb"},
  // {type: "text/html"},
  // {type: "text/plain"},
  // {type: "video/quicktime"},
  // {type: "video/x-mpeg2"},
  // {type: "video/x-msvideo"}
}

module.exports = {
  _getValueByDesc: function(desc, key){
    var value = [];
    if(BUI.isString(desc)){
      desc = desc.split(',');
    }
    if(BUI.isArray(desc)){
      BUI.each(desc, function(v, k){
        var item = filter[v];
        item && item[key] && value.push(item[key]);
      });
    }
    return value.join(',');
  },
  getTypeByDesc: function(desc){
    return this._getValueByDesc(desc, 'type');
  },
  getExtByDesc: function(desc){
    return this._getValueByDesc(desc, 'ext');
  },
  getTypeByExt: function(ext){
    var type = [];
    if(BUI.isString(ext)){
      ext = ext.split(',');
    };
    if(BUI.isArray(ext)){
      BUI.each(ext, function(e){
        BUI.each(filter, function(item, desc){
          if(BUI.Array.indexOf(e, item.ext.split(',')) > -1){
            type.push(item.type);
          }
        });
      });
    };
    return type.join(',');
  }
}

});
define("bui/uploader/button/swfButton", ["jquery","bui/common","bui/swf"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview flash上传按钮
 * @author: 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common"),
  Component = BUI.Component,
  File = require("bui/uploader/file"),
  ButtonBase = require("bui/uploader/button/base"),
  baseUrl = getBaseUrl(),
  SWF = require("bui/uploader/button/ajbridge");

function getBaseUrl(){
  if(window.seajs){
    if (seajs.pluginSDK && seajs.pluginSDK.util && seajs.pluginSDK.util.loaderDir) {
      return seajs.pluginSDK.util.loaderDir;
    } else {
      var paths = seajs.data.paths || {};
      return paths['bui'] || seajs.data.base;
    }
  }
  else if(window.KISSY){
    return KISSY.Config.packages['bui'].base;
  }
}

/**
 * 文件上传按钮，flash上传方式使用,使用的是flash
 * @class BUI.Uploader.Button.SwfButton
 * @extends BUI.Uploader.Button
 */
var SwfButton = ButtonBase.extend({
  renderUI: function(){
    var _self = this;
    _self._initSwfUploader();
  },
  bindUI: function(){
    var _self = this,
      swfUploader = _self.get('swfUploader');

    swfUploader.on('contentReady', function(ev){
      _self.fire('swfReady', {swfUploader: swfUploader});
      swfUploader.on('fileSelect', function(ev){
        var fileList = ev.fileList,
          files = [];
        BUI.each(fileList, function(file){
          files.push(File.create(file));
        });
        _self.fire('change', {files: files});
      });

    });
  },
  syncUI: function(){
    var _self = this,
      swfUploader = _self.get('swfUploader');
    //因为swf加载是个异步的过程，所以加载完后要同步下属性
    swfUploader.on('contentReady', function(ev){
      _self._uiSetMultiple(_self.get('multiple'));
      _self._uiSetFilter(_self.get('filter'));
    });
  },
  _initSwfUploader: function(){
    var _self = this,
      buttonCls = _self.get('buttonCls'),
      buttonEl = _self.get('el').find('.' + buttonCls),
      flashCfg = _self.get('flash'),
      flashUrl = _self.get('flashUrl'),
      swfTpl = _self.get('swfTpl'),
      swfEl = $(swfTpl).appendTo(buttonEl),
      swfUploader;
    BUI.mix(flashCfg, {
      render: swfEl,
      src: flashUrl
    });
    swfUploader = new SWF(flashCfg);
    _self.set('swfEl', swfEl);
    _self.set('swfUploader', swfUploader);
  },
  _uiSetMultiple: function(v){
    var _self = this,
      swfUploader = _self.get('swfUploader');
    swfUploader && swfUploader.multifile(v);
    return v;
  },
  _uiSetDisabled: function(v){
    var _self = this,
      swfEl = _self.get('swfEl');
    if(v){
      swfEl.hide();
    }
    else{
       swfEl.show();
    }
    return v;
  },
  _convertFilter: function(v){
    var desc = v.desc,
      ext = [];
    BUI.each(v.ext.split(','), function(item){
      item && ext.push('*' + item);
    });
    v.ext = ext.join(';');
    return v;
  },
  _uiSetFilter: function(v){
    var _self = this,
      swfUploader = _self.get('swfUploader'),
      filter = _self._convertFilter(_self.getFilter(v));
    //flash里需要一个数组
    // console.log(BUI.JSON.stringify(filter));
    swfUploader && swfUploader.filter([filter]);
    return v;
  }
},{
  ATTRS: {
    swfEl:{
    },
    swfUploader:{
    },
    /**
     * 上传uploader.swf的路径，默认为bui/uploader/uploader.swf
     * @type {String} url
     */
    flashUrl:{
      value: baseUrl + '/uploader.swf'
    },
    /**
     * flash的配置参数，一般不需要修改
     * @type {Object}
     */
    flash:{
      value:{
        params:{
          allowscriptaccess: 'always',
          bgcolor:"#fff",
          wmode:"transparent",
          flashvars: {
            //手型
            hand:true,
            //启用按钮模式,激发鼠标事件
            btn:true,
            //这里flash全局的回调函数
            jsEntry: 'BUI.AJBridge.eventHandler'
          }
        }
      },
      shared: false
    },
    swfTpl:{
      view: true,
      value: '<div class="uploader-button-swf"></div>'
    }
  }
}, {
  xclass: 'uploader-swfButton'
});

module.exports = SwfButton;

});
define("bui/uploader/button/ajbridge", ["bui/common","jquery","bui/swf"], function(require, exports, module){
/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
var BUI = require("bui/common"),
  SWF = require("bui/swf");


var instances = {};

/**
 * @ignore
 * @class  BUI.Uploader.AJBridge
 * @private
 * @author kingfo oicuicu@gmail.com
 */
function AJBridge(config){
  AJBridge.superclass.constructor.call(this, config);
}

BUI.mix(AJBridge, {
  /**
   * 处理来自 AJBridge 已定义的事件
   * @param {String} id            swf传出的自身ID
   * @param {Object} event        swf传出的事件
   */
  eventHandler: function(id, event) {
    var instance = instances[id];
    if (instance) {
      instance.__eventHandler(id, event);
    }
  },
  /**
   * 批量注册 SWF 公开的方法
   * @param {Function} C 构造函数
   * @param {String|Array} methods
   */
  augment: function (C, methods) {
    if (BUI.isString(methods)) {
      methods = [methods];
    }
    if (!BUI.isArray(methods)){
      return;
    }
    BUI.each(methods, function(methodName) {
      C.prototype[methodName] = function() {
        try {
          return this.callSWF(methodName, Array.prototype.slice.call(arguments, 0));
        } catch(e) { // 当 swf 异常时，进一步捕获信息
          this.fire('error', { message: e });
        }
      }
    });
  }
})

BUI.extend(AJBridge, SWF);

BUI.augment(AJBridge, {
  initializer: function(){
    AJBridge.superclass.initializer.call(this);
    var _self = this,
      attrs = _self.get('attrs'),
      id = attrs.id;

    instances[id] = _self;

    _self.set('id', id);
  },
  __eventHandler: function(id, event){
    var _self = this,
      type = event.type;
  
    event.id = id;   // 弥补后期 id 使用
    switch(type){
      case "log":
        BUI.log(event.message);
        break;
      default:
        _self.fire(type, event);
    }
  },
  destroy: function(){
    AJBridge.superclass.destroy.call(this);
    var id = this.get('id');
    instances[id] && delete instances[id];
  }
});

// 为静态方法动态注册
// 注意，只有在 S.ready() 后进行 AJBridge 注册才有效。
AJBridge.augment(AJBridge, [
  'activate',
  'getReady',
  'getCoreVersion',
  'setFileFilters',
  'filter',
  'setAllowMultipleFiles',
  'multifile',
  'browse',
  'upload',
  'uploadAll',
  'cancel',
  'getFile',
  'removeFile',
  'lock',
  'unlock',
  'setBtnMode',
  'useHand',
  'clear'
]);

//flash里面要调用全局方法BUI.AJBridge.eventHandler,所以挂在BUI下面
BUI.AJBridge = AJBridge;

module.exports = AJBridge;
/**
 * NOTES:
 * 20130904 从kissy ajbridge模块移植成bui的模块（索丘修改）
 * @ignore
 */

});
define("bui/uploader/type/ajax", ["bui/common","jquery"], function(require, exports, module){
/**
 * @fileoverview ajax方案上传
 * @author
 * @ignore
 **/
var EMPTY = '', LOG_PREFIX = '[uploader-Ajax]:';

var UploadType = require("bui/uploader/type/base");


/*function isSubDomain(hostname){
    return win.location.host === doc.domain;
}

function endsWith (str, suffix) {
    var ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) == ind;
}*/

/**
 * @class BUI.Uploader.UploadType.Ajax
 * ajax方案上传
 * @extends BUI.Uploader.UploadType
 */
function AjaxType(config) {
    var self = this;
    //调用父类构造函数
    AjaxType.superclass.constructor.call(self, config);
}

//继承于Base，属性getter和setter委托于Base处理
BUI.extend(AjaxType, UploadType,{
    /**
     * 上传文件
     * @param {Object} File
     * @return {BUI.Uploader.UploadType.Ajax}
     * @chainable
     */
    upload : function(file) {
        //不存在文件信息集合直接退出
        if (!file || !file.file) {
            BUI.log(LOG_PREFIX + 'upload()，fileData参数有误！');
            return false;
        }
        var self = this;
        self.set('file', file);
        self.fire('start', {file: file});
        self._setFormData();
        self._addFileData(file.file);
        self.send();
        return self;
    },
    /**
     * 停止上传
     * @return {BUI.Uploader.UploadType.Ajax}
     * @chainable
     */
    cancel : function() {
        var self = this,
            xhr = self.get('xhr'),
            file = self.get('file');
        //中止ajax请求，会触发error事件
        if(xhr){
            xhr.abort();
            self.fire('cancel', {file: file});
        }
        self.set('file', null);
        return self;
    },
    /**
     * 发送ajax请求
     * @return {BUI.Uploader.UploadType.Ajax}
     * @chainable
     */
    send : function() {
        var self = this,
            //服务器端处理文件上传的路径
            url = self.get('url'),
            data = self.get('formData'),
            file = self.get('file');
        var xhr = new XMLHttpRequest();
        //TODO:如果使用onProgress存在第二次上传不触发progress事件的问题
        xhr.upload.addEventListener('progress',function(ev){
            self.fire('progress', { 'loaded': ev.loaded, 'total': ev.total });
        });
        xhr.onload = function(ev){
            var result = self._processResponse(xhr.responseText);
            self.fire('complete', {result: result, file: file});
        };
        xhr.onerror = function(ev){
            self.fire('error', {file: file});
        }
        xhr.open("POST", url, true);
        xhr.send(data);
        // 重置FormData
        self._setFormData();
        self.set('xhr',xhr);
        return self;
    },
    reset: function(){
    },
    /**
     * 设置FormData数据
     * @private
     */
    _setFormData:function(){
        var self = this;
        try{
        	self.set('formData', new FormData());
            self._processData();
        }catch(e){
        	BUI.log(LOG_PREFIX + 'something error when reset FormData.');
        	BUI.log(e, 'dir');
       }
    },
    /**
     * 处理传递给服务器端的参数
     */
    _processData : function() {
        var self = this,data = self.get('data'),
            formData = self.get('formData');
        //将参数添加到FormData的实例内
        BUI.each(data, function(val, key) {
            formData.append(key, val);
        });
        self.set('formData', formData);
    },
    /**
     * 将文件信息添加到FormData内
     * @param {Object} file 文件信息
     */
    _addFileData : function(file) {
        if (!file) {
            BUI.log(LOG_PREFIX + '_addFileData()，file参数有误！');
            return false;
        }
        var self = this,
            formData = self.get('formData'),
            fileDataName = self.get('fileDataName');
        formData.append(fileDataName, file);
        self.set('formData', formData);
    }
}, {ATTRS :{
    /**
     * 表单数据对象
     */
    formData: {
    },
    xhr: {
    },
    events: {
        value: {
            /**
             * 上传正在上传时
             * @event
             * @param {Object} e 事件对象
             * @param {Number} total 文件的总大小
             * @param {Number} loaded 已经上传的大小
             */
            progress: false
        }
    }//,
    // subDomain: {
    //     value: {
    //         proxy: '/sub_domain_proxy.html'
    //     }
    // }
}
});
module.exports = AjaxType;

});
define("bui/uploader/type/base", ["bui/common","jquery"], function(require, exports, module){
/**
 * @fileoverview 上传方式类的基类
 * @ignore
 **/

var BUI = require("bui/common");
/**
 * @class BUI.Uploader.UploadType
 *  上传方式类的基类，定义通用的事件和方法，一般不直接监听此类的事件
 * @extends BUI.Base
 */
function UploadType(config) {
  var _self = this;
  //调用父类构造函数
  UploadType.superclass.constructor.call(_self, config);
}

UploadType.ATTRS = {
  /**
   * 当前处理的文件
   * @type {Object}
   */
  file: {
  },
  /**
   * 服务器端路径
   * @type String
   * @default ""
   */
  url: {
  },
  /**
   * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
   * @type Object
   * @default {}
   */
  data: {
  },
  fileDataName: {
    value: 'Filedata'
  },
  events: {
    value: {
      /**
       * 开始上传后触发
       * @event
       * @param {Object} e 事件对象
       */
      start: false,
      /**
       * 停止上传后触发
       * @event
       * @param {Object} e 事件对象
       */
      cancel: false,
      /**
       * 上传成功后触发
       * @event
       * @param {Object} e 事件对象
       */
      success: false,
      /**
       * 上传失败后触发
       * @event
       * @param {Object} e 事件对象
       */
      error: false
    }
  }
}


//继承于Base，属性getter和setter委托于Base处理
BUI.extend(UploadType, BUI.Base, {
  /**
   * 上传文件
   * @param {Object} File 数据对像
   * @description
   * 因为每种上传类型需要的数据都不一样，
   * Ajax需要File对像，
   * Iframe需要input[type=file]对像
   * 所以为了保持接口的一致性，这里的File对像不是浏览器原生的File对像，而是包含File和input的对像
   * 类似{name: 'test.jpg', size: 1024, textSize: '1K', input: {}, file: File}
   */
  upload: function(File) {
  },
  /** 
   * 停止上传
   */
  cancel: function(){
  },
  /**
   * 处理服务器端返回的结果集
   * @private
   */
  _processResponse: function(responseText){
    var _self = this,
      file = _self.get('file'),
      result;
    //格式化成json数据
    if(BUI.isString(responseText)){
      try{
        result = BUI.JSON.parse(responseText);
        // result = _self._fromUnicode(result);
      }catch(e){
        result = responseText;
      }
    }else if(BUI.isObject(responseText)){
      result = _self._fromUnicode(responseText);
    }
    BUI.log('服务器端输出：' + BUI.JSON.stringify(result));
    return result;
  },
  /**
   * 将unicode的中文转换成正常显示的文字，（为了修复flash的中文乱码问题）
   * @private
   */
  _fromUnicode:function(data){
      if(!BUI.isObject(data)) return data;
      _each(data);
      function _each(data){
          BUI.each(data,function(v,k){
              if(BUI.isObject(data[k])){
                  _each(data[k]);
              }else{
                  data[k] = BUI.isString(v) && BUI.fromUnicode(v) || v;
              }
          });
      }
      return data;
  },
  reset: function(){
  }
});

module.exports = UploadType;

});
define("bui/uploader/type/flash", ["jquery","bui/common"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview flash上传方案
 * @author 
 **/
var $ = require("jquery"),
    UploadType = require("bui/uploader/type/base");

var LOG_PREFIX = '[uploader-Flash]:';


//获取链接绝对路径正则
var URI_SPLIT_REG = new RegExp('^([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$'),
    HOSTNAME_SPLIT_REG = new RegExp('^(?:([\\w\\d+.-]+):)?(?://([\\w\\d\\-\\u0100-\\uffff.+%]*))?(:[\\d]*)?.*$');

/**
 * @class BUI.Uploader.UploadType.Flash
 * flash上传方案
 * 使用时要确认flash与提交的url是否跨越，如果跨越则需要设置crossdomain.xml
 * @extends BUI.Uploader.UploadType
 */
function FlashType(config) {
    var _self = this;
    //调用父类构造函数
    FlashType.superclass.constructor.call(_self, config);
}

BUI.extend(FlashType, UploadType, {
    /**
     * 初始化
     */
    _initSwfUploader:function () {
        var _self = this, swfUploader = _self.get('swfUploader');
        if(!swfUploader){
            BUI.log(LOG_PREFIX + 'swfUploader对象为空！');
            return false;
        }
        //初始化swf时swf已经ready，所以这里直接fire swfReady事件
        _self.fire('swfReady');

        //测试是否存在crossdomain.xml
        _self._hasCrossdomain();

        //监听开始上传事件
        swfUploader.on('uploadStart', function(ev){
            var file = _self.get('file');
            _self.fire('start', {file: file});
        });
        //监听文件正在上传事件
        swfUploader.on('uploadProgress', function(ev){
            BUI.mix(ev, {
                //已经读取的文件字节数
                loaded:ev.bytesLoaded,
                //文件总共字节数
                total : ev.bytesTotal
            });
            BUI.log(LOG_PREFIX + '已经上传字节数为：' + ev.bytesLoaded);
            _self.fire('progress', { 'loaded':ev.loaded, 'total':ev.total });
        });
        //监听文件上传完成事件
        swfUploader.on('uploadCompleteData', function(ev){
            var file = _self.get('file'),
                result = _self._processResponse(ev.data);
            _self.fire('complete', {result: result, file: file});
            _self.set('file', null);
        });
        //监听文件失败事件
        swfUploader.on('uploadError',function(){
            var file = _self.get('file');
            _self.fire('error', {file: file});
            _self.set('file', null);
        });
    },
    /**
     * 上传文件
     * @param {String} id 文件id
     * @return {BUI.Uploader.UploadType.Flash}
     * @chainable
     */
    upload:function (file) {
        var _self = this,
            swfUploader = _self.get('swfUploader'),
            url = _self.get('url'),
            method = 'POST',
            data = _self.get('data'),
            name = _self.get('fileDataName');
        if(!file){
            return;
        }
        _self.set('file', file);
        swfUploader.upload(file.id, url, method, data, name);
        return _self;
    },
    /**
     * 停止上传文件
     * @return {BUI.Uploader.UploadType.Flash}
     * @chainable
     */
    cancel: function () {
        var _self = this,
            swfUploader = _self.get('swfUploader'),
            file = _self.get('file');
        if(file){
            swfUploader.cancel(file.id);
            _self.fire('cancel', {file: file});
            _self.set('file', null);
        }
        return _self;
    },
    /**
     * 应用是否有flash跨域策略文件
     * @private
     * 2014-01-13 应该判断swf的路径上提交上传接口的路径是否同域
     */
    _hasCrossdomain: function(){
        var _self = this,

            // http://g.tbcdn.cn/fi/bui/upload.php => ['http://g.tbcdn.cn/fi/bui/upload.php', 'http', 'g.tbcdn.cn']
            url = _self.get('url').match(HOSTNAME_SPLIT_REG) || [],
            flashUrl = _self.get('swfUploader').get('src').match(HOSTNAME_SPLIT_REG) || [],
            urlDomain = url[2],
            flashUrlDomain = flashUrl[2],
            port = url[3] || '';

        //不同域时才去校验crossdomain
        if(urlDomain && flashUrlDomain && urlDomain !== flashUrlDomain){
            $.ajax({
                url: url[1] + '://' + urlDomain + port + '/crossdomain.xml',
                dataType:"xml",
                error:function(){
                   BUI.log('缺少crossdomain.xml文件或该文件不合法！');
                }
            });
        }
    }
}, {ATTRS:{
    uploader: {
        setter: function(v){
            var _self = this;
            if(v && v.isController){
                //因为flash上传需要依赖swfButton，所以是要等flash加载完成后才可以初始化的
                var swfButton = v.get('button');
                swfButton.on('swfReady', function(ev){
                    _self.set('swfUploader', ev.swfUploader);
                    _self._initSwfUploader();
                });
            }
        }
    },
    /**
     * 服务器端路径，留意flash必须是绝对路径
     */
    url:{
        setter: function(v){
            var reg = /^http/;
            //不是绝对路径拼接成绝对路径
            if(!reg.test(v)){
                //获取前面url部份
                //修复下如下链接问题：http://a.b.com/a.html?a=a/b/c#d/e/f => http://a.b.com/a.html
                var href = location.href.match(URI_SPLIT_REG) || [],
                    path = href[1] || '',
                    uris = path.split('/'),
                    newUris;
                newUris  = BUI.Array.filter(uris,function(item,i){
                    return i < uris.length - 1;
                });
                v = newUris.join('/') + '/' + v;
            }
            return v;
        }
    },
    /**
     * ajbridge的uploader组件的实例，必须参数
     */
    swfUploader:{},
    /**
     * 正在上传的文件id
     */
    uploadingId : {},
    /**
     * 事件列表
     */
    events:{
        value: {
            //swf文件已经准备就绪
            swfReady: false,
            /**
             * 上传正在上传时
             * @event
             * @param {Object} e 事件对象
             * @param {Number} total 文件的总大小
             * @param {Number} loaded 已经上传的大小
             */
            progress: false
        }
    }
}});

module.exports = FlashType;

});
define("bui/uploader/type/iframe", ["jquery","bui/common"], function(require, exports, module){
/**
 * @fileoverview iframe方案上传
 * @ignore
 **/
var $ = require("jquery"),
    UploadType = require("bui/uploader/type/base");

var ID_PREFIX = 'bui-uploader-iframe-';

/**
 * @class BUI.Uploader.UploadType.Iframe
 * iframe方案上传，全浏览器支持
 * @extends BUI.Uploader.UploadType
 *
 */
function IframeType(config) {
    var _self = this;
    //调用父类构造函数
    IframeType.superclass.constructor.call(_self, config);
}

//继承于Base，属性getter和setter委托于Base处理
BUI.extend(IframeType, UploadType,{
    /**
     * 上传文件
     * @param {HTMLElement} fileInput 文件input
     */
    upload : function(file) {
        var _self = this,
            input = file.input,
            form;
        if (!file){
            return false
        };
        _self.fire('start', {file: file});
        _self.set('file', file);
        _self.set('fileInput', input);
        //创建iframe和form
        _self._create();
        form = _self.get('form');
        //提交表单到iframe内
        form && form[0].submit();
    },
    /**
     * 取消上传
     * @return {BUI.Uploader.UploadType.Iframe}
     */
    cancel : function() {
        var self = this,iframe = self.get('iframe');
        //iframe.attr('src', 'javascript:"<html></html>";');
        self.reset();
        self.fire('cancel');
        // self.fire('error', {status : 'abort',msg : '上传失败，原因：abort'});
        return self;
    },
    /**
     * 将参数数据转换成hidden元素
     * @param {Object} data 对象数据
     * @return {String} hiddenInputHtml hidden元素html片段
     */
    dataToHidden : function(data) {
        if (!$.isPlainObject(data) || $.isEmptyObject(data)) return '';
        var self = this,
            hiddenInputHtml = [],
            //hidden元素模板
            tpl = self.get('tpl'),
            hiddenTpl = tpl.HIDDEN_INPUT;
        if (!BUI.isString(hiddenTpl)) return '';
        for (var k in data) {
            hiddenInputHtml.push(BUI.substitute(hiddenTpl, {'name' : k,'value' : data[k]}));
        }
        return hiddenInputHtml.join();
    },
    /**
     * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
     * @return {NodeList}
     */
    _createIframe : function() {
        var self = this,
            //iframe的id
            id = ID_PREFIX + BUI.guid(),
            //iframe模板
            tpl = self.get('tpl'),
            iframeTpl = tpl.IFRAME,
            existIframe = self.get('iframe'),
            iframe;
        //先判断是否已经存在iframe，存在直接返回iframe
        if (!$.isEmptyObject(existIframe)) return existIframe;

        //创建处理上传的iframe
        iframe = $(BUI.substitute(tpl.IFRAME, { 'id' : id }));
        //监听iframe的load事件
        $('body').append(iframe);
        iframe.on('load', function(ev){
            self._iframeLoadHandler(ev);
        });
        self.set('id',id);
        self.set('iframe', iframe);
        return iframe;
    },
    /**
     * iframe加载完成后触发（文件上传结束后）
     */
    _iframeLoadHandler : function(ev) {
        var self = this,iframe = ev.target,
            doc = iframe.contentDocument || window.frames[iframe.id].document,
            result;
        if (!doc || !doc.body) {
            self.fire('error', {msg : '服务器端返回数据有问题！'});
            return false;
        }
        var response = doc.body.innerHTML;
        //输出为直接退出
        if(response == ''){
            self.fire('error');
            return;
        };
        result = self._processResponse(response);

        self.fire('complete', {result: result, file: self.get('file')});
        self.reset();
    },
    /**
     * 创建文件上传表单
     * @return {NodeList}
     */
    _createForm : function() {
        var self = this,
            //iframe的id
            id = self.get('id'),
            //form模板
            tpl = self.get('tpl'),formTpl = tpl.FORM,
            //想要传送给服务器端的数据
            data = self.get('data'),
            //服务器端处理文件上传的路径
            action = self.get('url'),
            fileInput = self.get('fileInput'),
            hiddens,
            form;
        if (!BUI.isString(formTpl)) {
            return false;
        }
        if (!BUI.isString(action)) {
            return false;
        }
        hiddens = self.dataToHidden(data);
        hiddens += self.dataToHidden({"type":"iframe"});
        form = BUI.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
        //克隆文件域，并添加到form中
        form = $(form).append(fileInput);
        $('body').append(form);
        self.set('form', form);
        return form;
    },
    /**
     * 创建iframe和form
     */
    _create : function() {
        var _self = this,
            iframe = _self._createIframe(),
            form = _self._createForm();

        _self.fire('create', {iframe : iframe,form : form});
    },
    /**
     * 移除表单
     */
    _remove : function() {
        var self = this,form = self.get('form');
        if(!form)return false;
        //移除表单
        form.remove();
        //重置form属性
        self.set('form', null);
        self.fire('remove', {form : form});
    },
    reset: function(){
        var _self = this;
        _self._remove();
        _self.set('file', null);
    }
}, {ATTRS : {
    /**
     * iframe方案会用到的html模板，一般不需要修改
     * @type {String}
     * @default
     * {
     *   IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
     *   FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
     *   HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
     * }
     */
    tpl: {
        value: {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}" style="visibility: hidden;">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        }
    },
    /**
     * 只读，创建的iframeid,id为组件自动创建
     * @type {String}
     * @default  'ks-uploader-iframe-' +随机id
     */
    id: {value : ID_PREFIX + BUI.guid()},
    /**
     * iframe
     */
    iframe: {value : {}},
    form: {},
    fileInput: {},
    events: {
        value: {
            /**
             * 创建iframe和form后触发
             * @event
             * @param {Object} e 事件对象
             */
            create: false,
            /**
             * 删除form后触发
             * @event
             * @param {Object} e 事件对象
             */
            remove: false
        }
    }
}});

module.exports = IframeType;

});
define("bui/uploader/button/uploadify", ["jquery","bui/common"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview swfupload的上传
 * @author: 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common"),
  Component = BUI.Component,
  File = require("bui/uploader/file"),
  ButtonBase = require("bui/uploader/button/base"),
  baseUrl = getBaseUrl(),
  UploadifyPlugin = require("bui/uploader/plugins/uploadify");

function getBaseUrl(){
  if(window.seajs){
    if (seajs.pluginSDK && seajs.pluginSDK.util && seajs.pluginSDK.util.loaderDir) {
      return seajs.pluginSDK.util.loaderDir;
    } else {
      var paths = seajs.data.paths || {};
      return paths['bui'] || seajs.data.base;
    }
  }
  else if(window.KISSY){
    return KISSY.Config.packages['bui'].base;
  }
}

/**
 * 文件上传按钮，flash上传方式使用,使用的是flash
 * @class BUI.Uploader.Button.Uploadify
 * @extends BUI.Uploader.Button
 */
var Uploadify = ButtonBase.extend({
  renderUI: function(){
    var _self = this,
      buttonCls = _self.get('buttonCls'),
      buttonEl = _self.get('el').find('.' + buttonCls),
      flashCfg = _self.get('flash'),
      flashUrl = _self.get('flashUrl'),
      swfTpl = _self.get('swfTpl'),
      swfEl = $(swfTpl).appendTo(buttonEl),
      uploadifyEl = swfEl.find('input'),
      uploader = _self.get('uploader');

    var name = _self.get('name');

    // console.log(uploader);

    uploadifyEl.attr('name', name);
    uploadifyEl.attr('id', BUI.guid('bui-uploadify'));


    // uploadifyEl.uploadify({
    //   swf: flashUrl,
    //   uploader: uploader.get('url'),
    //   onSelect: function (file) {
    //     var files = [];
    //     files.push(File.create(file));
    //     _self.fire('change', {files: files});
    //   }
    // });
    // 
    
    _self.set('uploadifyEl', uploadifyEl);



    // console.log(UploadifyPlugin);
  }
},{
  ATTRS: {
    name: {},
    uploader: {
    },
    swfEl:{
    },
    /**
     * 上传uploader.swf的路径，默认为bui/uploader/uploader.swf
     * @type {String} url
     */
    flashUrl:{
      value: baseUrl + '/uploadify.swf'
    },
    swfTpl:{
      view: true,
      value: '<div class="uploader-button-swf"><input type="file"/></div>'
    }
  }
}, {
  xclass: 'uploader-uploadify'
});

module.exports = Uploadify;

});
define("bui/uploader/plugins/uploadify", ["jquery"], function(require, exports, module){
/*
SWFObject v2.2 <http://code.google.com/p/swfobject/> 
is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
;var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;
if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;
X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);
ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0;}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");
if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)];}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac};
}(),k=function(){if(!M.w3){return;}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f();
}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false);}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);
f();}});if(O==top){(function(){if(J){return;}try{j.documentElement.doScroll("left");}catch(X){setTimeout(arguments.callee,0);return;}f();})();}}if(M.wk){(function(){if(J){return;
}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return;}f();})();}s(f);}}();function f(){if(J){return;}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));
Z.parentNode.removeChild(Z);}catch(aa){return;}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]();}}function K(X){if(J){X();}else{U[U.length]=X;}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false);
}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false);}else{if(typeof O.attachEvent!=D){i(O,"onload",Y);}else{if(typeof O.onload=="function"){var X=O.onload;
O.onload=function(){X();Y();};}else{O.onload=Y;}}}}}function h(){if(T){V();}else{H();}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);
aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");
M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)];}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return;}}X.removeChild(aa);Z=null;H();
})();}else{H();}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);
if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa);}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;
ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class");}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align");
}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value");
}}P(ai,ah,Y,ab);}else{p(ae);if(ab){ab(aa);}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z;}ab(aa);}}}}}function z(aa){var X=null;
var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y;}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z;}}}return X;}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312);
}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null;}else{l=ae;Q=X;}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310";
}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137";}j.title=j.title.slice(0,47)+" - Flash Player Installation";
var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac;
}else{ab.flashvars=ac;}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";
(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae);}else{setTimeout(arguments.callee,10);}})();}u(aa,ab,X);}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");
Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y);}else{setTimeout(arguments.callee,10);
}})();}else{Y.parentNode.replaceChild(g(Y),Y);}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML;}else{var Y=ab.getElementsByTagName(r)[0];
if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true));
}}}}}return aa;}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X;}if(aa){if(typeof ai.id==D){ai.id=Y;}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae];
}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"';}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"';}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />';
}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id);}else{var Z=C(r);Z.setAttribute("type",q);
for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac]);}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac]);
}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab]);}}aa.parentNode.replaceChild(Z,aa);X=Z;}}return X;}function e(Z,X,Y){var aa=C("param");
aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa);}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";
(function(){if(X.readyState==4){b(Y);}else{setTimeout(arguments.callee,10);}})();}else{X.parentNode.removeChild(X);}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null;
}}Y.parentNode.removeChild(Y);}}function c(Z){var X=null;try{X=j.getElementById(Z);}catch(Y){}return X;}function C(X){return j.createElement(X);}function i(Z,X,Y){Z.attachEvent(X,Y);
I[I.length]=[Z,X,Y];}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false;
}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return;}var aa=j.getElementsByTagName("head")[0];if(!aa){return;}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;
G=null;}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1];
}G=X;}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y);}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"));
}}}function w(Z,X){if(!m){return;}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y;}else{v("#"+Z,"visibility:"+Y);}}function L(Y){var Z=/[\\\"<>\.;]/;
var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y;}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;
for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2]);}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa]);}for(var Y in M){M[Y]=null;}M=null;for(var X in swfobject){swfobject[X]=null;
}swfobject=null;});}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;
w(ab,false);}else{if(Z){Z({success:false,id:ab});}}},getObjectById:function(X){if(M.w3){return z(X);}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};
if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al];}}aj.data=ab;
aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak];}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai];
}else{am.flashvars=ai+"="+Z[ai];}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true);}X.success=true;X.ref=an;}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);
return;}else{w(ah,true);}}if(ac){ac(X);}});}else{if(ac){ac(X);}}},switchOffAutoHideShow:function(){m=false;},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]};
},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X);}else{return undefined;}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y);
}},removeSWF:function(X){if(M.w3){y(X);}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X);}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;
if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1];}if(aa==null){return L(Z);}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)));
}}}return"";},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block";
}}if(E){E(B);}}a=false;}}};}();

/*
SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com

mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/

SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilzén and Mammon Media and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php
 
SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
http://www.opensource.org/licenses/mit-license.php
*/

var SWFUpload;if(SWFUpload==undefined){SWFUpload=function(a){this.initSWFUpload(a)}}SWFUpload.prototype.initSWFUpload=function(b){try{this.customSettings={};this.settings=b;this.eventQueue=[];this.movieName="SWFUpload_"+SWFUpload.movieCount++;this.movieElement=null;SWFUpload.instances[this.movieName]=this;this.initSettings();this.loadFlash();this.displayDebugInfo()}catch(a){delete SWFUpload.instances[this.movieName];throw a}};SWFUpload.instances={};SWFUpload.movieCount=0;SWFUpload.version="2.2.0 2009-03-25";SWFUpload.QUEUE_ERROR={QUEUE_LIMIT_EXCEEDED:-100,FILE_EXCEEDS_SIZE_LIMIT:-110,ZERO_BYTE_FILE:-120,INVALID_FILETYPE:-130};SWFUpload.UPLOAD_ERROR={HTTP_ERROR:-200,MISSING_UPLOAD_URL:-210,IO_ERROR:-220,SECURITY_ERROR:-230,UPLOAD_LIMIT_EXCEEDED:-240,UPLOAD_FAILED:-250,SPECIFIED_FILE_ID_NOT_FOUND:-260,FILE_VALIDATION_FAILED:-270,FILE_CANCELLED:-280,UPLOAD_STOPPED:-290};SWFUpload.FILE_STATUS={QUEUED:-1,IN_PROGRESS:-2,ERROR:-3,COMPLETE:-4,CANCELLED:-5};SWFUpload.BUTTON_ACTION={SELECT_FILE:-100,SELECT_FILES:-110,START_UPLOAD:-120};SWFUpload.CURSOR={ARROW:-1,HAND:-2};SWFUpload.WINDOW_MODE={WINDOW:"window",TRANSPARENT:"transparent",OPAQUE:"opaque"};SWFUpload.completeURL=function(a){if(typeof(a)!=="string"||a.match(/^https?:\/\//i)||a.match(/^\//)){return a}var c=window.location.protocol+"//"+window.location.hostname+(window.location.port?":"+window.location.port:"");var b=window.location.pathname.lastIndexOf("/");if(b<=0){path="/"}else{path=window.location.pathname.substr(0,b)+"/"}return path+a};SWFUpload.prototype.initSettings=function(){this.ensureDefault=function(b,a){this.settings[b]=(this.settings[b]==undefined)?a:this.settings[b]};this.ensureDefault("upload_url","");this.ensureDefault("preserve_relative_urls",false);this.ensureDefault("file_post_name","Filedata");this.ensureDefault("post_params",{});this.ensureDefault("use_query_string",false);this.ensureDefault("requeue_on_error",false);this.ensureDefault("http_success",[]);this.ensureDefault("assume_success_timeout",0);this.ensureDefault("file_types","*.*");this.ensureDefault("file_types_description","All Files");this.ensureDefault("file_size_limit",0);this.ensureDefault("file_upload_limit",0);this.ensureDefault("file_queue_limit",0);this.ensureDefault("flash_url","swfupload.swf");this.ensureDefault("prevent_swf_caching",true);this.ensureDefault("button_image_url","");this.ensureDefault("button_width",1);this.ensureDefault("button_height",1);this.ensureDefault("button_text","");this.ensureDefault("button_text_style","color: #000000; font-size: 16pt;");this.ensureDefault("button_text_top_padding",0);this.ensureDefault("button_text_left_padding",0);this.ensureDefault("button_action",SWFUpload.BUTTON_ACTION.SELECT_FILES);this.ensureDefault("button_disabled",false);this.ensureDefault("button_placeholder_id","");this.ensureDefault("button_placeholder",null);this.ensureDefault("button_cursor",SWFUpload.CURSOR.ARROW);this.ensureDefault("button_window_mode",SWFUpload.WINDOW_MODE.WINDOW);this.ensureDefault("debug",false);this.settings.debug_enabled=this.settings.debug;this.settings.return_upload_start_handler=this.returnUploadStart;this.ensureDefault("swfupload_loaded_handler",null);this.ensureDefault("file_dialog_start_handler",null);this.ensureDefault("file_queued_handler",null);this.ensureDefault("file_queue_error_handler",null);this.ensureDefault("file_dialog_complete_handler",null);this.ensureDefault("upload_start_handler",null);this.ensureDefault("upload_progress_handler",null);this.ensureDefault("upload_error_handler",null);this.ensureDefault("upload_success_handler",null);this.ensureDefault("upload_complete_handler",null);this.ensureDefault("debug_handler",this.debugMessage);this.ensureDefault("custom_settings",{});this.customSettings=this.settings.custom_settings;if(!!this.settings.prevent_swf_caching){this.settings.flash_url=this.settings.flash_url+(this.settings.flash_url.indexOf("?")<0?"?":"&")+"preventswfcaching="+new Date().getTime()}if(!this.settings.preserve_relative_urls){this.settings.upload_url=SWFUpload.completeURL(this.settings.upload_url);this.settings.button_image_url=SWFUpload.completeURL(this.settings.button_image_url)}delete this.ensureDefault};SWFUpload.prototype.loadFlash=function(){var a,b;if(document.getElementById(this.movieName)!==null){throw"ID "+this.movieName+" is already in use. The Flash Object could not be added"}a=document.getElementById(this.settings.button_placeholder_id)||this.settings.button_placeholder;if(a==undefined){throw"Could not find the placeholder element: "+this.settings.button_placeholder_id}b=document.createElement("div");b.innerHTML=this.getFlashHTML();a.parentNode.replaceChild(b.firstChild,a);if(window[this.movieName]==undefined){window[this.movieName]=this.getMovieElement()}};SWFUpload.prototype.getFlashHTML=function(){return['<object id="',this.movieName,'" type="application/x-shockwave-flash" data="',this.settings.flash_url,'" width="',this.settings.button_width,'" height="',this.settings.button_height,'" class="swfupload">','<param name="wmode" value="',this.settings.button_window_mode,'" />','<param name="movie" value="',this.settings.flash_url,'" />','<param name="quality" value="high" />','<param name="menu" value="false" />','<param name="allowScriptAccess" value="always" />','<param name="flashvars" value="'+this.getFlashVars()+'" />',"</object>"].join("")};SWFUpload.prototype.getFlashVars=function(){var b=this.buildParamString();var a=this.settings.http_success.join(",");return["movieName=",encodeURIComponent(this.movieName),"&amp;uploadURL=",encodeURIComponent(this.settings.upload_url),"&amp;useQueryString=",encodeURIComponent(this.settings.use_query_string),"&amp;requeueOnError=",encodeURIComponent(this.settings.requeue_on_error),"&amp;httpSuccess=",encodeURIComponent(a),"&amp;assumeSuccessTimeout=",encodeURIComponent(this.settings.assume_success_timeout),"&amp;params=",encodeURIComponent(b),"&amp;filePostName=",encodeURIComponent(this.settings.file_post_name),"&amp;fileTypes=",encodeURIComponent(this.settings.file_types),"&amp;fileTypesDescription=",encodeURIComponent(this.settings.file_types_description),"&amp;fileSizeLimit=",encodeURIComponent(this.settings.file_size_limit),"&amp;fileUploadLimit=",encodeURIComponent(this.settings.file_upload_limit),"&amp;fileQueueLimit=",encodeURIComponent(this.settings.file_queue_limit),"&amp;debugEnabled=",encodeURIComponent(this.settings.debug_enabled),"&amp;buttonImageURL=",encodeURIComponent(this.settings.button_image_url),"&amp;buttonWidth=",encodeURIComponent(this.settings.button_width),"&amp;buttonHeight=",encodeURIComponent(this.settings.button_height),"&amp;buttonText=",encodeURIComponent(this.settings.button_text),"&amp;buttonTextTopPadding=",encodeURIComponent(this.settings.button_text_top_padding),"&amp;buttonTextLeftPadding=",encodeURIComponent(this.settings.button_text_left_padding),"&amp;buttonTextStyle=",encodeURIComponent(this.settings.button_text_style),"&amp;buttonAction=",encodeURIComponent(this.settings.button_action),"&amp;buttonDisabled=",encodeURIComponent(this.settings.button_disabled),"&amp;buttonCursor=",encodeURIComponent(this.settings.button_cursor)].join("")};SWFUpload.prototype.getMovieElement=function(){if(this.movieElement==undefined){this.movieElement=document.getElementById(this.movieName)}if(this.movieElement===null){throw"Could not find Flash element"}return this.movieElement};SWFUpload.prototype.buildParamString=function(){var c=this.settings.post_params;var b=[];if(typeof(c)==="object"){for(var a in c){if(c.hasOwnProperty(a)){b.push(encodeURIComponent(a.toString())+"="+encodeURIComponent(c[a].toString()))}}}return b.join("&amp;")};SWFUpload.prototype.destroy=function(){try{this.cancelUpload(null,false);var a=null;a=this.getMovieElement();if(a&&typeof(a.CallFunction)==="unknown"){for(var c in a){try{if(typeof(a[c])==="function"){a[c]=null}}catch(e){}}try{a.parentNode.removeChild(a)}catch(b){}}window[this.movieName]=null;SWFUpload.instances[this.movieName]=null;delete SWFUpload.instances[this.movieName];this.movieElement=null;this.settings=null;this.customSettings=null;this.eventQueue=null;this.movieName=null;return true}catch(d){return false}};SWFUpload.prototype.displayDebugInfo=function(){this.debug(["---SWFUpload Instance Info---\n","Version: ",SWFUpload.version,"\n","Movie Name: ",this.movieName,"\n","Settings:\n","\t","upload_url:               ",this.settings.upload_url,"\n","\t","flash_url:                ",this.settings.flash_url,"\n","\t","use_query_string:         ",this.settings.use_query_string.toString(),"\n","\t","requeue_on_error:         ",this.settings.requeue_on_error.toString(),"\n","\t","http_success:             ",this.settings.http_success.join(", "),"\n","\t","assume_success_timeout:   ",this.settings.assume_success_timeout,"\n","\t","file_post_name:           ",this.settings.file_post_name,"\n","\t","post_params:              ",this.settings.post_params.toString(),"\n","\t","file_types:               ",this.settings.file_types,"\n","\t","file_types_description:   ",this.settings.file_types_description,"\n","\t","file_size_limit:          ",this.settings.file_size_limit,"\n","\t","file_upload_limit:        ",this.settings.file_upload_limit,"\n","\t","file_queue_limit:         ",this.settings.file_queue_limit,"\n","\t","debug:                    ",this.settings.debug.toString(),"\n","\t","prevent_swf_caching:      ",this.settings.prevent_swf_caching.toString(),"\n","\t","button_placeholder_id:    ",this.settings.button_placeholder_id.toString(),"\n","\t","button_placeholder:       ",(this.settings.button_placeholder?"Set":"Not Set"),"\n","\t","button_image_url:         ",this.settings.button_image_url.toString(),"\n","\t","button_width:             ",this.settings.button_width.toString(),"\n","\t","button_height:            ",this.settings.button_height.toString(),"\n","\t","button_text:              ",this.settings.button_text.toString(),"\n","\t","button_text_style:        ",this.settings.button_text_style.toString(),"\n","\t","button_text_top_padding:  ",this.settings.button_text_top_padding.toString(),"\n","\t","button_text_left_padding: ",this.settings.button_text_left_padding.toString(),"\n","\t","button_action:            ",this.settings.button_action.toString(),"\n","\t","button_disabled:          ",this.settings.button_disabled.toString(),"\n","\t","custom_settings:          ",this.settings.custom_settings.toString(),"\n","Event Handlers:\n","\t","swfupload_loaded_handler assigned:  ",(typeof this.settings.swfupload_loaded_handler==="function").toString(),"\n","\t","file_dialog_start_handler assigned: ",(typeof this.settings.file_dialog_start_handler==="function").toString(),"\n","\t","file_queued_handler assigned:       ",(typeof this.settings.file_queued_handler==="function").toString(),"\n","\t","file_queue_error_handler assigned:  ",(typeof this.settings.file_queue_error_handler==="function").toString(),"\n","\t","upload_start_handler assigned:      ",(typeof this.settings.upload_start_handler==="function").toString(),"\n","\t","upload_progress_handler assigned:   ",(typeof this.settings.upload_progress_handler==="function").toString(),"\n","\t","upload_error_handler assigned:      ",(typeof this.settings.upload_error_handler==="function").toString(),"\n","\t","upload_success_handler assigned:    ",(typeof this.settings.upload_success_handler==="function").toString(),"\n","\t","upload_complete_handler assigned:   ",(typeof this.settings.upload_complete_handler==="function").toString(),"\n","\t","debug_handler assigned:             ",(typeof this.settings.debug_handler==="function").toString(),"\n"].join(""))};SWFUpload.prototype.addSetting=function(b,c,a){if(c==undefined){return(this.settings[b]=a)}else{return(this.settings[b]=c)}};SWFUpload.prototype.getSetting=function(a){if(this.settings[a]!=undefined){return this.settings[a]}return""};SWFUpload.prototype.callFlash=function(functionName,argumentArray){argumentArray=argumentArray||[];var movieElement=this.getMovieElement();var returnValue,returnString;try{returnString=movieElement.CallFunction('<invoke name="'+functionName+'" returntype="javascript">'+__flash__argumentsToXML(argumentArray,0)+"</invoke>");returnValue=eval(returnString)}catch(ex){throw"Call to "+functionName+" failed"}if(returnValue!=undefined&&typeof returnValue.post==="object"){returnValue=this.unescapeFilePostParams(returnValue)}return returnValue};SWFUpload.prototype.selectFile=function(){this.callFlash("SelectFile")};SWFUpload.prototype.selectFiles=function(){this.callFlash("SelectFiles")};SWFUpload.prototype.startUpload=function(a){this.callFlash("StartUpload",[a])};SWFUpload.prototype.cancelUpload=function(a,b){if(b!==false){b=true}this.callFlash("CancelUpload",[a,b])};SWFUpload.prototype.stopUpload=function(){this.callFlash("StopUpload")};SWFUpload.prototype.getStats=function(){return this.callFlash("GetStats")};SWFUpload.prototype.setStats=function(a){this.callFlash("SetStats",[a])};SWFUpload.prototype.getFile=function(a){if(typeof(a)==="number"){return this.callFlash("GetFileByIndex",[a])}else{return this.callFlash("GetFile",[a])}};SWFUpload.prototype.addFileParam=function(a,b,c){return this.callFlash("AddFileParam",[a,b,c])};SWFUpload.prototype.removeFileParam=function(a,b){this.callFlash("RemoveFileParam",[a,b])};SWFUpload.prototype.setUploadURL=function(a){this.settings.upload_url=a.toString();this.callFlash("SetUploadURL",[a])};SWFUpload.prototype.setPostParams=function(a){this.settings.post_params=a;this.callFlash("SetPostParams",[a])};SWFUpload.prototype.addPostParam=function(a,b){this.settings.post_params[a]=b;this.callFlash("SetPostParams",[this.settings.post_params])};SWFUpload.prototype.removePostParam=function(a){delete this.settings.post_params[a];this.callFlash("SetPostParams",[this.settings.post_params])};SWFUpload.prototype.setFileTypes=function(a,b){this.settings.file_types=a;this.settings.file_types_description=b;this.callFlash("SetFileTypes",[a,b])};SWFUpload.prototype.setFileSizeLimit=function(a){this.settings.file_size_limit=a;this.callFlash("SetFileSizeLimit",[a])};SWFUpload.prototype.setFileUploadLimit=function(a){this.settings.file_upload_limit=a;this.callFlash("SetFileUploadLimit",[a])};SWFUpload.prototype.setFileQueueLimit=function(a){this.settings.file_queue_limit=a;this.callFlash("SetFileQueueLimit",[a])};SWFUpload.prototype.setFilePostName=function(a){this.settings.file_post_name=a;this.callFlash("SetFilePostName",[a])};SWFUpload.prototype.setUseQueryString=function(a){this.settings.use_query_string=a;this.callFlash("SetUseQueryString",[a])};SWFUpload.prototype.setRequeueOnError=function(a){this.settings.requeue_on_error=a;this.callFlash("SetRequeueOnError",[a])};SWFUpload.prototype.setHTTPSuccess=function(a){if(typeof a==="string"){a=a.replace(" ","").split(",")}this.settings.http_success=a;this.callFlash("SetHTTPSuccess",[a])};SWFUpload.prototype.setAssumeSuccessTimeout=function(a){this.settings.assume_success_timeout=a;this.callFlash("SetAssumeSuccessTimeout",[a])};SWFUpload.prototype.setDebugEnabled=function(a){this.settings.debug_enabled=a;this.callFlash("SetDebugEnabled",[a])};SWFUpload.prototype.setButtonImageURL=function(a){if(a==undefined){a=""}this.settings.button_image_url=a;this.callFlash("SetButtonImageURL",[a])};SWFUpload.prototype.setButtonDimensions=function(c,a){this.settings.button_width=c;this.settings.button_height=a;var b=this.getMovieElement();if(b!=undefined){b.style.width=c+"px";b.style.height=a+"px"}this.callFlash("SetButtonDimensions",[c,a])};SWFUpload.prototype.setButtonText=function(a){this.settings.button_text=a;this.callFlash("SetButtonText",[a])};SWFUpload.prototype.setButtonTextPadding=function(b,a){this.settings.button_text_top_padding=a;this.settings.button_text_left_padding=b;this.callFlash("SetButtonTextPadding",[b,a])};SWFUpload.prototype.setButtonTextStyle=function(a){this.settings.button_text_style=a;this.callFlash("SetButtonTextStyle",[a])};SWFUpload.prototype.setButtonDisabled=function(a){this.settings.button_disabled=a;this.callFlash("SetButtonDisabled",[a])};SWFUpload.prototype.setButtonAction=function(a){this.settings.button_action=a;this.callFlash("SetButtonAction",[a])};SWFUpload.prototype.setButtonCursor=function(a){this.settings.button_cursor=a;this.callFlash("SetButtonCursor",[a])};SWFUpload.prototype.queueEvent=function(b,c){if(c==undefined){c=[]}else{if(!(c instanceof Array)){c=[c]}}var a=this;if(typeof this.settings[b]==="function"){this.eventQueue.push(function(){this.settings[b].apply(this,c)});setTimeout(function(){a.executeNextEvent()},0)}else{if(this.settings[b]!==null){throw"Event handler "+b+" is unknown or is not a function"}}};SWFUpload.prototype.executeNextEvent=function(){var a=this.eventQueue?this.eventQueue.shift():null;if(typeof(a)==="function"){a.apply(this)}};SWFUpload.prototype.unescapeFilePostParams=function(c){var e=/[$]([0-9a-f]{4})/i;var f={};var d;if(c!=undefined){for(var a in c.post){if(c.post.hasOwnProperty(a)){d=a;var b;while((b=e.exec(d))!==null){d=d.replace(b[0],String.fromCharCode(parseInt("0x"+b[1],16)))}f[d]=c.post[a]}}c.post=f}return c};SWFUpload.prototype.testExternalInterface=function(){try{return this.callFlash("TestExternalInterface")}catch(a){return false}};SWFUpload.prototype.flashReady=function(){var a=this.getMovieElement();if(!a){this.debug("Flash called back ready but the flash movie can't be found.");return}this.cleanUp(a);this.queueEvent("swfupload_loaded_handler")};SWFUpload.prototype.cleanUp=function(a){try{if(this.movieElement&&typeof(a.CallFunction)==="unknown"){this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");for(var c in a){try{if(typeof(a[c])==="function"){a[c]=null}}catch(b){}}}}catch(d){}window.__flash__removeCallback=function(e,f){try{if(e){e[f]=null}}catch(g){}}};SWFUpload.prototype.fileDialogStart=function(){this.queueEvent("file_dialog_start_handler")};SWFUpload.prototype.fileQueued=function(a){a=this.unescapeFilePostParams(a);this.queueEvent("file_queued_handler",a)};SWFUpload.prototype.fileQueueError=function(a,c,b){a=this.unescapeFilePostParams(a);this.queueEvent("file_queue_error_handler",[a,c,b])};SWFUpload.prototype.fileDialogComplete=function(b,c,a){this.queueEvent("file_dialog_complete_handler",[b,c,a])};SWFUpload.prototype.uploadStart=function(a){a=this.unescapeFilePostParams(a);this.queueEvent("return_upload_start_handler",a)};SWFUpload.prototype.returnUploadStart=function(a){var b;if(typeof this.settings.upload_start_handler==="function"){a=this.unescapeFilePostParams(a);b=this.settings.upload_start_handler.call(this,a)}else{if(this.settings.upload_start_handler!=undefined){throw"upload_start_handler must be a function"}}if(b===undefined){b=true}b=!!b;this.callFlash("ReturnUploadStart",[b])};SWFUpload.prototype.uploadProgress=function(a,c,b){a=this.unescapeFilePostParams(a);this.queueEvent("upload_progress_handler",[a,c,b])};SWFUpload.prototype.uploadError=function(a,c,b){a=this.unescapeFilePostParams(a);this.queueEvent("upload_error_handler",[a,c,b])};SWFUpload.prototype.uploadSuccess=function(b,a,c){b=this.unescapeFilePostParams(b);this.queueEvent("upload_success_handler",[b,a,c])};SWFUpload.prototype.uploadComplete=function(a){a=this.unescapeFilePostParams(a);this.queueEvent("upload_complete_handler",a)};SWFUpload.prototype.debug=function(a){this.queueEvent("debug_handler",a)};SWFUpload.prototype.debugMessage=function(c){if(this.settings.debug){var a,d=[];if(typeof c==="object"&&typeof c.name==="string"&&typeof c.message==="string"){for(var b in c){if(c.hasOwnProperty(b)){d.push(b+": "+c[b])}}a=d.join("\n")||"";d=a.split("\n");a="EXCEPTION: "+d.join("\nEXCEPTION: ");SWFUpload.Console.writeLine(a)}else{SWFUpload.Console.writeLine(c)}}};SWFUpload.Console={};SWFUpload.Console.writeLine=function(d){var b,a;try{b=document.getElementById("SWFUpload_Console");if(!b){a=document.createElement("form");document.getElementsByTagName("body")[0].appendChild(a);b=document.createElement("textarea");b.id="SWFUpload_Console";b.style.fontFamily="monospace";b.setAttribute("wrap","off");b.wrap="off";b.style.overflow="auto";b.style.width="700px";b.style.height="350px";b.style.margin="5px";a.appendChild(b)}b.value+=d+"\n";b.scrollTop=b.scrollHeight-b.clientHeight}catch(c){alert("Exception: "+c.name+" Message: "+c.message)}};

/*
Uploadify v3.2.1
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

var $ = require("jquery");

  // These methods can be called by adding them as the first argument in the uploadify plugin call
  var methods = {

    init : function(options, swfUploadOptions) {
      
      return this.each(function() {

        // Create a reference to the jQuery DOM object
        var $this = $(this);

        // Clone the original DOM object
        var $clone = $this.clone();

        // Setup the default options
        var settings = $.extend({
          // Required Settings
          id       : $this.attr('id'), // The ID of the DOM object
          swf      : 'uploadify.swf',  // The path to the uploadify SWF file
          uploader : 'uploadify.php',  // The path to the server-side upload script
          
          // Options
          auto            : true,               // Automatically upload files when added to the queue
          buttonClass     : '',                 // A class name to add to the browse button DOM object
          buttonCursor    : 'hand',             // The cursor to use with the browse button
          buttonImage     : null,               // (String or null) The path to an image to use for the Flash browse button if not using CSS to style the button
          buttonText      : 'SELECT FILES',     // The text to use for the browse button
          checkExisting   : false,              // The path to a server-side script that checks for existing files on the server
          debug           : false,              // Turn on swfUpload debugging mode
          fileObjName     : 'Filedata',         // The name of the file object to use in your server-side script
          fileSizeLimit   : 0,                  // The maximum size of an uploadable file in KB (Accepts units B KB MB GB if string, 0 for no limit)
          fileTypeDesc    : 'All Files',        // The description for file types in the browse dialog
          fileTypeExts    : '*.*',              // Allowed extensions in the browse dialog (server-side validation should also be used)
          height          : 30,                 // The height of the browse button
          itemTemplate    : false,              // The template for the file item in the queue
          method          : 'post',             // The method to use when sending files to the server-side upload script
          multi           : true,               // Allow multiple file selection in the browse dialog
          formData        : {},                 // An object with additional data to send to the server-side upload script with every file upload
          preventCaching  : true,               // Adds a random value to the Flash URL to prevent caching of it (conflicts with existing parameters)
          progressData    : 'percentage',       // ('percentage' or 'speed') Data to show in the queue item during a file upload
          queueID         : false,              // The ID of the DOM object to use as a file queue (without the #)
          queueSizeLimit  : 999,                // The maximum number of files that can be in the queue at one time
          removeCompleted : true,               // Remove queue items from the queue when they are done uploading
          removeTimeout   : 3,                  // The delay in seconds before removing a queue item if removeCompleted is set to true
          requeueErrors   : false,              // Keep errored files in the queue and keep trying to upload them
          successTimeout  : 30,                 // The number of seconds to wait for Flash to detect the server's response after the file has finished uploading
          uploadLimit     : 0,                  // The maximum number of files you can upload
          width           : 120,                // The width of the browse button
          
          // Events
          overrideEvents  : []             // (Array) A list of default event handlers to skip
          /*
          onCancel         // Triggered when a file is cancelled from the queue
          onClearQueue     // Triggered during the 'clear queue' method
          onDestroy        // Triggered when the uploadify object is destroyed
          onDialogClose    // Triggered when the browse dialog is closed
          onDialogOpen     // Triggered when the browse dialog is opened
          onDisable        // Triggered when the browse button gets disabled
          onEnable         // Triggered when the browse button gets enabled
          onFallback       // Triggered is Flash is not detected    
          onInit           // Triggered when Uploadify is initialized
          onQueueComplete  // Triggered when all files in the queue have been uploaded
          onSelectError    // Triggered when an error occurs while selecting a file (file size, queue size limit, etc.)
          onSelect         // Triggered for each file that is selected
          onSWFReady       // Triggered when the SWF button is loaded
          onUploadComplete // Triggered when a file upload completes (success or error)
          onUploadError    // Triggered when a file upload returns an error
          onUploadSuccess  // Triggered when a file is uploaded successfully
          onUploadProgress // Triggered every time a file progress is updated
          onUploadStart    // Triggered immediately before a file upload starts
          */
        }, options);

        // Prepare settings for SWFUpload
        var swfUploadSettings = {
          assume_success_timeout   : settings.successTimeout,
          button_placeholder_id    : settings.id,
          button_width             : settings.width,
          button_height            : settings.height,
          button_text              : null,
          button_text_style        : null,
          button_text_top_padding  : 0,
          button_text_left_padding : 0,
          button_action            : (settings.multi ? SWFUpload.BUTTON_ACTION.SELECT_FILES : SWFUpload.BUTTON_ACTION.SELECT_FILE),
          button_disabled          : false,
          button_cursor            : (settings.buttonCursor == 'arrow' ? SWFUpload.CURSOR.ARROW : SWFUpload.CURSOR.HAND),
          button_window_mode       : SWFUpload.WINDOW_MODE.TRANSPARENT,
          debug                    : settings.debug,            
          requeue_on_error         : settings.requeueErrors,
          file_post_name           : settings.fileObjName,
          file_size_limit          : settings.fileSizeLimit,
          file_types               : settings.fileTypeExts,
          file_types_description   : settings.fileTypeDesc,
          file_queue_limit         : settings.queueSizeLimit,
          file_upload_limit        : settings.uploadLimit,
          flash_url                : settings.swf,          
          prevent_swf_caching      : settings.preventCaching,
          post_params              : settings.formData,
          upload_url               : settings.uploader,
          use_query_string         : (settings.method == 'get'),
          
          // Event Handlers 
          file_dialog_complete_handler : handlers.onDialogClose,
          file_dialog_start_handler    : handlers.onDialogOpen,
          file_queued_handler          : handlers.onSelect,
          file_queue_error_handler     : handlers.onSelectError,
          swfupload_loaded_handler     : settings.onSWFReady,
          upload_complete_handler      : handlers.onUploadComplete,
          upload_error_handler         : handlers.onUploadError,
          upload_progress_handler      : handlers.onUploadProgress,
          upload_start_handler         : handlers.onUploadStart,
          upload_success_handler       : handlers.onUploadSuccess
        }

        // Merge the user-defined options with the defaults
        if (swfUploadOptions) {
          swfUploadSettings = $.extend(swfUploadSettings, swfUploadOptions);
        }
        // Add the user-defined settings to the swfupload object
        swfUploadSettings = $.extend(swfUploadSettings, settings);
        
        // Detect if Flash is available
        var playerVersion  = swfobject.getFlashPlayerVersion();
        var flashInstalled = (playerVersion.major >= 9);

        if (flashInstalled) {
          // Create the swfUpload instance
          window['uploadify_' + settings.id] = new SWFUpload(swfUploadSettings);
          var swfuploadify = window['uploadify_' + settings.id];

          // Add the SWFUpload object to the elements data object
          $this.data('uploadify', swfuploadify);
          
          // Wrap the instance
          var $wrapper = $('<div />', {
            'id'    : settings.id,
            'class' : 'uploadify',
            'css'   : {
                  'height'   : settings.height + 'px',
                  'width'    : settings.width + 'px'
                  }
          });
          $('#' + swfuploadify.movieName).wrap($wrapper);
          // Recreate the reference to wrapper
          $wrapper = $('#' + settings.id);
          // Add the data object to the wrapper 
          $wrapper.data('uploadify', swfuploadify);

          // Create the button
          var $button = $('<div />', {
            'id'    : settings.id + '-button',
            'class' : 'uploadify-button ' + settings.buttonClass
          });
          if (settings.buttonImage) {
            $button.css({
              'background-image' : "url('" + settings.buttonImage + "')",
              'text-indent'      : '-9999px'
            });
          }
          $button.html('<span class="uploadify-button-text">' + settings.buttonText + '</span>')
          .css({
            'height'      : settings.height + 'px',
            'line-height' : settings.height + 'px',
            'width'       : settings.width + 'px'
          });
          // Append the button to the wrapper
          $wrapper.append($button);

          // Adjust the styles of the movie
          // $('#' + swfuploadify.movieName).css({
          //   'position' : 'absolute',
          //   'z-index'  : 1
          // });
          
          // Create the file queue
          if (!settings.queueID) {
            var $queue = $('<div />', {
              'id'    : settings.id + '-queue',
              'class' : 'uploadify-queue'
            });
            $wrapper.after($queue);
            swfuploadify.settings.queueID      = settings.id + '-queue';
            swfuploadify.settings.defaultQueue = true;
          }
          
          // Create some queue related objects and variables
          swfuploadify.queueData = {
            files              : {}, // The files in the queue
            filesSelected      : 0, // The number of files selected in the last select operation
            filesQueued        : 0, // The number of files added to the queue in the last select operation
            filesReplaced      : 0, // The number of files replaced in the last select operation
            filesCancelled     : 0, // The number of files that were cancelled instead of replaced
            filesErrored       : 0, // The number of files that caused error in the last select operation
            uploadsSuccessful  : 0, // The number of files that were successfully uploaded
            uploadsErrored     : 0, // The number of files that returned errors during upload
            averageSpeed       : 0, // The average speed of the uploads in KB
            queueLength        : 0, // The number of files in the queue
            queueSize          : 0, // The size in bytes of the entire queue
            uploadSize         : 0, // The size in bytes of the upload queue
            queueBytesUploaded : 0, // The size in bytes that have been uploaded for the current upload queue
            uploadQueue        : [], // The files currently to be uploaded
            errorMsg           : 'Some files were not added to the queue:'
          };

          // Save references to all the objects
          swfuploadify.original = $clone;
          swfuploadify.wrapper  = $wrapper;
          swfuploadify.button   = $button;
          swfuploadify.queue    = $queue;

          // Call the user-defined init event handler
          if (settings.onInit) settings.onInit.call($this, swfuploadify);

        } else {

          // Call the fallback function
          if (settings.onFallback) settings.onFallback.call($this);

        }
      });

    },

    // Stop a file upload and remove it from the queue 
    cancel : function(fileID, supressEvent) {

      var args = arguments;

      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify'),
          settings     = swfuploadify.settings,
          delay        = -1;

        if (args[0]) {
          // Clear the queue
          if (args[0] == '*') {
            var queueItemCount = swfuploadify.queueData.queueLength;
            $('#' + settings.queueID).find('.uploadify-queue-item').each(function() {
              delay++;
              if (args[1] === true) {
                swfuploadify.cancelUpload($(this).attr('id'), false);
              } else {
                swfuploadify.cancelUpload($(this).attr('id'));
              }
              $(this).find('.data').removeClass('data').html(' - Cancelled');
              $(this).find('.uploadify-progress-bar').remove();
              $(this).delay(1000 + 100 * delay).fadeOut(500, function() {
                $(this).remove();
              });
            });
            swfuploadify.queueData.queueSize   = 0;
            swfuploadify.queueData.queueLength = 0;
            // Trigger the onClearQueue event
            if (settings.onClearQueue) settings.onClearQueue.call($this, queueItemCount);
          } else {
            for (var n = 0; n < args.length; n++) {
              swfuploadify.cancelUpload(args[n]);
              $('#' + args[n]).find('.data').removeClass('data').html(' - Cancelled');
              $('#' + args[n]).find('.uploadify-progress-bar').remove();
              $('#' + args[n]).delay(1000 + 100 * n).fadeOut(500, function() {
                $(this).remove();
              });
            }
          }
        } else {
          var item = $('#' + settings.queueID).find('.uploadify-queue-item').get(0);
          $item = $(item);
          swfuploadify.cancelUpload($item.attr('id'));
          $item.find('.data').removeClass('data').html(' - Cancelled');
          $item.find('.uploadify-progress-bar').remove();
          $item.delay(1000).fadeOut(500, function() {
            $(this).remove();
          });
        }
      });

    },

    // Revert the DOM object back to its original state
    destroy : function() {

      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify'),
          settings     = swfuploadify.settings;

        // Destroy the SWF object and 
        swfuploadify.destroy();
        
        // Destroy the queue
        if (settings.defaultQueue) {
          $('#' + settings.queueID).remove();
        }
        
        // Reload the original DOM element
        $('#' + settings.id).replaceWith(swfuploadify.original);

        // Call the user-defined event handler
        if (settings.onDestroy) settings.onDestroy.call(this);

        delete swfuploadify;
      });

    },

    // Disable the select button
    disable : function(isDisabled) {
      
      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify'),
          settings     = swfuploadify.settings;

        // Call the user-defined event handlers
        if (isDisabled) {
          swfuploadify.button.addClass('disabled');
          if (settings.onDisable) settings.onDisable.call(this);
        } else {
          swfuploadify.button.removeClass('disabled');
          if (settings.onEnable) settings.onEnable.call(this);
        }

        // Enable/disable the browse button
        swfuploadify.setButtonDisabled(isDisabled);
      });

    },

    // Get or set the settings data
    settings : function(name, value, resetObjects) {

      var args        = arguments;
      var returnValue = value;

      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify'),
          settings     = swfuploadify.settings;

        if (typeof(args[0]) == 'object') {
          for (var n in value) {
            setData(n,value[n]);
          }
        }
        if (args.length === 1) {
          returnValue =  settings[name];
        } else {
          switch (name) {
            case 'uploader':
              swfuploadify.setUploadURL(value);
              break;
            case 'formData':
              if (!resetObjects) {
                value = $.extend(settings.formData, value);
              }
              swfuploadify.setPostParams(settings.formData);
              break;
            case 'method':
              if (value == 'get') {
                swfuploadify.setUseQueryString(true);
              } else {
                swfuploadify.setUseQueryString(false);
              }
              break;
            case 'fileObjName':
              swfuploadify.setFilePostName(value);
              break;
            case 'fileTypeExts':
              swfuploadify.setFileTypes(value, settings.fileTypeDesc);
              break;
            case 'fileTypeDesc':
              swfuploadify.setFileTypes(settings.fileTypeExts, value);
              break;
            case 'fileSizeLimit':
              swfuploadify.setFileSizeLimit(value);
              break;
            case 'uploadLimit':
              swfuploadify.setFileUploadLimit(value);
              break;
            case 'queueSizeLimit':
              swfuploadify.setFileQueueLimit(value);
              break;
            case 'buttonImage':
              swfuploadify.button.css('background-image', settingValue);
              break;
            case 'buttonCursor':
              if (value == 'arrow') {
                swfuploadify.setButtonCursor(SWFUpload.CURSOR.ARROW);
              } else {
                swfuploadify.setButtonCursor(SWFUpload.CURSOR.HAND);
              }
              break;
            case 'buttonText':
              $('#' + settings.id + '-button').find('.uploadify-button-text').html(value);
              break;
            case 'width':
              swfuploadify.setButtonDimensions(value, settings.height);
              break;
            case 'height':
              swfuploadify.setButtonDimensions(settings.width, value);
              break;
            case 'multi':
              if (value) {
                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILES);
              } else {
                swfuploadify.setButtonAction(SWFUpload.BUTTON_ACTION.SELECT_FILE);
              }
              break;
          }
          settings[name] = value;
        }
      });
      
      if (args.length === 1) {
        return returnValue;
      }

    },

    // Stop the current uploads and requeue what is in progress
    stop : function() {

      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify');

        // Reset the queue information
        swfuploadify.queueData.averageSpeed  = 0;
        swfuploadify.queueData.uploadSize    = 0;
        swfuploadify.queueData.bytesUploaded = 0;
        swfuploadify.queueData.uploadQueue   = [];

        swfuploadify.stopUpload();
      });

    },

    // Start uploading files in the queue
    upload : function() {

      var args = arguments;

      this.each(function() {
        // Create a reference to the jQuery DOM object
        var $this        = $(this),
          swfuploadify = $this.data('uploadify');

        // Reset the queue information
        swfuploadify.queueData.averageSpeed  = 0;
        swfuploadify.queueData.uploadSize    = 0;
        swfuploadify.queueData.bytesUploaded = 0;
        swfuploadify.queueData.uploadQueue   = [];
        
        // Upload the files
        if (args[0]) {
          if (args[0] == '*') {
            swfuploadify.queueData.uploadSize = swfuploadify.queueData.queueSize;
            swfuploadify.queueData.uploadQueue.push('*');
            swfuploadify.startUpload();
          } else {
            for (var n = 0; n < args.length; n++) {
              swfuploadify.queueData.uploadSize += swfuploadify.queueData.files[args[n]].size;
              swfuploadify.queueData.uploadQueue.push(args[n]);
            }
            swfuploadify.startUpload(swfuploadify.queueData.uploadQueue.shift());
          }
        } else {
          swfuploadify.startUpload();
        }

      });

    }

  }

  // These functions handle all the events that occur with the file uploader
  var handlers = {

    // Triggered when the file dialog is opened
    onDialogOpen : function() {
      // Load the swfupload settings
      var settings = this.settings;

      // Reset some queue info
      this.queueData.errorMsg       = 'Some files were not added to the queue:';
      this.queueData.filesReplaced  = 0;
      this.queueData.filesCancelled = 0;

      // Call the user-defined event handler
      if (settings.onDialogOpen) settings.onDialogOpen.call(this);
    },

    // Triggered when the browse dialog is closed
    onDialogClose :  function(filesSelected, filesQueued, queueLength) {
      // Load the swfupload settings
      var settings = this.settings;

      // Update the queue information
      this.queueData.filesErrored  = filesSelected - filesQueued;
      this.queueData.filesSelected = filesSelected;
      this.queueData.filesQueued   = filesQueued - this.queueData.filesCancelled;
      this.queueData.queueLength   = queueLength;

      // Run the default event handler
      if ($.inArray('onDialogClose', settings.overrideEvents) < 0) {
        if (this.queueData.filesErrored > 0) {
          alert(this.queueData.errorMsg);
        }
      }

      // Call the user-defined event handler
      if (settings.onDialogClose) settings.onDialogClose.call(this, this.queueData);

      // Upload the files if auto is true
      if (settings.auto) $('#' + settings.id).uploadify('upload', '*');
    },

    // Triggered once for each file added to the queue
    onSelect : function(file) {
      // Load the swfupload settings
      var settings = this.settings;

      // Check if a file with the same name exists in the queue
      var queuedFile = {};
      for (var n in this.queueData.files) {
        queuedFile = this.queueData.files[n];
        if (queuedFile.uploaded != true && queuedFile.name == file.name) {
          var replaceQueueItem = confirm('The file named "' + file.name + '" is already in the queue.\nDo you want to replace the existing item in the queue?');
          if (!replaceQueueItem) {
            this.cancelUpload(file.id);
            this.queueData.filesCancelled++;
            return false;
          } else {
            $('#' + queuedFile.id).remove();
            this.cancelUpload(queuedFile.id);
            this.queueData.filesReplaced++;
          }
        }
      }

      // Get the size of the file
      var fileSize = Math.round(file.size / 1024);
      var suffix   = 'KB';
      if (fileSize > 1000) {
        fileSize = Math.round(fileSize / 1000);
        suffix   = 'MB';
      }
      var fileSizeParts = fileSize.toString().split('.');
      fileSize = fileSizeParts[0];
      if (fileSizeParts.length > 1) {
        fileSize += '.' + fileSizeParts[1].substr(0,2);
      }
      fileSize += suffix;
      
      // Truncate the filename if it's too long
      var fileName = file.name;
      if (fileName.length > 25) {
        fileName = fileName.substr(0,25) + '...';
      }

      // Create the file data object
      itemData = {
        'fileID'     : file.id,
        'instanceID' : settings.id,
        'fileName'   : fileName,
        'fileSize'   : fileSize
      }

      // Create the file item template
      if (settings.itemTemplate == false) {
        settings.itemTemplate = '<div id="${fileID}" class="uploadify-queue-item">\
          <div class="cancel">\
            <a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')">X</a>\
          </div>\
          <span class="fileName">${fileName} (${fileSize})</span><span class="data"></span>\
          <div class="uploadify-progress">\
            <div class="uploadify-progress-bar"><!--Progress Bar--></div>\
          </div>\
        </div>';
      }

      // Run the default event handler
      if ($.inArray('onSelect', settings.overrideEvents) < 0) {
        
        // Replace the item data in the template
        itemHTML = settings.itemTemplate;
        for (var d in itemData) {
          itemHTML = itemHTML.replace(new RegExp('\\$\\{' + d + '\\}', 'g'), itemData[d]);
        }

        // Add the file item to the queue
        $('#' + settings.queueID).append(itemHTML);
      }

      this.queueData.queueSize += file.size;
      this.queueData.files[file.id] = file;

      // Call the user-defined event handler
      if (settings.onSelect) settings.onSelect.apply(this, arguments);
    },

    // Triggered when a file is not added to the queue
    onSelectError : function(file, errorCode, errorMsg) {
      // Load the swfupload settings
      var settings = this.settings;

      // Run the default event handler
      if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
        switch(errorCode) {
          case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
            if (settings.queueSizeLimit > errorMsg) {
              this.queueData.errorMsg += '\nThe number of files selected exceeds the remaining upload limit (' + errorMsg + ').';
            } else {
              this.queueData.errorMsg += '\nThe number of files selected exceeds the queue size limit (' + settings.queueSizeLimit + ').';
            }
            break;
          case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" exceeds the size limit (' + settings.fileSizeLimit + ').';
            break;
          case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" is empty.';
            break;
          case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
            this.queueData.errorMsg += '\nThe file "' + file.name + '" is not an accepted file type (' + settings.fileTypeDesc + ').';
            break;
        }
      }
      if (errorCode != SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
        delete this.queueData.files[file.id];
      }

      // Call the user-defined event handler
      if (settings.onSelectError) settings.onSelectError.apply(this, arguments);
    },

    // Triggered when all the files in the queue have been processed
    onQueueComplete : function() {
      if (this.settings.onQueueComplete) this.settings.onQueueComplete.call(this, this.settings.queueData);
    },

    // Triggered when a file upload successfully completes
    onUploadComplete : function(file) {
      // Load the swfupload settings
      var settings     = this.settings,
        swfuploadify = this;

      // Check if all the files have completed uploading
      var stats = this.getStats();
      this.queueData.queueLength = stats.files_queued;
      if (this.queueData.uploadQueue[0] == '*') {
        if (this.queueData.queueLength > 0) {
          this.startUpload();
        } else {
          this.queueData.uploadQueue = [];

          // Call the user-defined event handler for queue complete
          if (settings.onQueueComplete) settings.onQueueComplete.call(this, this.queueData);
        }
      } else {
        if (this.queueData.uploadQueue.length > 0) {
          this.startUpload(this.queueData.uploadQueue.shift());
        } else {
          this.queueData.uploadQueue = [];

          // Call the user-defined event handler for queue complete
          if (settings.onQueueComplete) settings.onQueueComplete.call(this, this.queueData);
        }
      }

      // Call the default event handler
      if ($.inArray('onUploadComplete', settings.overrideEvents) < 0) {
        if (settings.removeCompleted) {
          switch (file.filestatus) {
            case SWFUpload.FILE_STATUS.COMPLETE:
              setTimeout(function() { 
                if ($('#' + file.id)) {
                  swfuploadify.queueData.queueSize   -= file.size;
                  swfuploadify.queueData.queueLength -= 1;
                  delete swfuploadify.queueData.files[file.id]
                  $('#' + file.id).fadeOut(500, function() {
                    $(this).remove();
                  });
                }
              }, settings.removeTimeout * 1000);
              break;
            case SWFUpload.FILE_STATUS.ERROR:
              if (!settings.requeueErrors) {
                setTimeout(function() {
                  if ($('#' + file.id)) {
                    swfuploadify.queueData.queueSize   -= file.size;
                    swfuploadify.queueData.queueLength -= 1;
                    delete swfuploadify.queueData.files[file.id];
                    $('#' + file.id).fadeOut(500, function() {
                      $(this).remove();
                    });
                  }
                }, settings.removeTimeout * 1000);
              }
              break;
          }
        } else {
          file.uploaded = true;
        }
      }

      // Call the user-defined event handler
      if (settings.onUploadComplete) settings.onUploadComplete.call(this, file);
    },

    // Triggered when a file upload returns an error
    onUploadError : function(file, errorCode, errorMsg) {
      // Load the swfupload settings
      var settings = this.settings;

      // Set the error string
      var errorString = 'Error';
      switch(errorCode) {
        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
          errorString = 'HTTP Error (' + errorMsg + ')';
          break;
        case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL:
          errorString = 'Missing Upload URL';
          break;
        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
          errorString = 'IO Error';
          break;
        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
          errorString = 'Security Error';
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
          alert('The upload limit has been reached (' + errorMsg + ').');
          errorString = 'Exceeds Upload Limit';
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
          errorString = 'Failed';
          break;
        case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND:
          break;
        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
          errorString = 'Validation Error';
          break;
        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
          errorString = 'Cancelled';
          this.queueData.queueSize   -= file.size;
          this.queueData.queueLength -= 1;
          if (file.status == SWFUpload.FILE_STATUS.IN_PROGRESS || $.inArray(file.id, this.queueData.uploadQueue) >= 0) {
            this.queueData.uploadSize -= file.size;
          }
          // Trigger the onCancel event
          if (settings.onCancel) settings.onCancel.call(this, file);
          delete this.queueData.files[file.id];
          break;
        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
          errorString = 'Stopped';
          break;
      }

      // Call the default event handler
      if ($.inArray('onUploadError', settings.overrideEvents) < 0) {

        if (errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && errorCode != SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED) {
          $('#' + file.id).addClass('uploadify-error');
        }

        // Reset the progress bar
        $('#' + file.id).find('.uploadify-progress-bar').css('width','1px');

        // Add the error message to the queue item
        if (errorCode != SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND && file.status != SWFUpload.FILE_STATUS.COMPLETE) {
          $('#' + file.id).find('.data').html(' - ' + errorString);
        }
      }

      var stats = this.getStats();
      this.queueData.uploadsErrored = stats.upload_errors;

      // Call the user-defined event handler
      if (settings.onUploadError) settings.onUploadError.call(this, file, errorCode, errorMsg, errorString);
    },

    // Triggered periodically during a file upload
    onUploadProgress : function(file, fileBytesLoaded, fileTotalBytes) {
      // Load the swfupload settings
      var settings = this.settings;

      // Setup all the variables
      var timer            = new Date();
      var newTime          = timer.getTime();
      var lapsedTime       = newTime - this.timer;
      if (lapsedTime > 500) {
        this.timer = newTime;
      }
      var lapsedBytes      = fileBytesLoaded - this.bytesLoaded;
      this.bytesLoaded     = fileBytesLoaded;
      var queueBytesLoaded = this.queueData.queueBytesUploaded + fileBytesLoaded;
      var percentage       = Math.round(fileBytesLoaded / fileTotalBytes * 100);
      
      // Calculate the average speed
      var suffix = 'KB/s';
      var mbs = 0;
      var kbs = (lapsedBytes / 1024) / (lapsedTime / 1000);
          kbs = Math.floor(kbs * 10) / 10;
      if (this.queueData.averageSpeed > 0) {
        this.queueData.averageSpeed = Math.floor((this.queueData.averageSpeed + kbs) / 2);
      } else {
        this.queueData.averageSpeed = Math.floor(kbs);
      }
      if (kbs > 1000) {
        mbs = (kbs * .001);
        this.queueData.averageSpeed = Math.floor(mbs);
        suffix = 'MB/s';
      }
      
      // Call the default event handler
      if ($.inArray('onUploadProgress', settings.overrideEvents) < 0) {
        if (settings.progressData == 'percentage') {
          $('#' + file.id).find('.data').html(' - ' + percentage + '%');
        } else if (settings.progressData == 'speed' && lapsedTime > 500) {
          $('#' + file.id).find('.data').html(' - ' + this.queueData.averageSpeed + suffix);
        }
        $('#' + file.id).find('.uploadify-progress-bar').css('width', percentage + '%');
      }

      // Call the user-defined event handler
      if (settings.onUploadProgress) settings.onUploadProgress.call(this, file, fileBytesLoaded, fileTotalBytes, queueBytesLoaded, this.queueData.uploadSize);
    },

    // Triggered right before a file is uploaded
    onUploadStart : function(file) {
      // Load the swfupload settings
      var settings = this.settings;

      var timer        = new Date();
      this.timer       = timer.getTime();
      this.bytesLoaded = 0;
      if (this.queueData.uploadQueue.length == 0) {
        this.queueData.uploadSize = file.size;
      }
      if (settings.checkExisting) {
        $.ajax({
          type    : 'POST',
          async   : false,
          url     : settings.checkExisting,
          data    : {filename: file.name},
          success : function(data) {
            if (data == 1) {
              var overwrite = confirm('A file with the name "' + file.name + '" already exists on the server.\nWould you like to replace the existing file?');
              if (!overwrite) {
                this.cancelUpload(file.id);
                $('#' + file.id).remove();
                if (this.queueData.uploadQueue.length > 0 && this.queueData.queueLength > 0) {
                  if (this.queueData.uploadQueue[0] == '*') {
                    this.startUpload();
                  } else {
                    this.startUpload(this.queueData.uploadQueue.shift());
                  }
                }
              }
            }
          }
        });
      }

      // Call the user-defined event handler
      if (settings.onUploadStart) settings.onUploadStart.call(this, file); 
    },

    // Triggered when a file upload returns a successful code
    onUploadSuccess : function(file, data, response) {
      // Load the swfupload settings
      var settings = this.settings;
      var stats    = this.getStats();
      this.queueData.uploadsSuccessful = stats.successful_uploads;
      this.queueData.queueBytesUploaded += file.size;

      // Call the default event handler
      if ($.inArray('onUploadSuccess', settings.overrideEvents) < 0) {
        $('#' + file.id).find('.data').html(' - Complete');
      }

      // Call the user-defined event handler
      if (settings.onUploadSuccess) settings.onUploadSuccess.call(this, file, data, response); 
    }

  }

  $.fn.uploadify = function(method) {

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('The method ' + method + ' does not exist in $.uploadify');
    }

  }

window.SWFUpload = SWFUpload;
window.swfobject = swfobject;

  module.exports = methods;


});
define("bui/uploader/type/uploadify", ["jquery","bui/common"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview flash上传方案
 * @author 
 **/
var $ = require("jquery"),
    File = require("bui/uploader/file"),
    UploadType = require("bui/uploader/type/base");

var LOG_PREFIX = '[uploader-Flash]:';


//获取链接绝对路径正则
var URI_SPLIT_REG = new RegExp('^([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$'),
    HOSTNAME_SPLIT_REG = new RegExp('^(?:([\\w\\d+.-]+):)?(?://([\\w\\d\\-\\u0100-\\uffff.+%]*))?(:[\\d]*)?.*$');

/**
 * @class BUI.Uploader.UploadType.Flash
 * flash上传方案
 * 使用时要确认flash与提交的url是否跨越，如果跨越则需要设置crossdomain.xml
 * @extends BUI.Uploader.UploadType
 */
function FlashType(config) {
    var _self = this;
    //调用父类构造函数
    FlashType.superclass.constructor.call(_self, config);
}

BUI.extend(FlashType, UploadType, {
    /**
     * 初始化
     */
    _init:function () {
        var _self = this;
        var swfButton = _self.get('swfButton');
        var uploadifyEl = swfButton.get('uploadifyEl');

        //测试是否存在crossdomain.xml
        // _self._hasCrossdomain();

        var uploadify = uploadifyEl.uploadify({
          auto: false,
          width: 200,
          height: 200,
          swf: swfButton.get('flashUrl'),
          uploader: _self.get('url'),
          onSelect: function (file) {
            var files = [];
            files.push(File.create(file));
            swfButton.fire('change', {files: files});
          },
          onUploadStart: function (file) {
            _self.fire('start', {file: File.create(file)});
          },
          onUploadProgress: function(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {
            _self.fire('progress', { 'loaded': bytesUploaded, 'total': bytesTotal });
          },
          onUploadSuccess: function (file, data, response) {
            var result = _self._processResponse(data);
            file = File.create(file);
            _self.fire('complete', {result: result, file: file});
            // _self.fire('complete', {result: result, file: file});
          },
          onUploadError: function (file) {
            _self.fire('error', {file: File.create(file)});
          }
        });

        _self.set('uploadify', uploadify);


    },
    /**
     * 上传文件
     * @param {String} id 文件id
     * @return {BUI.Uploader.UploadType.Flash}
     * @chainable
     */
    upload:function () {
        var _self = this;
        var swfButton = _self.get('swfButton');
        var uploadifyEl = swfButton.get('uploadifyEl');

        uploadifyEl.uploadify("upload", '*');

        return _self;
    },
    cancel: function () {
        var _self = this;
        var swfButton = _self.get('swfButton');
        var uploadifyEl = swfButton.get('uploadifyEl');

        uploadifyEl.uploadify("cancel", '*');

        return _self;
    },
    /**
     * 应用是否有flash跨域策略文件
     * @private
     * 2014-01-13 应该判断swf的路径上提交上传接口的路径是否同域
     */
    _hasCrossdomain: function(){
        var _self = this,

            // http://g.tbcdn.cn/fi/bui/upload.php => ['http://g.tbcdn.cn/fi/bui/upload.php', 'http', 'g.tbcdn.cn']
            url = _self.get('url').match(HOSTNAME_SPLIT_REG) || [],
            flashUrl = _self.get('swfUploader').get('src').match(HOSTNAME_SPLIT_REG) || [],
            urlDomain = url[2],
            flashUrlDomain = flashUrl[2],
            port = url[3] || '';

        //不同域时才去校验crossdomain
        if(urlDomain && flashUrlDomain && urlDomain !== flashUrlDomain){
            $.ajax({
                url: url[1] + '://' + urlDomain + port + '/crossdomain.xml',
                dataType:"xml",
                error:function(){
                   BUI.log('缺少crossdomain.xml文件或该文件不合法！');
                }
            });
        }
    }
}, {ATTRS:{
    uploader: {
        setter: function(v){
            var _self = this;
            if(v && v.isController){
                //因为flash上传需要依赖swfButton，所以是要等flash加载完成后才可以初始化的
                var swfButton = v.get('button');
                _self.set('swfButton', swfButton);
                _self._init();
            }
        }
    },
    /**
     * 服务器端路径，留意flash必须是绝对路径
     */
    url:{
        setter: function(v){
            var reg = /^http/;
            //不是绝对路径拼接成绝对路径
            if(!reg.test(v)){
                //获取前面url部份
                //修复下如下链接问题：http://a.b.com/a.html?a=a/b/c#d/e/f => http://a.b.com/a.html
                var href = location.href.match(URI_SPLIT_REG) || [],
                    path = href[1] || '',
                    uris = path.split('/'),
                    newUris;
                newUris  = BUI.Array.filter(uris,function(item,i){
                    return i < uris.length - 1;
                });
                v = newUris.join('/') + '/' + v;
            }
            return v;
        }
    },
    /**
     * 正在上传的文件id
     */
    uploadingId : {},
    /**
     * 事件列表
     */
    events:{
        value: {
            /**
             * 上传正在上传时
             * @event
             * @param {Object} e 事件对象
             * @param {Number} total 文件的总大小
             * @param {Number} loaded 已经上传的大小
             */
            progress: false
        }
    }
}});

module.exports = FlashType;

});
define("bui/uploader/validator", ["jquery","bui/common"], function(require, exports, module){
/**
 * @ignore
 * @fileoverview 异步文件上传的验证器
 * @author 索丘 yezengyue@gmail.com
 **/

var $ = require("jquery"),
  BUI = require("bui/common");


/**
 * 异步文件上传的验证器
 * @class BUI.Uploader.Validator
 * @extend BUI.Base
 *
 * <pre><code>
 * //默认已经定义的一些规则
 * rules: {
 *   maxSize: [1024, '文件最大不能超过1M!'],
 *   minSize: [1, '文件最小不能小于1k!'],
 *   max: [5, '文件最多不能超过{0}个！'],
 *   min: [1, '文件最少不能少于{0}个!'],
 *   ext: ['.png','文件类型只能为{0}']
 * }
 * </code></pre>
 */
function Validator(config){
  Validator.superclass.constructor.call(this, config);
}

Validator.ATTRS = {
  /**
   * 上传组件的校验规则
   * @type {Object}
   */
  rules: {
  },
  queue: {
  }
}

BUI.extend(Validator, BUI.Base);

BUI.augment(Validator, {
  /**
   * 校验文件是否符合规则，并设置文件的状态
   * @param  {Object} item
   * @return {Boolean} 校验结果
   */
  valid: function(item){
    return this._validItem(item);
  },
  _validItem: function(item){
    var _self = this,
      rules = _self.get('rules'),
      isValid = true;

    BUI.each(rules, function(rule, name){
      isValid = isValid && _self._validRule(item, name, rule);
      return isValid;
    })
    return isValid;
  },
  _validRule: function(item, name, rule, msg){
    if(BUI.isArray(rule)){
      msg = BUI.substitute(rule[1], rule);
      rule = rule[0];
    }
    var ruleFn = Validator.getRule(name),
      validMsg = ruleFn && ruleFn.call(this, item, rule, msg),
      result = this._getResult(validMsg);

    if(result){
      item.result = result;
      return false;
    }
    return true;
  },
  /**
   * 获取校验的结果
   * @param  {String} msg
   */
  _getResult: function(msg){
    if(msg){
      return {
        msg: msg
      }
    }
  }
});


var ruleMap = {};

Validator.addRule = function(name, fn){
  ruleMap[name] = fn;
}

Validator.getRule = function(name){
  return ruleMap[name];
}

//文件最大值
Validator.addRule('maxSize', function(item, baseValue, formatMsg){
  if(item.size > baseValue * 1024){
    return formatMsg;
  }
});

//文件最小值
Validator.addRule('minSize', function(item, baseValue, formatMsg){
  if(item.size < baseValue * 1024){
    return formatMsg;
  }
});

//上传文件的最大个数
Validator.addRule('max', function(item, baseValue, formatMsg){
  var count = this.get('queue').getCount();
  if(count > baseValue){
    return formatMsg;
  }
});

//上传文件的最小个数
Validator.addRule('min', function(item, baseValue, formatMsg){
  var count = this.get('queue').getCount();
  if(count < baseValue){
    return formatMsg;
  }
});

//上传文件的文件类型
Validator.addRule('ext', function(item, baseValue, formatMsg){
  var ext = item.ext,
    baseValue = baseValue.split(',');
  if($.inArray(ext, baseValue) === -1){
    return formatMsg;
  }
});

module.exports = Validator;

});
