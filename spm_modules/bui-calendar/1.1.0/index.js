/**
 * @fileOverview 日历命名空间入口
 * @ignore
 */

  var BUI = require('bui-common'),
    Calendar = BUI.namespace('Calendar');

  BUI.mix(Calendar, {
    Calendar: require('./src/calendar'),
    MonthPicker: require('./src/monthpicker'),
    DatePicker: require('./src/datepicker')
  });

  module.exports = Calendar;
