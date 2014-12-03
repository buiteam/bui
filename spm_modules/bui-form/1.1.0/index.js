/**
 * @fileOverview form 命名空间入口
 * @ignore
 */
var BUI = require('bui-common'),
  Form = BUI.namespace('Form'),
  Tips = require('./src/tips');

BUI.mix(Form, {
  Tips : Tips,
  TipItem : Tips.Item,
  FieldContainer : require('./src/fieldcontainer'),
  Form : require('./src/form'),
  Row : require('./src/row'),
  Group : require('./src/fieldgroup'),
  HForm : require('./src/hform'),
  Rules : require('./src/rules'),
  Field : require('./src/field'),
  FieldGroup : require('./src/fieldgroup')
});

module.exports = Form;
