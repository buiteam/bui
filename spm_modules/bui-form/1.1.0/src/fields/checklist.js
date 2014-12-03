/**
 * @fileOverview 可勾选的列表，模拟多个checkbox
 * @ignore
 */

'use strict';
var BUI = require('bui-common'),
  ListField = require('./list');

/**
 * @class BUI.Form.Field.CheckList
 * 可勾选的列表，模拟多个checkbox
 * @extends BUI.Form.Field.List
 */
var CheckList = ListField.extend({

},{
  ATTRS : {
    /**
     * @protected
     * 默认的列表配置
     * @type {Object}
     */
    defaultListCfg : {
      value : {
        itemTpl : '<li><span class="x-checkbox"></span>{text}</li>',
        multipleSelect : true,
        allowTextSelection : false
      }
    }
  }
},{
  xclass : 'form-field-checklist'
});

module.exports = CheckList;
