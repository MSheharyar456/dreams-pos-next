 <div class="span2">
        <div class="well sidebar-nav">
        <ul class="nav nav-list" style='background-color: #333333'>
    <li><a href="index.php"><i class="icon-dashboard icon-2x"></i> ڈیش بورڈ </a></li> 
	<li><a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-shopping-cart icon-2x"></i> فروخت</a></li>             
	<li><a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a></li>
	<li><a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a></li>
	<li><a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a></li>
	<?php
		$today = date("m/d/Y");
        $tomorrow = date("m/d/Y", strtotime("+1 day"));
    ?>
    <li><a href="salesreport.php?d1=<?= $today ?>&d2=<?= $tomorrow ?>"><i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ</a></li>
	<li><a href="trade.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-bar-chart icon-2x"></i> لین دین</a></li>
	<br><br><br><br><br><br>		
	<li>
	<div class="hero-unit-clock">
	<form name="clock">
   <font color="white;" style="color: white; font-family: 'Noto Nastaliq Urdu' !important;">وقت: <br></font>&nbsp;<input style="width:150px;font-family: 'Noto Nastaliq Urdu' !important; color: black !important " type="submit" class="trans" name="face" value=""></form>
	</div>
	</li>
	</ul>            
          </div>
        </div> 