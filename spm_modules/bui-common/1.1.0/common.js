var BUI = require('./src/util');

BUI.mix(BUI, {
  UA: require('./src/ua'),
  JSON: require('./src/json'),
  Date: require('./src/date'),
  Array: require('./src/array'),
  KeyCode: require('./src/keycode'),
  Observable: require('./src/observable'),
  Base: require('./src/base'),
  Component: require('./src/component/component')
});

module.exports = BUI;
