/**
 * @fileOverview 表单文本域组，可以包含一个至多个字段
 * @author dxq613@gmail.com
 * @ignore
 */

var BUI = require('bui-common'),
  FieldContainer = require('../fieldcontainer');

/**
 * @class BUI.Form.Group
 * 表单字段分组
 * @extends BUI.Form.FieldContainer
 */
var Group = FieldContainer.extend({
  
},{
  ATTRS : {
    /**
     * 标题
     * @type {String}
     */
    label : {
      view : true
    },
    defaultChildClass : {
      value : 'form-field'
    }
  }
},{
  xclass:'form-group'
});

module.exports = Group;
