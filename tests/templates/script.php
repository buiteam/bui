<script>
    (function() {

      var loadPath = seajs.data.paths['bui'];

      seajs.config({
        map: [
          function(uri){
            if(uri.indexOf(loadPath) !== -1){
              debugger;
              var usePath = uri.replace(loadPath, ''),
                folder = usePath.replace(/^(\/|\\)([a-z]*)(\.)/, '$1$2/$2$3');
              // console.log(loadPath + folder);
              return loadPath + folder;
            }
            // return loadPath + folder;
            
            // return uri;
          }
        ]
      })

      //BUI.setDebug(true);
      
      jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var htmlReporter = new jasmine.HtmlReporter();
      jasmineEnv.addReporter(htmlReporter);

    })()
  </script>
