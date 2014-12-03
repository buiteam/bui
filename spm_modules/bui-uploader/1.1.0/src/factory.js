/**
 * @fileoverview 文件上传的工厂类
 * @author 索丘 yezengyue@gmail.com
 * @ignore
 **/

var BUI = require('bui-common'),
  Queue = require('./queue'),
  HtmlButton = require('./button/htmlButton'),
  SwfButton = require('./button/swfButton'),
  Ajax = require('./type/ajax'),
  Flash = require('./type/flash'),
  Iframe = require('./type/iframe');

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
