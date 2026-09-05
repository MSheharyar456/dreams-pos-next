<?php
$current_page = basename($_SERVER['PHP_SELF']); // gets current page name like 'index.php'
$today = date("m/d/Y");
$tomorrow = date("m/d/Y", strtotime("+1 day"));
?>

<div class="span2">
  <div class="well sidebar-nav" >
    <ul class="nav nav-list" style='background: #333333;'>

      <li class="<?= ($current_page == 'index.php') ? 'active' : '' ?>">
        <a href="index.php"><i class="icon-dashboard icon-2x"></i> ڈیش بورڈ </a>
      </li>

      <li class="<?= ($current_page == 'products.php') ? 'active' : '' ?>">
        <a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a>
      </li>

      <li class="<?= ($current_page == 'cashier.php') ? 'active' : '' ?>">
        <a href="cashier.php"><i class="icon-user icon-2x"></i> کیشیئر</a>
      </li>

      <li class="<?= ($current_page == 'customer.php') ? 'active' : '' ?>">
        <a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a>
      </li>

      <li class="<?= ($current_page == 'supplier.php') ? 'active' : '' ?>">
        <a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a>
      </li>

      <li class="<?= ($current_page == 'salesreport.php') ? 'active' : '' ?>">
        <a href="salesreport.php?d1=<?= $today ?>&d2=<?= $tomorrow ?>">
          <i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ
        </a>
      </li>

      <li class="<?= ($current_page == 'sales_inventory.php') ? 'active' : '' ?>">
        <a href="sales_inventory.php?d1=0&d2=0">
          <i class="icon-bar-chart icon-2x"></i> سیلز انوینٹری
        </a>
      </li>

      <li class="<?= ($current_page == 'trade.php') ? 'active' : '' ?>">
        <a href="trade.php?id=cash&invoice=<?php echo $finalcode ?>">
          <i class="icon-bar-chart icon-2x"></i> لین دین
        </a>
      </li>

      <br><br><br><br><br><br>

      <li>
        <div class="hero-unit-clock">
          <form name="clock">
            <font color="white;" style="color: white; font-family: 'Noto Nastaliq Urdu' !important;">وقت: <br></font>
            &nbsp;<input style="width:150px;font-family: 'Noto Nastaliq Urdu' !important; color: black !important " type="submit" class="trans" name="face" value="">
          </form>
        </div>
      </li>

    </ul>
  </div>
</div>
