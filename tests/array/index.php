<?php  $title='数组测试' ?>
<?php include("../templates/header.php"); ?>


<?php include("../templates/script.php"); ?>

<script type="text/javascript">
  (function(){
    seajs.use(["./specs/array"], function(m) {
      jasmine.getEnv().execute();
    })
  })();
</script>
<?php include("../templates/footer.php"); ?>
