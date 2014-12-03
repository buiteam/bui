/**
 * @fileOverview 表单域的入口文件
 * @ignore
 */
var BUI = require('bui-common'),
  Field = require('./fields/base');

BUI.mix(Field, {
  Text : require('./fields/text'),
  Date : require('./fields/date'),
  Select : require('./fields/select'),
  Hidden : require('./fields/hidden'),
  Number : require('./fields/number'),
  Check : require('./fields/check'),
  Radio : require('./fields/radio'),
  Checkbox : require('./fields/checkbox'),
  Plain : require('./fields/plain'),
  List : require('./fields/list'),
  TextArea : require('./fields/textarea'),
  Uploader : require('./fields/uploader'),
  CheckList : require('./fields/checklist'),
  RadioList : require('./fields/radiolist')
});

module.exports = Field;
