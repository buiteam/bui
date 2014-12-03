/**
 * @fileOverview 选择框命名空间入口文件
 * @ignore
 */

var BUI = require('bui-common'),
  Select = BUI.namespace('Select');

BUI.mix(Select,{
  Select : require('./src/select'),
  Combox : require('./src/combox'),
  Suggest: require('./src/suggest')
});

module.exports = Select;
