/**
 * @fileOverview 输入、选择完毕后显示tag
 * @ignore
 */

var $ = require('jquery'),
  BUI = require('bui-common'),
  List = require('bui-list'),
  KeyCode = BUI.KeyCode,
  WARN = 'warn';

function html_decode(str)   
{   
  var s = "";   
  if (str.length == 0) return "";   
  s = str.replace(/>/g, "&gt;");   
  s = s.replace(/</g, "&lt;");   
  return s;   
}    

/**
 * @class BUI.Select.Tag
 * 显示tag的扩展
 */
var Tag = function(){

};

Tag.ATTRS = {
  /**
   * 显示tag
   * @type {Boolean}
   */
  showTag : {
    value : false
  },
  /**
   * tag的模板
   * @type {String}
   */
  tagItemTpl : {
    value : '<li>{text}<button>×</button></li>'
  },
  /**
   * @private
   * tag 的列表
   * @type {Object}
   */
  tagList : {
    value : null
  },
  limit : {
    value : null
  },
  forbitInput : {
    value : false
  },
  tagPlaceholder : {
    value : '输入标签'
  },
  tagFormatter : {
    value : null
  },
  /**
   * 默认的value分隔符，将值分割显示成tag
   * @type {String}
   */
  separator : {
    value : ';'
  }
};

BUI.augment(Tag,{

  __renderUI : function(){
    var _self = this,
      showTag = _self.get('showTag'),
      tagPlaceholder = _self.get('tagPlaceholder'),
      tagInput = _self.getTagInput();
    if(showTag && !tagInput.attr('placeholder')){
      tagInput.attr('placeholder',tagPlaceholder);
      _self.set('inputForceFit',false);
    }
  },
  __bindUI : function(){
    var _self = this,
      showTag = _self.get('showTag'),
      tagInput = _self.getTagInput();
    if(showTag){
      tagInput.on('keydown',function(ev){
        if(!tagInput.val()){
          var tagList =  _self.get('tagList'),
            last = tagList.getLastItem(),
            picker = _self.get('picker');
          if(ev.which == KeyCode.DELETE || ev.which == KeyCode.BACKSPACE){
            if(tagList.hasStatus(last,WARN)){
              _self._delTag(last);
            }else{
              tagList.setItemStatus(last,WARN,true);
            }
            picker.hide();
          }else{
            tagList.setItemStatus(last,WARN,false);
          }
        }
      });

      var handler;
      function setTag(){
        var tagList =  _self.get('tagList'),
          last = tagList.getLastItem();
        if(last && tagList.hasStatus(last,WARN)){ //如果最后一项处于警告状态
          tagList.setItemStatus(last,WARN,false);
        }

        var val = tagInput.val();
        if(val){
          _self._addTag(val);
        }
        
      }
      if(!_self.get('forbitInput')){
        tagInput.on('change',function(){
          handler = setTimeout(function(){
            setTag();
            handler = null;
          },50);
        });
      }
      

      _self.on('change',function(ev){
        setTimeout(function(){
          if(handler){
            clearTimeout(handler);
          }
          setTag();
        });
      });
    }
  },
  __syncUI : function(){
    var _self = this,
      showTag = _self.get('showTag'),
      valueField = _self.get('valueField');
    if(showTag && valueField){
      _self._setTags($(valueField).val());
    }
  },
  //设置tags，初始化时处理
  _setTags : function(value){
    
    var _self = this,
      tagList = _self.get('tagList'),
      separator = _self.get('separator'),
      formatter = _self.get('tagFormatter'),
      values = value.split(separator);
    if(!tagList){
      tagList = _self._initTagList();
    }
    if(value){
      BUI.each(values,function(val){
        var text = val;
        if(formatter){
          text = formatter(text);
        }
        tagList.addItem({value : val,text : text});
      });
    }
  },
  //添加tag
  _addTag : function(value){
    value = html_decode(value);
    var _self = this,
      tagList = _self.get('tagList'),
      tagInput = _self.getTagInput(),
      limit = _self.get('limit'),
      formatter = _self.get('tagFormatter'),
      preItem = tagList.getItem(value);
    if(limit){
      if(tagList.getItemCount() >= limit){
        return;
      }
    }
    if(!preItem){
      var text = value;
      if(formatter){
        text = formatter(text);
      }
      tagList.addItem({value : value,text : text});
      _self._synTagsValue();
    }else{
      _self._blurItem(tagList,preItem);
    }
    tagInput.val('');

  },
  //提示用户选项已经存在
  _blurItem : function(list,item){
    list.setItemStatus(item,'active',true);
    setTimeout(function(){
      list.setItemStatus(item,'active',false);
    },400);
  },
  //删除tag
  _delTag : function(item){
    var _self = this,
      tagList = _self.get('tagList');

    tagList.removeItem(item);
    _self._synTagsValue();
  },

  /**
   * 获取tag 列表的值
   * @return {String} 列表对应的值
   */
  getTagsValue : function(){
    var _self = this,
      tagList = _self.get('tagList'),
      items = tagList.getItems(),
      vals = [];

    BUI.each(items,function(item){
      vals.push(item.value);
    });
    return vals.join(_self.get('separator'));
  },
  //初始化tagList
  _initTagList : function(){
    var _self = this,
      tagInput = _self.getTagInput(),
      tagList = new List.SimpleList({
        elBefore : tagInput,
        itemTpl : _self.get('tagItemTpl'),
        idField : 'value'
      });
    tagList.render();
    _self._initTagEvent(tagList);
    _self.set('tagList',tagList);
    return tagList;
  },
  //初始化tag删除事件
  _initTagEvent : function(list){
    var _self = this;
    list.on('itemclick',function(ev){
      var sender = $(ev.domTarget);
      if(sender.is('button')){
        _self._delTag(ev.item);
      }
    });
  },
  /**
   * 获取输入的文本框
   * @protected
   * @return {jQuery} 输入框
   */
  getTagInput : function(){
    var _self = this,
        el = _self.get('el');
    return el.is('input') ? el : el.find('input');
  },
  _synTagsValue : function(){
    var _self = this,
      valueEl = _self.get('valueField');
     valueEl && $(valueEl).val(_self.getTagsValue());
  }
});

module.exports = Tag;
