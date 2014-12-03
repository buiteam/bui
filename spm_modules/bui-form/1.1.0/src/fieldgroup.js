/**
 * @fileOverview 表单文本域组，可以包含一个至多个字段
 * @author dxq613@gmail.com
 * @ignore
 */

var BUI = require('bui-common'),
  Group = require('./group/base');

BUI.mix(Group,{
  Range : require('./group/range'),
  Check : require('./group/check'),
  Select : require('./group/select')
});
return Group;
