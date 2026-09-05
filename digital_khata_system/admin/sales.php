<?php
session_start();

if (!isset($_SESSION['SESS_LAST_NAME']) || $_SESSION['SESS_LAST_NAME'] !== 'admin') {
    // Redirect if not cashier
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
	<!-- js -->			
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<link href="css/css2.css" media="screen" rel="stylesheet" type="text/css" />
<meta charset="UTF-8">

<style>
	body{
		font-family: 'Noto Nastaliq Urdu' !important;
		
	}
	.urdu-text {
  font-family: 'Noto Nastaliq Urdu' !important;
  direction: rtl;
  text-align: right;
}
.custom-modal {
  font-family: 'Noto Nastaliq Urdu', serif;
  border-radius: 15px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
  background: #fefefe;
  border: none;
  text-align: center;
}

.custom-modal-header {
  background-color: #63C592FF;
  color: white;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 1rem 1.5rem;
  position: relative;
}

.custom-modal-body {
  padding: 1.5rem;
  background-color: #f9f9f9;
}

.custom-modal-footer {
  padding: 1rem 1.5rem;
  background-color: #f1f1f1;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  display: flex;
  justify-content: flex-start;
}

.custom-input {
  border: 2px solid #007bff;
  border-radius: 10px;
  padding: 0.5rem;
  font-size: 1.1rem;
  direction: rtl;
}

.custom-input::placeholder {
  color: #aaa;
}

.custom-btn {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
}

.close-btn {
  background: black !important;
  border: none;
  font-size: 32px;
  color: #ffffff !important;
  padding: 50px;
  border-radius: 10px;
  
  position: absolute;
  top: 5px;
  right: 15px;
}

.close-btn:hover {
  opacity: 1;
}

</style>
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
<script type="text/javascript">
  jQuery(document).ready(function($) {
    $('a[rel*=facebox]').facebox({
      loadingImage : 'src/loading.gif',
      closeImage   : 'src/closelabel.png'
    })
  })
</script>
<title>
ڈیجی کھاتہ سسٹم
</title>
<?php
	require_once('auth.php');
?>
       
		<link href="vendors/uniform.default.css" rel="stylesheet" media="screen">
  <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      .sidebar-nav {
        padding: 9px 0;
      }
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

	<!-- combosearch box-->	
	
	  <script src="vendors/jquery-1.7.2.min.js"></script>
    <script src="vendors/bootstrap.js"></script>

	
	
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!--sa poip up-->




 <script language="javascript" type="text/javascript">
/* Visit http://www.yaldex.com/ for full source code
and get more free JavaScript, CSS and DHTML scripts! */
<!-- Begin
var timerID = null;
var timerRunning = false;
function stopclock (){
if(timerRunning)
clearTimeout(timerID);
timerRunning = false;
}
function showtime () {
var now = new Date();
var hours = now.getHours();
var minutes = now.getMinutes();
var seconds = now.getSeconds()
var timeValue = "" + ((hours >12) ? hours -12 :hours)
if (timeValue == "0") timeValue = 12;
timeValue += ((minutes < 10) ? ":0" : ":") + minutes
timeValue += ((seconds < 10) ? ":0" : ":") + seconds
timeValue += (hours >= 12) ? " شام " : " صبح "
document.clock.face.value = timeValue;
timerID = setTimeout("showtime()",1000);
timerRunning = true;
}
function startclock() {
stopclock();
showtime();
}
window.onload=startclock;
// End -->
</SCRIPT>	
<style>
	body{
		font-family: 'Noto Nastaliq Urdu' !important;
	}
	.urdu-text {
  font-family: 'Noto Nastaliq Urdu' !important;
  direction: rtl;
  text-align: right;
}

</style>
</head>
<?php
function createRandomPassword() {
	$chars = "003232303232023232023456789";
	srand((double)microtime()*1000000);
	$i = 0;
	$pass = '' ;
	while ($i <= 7) {

		$num = rand() % 33;

		$tmp = substr($chars, $num, 1);

		$pass = $pass . $tmp;

		$i++;

	}
	return $pass;
}
$finalcode='RS-'.createRandomPassword();
?>
<body>
<?php include('navfixed.php');?>
	<?php
$position=$_SESSION['SESS_LAST_NAME'];
if($position=='cashier') {
?>
<a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>">نقد</a>

<a href="../index.php">لاگ آؤٹ</a>
<?php
}
if($position=='admin') {
?>
	
<div class="container-fluid">
      <div class="row-fluid">
	  <div class="span2">
        <div class="well sidebar-nav">
        <ul class="nav nav-list">
		
    <li ><a href="index.php"><i class="icon-dashboard icon-2x"></i> ڈیش بورڈ </a></li> 
	<li class="active"><a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>">
		<i class="icon-shopping-cart icon-2x"></i> فروخت</a></li>             
			<li><a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a></li>
			<li><a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a></li>
			<li><a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a></li>
		
      <?php
		    	$today = date("m/d/Y");
                $tomorrow = date("m/d/Y", strtotime("+1 day"));
            ?>
      <li><a href="salesreport.php?d1=<?= $today ?>&d2=<?= $tomorrow ?>"><i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ</a></li>  
      <li><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> سیلز انوینٹری</a></li>

      <li><a href="trade.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-bar-chart icon-2x"></i> لین دین</a></li>

			<br><br><br><br><br><br>		
			
			<li>
			<div class="hero-unit-clock">
      <form name="clock">
           <font color="white;" style="color: white; font-family: 'Noto Nastaliq Urdu' !important;">وقت: <br></font>&nbsp;<input style="width:150px;font-family: 'Noto Nastaliq Urdu' !important; " type="submit" class="trans" name="face" value=""></form>
					</div>
			</li>
			</ul>   
<?php } ?>				
          </div><!--/.well -->
        </div><!--/span-->
	<div class="span10">
		<div class="contentheader">
			<!-- <i class="icon-money"> --></i> فروخت
			</div>
			<ul class="breadcrumb">
			<a href="index.php"><li>ڈیش بورڈ</li></a> /
			<li class="active">فروخت</li>
			</ul>
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
</div>
													
<form id="productForm" action="incoming.php" method="post" onsubmit="handleSubmit(event);">
    <input type="hidden" name="pt" value="<?php echo $_GET['id']; ?>" />
    <input type="hidden" name="invoice" value="<?php echo $_GET['invoice']; ?>" />

    <select name="product" id="productSelect" style="width:650px;" class="chzn-select" required>
        <option></option>
        <?php
        include('../connect.php');
        $result = $db->prepare("SELECT * FROM products");
        $result->execute();

        while ($row = $result->fetch()) {
            if ($row['qty'] > 0) {
        ?>
            <option value="<?php echo $row['product_id']; ?>" data-qty="<?php echo $row['qty']; ?>" data-o_price="<?php echo $row['o_price']; ?>">
                <?php echo $row['product_code']; ?> - 
                <?php echo $row['gen_name']; ?> - 
                <?php echo $row['product_name']; ?> | 
                بقیہ مقدار: <?php echo $row['qty']; ?>
            </option>
        <?php
            }
        }
        ?>
    </select>

    <input type="number" name="qty" value="1" min="1" id="qtyInput" placeholder="Qty" autocomplete="off"
        style="width: 68px; height:30px; padding-top:6px; padding-bottom: 4px; margin-right: 4px; font-size:15px;" required>

    <input type="hidden" name="price_sold" id="PriceSold" value="">
    <input type="hidden" name="discount" value="">
    <input type="hidden" name="date" value="<?php echo date("m/d/y"); ?>" />
    <input type="hidden" name="qt_sold" value="<?php echo $row['qty_sold']; ?>" />

    <button type="submit" class="btn btn-info"
        style="width: 123px; height:35px; margin-top:-5px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;">
        <i class="icon-plus-sign icon-large"></i> شامل کریں
    </button>
</form>

<table class="table table-bordered table-hover table-striped" id="resultTable" data-responsive="table">
	<thead>
		<tr>
			<th> پروڈکٹ کانام </th>
			<th> عام نام </th>
			<th> زمرہ / تفصیل</th>
			<th> قیمت خرید</th>
			<th> قیمتِ فروخت</th>
			<th> مقدار </th>
			<th> رقم </th>
			<th> منافع </th>
			
			<th> کارروائی </th>
		</tr>
	</thead>
	<tbody>
		
			<?php
				$id=$_GET['invoice'];
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM sales_order WHERE invoice= :userid");
				$result->bindParam(':userid', $id);
				$result->execute();
				for($i=1; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td hidden><?php echo $row['product']; ?></td>
			<td><?php echo $row['product_code']; ?></td>
			<td><?php echo $row['gen_name']; ?></td>
			<td><?php echo $row['name']; ?></td>
			<td>
			<?php
			$ppp=$row['price'];
			echo formatMoney($ppp, true);
			?>
			
			</td>
			<td><?php
			$dfdf=$row['o_price'];
			echo formatMoney($dfdf, true);
			?></td>
			<td><?php echo $row['qty']; ?></td>
			<td>
			<?php
			$dfdf=$row['amount'];
			echo formatMoney($dfdf, true);
			?>
			</td>
			<td>
			<?php
			$profit=$row['profit'];
			echo formatMoney($profit, true);
			?>
			</td>
			<td width="90"><a href="delete.php?id=<?php echo $row['transaction_id']; ?>&invoice=<?php echo $_GET['invoice']; ?>&dle=<?php echo $_GET['id']; ?>&qty=<?php echo $row['qty'];?>&code=<?php echo $row['product'];?>"><button class="btn btn-mini btn-warning" style="font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-remove"></i> منسوخ کریں </button></a></td>
			</tr>
			<?php
				}
			?>
			<tr>
			<th> </th>
			<th>  </th>
			<th>  </th>
			<th>  </th>
			<th>  </th>
			<th>  </th>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b>  کل رقم : </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل منافع: </b></td>
			<th>  </th>
		</tr>
			<tr>
				<th colspan="6"><strong style="font-size: 12px; color: #222222;font-family: 'Noto Nastaliq Urdu' !important;"> <b> کل مجموعی رقم: </b> </strong></th>
				<td colspan="1"><strong style="font-size: 12px; color: #222222;">
				<?php
				function formatMoney($number, $fractional=false) {
					if ($fractional) {
						$number = sprintf('%.2f', $number);
					}
					while (true) {
						$replaced = preg_replace('/(-?\d+)(\d\d\d)/', '$1,$2', $number);
						if ($replaced != $number) {
							$number = $replaced;
						} else {
							break;
						}
					}
					return $number;
				}
				$sdsd=$_GET['invoice'];
				$resultas = $db->prepare("SELECT sum(amount) FROM sales_order WHERE invoice= :a");
				$resultas->bindParam(':a', $sdsd);
				$resultas->execute();
				for($i=0; $rowas = $resultas->fetch(); $i++){
				$fgfg=$rowas['sum(amount)'];
				echo formatMoney($fgfg, true);
				}
				?>
				</strong></td>
				<td colspan="1"><strong style="font-size: 12px; color: #222222;">
			<?php 
				$resulta = $db->prepare("SELECT sum(profit) FROM sales_order WHERE invoice= :b");
				$resulta->bindParam(':b', $sdsd);
				$resulta->execute();
				for($i=0; $qwe = $resulta->fetch(); $i++){
				$asd=$qwe['sum(profit)'];
				echo formatMoney($asd, true);
				}
			?>
		
				</td>
			</tr>
	
	</tbody>
</table><br>
 
<a id="saveBtn" rel="facebox" href="checkout.php?pt=<?php echo $_GET['id']?>&price=<?php echo $_GET['price']?>&invoice=<?php echo $_GET['invoice']?>&total=<?php echo $fgfg ?>&totalprof=<?php echo $asd ?>&cashier=<?php echo $_SESSION['SESS_FIRST_NAME']?>"><button Style="width:200px; height:50px; font-family: 'Noto Nastaliq Urdu' !important;  direction: rtl;
  " class="btn btn-info"><i class="icon icon-save icon-large"></i>محفوظ کریں</button></a>  </br></br></br></br></br></br>

<!--<a rel="facebox" href="alert.php?pt=<?php //echo $_GET['id']?>&invoice=<?php //echo $_GET['invoice']?>&total=<?php //echo $fgfg ?>&totalprof=<?php //echo $asd ?>&cashier=// echo $_SESSION['SESS_FIRST_NAME']?>"><button Style="width:200px; height:50px; background-color: #A5DCE9 !important; color: #EA6A02!important; align: left !important;" class="btn btn-info"><i class="icon icon-save icon-large"></i> Return Product</button></a>-->
<div class="clearfix"></div>

</div>
</div>
</div>

<!-- Custom Modal for Original Price -->
<div class="modal fade" id="priceModal" tabindex="-1" role="dialog" aria-labelledby="priceModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content custom-modal">
      <div class="modal-header custom-modal-header">
        <h5 class="modal-title" id="priceModalLabel">قیمت درج کریں</h5>
        <button type="button" style="font-size: 20px; padding: 10px;" class="close close-btn" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body custom-modal-body">
        <label for="customPriceInput" class="form-label">براہ کرم قیمت فروخت درج کریں:</label>
        <input type="number" 
               id="customPriceInput" 
               class="form-control custom-input" 
               required 
               oninput="this.value = this.value.replace(/[^0-9]/g, '');">

        <!-- Separate Alert Box -->
        <div id="customPriceAlert" 
             class="alert alert-danger mt-3" 
             style="display: none; font-family: 'Noto Nastaliq Urdu'; direction: rtl;">
        </div>
      </div>

      <div class="modal-footer custom-modal-footer" style="display: flex; justify-content: center; gap: 10px; height: 40px">
        <button type="button" class="btn btn-outline-secondary custom-btn" style="background: #faa732 !important; font-family: 'Noto Nastaliq Urdu' !important; color: white;" data-dismiss="modal">منسوخ کریں</button>
        <button type="button" class="btn custom-btn" style="background: #49afcd !important; color: white; font-family: 'Noto Nastaliq Urdu' !important;" onclick="submitCustomPrice()">شامل کریں</button>
      </div>
    </div>
  </div>
</div>


<script>
window.addEventListener('DOMContentLoaded', function () {
    var table = document.getElementById('resultTable');
    var tbody = table.querySelector('tbody');
    var rows = tbody.querySelectorAll('tr.record');
    var saveBtn = document.getElementById('saveBtn');

    if (rows.length === 0) {
        saveBtn.style.display = 'none';
    } else {
        saveBtn.style.display = 'block';
    }
});
</script>


<script>
	this.value = this.value.replace(/[^0-9]/g, '');

    function handleSubmit(event) {
        event.preventDefault(); // Stop default form submit
        $('#priceModal').modal('show'); // Show the custom modal
    }
	function submitCustomPrice() {
    const price = parseFloat(document.getElementById('customPriceInput').value);
    const selectedOption = document.querySelector('#productSelect option:checked');
    const oPrice = parseFloat(selectedOption.getAttribute('data-o_price'));

    const alertDiv = document.getElementById('customPriceAlert');
    alertDiv.style.display = 'none';
    alertDiv.innerHTML = '';

    if (isNaN(price)) {
        alertDiv.innerHTML = "براہ کرم قیمت فروخت درج کریں!";
        alertDiv.style.display = 'block';
        return;
    }

    if (price <= oPrice) {
        alertDiv.innerHTML = "قیمت فروخت، قیمت خرید (" + oPrice + ") سے زیادہ ہونی چاہیے!";
        alertDiv.style.display = 'block';
        return;
    }

    // ✅ Set price in hidden field
    document.getElementById('PriceSold').value = price;

    // ✅ Hide modal
    $('#priceModal').modal('hide');

    // ✅ Submit the form
    document.getElementById("productForm").submit();
}

</script>


<script>
$(document).ready(function () {
    $('#productSelect').chosen().change(function () {
        var selected = $(this).find('option:selected');
        var maxQty = selected.data('qty'); // get data-qty value

        if (maxQty) {
            $('#qtyInput').attr('max', maxQty);
        } else {
            $('#qtyInput').removeAttr('max');
        }
    });
});
</script>



</body>
<?php include('footer.php');?>
</html>