<?php  $title='加载测试' ?>
<?php include("../templates/header.php"); ?>


<?php include("../templates/script.php"); ?>

<script type="text/javascript">
  (function(){
    BUI.use(["./specs/seajs"], function(m) {
      jasmine.getEnv().execute();
    })
  })();
</script>
<?php include("../templates/footer.php"); ?>
