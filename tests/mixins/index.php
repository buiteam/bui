<?php  $title='扩展测试' ?>
<?php include("../templates/header.php"); ?>

<div id="t1" style="width:500px;height:500px;background-color:red;margin-left:20px;"></div>

<button id="btnShow" class="button button-primary">显示</button>
<button id="btnHide" class="button button-primary">隐藏</button>
<button id="btnToggle" class="button ks-button-primary">toggle</button>


<?php include("../templates/script.php"); ?>

<script type="text/javascript">
  (function(){
    BUI.use(["./specs/mixins"], function(m) {
      jasmine.getEnv().execute();
    })
  })();
</script>
<?php include("../templates/footer.php"); ?>
