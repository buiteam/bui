<?php  $title='键盘测试' ?>
<?php include("../templates/header.php"); ?>

<style type="text/css">
  .bui-test-control{
    border:1px solid #ddd;
  }
</style>
<div class="container">
  <div class="row">
   <div id="c" class="span8 well" style="height:50px">
     
   </div>
  </div>
</div>

<?php include("../templates/script.php"); ?>

<script type="text/javascript">
  (function(){
    BUI.use(["./specs/keynav"], function() {
      jasmine.getEnv().execute();
    })
  })();
</script>
<?php include("../templates/footer.php"); ?>
