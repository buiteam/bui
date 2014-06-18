<?php  $title='表格布局' ?>
<?php include("./templates/header.php"); ?>
<style>
	.x-layout-item-cell{
    border : 1px solid #ddd;
  }

  .layout-test{
    border: 1px solid red;
    padding: 10px;
  }

  .x-layout-table{
    width: 100%;
  }
</style>
<div class="container">
  <div id="J_Layout"></div>
</div>
  <?php $url = 'bui/layout/table'?>
  <?php include("./templates/script.php"); ?>
  <script type="text/javascript" src="../src/layout/item/base.js"></script>
  <script type="text/javascript" src="../src/layout/item/cell.js"></script>
  <script type="text/javascript" src="../src/layout/abstract.js"></script>
  <script type="text/javascript" src="../src/layout/table.js"></script>
  <script type="text/javascript" src="specs/layout-table-spec.js"></script>
    
<?php include("./templates/footer.php"); ?>   