/**
 * @fileOverview Component命名空间的入口文件
 * @ignore
 */

/**
 * @class BUI.Component
 * <p>
 * <img src="../assets/img/class-common.jpg"/>
 * </p>
 * 控件基类的命名空间
 */
var Component = {};

BUI.mix(Component, {
  Manager: require('./manage'),
  UIBase: require('./uibase/uibase'),
  View: require('./view'),
  Controller: require('./controller')
});

function create(component, self) {
  var childConstructor, xclass;
  if (component && (xclass = component.xclass)) {
    if (self && !component.prefixCls) {
      component.prefixCls = self.get('prefixCls');
    }
    childConstructor = Component.Manager.getConstructorByXClass(xclass);
    if (!childConstructor) {
      BUI.error('can not find class by xclass desc : ' + xclass);
    }
    component = new childConstructor(component);
  }
  return component;
}

/**
 * 根据Xclass创建对象
 * @method
 * @static
 * @param  {Object} component 控件的配置项或者控件
 * @param  {Object} self      父类实例
 * @return {Object} 实例对象
 */
Component.create = create;

module.exports = Component;
