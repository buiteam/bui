<?php $title = '单元测试'; ?>
<?php include("./templates/header.php"); ?>
<?php include("./templates/script.php"); ?>
<?php $url = 'bui/common'; ?>

<?php
    function traverse($path = '.') {
        $files = array();
        $current_dir = opendir($path);    //opendir()返回一个目录句柄,失败返回false
        while(($file = readdir($current_dir)) !== false) {    //readdir()返回打开目录句柄中的一个条目
            $sub_dir = $path . DIRECTORY_SEPARATOR . $file;    //构建子目录路径
            if($file == '.' || $file == '..') {
                continue;
            } else if(is_dir($sub_dir)) {    //如果是目录,进行递归
                //echo 'Directory ' . $file . ':<br>';
                //traverse($sub_dir);
            } else {    //如果是文件,直接输出
                $files[] = $file;
            }
        }
        return $files;
    }
    $files = traverse();
    // print_r(json_encode($files));

?>

<script type="text/javascript">

  (function($){

    var multiReporter = new jasmine.MultiReporter();

    function subJasmine(frameEl, path){
      var reporter = new jasmine.TrivialReporter();
      var win = frameEl.contentWindow,
        jasmineEnv = win.jasmine.getEnv();
      jasmineEnv.addReporter(reporter);

      reporter.reportRunnerStarting = function () {
        jasmine.TrivialReporter.prototype.reportRunnerStarting.apply(this, arguments);
        $(reporter.outerDiv).find('.logo').append(' <a class="version" href="' + path + '">' + win.document.title + '</a>');

        $('<label class="checkbox"><input type="checkbox" />显示frame</label>')
          .appendTo($(reporter.outerDiv).find('.options'))
          .find('input').on('click', function(ev){
            $(frameEl).toggle();
          });
      }

      var oldCallback = jasmineEnv.currentRunner().finishCallback;
      jasmineEnv.currentRunner().finishCallback = function () {
        oldCallback.apply(this, arguments);
        $(frameEl).addClass('hide');
      };
    }

    function createFrame(path){
      var frame = $('<iframe frameborder="0" width="100%"></iframe>');
      frame.attr('src', path);

      frame.appendTo(document.body);
      return frame;
    }
    


    var files = <?php print_r(json_encode($files)); ?>;
    $.each(files, function(index, path){
      var frame = createFrame(path);

      frame.on('load', function(){
        subJasmine(frame[0], path);
      });
    });
    
  })(jQuery);

</script>
  
<?php //include("./templates/footer.php"); ?>
</body>
</html>
