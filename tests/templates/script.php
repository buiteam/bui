<script>
    (function() {

      BUI.setDebug(true);
      
      jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var htmlReporter = new jasmine.HtmlReporter();
      jasmineEnv.addReporter(htmlReporter);

      // BUI.use(["./example-spec.js"], function(m) {
      //   jasmineEnv.execute();
      // })
    })()
  </script>
