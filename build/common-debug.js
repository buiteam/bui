// (function(){
//   var requires = ['bui/util','bui/ua','bui/json','bui/date','bui/array','bui/keycode','bui/observable','bui/base','bui/component'];
//   if(window.KISSY && (!window.KISSY.Node || !window.jQuery)){ //如果是kissy同时未加载core模块
//     requires.unshift('bui/adapter');
//   }
  define('bui/common', function(require){
    // if(window.KISSY && (!window.KISSY.Node || !window.jQuery)){
    //   require('bui/adapter');
    // }
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
// })();


/**
 * @class BUI
 * 控件库的工具方法，这些工具方法直接绑定到BUI对象上
 * <pre><code>
 *     BUI.isString(str);
 *
 *     BUI.extend(A,B);
 *
 *     BUI.mix(A,{a:'a'});
 * </code></pre>
 * @singleton
 */
define('bui/common/util',function(require){

    //兼容jquery 1.6以下
    (function($){
        if($.fn){
            $.fn.on = $.fn.on || $.fn.bind;
            $.fn.off = $.fn.off || $.fn.unbind;
        }

    })(jQuery);
    /**
     * @ignore
     * 处于效率的目的，复制属性
     */
    function mixAttrs(to,from){

        for(var c in from){
            if(from.hasOwnProperty(c)){
                to[c] = to[c] || {};
                mixAttr(to[c],from[c]);
            }
        }

    }
    //合并属性
    function mixAttr(attr,attrConfig){
        for (var p in attrConfig) {
            if(attrConfig.hasOwnProperty(p)){
                if(p == 'value'){
                    if(BUI.isObject(attrConfig[p])){
                        attr[p] = attr[p] || {};
                        BUI.mix(/*true,*/attr[p], attrConfig[p]);
                    }else if(BUI.isArray(attrConfig[p])){
                        attr[p] = attr[p] || [];
                        //BUI.mix(/*true,*/attr[p], attrConfig[p]);
                        attr[p] = attr[p].concat(attrConfig[p]);
                    }else{
                        attr[p] = attrConfig[p];
                    }
                }else{
                    attr[p] = attrConfig[p];
                }
            }
        };
    }

    var win = window,
        doc = document,
        objectPrototype = Object.prototype,
        toString = objectPrototype.toString,
        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        SCROLL = 'scroll',
        SCROLL_WIDTH = SCROLL + 'Width',
        SCROLL_HEIGHT = SCROLL + 'Height',
        ATTRS = 'ATTRS',
        PARSER = 'PARSER',
        GUID_DEFAULT = 'guid';

    $.extend(BUI,
        {
            /**
             * 版本号
             * @memberOf BUI
             * @type {Number}
             */
            version:1.0,

            /**
             * 子版本号
             * @type {Number}
             */
            subVersion : 96,


            /**
             * 是否为函数
             * @param  {*} fn 对象
             * @return {Boolean}  是否函数
             */
            isFunction : function(fn){
                return typeof(fn) === 'function';
            },
            /**
             * 是否数组
             * @method
             * @param  {*}  obj 是否数组
             * @return {Boolean}  是否数组
             */
            isArray : ('isArray' in Array) ? Array.isArray : function(value) {
                return toString.call(value) === '[object Array]';
            },
            /**
             * 是否日期
             * @param  {*}  value 对象
             * @return {Boolean}  是否日期
             */
            isDate: function(value) {
                return toString.call(value) === '[object Date]';
            },
            /**
             * 是否是javascript对象
             * @param {Object} value The value to test
             * @return {Boolean}
             * @method
             */
            isObject: (toString.call(null) === '[object Object]') ?
                function(value) {
                    // check ownerDocument here as well to exclude DOM nodes
                    return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
                } :
                function(value) {
                    return toString.call(value) === '[object Object]';
                },
            /**
             * 是否是数字或者数字字符串
             * @param  {String}  value 数字字符串
             * @return {Boolean}  是否是数字或者数字字符串
             */
            isNumeric: function(value) {
                return !isNaN(parseFloat(value)) && isFinite(value);
            },
            /**
             * 将指定的方法或属性放到构造函数的原型链上，
             * 函数支持多于2个变量，后面的变量同s1一样将其成员复制到构造函数的原型链上。
             * @param  {Function} r  构造函数
             * @param  {Object} s1 将s1 的成员复制到构造函数的原型链上
             *          @example
             *          BUI.augment(class1,{
     *              method1: function(){
     *   
     *              }
     *          });
             */
            augment : function(r,s1){
                if(!BUI.isFunction(r))
                {
                    return r;
                }
                for (var i = 1; i < arguments.length; i++) {
                    BUI.mix(r.prototype,arguments[i].prototype || arguments[i]);
                };
                return r;
            },
            /**
             * 拷贝对象
             * @param  {Object} obj 要拷贝的对象
             * @return {Object} 拷贝生成的对象
             */
            cloneObject : function(obj){
                var result = BUI.isArray(obj) ? [] : {};

                return BUI.mix(true,result,obj);
            },
            /**
             * 抛出错误
             */
            error : function(msg){
                if(BUI.debug){
                    throw msg;
                }
            },
            
            /**
             * 实现类的继承，通过父类生成子类
             * @param  {Function} subclass
             * @param  {Function} superclass 父类构造函数
             * @param  {Object} overrides  子类的属性或者方法
             * @return {Function} 返回的子类构造函数
             * 示例:
             *      @example
             *      //父类
             *      function base(){
             *  
             *      }
             *
             *      function sub(){
             * 
             *      }
             *      //子类
             *      BUI.extend(sub,base,{
             *          method : function(){
             *    
             *          }
             *      });
             *
             *      //或者
             *      var sub = BUI.extend(base,{});
             */
            extend : function(subclass,superclass,overrides, staticOverrides){
                //如果只提供父类构造函数，则自动生成子类构造函数
                if(!BUI.isFunction(superclass))
                {

                    overrides = superclass;
                    superclass = subclass;
                    subclass =  function(){};
                }

                var create = Object.create ?
                    function (proto, c) {
                        return Object.create(proto, {
                            constructor: {
                                value: c
                            }
                        });
                    } :
                    function (proto, c) {
                        function F() {
                        }

                        F.prototype = proto;

                        var o = new F();
                        o.constructor = c;
                        return o;
                    };
                var superObj = create(superclass.prototype,subclass);//new superclass(),//实例化父类作为子类的prototype
                subclass.prototype = BUI.mix(superObj,subclass.prototype);     //指定子类的prototype
                subclass.superclass = create(superclass.prototype,superclass);
                BUI.mix(superObj,overrides);
                BUI.mix(subclass,staticOverrides);
                return subclass;
            },
            /**
             * 生成唯一的Id
             * @method
             * @param {String} prefix 前缀
             * @default 'bui-guid'
             * @return {String} 唯一的编号
             */
            guid : (function(){
                var map = {};
                return function(prefix){
                    prefix = prefix || BUI.prefix + GUID_DEFAULT;
                    if(!map[prefix]){
                        map[prefix] = 1;
                    }else{
                        map[prefix] += 1;
                    }
                    return prefix + map[prefix];
                };
            })(),
            /**
             * 判断是否是字符串
             * @return {Boolean} 是否是字符串
             */
            isString : function(value){
                return typeof value === 'string';
            },
            /**
             * 判断是否数字，由于$.isNumberic方法会把 '123'认为数字
             * @return {Boolean} 是否数字
             */
            isNumber : function(value){
                return typeof value === 'number';
            },
            /**
             * 是否是布尔类型
             *
             * @param {Object} value 测试的值
             * @return {Boolean}
             */
            isBoolean: function(value) {
                return typeof value === 'boolean';
            },
            /**
             * 控制台输出日志
             * @param  {Object} obj 输出的数据
             */
            log : function(obj){
                if(BUI.debug && win.console && win.console.log){
                    win.console.log(obj);
                }
            },
            /**
             * 将多个对象的属性复制到一个新的对象
             */
            merge : function(){
                var args = $.makeArray(arguments),
                    first = args[0];
                if(BUI.isBoolean(first)){
                    args.shift();
                    args.unshift({});
                    args.unshift(first);
                }else{
                    args.unshift({});
                }

                return BUI.mix.apply(null,args);

            },
            /**
             * 封装 jQuery.extend 方法，将多个对象的属性merge到第一个对象中
             * @return {Object}
             */
            mix : function(){
                return $.extend.apply(null,arguments);
            },
            /**
             * 创造顶层的命名空间，附加到window对象上,
             * 包含namespace方法
             */
            app : function(name){
                if(!window[name]){
                    window[name] = {
                        namespace :function(nsName){
                            return BUI.namespace(nsName,window[name]);
                        }
                    };
                }
                return window[name];
            },

            mixAttrs : mixAttrs,

            mixAttr : mixAttr,

            /**
             * 将其他类作为mixin集成到指定类上面
             * @param {Function} c 构造函数
             * @param {Array} mixins 扩展类
             * @param {Array} attrs 扩展的静态属性，默认为['ATTRS']
             * @return {Function} 传入的构造函数
             */
            mixin : function(c,mixins,attrs){
                attrs = attrs || [ATTRS,PARSER];
                var extensions = mixins;
                if (extensions) {
                    c.mixins = extensions;

                    var desc = {
                        // ATTRS:
                        // HTML_PARSER:
                    }, constructors = extensions['concat'](c);

                    // [ex1,ex2]，扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
                    // 主类最优先
                    BUI.each(constructors, function (ext) {
                        if (ext) {
                            // 合并 ATTRS/HTML_PARSER 到主类
                            BUI.each(attrs, function (K) {
                                if (ext[K]) {
                                    desc[K] = desc[K] || {};
                                    // 不覆盖主类上的定义，因为继承层次上扩展类比主类层次高
                                    // 但是值是对象的话会深度合并
                                    // 注意：最好值是简单对象，自定义 new 出来的对象就会有问题(用 function return 出来)!
                                    if(K == 'ATTRS'){
                                        //BUI.mix(true,desc[K], ext[K]);
                                        mixAttrs(desc[K],ext[K]);
                                    }else{
                                        BUI.mix(desc[K], ext[K]);
                                    }

                                }
                            });
                        }
                    });

                    BUI.each(desc, function (v,k) {
                        c[k] = v;
                    });

                    var prototype = {};

                    // 主类最优先
                    BUI.each(constructors, function (ext) {
                        if (ext) {
                            var proto = ext.prototype;
                            // 合并功能代码到主类，不覆盖
                            for (var p in proto) {
                                // 不覆盖主类，但是主类的父类还是覆盖吧
                                if (proto.hasOwnProperty(p)) {
                                    prototype[p] = proto[p];
                                }
                            }
                        }
                    });

                    BUI.each(prototype, function (v,k) {
                        c.prototype[k] = v;
                    });
                }
                return c;
            },
            /**
             * 生成命名空间
             * @param  {String} name 命名空间的名称
             * @param  {Object} baseNS 在已有的命名空间上创建命名空间，默认“BUI”
             * @return {Object} 返回的命名空间对象
             *      @example
             *      BUI.namespace("Grid"); // BUI.Grid
             */
            namespace : function(name,baseNS){
                baseNS = baseNS || BUI;
                if(!name){
                    return baseNS;
                }
                var list = name.split('.'),
                //firstNS = win[list[0]],
                    curNS = baseNS;

                for (var i = 0; i < list.length; i++) {
                    var nsName = list[i];
                    if(!curNS[nsName]){
                        curNS[nsName] = {};
                    }
                    curNS = curNS[nsName];
                };
                return curNS;
            },
            /**
             * BUI 控件的公用前缀
             * @type {String}
             */
            prefix : 'bui-',
            /**
             * 替换字符串中的字段.
             * @param {String} str 模版字符串
             * @param {Object} o json data
             * @param {RegExp} [regexp] 匹配字符串的正则表达式
             */
            substitute: function (str, o, regexp) {
                if (!BUI.isString(str)
                    || (!BUI.isObject(o)) && !BUI.isArray(o)) {
                    return str;
                }

                return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
                    if (match.charAt(0) === '\\') {
                        return match.slice(1);
                    }
                    return (o[name] === undefined) ? '' : o[name];
                });
            },
            /**
             * 使第一个字母变成大写
             * @param  {String} s 字符串
             * @return {String} 首字母大写后的字符串
             */
            ucfirst : function(s){
                s += '';
                return s.charAt(0).toUpperCase() + s.substring(1);
            },
            /**
             * 页面上的一点是否在用户的视图内
             * @param {Object} offset 坐标，left,top
             * @return {Boolean} 是否在视图内
             */
            isInView : function(offset){
                var left = offset.left,
                    top = offset.top,
                    viewWidth = BUI.viewportWidth(),
                    wiewHeight = BUI.viewportHeight(),
                    scrollTop = BUI.scrollTop(),
                    scrollLeft = BUI.scrollLeft();
                //判断横坐标
                if(left < scrollLeft ||left > scrollLeft + viewWidth){
                    return false;
                }
                //判断纵坐标
                if(top < scrollTop || top > scrollTop + wiewHeight){
                    return false;
                }
                return true;
            },
            /**
             * 页面上的一点纵向坐标是否在用户的视图内
             * @param {Object} top  纵坐标
             * @return {Boolean} 是否在视图内
             */
            isInVerticalView : function(top){
                var wiewHeight = BUI.viewportHeight(),
                    scrollTop = BUI.scrollTop();

                //判断纵坐标
                if(top < scrollTop || top > scrollTop + wiewHeight){
                    return false;
                }
                return true;
            },
            /**
             * 页面上的一点横向坐标是否在用户的视图内
             * @param {Object} left 横坐标
             * @return {Boolean} 是否在视图内
             */
            isInHorizontalView : function(left){
                var viewWidth = BUI.viewportWidth(),
                    scrollLeft = BUI.scrollLeft();
                //判断横坐标
                if(left < scrollLeft ||left > scrollLeft + viewWidth){
                    return false;
                }
                return true;
            },
            /**
             * 获取窗口可视范围宽度
             * @return {Number} 可视区宽度
             */
            viewportWidth : function(){
                return $(window).width();
            },
            /**
             * 获取窗口可视范围高度
             * @return {Number} 可视区高度
             */
            viewportHeight:function(){
                return $(window).height();
            },
            /**
             * 滚动到窗口的left位置
             */
            scrollLeft : function(){
                return $(window).scrollLeft();
            },
            /**
             * 滚动到横向位置
             */
            scrollTop : function(){
                return $(window).scrollTop();
            },
            /**
             * 窗口宽度
             * @return {Number} 窗口宽度
             */
            docWidth : function(){
                return Math.max(this.viewportWidth(), doc[DOC_ELEMENT][SCROLL_WIDTH], doc[BODY][SCROLL_WIDTH]);
            },
            /**
             * 窗口高度
             * @return {Number} 窗口高度
             */
            docHeight : function(){
                return Math.max(this.viewportHeight(), doc[DOC_ELEMENT][SCROLL_HEIGHT], doc[BODY][SCROLL_HEIGHT]);
            },
            /**
             * 遍历数组或者对象
             * @param {Object|Array} element/Object 数组中的元素或者对象的值
             * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){}
             */
            each : function (elements,func) {
                if(!elements){
                    return;
                }
                $.each(elements,function(k,v){
                    return func(v,k);
                });
            },
            /**
             * 封装事件，便于使用上下文this,和便于解除事件时使用
             * @protected
             * @param  {Object} self   对象
             * @param  {String} action 事件名称
             */
            wrapBehavior : function(self, action) {
                return self['__bui_wrap_' + action] = function (e) {
                    if (!self.get('disabled')) {
                        self[action](e);
                    }
                };
            },
            /**
             * 获取封装的事件
             * @protected
             * @param  {Object} self   对象
             * @param  {String} action 事件名称
             */
            getWrapBehavior : function(self, action) {
                return self['__bui_wrap_' + action];
            },
            /**
             * 获取页面上使用了此id的控件
             * @param  {String} id 控件id
             * @return {BUI.Component.Controller}    查找的控件
             */
            getControl : function(id){
                return BUI.Component.Manager.getComponent(id);
            }

        });

    /**
     * 表单帮助类，序列化、反序列化，设置值
     * @class BUI.FormHelper
     * @singleton
     */
    var formHelper = BUI.FormHelper = {
        /**
         * 将表单格式化成键值对形式
         * @param {HTMLElement} form 表单
         * @return {Object} 键值对的对象
         */
        serializeToObject:function(form){
            var array = $(form).serializeArray(),
                result = {};
            BUI.each(array,function(item){
                var name = item.name;
                if(!result[name]){ //如果是单个值，直接赋值
                    result[name] = item.value;
                }else{ //多值使用数组
                    if(!BUI.isArray(result[name])){
                        result[name] = [result[name]];
                    }
                    result[name].push(item.value);
                }
            });
            return result;
        },
        /**
         * 设置表单的值
         * @param {HTMLElement} form 表单
         * @param {Object} obj  键值对
         */
        setFields : function(form,obj){
            for(var name in obj){
                if(obj.hasOwnProperty(name)){
                    BUI.FormHelper.setField(form,name,obj[name]);
                }
            }
        },
        /**
         * 清空表单
         * @param  {HTMLElement} form 表单元素
         */
        clear : function(form){
            var elements = $.makeArray(form.elements);

            BUI.each(elements,function(element){
                if(element.type === 'checkbox' || element.type === 'radio' ){
                    $(element).attr('checked',false);
                }else{
                    $(element).val('');
                }
                $(element).change();
            });
        },
        /**
         * 设置表单字段
         * @param {HTMLElement} form 表单元素
         * @param {string} field 字段名
         * @param {string} value 字段值
         */
        setField:function(form,fieldName,value){
            var fields = form.elements[fieldName];
            if(fields && fields.type){
                formHelper._setFieldValue(fields,value);
            }else if(BUI.isArray(fields) || (fields && fields.length)){
                BUI.each(fields,function(field){
                    formHelper._setFieldValue(field,value);
                });
            }
        },
        //设置字段的值
        _setFieldValue : function(field,value){
            if(field.type === 'checkbox'){
                if(field.value == ''+ value ||(BUI.isArray(value) && BUI.Array.indexOf(field.value,value) !== -1)) {
                    $(field).attr('checked',true);
                }else{
                    $(field).attr('checked',false);
                }
            }else if(field.type === 'radio'){
                if(field.value == ''+  value){
                    $(field).attr('checked',true);
                }else{
                    $(field).attr('checked',false);
                }
            }else{
                $(field).val(value);
            }
        },
        /**
         * 获取表单字段值
         * @param {HTMLElement} form 表单元素
         * @param {string} field 字段名
         * @return {String}   字段值
         */
        getField : function(form,fieldName){
            return BUI.FormHelper.serializeToObject(form)[fieldName];
        }
    };

    return BUI;
});

/**
 * @fileOverview 数组帮助类
 * @ignore
 */

/**
 * @class BUI
 * 控件库的基础命名空间
 * @singleton
 */

define('bui/common/array',['bui/common/util'],function (require) {
  
  var BUI = require('bui/common/util');
  /**
   * @class BUI.Array
   * 数组帮助类
   */
  BUI.Array ={
    /**
     * 返回数组的最后一个对象
     * @param {Array} array 数组或者类似于数组的对象.
     * @return {*} 数组的最后一项.
     */
    peek : function(array) {
      return array[array.length - 1];
    },
    /**
     * 查找记录所在的位置
     * @param  {*} value 值
     * @param  {Array} array 数组或者类似于数组的对象
     * @param  {Number} [fromIndex=0] 起始项，默认为0
     * @return {Number} 位置，如果为 -1则不在数组内
     */
    indexOf : function(value, array,opt_fromIndex){
       var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, array.length + opt_fromIndex) : opt_fromIndex);

      for (var i = fromIndex; i < array.length; i++) {
        if (i in array && array[i] === value)
          return i;
      }
      return -1;
    },
    /**
     * 数组是否存在指定值
     * @param  {*} value 值
     * @param  {Array} array 数组或者类似于数组的对象
     * @return {Boolean} 是否存在于数组中
     */
    contains : function(value,array){
      return BUI.Array.indexOf(value,array) >=0;
    },
    /**
     * 遍历数组或者对象
     * @method 
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){}
     */
    each : BUI.each,
    /**
     * 2个数组内部的值是否相等
     * @param  {Array} a1 数组1
     * @param  {Array} a2 数组2
     * @return {Boolean} 2个数组相等或者内部元素是否相等
     */
    equals : function(a1,a2){
      if(a1 == a2){
        return true;
      }
      if(!a1 || !a2){
        return false;
      }

      if(a1.length != a2.length){
        return false;
      }
      var rst = true;
      for(var i = 0 ;i < a1.length; i++){
        if(a1[i] !== a2[i]){
          rst = false;
          break;
        }
      }
      return rst;
    },

    /**
     * 过滤数组
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){},如果返回true则添加到结果集
     * @return {Array} 过滤的结果集
     */
    filter : function(array,func){
      var result = [];
      BUI.Array.each(array,function(value,index){
        if(func(value,index)){
          result.push(value);
        }
      });
      return result;
    },
    /**
     * 转换数组数组
     * @param {Object|Array} element/Object 数组中的元素或者对象的值 
     * @param {Function} func 遍历的函数 function(elememt,index){} 或者 function(value,key){},将返回的结果添加到结果集
     * @return {Array} 过滤的结果集
     */
    map : function(array,func){
      var result = [];
      BUI.Array.each(array,function(value,index){
        result.push(func(value,index));
      });
      return result;
    },
    /**
     * 获取第一个符合条件的数据
     * @param  {Array} array 数组
     * @param  {Function} func  匹配函数
     * @return {*}  符合条件的数据
     */
    find : function(array,func){
      var i = BUI.Array.findIndex(array, func);
      return i < 0 ? null : array[i];
    },
    /**
     * 获取第一个符合条件的数据的索引值
    * @param  {Array} array 数组
     * @param  {Function} func  匹配函数
     * @return {Number} 符合条件的数据的索引值
     */
    findIndex : function(array,func){
      var result = -1;
      BUI.Array.each(array,function(value,index){
        if(func(value,index)){
          result = index;
          return false;
        }
      });
      return result;
    },
    /**
     * 数组是否为空
     * @param  {Array}  array 数组
     * @return {Boolean}  是否为空
     */
    isEmpty : function(array){
      return array.length == 0;
    },
    /**
     * 插入数组
     * @param  {Array} array 数组
     * @param  {Number} index 位置
     * @param {*} value 插入的数据
     */
    add : function(array,value){
      array.push(value);
    },
    /**
     * 将数据插入数组指定的位置
     * @param  {Array} array 数组
     * @param {*} value 插入的数据
     * @param  {Number} index 位置
     */
    addAt : function(array,value,index){
      BUI.Array.splice(array, index, 0, value);
    },
    /**
     * 清空数组
     * @param  {Array} array 数组
     * @return {Array}  清空后的数组
     */
    empty : function(array){
      if(!(array instanceof(Array))){
        for (var i = array.length - 1; i >= 0; i--) {
          delete array[i];
        }
      }
      array.length = 0;
    },
    /**
     * 移除记录
     * @param  {Array} array 数组
     * @param  {*} value 记录
     * @return {Boolean}   是否移除成功
     */
    remove : function(array,value){
      var i = BUI.Array.indexOf(value, array);
      var rv;
      if ((rv = i >= 0)) {
        BUI.Array.removeAt(array, i);
      }
      return rv;
    },
    /**
     * 移除指定位置的记录
     * @param  {Array} array 数组
     * @param  {Number} index 索引值
     * @return {Boolean}   是否移除成功
     */
    removeAt : function(array,index){
      return BUI.Array.splice(array, index, 1).length == 1;
    },
    /**
     * @private
     */
    slice : function(arr, start, opt_end){
      if (arguments.length <= 2) {
        return Array.prototype.slice.call(arr, start);
      } else {
        return Array.prototype.slice.call(arr, start, opt_end);
      }
    },
    /**
     * @private
     */
    splice : function(arr, index, howMany, var_args){
      return Array.prototype.splice.apply(arr, BUI.Array.slice(arguments, 1))
    }

  };
  return BUI.Array;
});

/**
 * @fileOverview 观察者模式实现事件
 * @ignore
 */

define('bui/common/observable', ['bui/common/util'], function (require) {
  
  var BUI = require('bui/common/util');
  /**
   * @private
   * @class BUI.Observable.Callbacks
   * jquery 1.7 时存在 $.Callbacks,但是fireWith的返回结果是$.Callbacks 对象，
   * 而我们想要的效果是：当其中有一个函数返回为false时，阻止后面的执行，并返回false
   */
  var Callbacks = function(){
    this._init();
  };

  BUI.augment(Callbacks,{

    _functions : null,

    _init : function(){
      var _self = this;

      _self._functions = [];
    },
    /**
     * 添加回调函数
     * @param {Function} fn 回调函数
     */
    add:function(fn){
      this._functions.push(fn);
    },
    /**
     * 移除回调函数
     * @param  {Function} fn 回调函数
     */
    remove : function(fn){
      var functions = this._functions;
        index = BUI.Array.indexOf(fn,functions);
      if(index>=0){
        functions.splice(index,1);
      }
    },
    /**
     * 清空事件
     */
    empty : function(){
      var length = this._functions.length; //ie6,7下，必须指定需要删除的数量
      this._functions.splice(0,length);
    },
    /**
     * 暂停事件
     */
    pause : function(){
      this._paused = true;
    },
    /**
     * 唤醒事件
     */
    resume : function(){
      this._paused = false;
    },
    /**
     * 触发回调
     * @param  {Object} scope 上下文
     * @param  {Array} args  回调函数的参数
     * @return {Boolean|undefined} 当其中有一个函数返回为false时，阻止后面的执行，并返回false
     */
    fireWith : function(scope,args){
      var _self = this,
        rst;
      if(this._paused){
        return;
      }
      BUI.each(_self._functions,function(fn){
        rst = fn.apply(scope,args);
        if(rst === false){
          return false;
        }
      });
      return rst;
    }
  });

  function getCallbacks(){
    return new Callbacks();
  }
  /**
   * 支持事件的对象，参考观察者模式
   *  - 此类提供事件绑定
   *  - 提供事件冒泡机制
   *
   * <pre><code>
   *   var control = new Control();
   *   control.on('click',function(ev){
   *   
   *   });
   *
   *   control.off();  //移除所有事件
   * </code></pre>
   * @class BUI.Observable
   * @abstract
   * @param {Object} config 配置项键值对
   */
  var Observable = function(config){
        this._events = [];
        this._eventMap = {};
        this._bubblesEvents = [];
    this._initEvents(config);
  };

  BUI.augment(Observable,
  {

    /**
     * @cfg {Object} listeners 
     *  初始化事件,快速注册事件
     *  <pre><code>
     *    var list = new BUI.List.SimpleList({
     *      listeners : {
     *        itemclick : function(ev){},
     *        itemrendered : function(ev){}
     *      },
     *      items : []
     *    });
     *    list.render();
     *  </code></pre>
     */
    
    /**
     * @cfg {Function} handler
     * 点击事件的处理函数，快速配置点击事件而不需要写listeners属性
     * <pre><code>
     *    var list = new BUI.List.SimpleList({
     *      handler : function(ev){} //click 事件
     *    });
     *    list.render();
     *  </code></pre>
     */
    
    /**
     * 支持的事件名列表
     * @private
     */
    _events:[],

    /**
     * 绑定的事件
     * @private
     */
    _eventMap : {},

    _bubblesEvents : [],

    _bubbleTarget : null,

    //获取回调集合
    _getCallbacks : function(eventType){
      var _self = this,
        eventMap = _self._eventMap;
      return eventMap[eventType];
    },
    //初始化事件列表
    _initEvents : function(config){
      var _self = this,
        listeners = null; 

      if(!config){
        return;
      }
      listeners = config.listeners || {};
      if(config.handler){
        listeners.click = config.handler;
      }
      if(listeners){
        for (var name in listeners) {
          if(listeners.hasOwnProperty(name)){
            _self.on(name,listeners[name]);
          }
        };
      }
    },
    //事件是否支持冒泡
    _isBubbles : function (eventType) {
        return BUI.Array.indexOf(eventType,this._bubblesEvents) >= 0;
    },
    /**
     * 添加冒泡的对象
     * @protected
     * @param {Object} target  冒泡的事件源
     */
    addTarget : function(target) {
        this._bubbleTarget = target;
    },
    /**
     * 添加支持的事件
     * @protected
     * @param {String|String[]} events 事件
     */
    addEvents : function(events){
      var _self = this,
        existEvents = _self._events,
        eventMap = _self._eventMap;

      function addEvent(eventType){
        if(BUI.Array.indexOf(eventType,existEvents) === -1){
          eventMap[eventType] = getCallbacks();
          existEvents.push(eventType);
        }
      }
      if(BUI.isArray(events)){
        $.each(events,function(index,eventType){
          addEvent(eventType);
        });
      }else{
        addEvent(events);
      }
    },
    /**
     * 移除所有绑定的事件
     * @protected
     */
    clearListeners : function(){
      var _self = this,
        eventMap = _self._eventMap;
      for(var name in eventMap){
        if(eventMap.hasOwnProperty(name)){
          eventMap[name].empty();
        }
      }
    },
    /**
     * 触发事件
     * <pre><code>
     *   //绑定事件
     *   list.on('itemclick',function(ev){
     *     alert('21');
     *   });
     *   //触发事件
     *   list.fire('itemclick');
     * </code></pre>
     * @param  {String} eventType 事件类型
     * @param  {Object} eventData 事件触发时传递的数据
     * @return {Boolean|undefined}  如果其中一个事件处理器返回 false , 则返回 false, 否则返回最后一个事件处理器的返回值
     */
    fire : function(eventType,eventData){
      var _self = this,
        callbacks = _self._getCallbacks(eventType),
        args = $.makeArray(arguments),
        result;
      if(!eventData){
        eventData = {};
        args.push(eventData);
      }
      if(!eventData.target){
        eventData.target = _self;
      }
      if(callbacks){
        result = callbacks.fireWith(_self,Array.prototype.slice.call(args,1));
      }
      if(_self._isBubbles(eventType)){
          var bubbleTarget = _self._bubbleTarget;
          if(bubbleTarget && bubbleTarget.fire){
              bubbleTarget.fire(eventType,eventData);
          }
      }
      return result;
    },
    /**
     * 暂停事件的执行
     * <pre><code>
     *  list.pauseEvent('itemclick');
     * </code></pre>
     * @param  {String} eventType 事件类型
     */
    pauseEvent : function(eventType){
      var _self = this,
        callbacks = _self._getCallbacks(eventType);
      callbacks && callbacks.pause();
    },
    /**
     * 唤醒事件
     * <pre><code>
     *  list.resumeEvent('itemclick');
     * </code></pre>
     * @param  {String} eventType 事件类型
     */
    resumeEvent : function(eventType){
      var _self = this,
        callbacks = _self._getCallbacks(eventType);
      callbacks && callbacks.resume();
    },
    /**
     * 添加绑定事件
     * <pre><code>
     *   //绑定单个事件
     *   list.on('itemclick',function(ev){
     *     alert('21');
     *   });
     *   //绑定多个事件
     *   list.on('itemrendered itemupdated',function(){
     *     //列表项创建、更新时触发操作
     *   });
     * </code></pre>
     * @param  {String}   eventType 事件类型
     * @param  {Function} fn        回调函数
     */
    on : function(eventType,fn){
      //一次监听多个事件
      var arr = eventType.split(' '),
        _self = this,
        callbacks =null;
      if(arr.length > 1){
        BUI.each(arr,function(name){
          _self.on(name,fn);
        });
      }else{
        callbacks = _self._getCallbacks(eventType);
        if(callbacks){
          callbacks.add(fn);
        }else{
          _self.addEvents(eventType);
          _self.on(eventType,fn);
        }
      }
      return _self;
    },
    /**
     * 移除绑定的事件
     * <pre><code>
     *  //移除所有事件
     *  list.off();
     *  
     *  //移除特定事件
     *  function callback(ev){}
     *  list.on('click',callback);
     *
     *  list.off('click',callback);//需要保存回调函数的引用
     * 
     * </code></pre>
     * @param  {String}   eventType 事件类型
     * @param  {Function} fn        回调函数
     */
    off : function(eventType,fn){
      if(!eventType && !fn){
        this.clearListeners();
        return this;
      }
      var _self = this,
        callbacks = _self._getCallbacks(eventType);
      if(callbacks){
        if(fn){
          callbacks.remove(fn);
        }else{
          callbacks.empty();
        }
        
      }
      return _self;
    },
    /**
     * 配置事件是否允许冒泡
     * @protected
     * @param  {String} eventType 支持冒泡的事件
     * @param  {Object} cfg 配置项
     * @param {Boolean} cfg.bubbles 是否支持冒泡
     */
    publish : function(eventType, cfg){
      var _self = this,
          bubblesEvents = _self._bubblesEvents;

      if(cfg.bubbles){
          if(BUI.Array.indexOf(eventType,bubblesEvents) === -1){
              bubblesEvents.push(eventType);
          }
      }else{
          var index = BUI.Array.indexOf(eventType,bubblesEvents);
          if(index !== -1){
              bubblesEvents.splice(index,1);
          }
      }
    }
  });

  return Observable;
});

/**
 * @fileOverview UA,jQuery的 $.browser 对象非常难使用
 * @ignore
 * @author dxq613@gmail.com
 */
define('bui/common/ua', function () {

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    };

    function uaMatch(s) {
        s = s.toLowerCase();
        var r = /(chrome)[ \/]([\w.]+)/.exec(s) || /(webkit)[ \/]([\w.]+)/.exec(s) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(s) || /(msie) ([\w.]+)/.exec(s) || s.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(s) || [],
            a = {
                browser: r[1] || "",
                version: r[2] || "0"
            },
            b = {};
        a.browser && (b[a.browser] = !0, b.version = a.version),
            b.chrome ? b.webkit = !0 : b.webkit && (b.safari = !0);
        return b;
    }

    var UA = $.UA || (function () {
        var browser = $.browser || uaMatch(navigator.userAgent),
            versionNumber = numberify(browser.version),
            /**
             * 浏览器版本检测
             * @class BUI.UA
             * @singleton
             */
                ua =
            {
                /**
                 * ie 版本
                 * @type {Number}
                 */
                ie: browser.msie && versionNumber,

                /**
                 * webkit 版本
                 * @type {Number}
                 */
                webkit: browser.webkit && versionNumber,
                /**
                 * opera 版本
                 * @type {Number}
                 */
                opera: browser.opera && versionNumber,
                /**
                 * mozilla 火狐版本
                 * @type {Number}
                 */
                mozilla: browser.mozilla && versionNumber
            };
        return ua;
    })();

    return UA;
});

/**
 * @fileOverview 由于jQuery只有 parseJSON ，没有stringify所以使用过程不方便
 * @ignore
 */
define('bui/common/json',['bui/common/ua'],function (require) {

  var win = window,
    UA = require('bui/common/ua'),
    JSON = win.JSON;

  // ie 8.0.7600.16315@win7 json 有问题
  if (!JSON || UA['ie'] < 9) {
      JSON = win.JSON = {};
  }

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

      Date.prototype.toJSON = function (key) {

          return isFinite(this.valueOf()) ?
              this.getUTCFullYear() + '-' +
                  f(this.getUTCMonth() + 1) + '-' +
                  f(this.getUTCDate()) + 'T' +
                  f(this.getUTCHours()) + ':' +
                  f(this.getUTCMinutes()) + ':' +
                  f(this.getUTCSeconds()) + 'Z' : null;
      };

      String.prototype.toJSON =
          Number.prototype.toJSON =
              Boolean.prototype.toJSON = function (key) {
                  return this.valueOf();
              };
  }


  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },
    rep;

    function quote(string) {

      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.

      escapable['lastIndex'] = 0;
      return escapable.test(string) ?
          '"' + string.replace(escapable, function (a) {
              var c = meta[a];
              return typeof c === 'string' ? c :
                  '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          }) + '"' :
          '"' + string + '"';
    }

    function str(key, holder) {

      // Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.

      if (value && typeof value === 'object' &&
          typeof value.toJSON === 'function') {
          value = value.toJSON(key);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

      // What happens next depends on the value's type.

      switch (typeof value) {
          case 'string':
              return quote(value);

          case 'number':

      // JSON numbers must be finite. Encode non-finite numbers as null.

              return isFinite(value) ? String(value) : 'null';

          case 'boolean':
          case 'null':

      // If the value is a boolean or null, convert it to a string. Note:
      // typeof null does not produce 'null'. The case is included here in
      // the remote chance that this gets fixed someday.

              return String(value);

      // If the type is 'object', we might be dealing with an object or an array or
      // null.

          case 'object':

      // Due to a specification blunder in ECMAScript, typeof null is 'object',
      // so watch out for that case.

              if (!value) {
                  return 'null';
              }

      // Make an array to hold the partial results of stringifying this object value.

              gap += indent;
              partial = [];

      // Is the value an array?

              if (Object.prototype.toString.apply(value) === '[object Array]') {

      // The value is an array. Stringify every element. Use null as a placeholder
      // for non-JSON values.

                  length = value.length;
                  for (i = 0; i < length; i += 1) {
                      partial[i] = str(i, value) || 'null';
                  }

      // Join all of the elements together, separated with commas, and wrap them in
      // brackets.

                  v = partial.length === 0 ? '[]' :
                      gap ? '[\n' + gap +
                          partial.join(',\n' + gap) + '\n' +
                          mind + ']' :
                          '[' + partial.join(',') + ']';
                  gap = mind;
                  return v;
              }

      // If the replacer is an array, use it to select the members to be stringified.

              if (rep && typeof rep === 'object') {
                  length = rep.length;
                  for (i = 0; i < length; i += 1) {
                      k = rep[i];
                      if (typeof k === 'string') {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              } else {

      // Otherwise, iterate through all of the keys in the object.

                  for (k in value) {
                      if (Object.hasOwnProperty.call(value, k)) {
                          v = str(k, value);
                          if (v) {
                              partial.push(quote(k) + (gap ? ': ' : ':') + v);
                          }
                      }
                  }
              }

      // Join all of the member texts together, separated with commas,
      // and wrap them in braces.

              v = partial.length === 0 ? '{}' :
                  gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                      mind + '}' : '{' + partial.join(',') + '}';
              gap = mind;
              return v;
      }
  }

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

      // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.

      return str('', {'': value});
      };
    }

  function looseParse(data){
    try{
      return new Function('return ' + data + ';')();
    }catch(e){
      throw 'Json parse error!';
    }
  }
 /**
	* JSON 格式化
  * @class BUI.JSON
	* @singleton
  */
  var JSON = {
    /**
     * 转成json 等同于$.parseJSON
     * @method
     * @param {String} jsonstring 合法的json 字符串
     */
    parse : $.parseJSON,
    /**
     * 业务中有些字符串组成的json数据不是严格的json数据，如使用单引号，或者属性名不是字符串
     * 如 ： {a:'abc'}
     * @method 
     * @param {String} jsonstring
     */
    looseParse : looseParse,
    /**
     * 将Json转成字符串
     * @method 
     * @param {Object} json json 对象
     */
    stringify : JSON.stringify
  }

  return JSON;
});

/**
 * @fileOverview 键盘值
 * @ignore
 */

define('bui/common/keycode',function () {
  
  /**
   * 键盘按键对应的数字值
   * @class BUI.KeyCode
   * @singleton
   */
  var keyCode = {
    /** Key constant @type Number */
    BACKSPACE: 8,
    /** Key constant @type Number */
    TAB: 9,
    /** Key constant @type Number */
    NUM_CENTER: 12,
    /** Key constant @type Number */
    ENTER: 13,
    /** Key constant @type Number */
    RETURN: 13,
    /** Key constant @type Number */
    SHIFT: 16,
    /** Key constant @type Number */
    CTRL: 17,
    /** Key constant @type Number */
    ALT: 18,
    /** Key constant @type Number */
    PAUSE: 19,
    /** Key constant @type Number */
    CAPS_LOCK: 20,
    /** Key constant @type Number */
    ESC: 27,
    /** Key constant @type Number */
    SPACE: 32,
    /** Key constant @type Number */
    PAGE_UP: 33,
    /** Key constant @type Number */
    PAGE_DOWN: 34,
    /** Key constant @type Number */
    END: 35,
    /** Key constant @type Number */
    HOME: 36,
    /** Key constant @type Number */
    LEFT: 37,
    /** Key constant @type Number */
    UP: 38,
    /** Key constant @type Number */
    RIGHT: 39,
    /** Key constant @type Number */
    DOWN: 40,
    /** Key constant @type Number */
    PRINT_SCREEN: 44,
    /** Key constant @type Number */
    INSERT: 45,
    /** Key constant @type Number */
    DELETE: 46,
    /** Key constant @type Number */
    ZERO: 48,
    /** Key constant @type Number */
    ONE: 49,
    /** Key constant @type Number */
    TWO: 50,
    /** Key constant @type Number */
    THREE: 51,
    /** Key constant @type Number */
    FOUR: 52,
    /** Key constant @type Number */
    FIVE: 53,
    /** Key constant @type Number */
    SIX: 54,
    /** Key constant @type Number */
    SEVEN: 55,
    /** Key constant @type Number */
    EIGHT: 56,
    /** Key constant @type Number */
    NINE: 57,
    /** Key constant @type Number */
    A: 65,
    /** Key constant @type Number */
    B: 66,
    /** Key constant @type Number */
    C: 67,
    /** Key constant @type Number */
    D: 68,
    /** Key constant @type Number */
    E: 69,
    /** Key constant @type Number */
    F: 70,
    /** Key constant @type Number */
    G: 71,
    /** Key constant @type Number */
    H: 72,
    /** Key constant @type Number */
    I: 73,
    /** Key constant @type Number */
    J: 74,
    /** Key constant @type Number */
    K: 75,
    /** Key constant @type Number */
    L: 76,
    /** Key constant @type Number */
    M: 77,
    /** Key constant @type Number */
    N: 78,
    /** Key constant @type Number */
    O: 79,
    /** Key constant @type Number */
    P: 80,
    /** Key constant @type Number */
    Q: 81,
    /** Key constant @type Number */
    R: 82,
    /** Key constant @type Number */
    S: 83,
    /** Key constant @type Number */
    T: 84,
    /** Key constant @type Number */
    U: 85,
    /** Key constant @type Number */
    V: 86,
    /** Key constant @type Number */
    W: 87,
    /** Key constant @type Number */
    X: 88,
    /** Key constant @type Number */
    Y: 89,
    /** Key constant @type Number */
    Z: 90,
    /** Key constant @type Number */
    CONTEXT_MENU: 93,
    /** Key constant @type Number */
    NUM_ZERO: 96,
    /** Key constant @type Number */
    NUM_ONE: 97,
    /** Key constant @type Number */
    NUM_TWO: 98,
    /** Key constant @type Number */
    NUM_THREE: 99,
    /** Key constant @type Number */
    NUM_FOUR: 100,
    /** Key constant @type Number */
    NUM_FIVE: 101,
    /** Key constant @type Number */
    NUM_SIX: 102,
    /** Key constant @type Number */
    NUM_SEVEN: 103,
    /** Key constant @type Number */
    NUM_EIGHT: 104,
    /** Key constant @type Number */
    NUM_NINE: 105,
    /** Key constant @type Number */
    NUM_MULTIPLY: 106,
    /** Key constant @type Number */
    NUM_PLUS: 107,
    /** Key constant @type Number */
    NUM_MINUS: 109,
    /** Key constant @type Number */
    NUM_PERIOD: 110,
    /** Key constant @type Number */
    NUM_DIVISION: 111,
    /** Key constant @type Number */
    F1: 112,
    /** Key constant @type Number */
    F2: 113,
    /** Key constant @type Number */
    F3: 114,
    /** Key constant @type Number */
    F4: 115,
    /** Key constant @type Number */
    F5: 116,
    /** Key constant @type Number */
    F6: 117,
    /** Key constant @type Number */
    F7: 118,
    /** Key constant @type Number */
    F8: 119,
    /** Key constant @type Number */
    F9: 120,
    /** Key constant @type Number */
    F10: 121,
    /** Key constant @type Number */
    F11: 122,
    /** Key constant @type Number */
    F12: 123
  };

  return keyCode;
});

/*
 * @fileOverview Date Format 1.2.3
 * @ignore
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * Last modified by jayli 拔赤 2010-09-09
 * - 增加中文的支持
 * - 简单的本地化，对w（星期x）的支持
 * 
 */
define('bui/common/date', function () {

    var dateRegex = /^(?:(?!0000)[0-9]{4}([-/.]+)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-/.]?)0?2\2(?:29))(\s+([01]|([01][0-9]|2[0-3])):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]))?$/;

    function dateParse(val, format) {
		if(val instanceof Date){
			return val;
		}
		if (typeof(format)=="undefined" || format==null || format=="") {
			var checkList=new Array('y-m-d','yyyy-mm-dd','yyyy-mm-dd HH:MM:ss','H:M:s');
			for (var i=0; i<checkList.length; i++) {
					var d=dateParse(val,checkList[i]);
					if (d!=null) { 
						return d; 
					}
			}
			return null;
		};
        val = val + "";
        var i_val = 0;
        var i_format = 0;
        var c = "";
        var token = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 1;
        var hh = 00;
        var mm = 00;
        var ss = 00;
        this.isInteger = function(val) {
            return /^\d*$/.test(val);
		};
		this.getInt = function(str,i,minlength,maxlength) {
			for (var x=maxlength; x>=minlength; x--) {
				var token=str.substring(i,i+x);
				if (token.length < minlength) { 
					return null; 
				}
				if (this.isInteger(token)) { 
					return token; 
				}
			}
		return null;
		};

        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            if (token=="yyyy" || token=="yy" || token=="y") {
				if (token=="yyyy") { 
					x=4;y=4; 
				}
				if (token=="yy") { 
					x=2;y=2; 
				}
				if (token=="y") { 
					x=2;y=4; 
				}
				year=this.getInt(val,i_val,x,y);
				if (year==null) { 
					return null; 
				}
				i_val += year.length;
				if (year.length==2) {
                    year = year>70?1900+(year-0):2000+(year-0);
				}
			}
            else if (token=="mm"||token=="m") {
				month=this.getInt(val,i_val,token.length,2);
				if(month==null||(month<1)||(month>12)){
					return null;
				}
				i_val+=month.length;
			}
			else if (token=="dd"||token=="d") {
				date=this.getInt(val,i_val,token.length,2);
				if(date==null||(date<1)||(date>31)){
					return null;
				}
				i_val+=date.length;
			}
			else if (token=="hh"||token=="h") {
				hh=this.getInt(val,i_val,token.length,2);
				if(hh==null||(hh<1)||(hh>12)){
					return null;
				}
				i_val+=hh.length;
			}
			else if (token=="HH"||token=="H") {
				hh=this.getInt(val,i_val,token.length,2);
				if(hh==null||(hh<0)||(hh>23)){
					return null;
				}
				i_val+=hh.length;
			}
			else if (token=="MM"||token=="M") {
				mm=this.getInt(val,i_val,token.length,2);
				if(mm==null||(mm<0)||(mm>59)){
					return null;
				}
				i_val+=mm.length;
			}
			else if (token=="ss"||token=="s") {
				ss=this.getInt(val,i_val,token.length,2);
				if(ss==null||(ss<0)||(ss>59)){
					return null;
				}
				i_val+=ss.length;
			}
			else {
				if (val.substring(i_val,i_val+token.length)!=token) {
					return null;
				}
				else {
					i_val+=token.length;
				}
			}
		}
		if (i_val != val.length) { 
			return null; 
		}
		if (month==2) {
			if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
				if (date > 29){ 
					return null; 
				}
			}
			else { 
				if (date > 28) { 
					return null; 
				} 
			}
		}
		if ((month==4)||(month==6)||(month==9)||(month==11)) {
			if (date > 30) { 
				return null; 
			}
		}
		return new Date(year,month-1,date,hh,mm,ss);
    }

    function DateAdd(strInterval, NumDay, dtDate) {
        var dtTmp = new Date(dtDate);
        if (isNaN(dtTmp)) {
            dtTmp = new Date();
        }
        NumDay = parseInt(NumDay,10);
        switch (strInterval) {
            case   's':
                dtTmp = new Date(dtTmp.getTime() + (1000 * NumDay));
                break;
            case   'n':
                dtTmp = new Date(dtTmp.getTime() + (60000 * NumDay));
                break;
            case   'h':
                dtTmp = new Date(dtTmp.getTime() + (3600000 * NumDay));
                break;
            case   'd':
                dtTmp = new Date(dtTmp.getTime() + (86400000 * NumDay));
                break;
            case   'w':
                dtTmp = new Date(dtTmp.getTime() + ((86400000 * 7) * NumDay));
                break;
            case   'm':
                dtTmp = new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + NumDay, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                break;
            case   'y':
                //alert(dtTmp.getFullYear());
                dtTmp = new Date(dtTmp.getFullYear() + NumDay, dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
                //alert(dtTmp);
                break;
        }
        return dtTmp;
    }

    var dateFormat = function () {
        var token = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = '0' + val;
                }
                return val;
            },
            // Some common format strings
            masks = {
                'default':'ddd mmm dd yyyy HH:MM:ss',
                shortDate:'m/d/yy',
                //mediumDate:     'mmm d, yyyy',
                longDate:'mmmm d, yyyy',
                fullDate:'dddd, mmmm d, yyyy',
                shortTime:'h:MM TT',
                //mediumTime:     'h:MM:ss TT',
                longTime:'h:MM:ss TT Z',
                isoDate:'yyyy-mm-dd',
                isoTime:'HH:MM:ss',
                isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",
                isoUTCDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",

                //added by jayli
                localShortDate:'yy年mm月dd日',
                localShortDateTime:'yy年mm月dd日 hh:MM:ss TT',
                localLongDate:'yyyy年mm月dd日',
                localLongDateTime:'yyyy年mm月dd日 hh:MM:ss TT',
                localFullDate:'yyyy年mm月dd日 w',
                localFullDateTime:'yyyy年mm月dd日 w hh:MM:ss TT'

            },

            // Internationalization strings
            i18n = {
                dayNames:[
                    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
                    '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
                ],
                monthNames:[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
                ]
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                throw SyntaxError('invalid date');
            }

            mask = String(masks[mask] || mask || masks['default']);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) === 'UTC:') {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? 'getUTC' : 'get',
                d = date[_ + 'Date'](),
                D = date[_ + 'Day'](),
                m = date[_ + 'Month'](),
                y = date[_ + 'FullYear'](),
                H = date[_ + 'Hours'](),
                M = date[_ + 'Minutes'](),
                s = date[_ + 'Seconds'](),
                L = date[_ + 'Milliseconds'](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:d,
                    dd:pad(d, undefined),
                    ddd:i18n.dayNames[D],
                    dddd:i18n.dayNames[D + 7],
                    w:i18n.dayNames[D + 14],
                    m:m + 1,
                    mm:pad(m + 1, undefined),
                    mmm:i18n.monthNames[m],
                    mmmm:i18n.monthNames[m + 12],
                    yy:String(y).slice(2),
                    yyyy:y,
                    h:H % 12 || 12,
                    hh:pad(H % 12 || 12, undefined),
                    H:H,
                    HH:pad(H, undefined),
                    M:M,
                    MM:pad(M, undefined),
                    s:s,
                    ss:pad(s, undefined),
                    l:pad(L, 3),
                    L:pad(L > 99 ? Math.round(L / 10) : L, undefined),
                    t:H < 12 ? 'a' : 'p',
                    tt:H < 12 ? 'am' : 'pm',
                    T:H < 12 ? 'A' : 'P',
                    TT:H < 12 ? 'AM' : 'PM',
                    Z:utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                    o:(o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    /**
     * 日期的工具方法
     * @class BUI.Date
     */
    var DateUtil = {
        /**
         * 日期加法
         * @param {String} strInterval 加法的类型，s(秒),n(分),h(时),d(天),w(周),m(月),y(年)
         * @param {Number} Num         数量，如果为负数，则为减法
         * @param {Date} dtDate      起始日期，默认为此时
         */
        add: function (strInterval, Num, dtDate) {
            return DateAdd(strInterval, Num, dtDate);
        },
        /**
         * 小时的加法
         * @param {Number} hours 小时
         * @param {Date} date 起始日期
         */
        addHour: function (hours, date) {
            return DateAdd('h', hours, date);
        },
        /**
         * 分的加法
         * @param {Number} minutes 分
         * @param {Date} date 起始日期
         */
        addMinute: function (minutes, date) {
            return DateAdd('n', minutes, date);
        },
        /**
         * 秒的加法
         * @param {Number} seconds 秒
         * @param {Date} date 起始日期
         */
        addSecond: function (seconds, date) {
            return DateAdd('s', seconds, date);
        },
        /**
         * 天的加法
         * @param {Number} days 天数
         * @param {Date} date 起始日期
         */
        addDay: function (days, date) {
            return DateAdd('d', days, date);
        },
        /**
         * 增加周
         * @param {Number} weeks 周数
         * @param {Date} date  起始日期
         */
        addWeek: function (weeks, date) {
            return DateAdd('w', weeks, date);
        },
        /**
         * 增加月
         * @param {Number} months 月数
         * @param {Date} date  起始日期
         */
        addMonths: function (months, date) {
            return DateAdd('m', months, date);
        },
        /**
         * 增加年
         * @param {Number} years 年数
         * @param {Date} date  起始日期
         */
        addYear: function (years, date) {
            return DateAdd('y', years, date);
        },
        /**
         * 日期是否相等，忽略时间
         * @param  {Date}  d1 日期对象
         * @param  {Date}  d2 日期对象
         * @return {Boolean}    是否相等
         */
        isDateEquals: function (d1, d2) {

            return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        },
        /**
         * 日期时间是否相等，包含时间
         * @param  {Date}  d1 日期对象
         * @param  {Date}  d2 日期对象
         * @return {Boolean}    是否相等
         */
        isEquals: function (d1, d2) {
            if (d1 == d2) {
                return true;
            }
            if (!d1 || !d2) {
                return false;
            }
            if (!d1.getTime || !d2.getTime) {
                return false;
            }
            return d1.getTime() == d2.getTime();
        },
        /**
         * 字符串是否是有效的日期类型
         * @param {String} str 字符串
         * @return 字符串是否能转换成日期
         */
        isDateString: function (str) {
            return dateRegex.test(str);
        },
        /**
         * 将日期格式化成字符串
         * @param  {Date} date 日期
         * @param  {String} mask 格式化方式
         * @param  {Date} utc  是否utc时间
         * @return {String}      日期的字符串
         */
        format: function (date, mask, utc) {
            return dateFormat(date, mask, utc);
        },
        /**
         * 转换成日期
         * @param  {String|Date} date 字符串或者日期
         * @param  {String} dateMask  日期的格式,如:yyyy-MM-dd
         * @return {Date}      日期对象
         */
        parse: function (date, s) {
            if(BUI.isString(date)){
                date = date.replace('\/','-');
            }
            return dateParse(date, s);
        },
        /**
         * 当前天
         * @return {Date} 当前天 00:00:00
         */
        today: function () {
            var now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        },
        /**
         * 返回当前日期
         * @return {Date} 日期的 00:00:00
         */
        getDate: function (date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
    };

    return DateUtil;
});

/**
 * @fileOverview  Base UI控件的最基础的类
 * @author yiminghe@gmail.com
 * copied by dxq613@gmail.com
 * @ignore
 */
define('bui/common/base',['bui/common/observable'],function(require){

  var INVALID = {},
    Observable = require('bui/common/observable');

  function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
  }

  function normalFn(host, method) {
      if (BUI.isString(method)) {
          return host[method];
      }
      return method;
  }

  function __fireAttrChange(self, when, name, prevVal, newVal) {
      var attrName = name;
      return self.fire(when + BUI.ucfirst(name) + 'Change', {
          attrName: attrName,
          prevVal: prevVal,
          newVal: newVal
      });
  }

  function setInternal(self, name, value, opts, attrs) {
      opts = opts || {};

      var ret,
          subVal,
          prevVal;

      prevVal = self.get(name);

      //如果未改变值不进行修改
      if(!$.isPlainObject(value) && !BUI.isArray(value) && prevVal === value){
        return undefined;
      }
      // check before event
      if (!opts['silent']) {
          if (false === __fireAttrChange(self, 'before', name, prevVal, value)) {
              return false;
          }
      }
      // set it
      ret = self._set(name, value, opts);

      if (ret === false) {
          return ret;
      }

      // fire after event
      if (!opts['silent']) {
          value = self.__attrVals[name];
          __fireAttrChange(self, 'after', name, prevVal, value);
      }
      return self;
  }

  function initClassAttrs(c){
    if(c._attrs || c == Base){
      return;
    }

    var superCon = c.superclass.constructor;
    if(superCon && !superCon._attrs){
      initClassAttrs(superCon);
    }
    c._attrs =  {};
    
    BUI.mixAttrs(c._attrs,superCon._attrs);
    BUI.mixAttrs(c._attrs,c.ATTRS);
  }
  /**
   * 基础类，此类提供以下功能
   *  - 提供设置获取属性
   *  - 提供事件支持
   *  - 属性变化时会触发对应的事件
   *  - 将配置项自动转换成属性
   *
   * ** 创建类，继承BUI.Base类 **
   * <pre><code>
   *   var Control = function(cfg){
   *     Control.superclass.constructor.call(this,cfg); //调用BUI.Base的构造方法，将配置项变成属性
   *   };
   *
   *   BUI.extend(Control,BUI.Base);
   * </code></pre>
   *
   * ** 声明默认属性 ** 
   * <pre><code>
   *   Control.ATTRS = {
   *     id : {
   *       value : 'id' //value 是此属性的默认值
   *     },
   *     renderTo : {
   *      
   *     },
   *     el : {
   *       valueFn : function(){                 //第一次调用的时候将renderTo的DOM转换成el属性
   *         return $(this.get('renderTo'));
   *       }
   *     },
   *     text : {
   *       getter : function(){ //getter 用于获取值，而不是设置的值
   *         return this.get('el').val();
   *       },
   *       setter : function(v){ //不仅仅是设置值，可以进行相应的操作
   *         this.get('el').val(v);
   *       }
   *     }
   *   };
   * </code></pre>
   *
   * ** 声明类的方法 ** 
   * <pre><code>
   *   BUI.augment(Control,{
   *     getText : function(){
   *       return this.get('text');   //可以用get方法获取属性值
   *     },
   *     setText : function(txt){
   *       this.set('text',txt);      //使用set 设置属性值
   *     }
   *   });
   * </code></pre>
   *
   * ** 创建对象 ** 
   * <pre><code>
   *   var c = new Control({
   *     id : 'oldId',
   *     text : '测试文本',
   *     renderTo : '#t1'
   *   });
   *
   *   var el = c.get(el); //$(#t1);
   *   el.val(); //text的值 ： '测试文本'
   *   c.set('text','修改的值');
   *   el.val();  //'修改的值'
   *
   *   c.set('id','newId') //会触发2个事件： beforeIdChange,afterIdChange 2个事件 ev.newVal 和ev.prevVal标示新旧值
   * </code></pre>
   * @class BUI.Base
   * @abstract
   * @extends BUI.Observable
   * @param {Object} config 配置项
   */
  var Base = function(config){
    var _self = this,
            c = _self.constructor,
            constructors = [];
        this.__attrs = {};
        this.__attrVals = {};
        Observable.apply(this,arguments);
        // define
        while (c) {
            constructors.push(c);
            if(c.extensions){ //延迟执行mixin
              BUI.mixin(c,c.extensions);
              delete c.extensions;
            }
            //_self.addAttrs(c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        //以当前对象的属性最终添加到属性中，覆盖之前的属性
        /*for (var i = constructors.length - 1; i >= 0; i--) {
          _self.addAttrs(constructors[i]['ATTRS'],true);
        };*/
      var con = _self.constructor;
      initClassAttrs(con);
      _self._initStaticAttrs(con._attrs);
      _self._initAttrs(config);
  };

  Base.INVALID = INVALID;

  BUI.extend(Base,Observable);

  BUI.augment(Base,
  {
    _initStaticAttrs : function(attrs){
      var _self = this,
        __attrs;

      __attrs = _self.__attrs = {};
      for (var p in attrs) {
        if(attrs.hasOwnProperty(p)){
          var attr = attrs[p];
          /*if(BUI.isObject(attr.value) || BUI.isArray(attr.value) || attr.valueFn){*/
          if(attr.shared === false || attr.valueFn){
            __attrs[p] = {};
            BUI.mixAttr(__attrs[p], attrs[p]); 
          }else{
            __attrs[p] = attrs[p];
          }
        }
      };
    },
    /**
     * 添加属性定义
     * @protected
     * @param {String} name       属性名
     * @param {Object} attrConfig 属性定义
     * @param {Boolean} overrides 是否覆盖字段
     */
    addAttr: function (name, attrConfig,overrides) {
            var _self = this,
                attrs = _self.__attrs,
                attr = attrs[name];
            
            if(!attr){
              attr = attrs[name] = {};
            }
            for (var p in attrConfig) {
              if(attrConfig.hasOwnProperty(p)){
                if(p == 'value'){
                  if(BUI.isObject(attrConfig[p])){
                    attr[p] = attr[p] || {};
                    BUI.mix(/*true,*/attr[p], attrConfig[p]); 
                  }else if(BUI.isArray(attrConfig[p])){
                    attr[p] = attr[p] || [];
                    BUI.mix(/*true,*/attr[p], attrConfig[p]); 
                  }else{
                    attr[p] = attrConfig[p];
                  }
                }else{
                  attr[p] = attrConfig[p];
                }
              }

            };
            return _self;
    },
    /**
     * 添加属性定义
     * @protected
     * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
     * @param {Object} initialValues user defined initial values
     * @param {Boolean} overrides 是否覆盖字段
     */
    addAttrs: function (attrConfigs, initialValues,overrides) {
        var _self = this;
        if(!attrConfigs)
        {
          return _self;
        }
        if(typeof(initialValues) === 'boolean'){
          overrides = initialValues;
          initialValues = null;
        }
        BUI.each(attrConfigs, function (attrConfig, name) {
            _self.addAttr(name, attrConfig,overrides);
        });
        if (initialValues) {
            _self.set(initialValues);
        }
        return _self;
    },
    /**
     * 是否包含此属性
     * @protected
     * @param  {String}  name 值
     * @return {Boolean} 是否包含
     */
    hasAttr : function(name){
      return name && this.__attrs.hasOwnProperty(name);
    },
    /**
     * 获取默认的属性值
     * @protected
     * @return {Object} 属性值的键值对
     */
    getAttrs : function(){
       return this.__attrs;//ensureNonEmpty(this, '__attrs', true);
    },
    /**
     * 获取属性名/属性值键值对
     * @protected
     * @return {Object} 属性对象
     */
    getAttrVals: function(){
      return this.__attrVals; //ensureNonEmpty(this, '__attrVals', true);
    },
    /**
     * 获取属性值，所有的配置项和属性都可以通过get方法获取
     * <pre><code>
     *  var control = new Control({
     *   text : 'control text'
     *  });
     *  control.get('text'); //control text
     *
     *  control.set('customValue','value'); //临时变量
     *  control.get('customValue'); //value
     * </code></pre>
     * ** 属性值/配置项 **
     * <pre><code> 
     *   Control.ATTRS = { //声明属性值
     *     text : {
     *       valueFn : function(){},
     *       value : 'value',
     *       getter : function(v){} 
     *     }
     *   };
     *   var c = new Control({
     *     text : 'text value'
     *   });
     *   //get 函数取的顺序为：是否有修改值（配置项、set)、默认值（第一次调用执行valueFn)，如果有getter，则将值传入getter返回
     *
     *   c.get('text') //text value
     *   c.set('text','new text');//修改值
     *   c.get('text');//new text
     * </code></pre>
     * @param  {String} name 属性名
     * @return {Object} 属性值
     */
    get : function(name){
      var _self = this,
                //declared = _self.hasAttr(name),
                attrVals = _self.__attrVals,
                attrConfig,
                getter, 
                ret;

            attrConfig = ensureNonEmpty(_self.__attrs, name);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in attrVals ?
                attrVals[name] :
                _self._getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter && (getter = normalFn(_self, getter))) {
                ret = getter.call(_self, ret, name);
            }

            return ret;
    },
  	/**
  	* @清理所有属性值
    * @protected 
  	*/
  	clearAttrVals : function(){
  		this.__attrVals = {};
  	},
    /**
     * 移除属性定义
     * @protected
     */
    removeAttr: function (name) {
        var _self = this;

        if (_self.hasAttr(name)) {
            delete _self.__attrs[name];
            delete _self.__attrVals[name];
        }

        return _self;
    },
    /**
     * 设置属性值，会触发before+Name+Change,和 after+Name+Change事件
     * <pre><code>
     *  control.on('beforeTextChange',function(ev){
     *    var newVal = ev.newVal,
     *      attrName = ev.attrName,
     *      preVal = ev.prevVal;
     *
     *    //TO DO
     *  });
     *  control.set('text','new text');  //此时触发 beforeTextChange,afterTextChange
     *  control.set('text','modify text',{silent : true}); //此时不触发事件
     * </code></pre>
     * @param {String|Object} name  属性名
     * @param {Object} value 值
     * @param {Object} opts 配置项
     * @param {Boolean} opts.silent  配置属性时，是否不触发事件
     */
    set : function(name,value,opts){
      var _self = this;
            if ($.isPlainObject(name)) {
                opts = value;
                var all = Object(name),
                    attrs = [];
                   
                for (name in all) {
                    if (all.hasOwnProperty(name)) {
                        setInternal(_self, name, all[name], opts);
                    }
                }
                return _self;
            }
            return setInternal(_self, name, value, opts);
    },
    /**
     * 设置属性，不触发事件
     * <pre><code>
     *  control.setInternal('text','text');//此时不触发事件
     * </code></pre>
     * @param  {String} name  属性名
     * @param  {Object} value 属性值
     * @return {Boolean|undefined}   如果值无效则返回false,否则返回undefined
     */
    setInternal : function(name, value, opts){
        return this._set(name, value, opts);
    },
    //获取属性默认值
    _getDefAttrVal : function(name){
      var _self = this,
        attrs = _self.__attrs,
              attrConfig = ensureNonEmpty(attrs, name),
              valFn = attrConfig.valueFn,
              val;

          if (valFn && (valFn = normalFn(_self, valFn))) {
              val = valFn.call(_self);
              if (val !== undefined) {
                  attrConfig.value = val;
              }
              delete attrConfig.valueFn;
              attrs[name] = attrConfig;
          }

          return attrConfig.value;
    },
    //仅仅设置属性值
    _set : function(name, value, opts){
      var _self = this,
                setValue,
            // if host does not have meta info corresponding to (name,value)
            // then register on demand in order to collect all data meta info
            // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
            // 因为属性在声明注册前可以直接设置值
                attrConfig = ensureNonEmpty(_self.__attrs, name, true),
                setter = attrConfig['setter'];

            // if setter has effect
            if (setter && (setter = normalFn(_self, setter))) {
                setValue = setter.call(_self, value, name);
            }

            if (setValue === INVALID) {
                return false;
            }

            if (setValue !== undefined) {
                value = setValue;
            }
            
            // finally set
            _self.__attrVals[name] = value;
      return _self;
    },
    //初始化属性
    _initAttrs : function(config){
      var _self = this;
      if (config) {
              for (var attr in config) {
                  if (config.hasOwnProperty(attr)) {
                      // 用户设置会调用 setter/validator 的，但不会触发属性变化事件
                      _self._set(attr, config[attr]);
                  }

              }
          }
    }
  });

  //BUI.Base = Base;
  return Base;
});
