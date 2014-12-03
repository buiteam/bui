/**
 * @fileOverview imgview 命名空间入口
 * @ignore
 */
var BUI = require('bui-common'),
  ImgView = BUI.namespace('ImgView');

BUI.mix(ImgView, {
  ImgView: require('./src/imgview'),
  ViewContent: require('./src/viewcontent'),
  PreviewList: require('./src/previewlist')
});

module.exports = ImgView;
