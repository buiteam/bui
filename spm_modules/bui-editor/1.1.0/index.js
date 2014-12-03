var BUI = require('bui-common'),
  Form = require('bui-form'),
  Editor = BUI.namespace('Editor');

BUI.mix(Editor,{
  Editor : require('./src/editor'),
  RecordEditor : require('./src/record'),
  DialogEditor : require('./src/dialog')
});

return Editor;
