<?php  $title='工具栏测试' ?>
<?php include("../templates/header.php"); ?>

<div id="bar"></div>
<div id="log"></div>
<div id="pbar"></div>
<div id="pbar1"></div>
<div id="numpbar"></div>
<div id="numpbar1"></div>
<div id="numpbar2"></div>
<div id="numpbar3"></div> 

<?php include("../templates/script.php"); ?>

<script type="text/javascript">
  (function(){
    BUI.use(["./specs/bar", './specs/pagingbar', './specs/numberpagingbar'], function(m) {
      jasmine.getEnv().execute();
    })
  })();
</script>
<?php include("../templates/footer.php"); ?>
