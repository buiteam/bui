/**
 * @fileOverview 表单文本域
 * @author dxq613@gmail.com
 * @ignore
 */

var Field = require('./base');

/**
 * 表单文本域
 * @class BUI.Form.Field.Text
 * @extends BUI.Form.Field
 */
var textField = Field.extend({

},{
  xclass : 'form-field-text'
});

module.exports = textField;
