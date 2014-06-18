<?php  $title='边框布局' ?>
<?php include("./templates/header.php"); ?>
<link rel="stylesheet" href="../assets/css/layout.css">
<style>
	.red{
		border: 1px solid red;
	}
	.blue{
		border: 1px solid blue;
	}
</style>
<div class="container">
  <div id="J_Layout"></div>
</div>
  <?php $url = 'bui/layout/border'?>
  <?php include("./templates/script.php"); ?>
  <script type="text/javascript" src="../src/layout/item/base.js"></script>
  <script type="text/javascript" src="../src/layout/item/border.js"></script>
  <script type="text/javascript" src="../src/layout/abstract.js"></script>
  <script type="text/javascript" src="../src/layout/collapsable.js"></script>
  <script type="text/javascript" src="../src/layout/border.js"></script>
  <script type="text/javascript" src="specs/layout-border-spec.js"></script>
    
<?php include("./templates/footer.php"); ?>   