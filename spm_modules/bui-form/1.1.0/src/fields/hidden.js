/**
* @fileOverview 隐藏字段
* @ignore
* @author dxq613@gmail.com
*/

var Field = require('./base');
/**
 * 表单隐藏域
 * @class BUI.Form.Field.Hidden
 * @extends BUI.Form.Field
 */
var hiddenField = Field.extend({

},{
  ATTRS : {
    /**
     * 内部表单元素的容器
     * @type {String}
     */
    controlTpl : {
      value : '<input type="hidden"/>'
    },
    tpl : {
      value : ''
    }
  }
},{
  xclass : 'form-field-hidden'
});

module.exports = hiddenField;
