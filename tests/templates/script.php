<script>
    (function() {

      // var loadPath = seajs.data.paths['bui'];

      // seajs.config({
      //   map: [
      //     [/(\/|\\)(src)(\/|\\)([a-z]*)(\.js)$/, '$1$2$3$4/$4$5']
      //   ]
      // })

      //BUI.setDebug(true);
      
      jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var htmlReporter = new jasmine.HtmlReporter();
      jasmineEnv.addReporter(htmlReporter);

    })()
  </script>
