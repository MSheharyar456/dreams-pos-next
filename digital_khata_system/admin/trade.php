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
           
			<li><a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a></li>
      	<li><a href="cashier.php"><i class="icon-user icon-2x"></i> کیشیئر</a></li>

			<li><a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a></li>
			<li><a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a></li>
      <?php
		    	$today = date("m/d/Y");
                $tomorrow = date("m/d/Y", strtotime("+1 day"));
            ?>
            <li><a href="salesreport.php?d1=<?= $today ?>&d2=<?= $tomorrow ?>"><i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ</a></li>	
            <li><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> سیلز انوینٹری</a></li>

            <li class="active"><a href="trade.php"><i class="icon-bar-chart icon-2x"></i> لین دین</a></li>

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
			<!-- <i class="icon-money"> --></i> لین دین
			</div>
			<ul class="breadcrumb">
			<a href="index.php"><li>ڈیش بورڈ</li></a> /
			<li class="active">لین دین</li>
			</ul>
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none;font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
</div>
<style>
  .lan-dain-container {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 30px;
  }

  .lan-dain-card {
    width: 350px;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    text-align: center;
    text-decoration: none;
    transition: transform 0.3s ease;
  }

  .lan-dain-card:hover {
    transform: translateY(-5px);
  }

  .supplier-card {
    background-color: #E3F2FD;
    color: #007BFF;
  }

  .customer-card {
    background-color: #FFF3E0;
    color: #FF6F00;
  }

  .lan-dain-card h4 {
    margin-bottom: 10px;
    font-size: 24px;
  }

  .lan-dain-card p {
    padding: 20px;
    font-size: 16px;
    color: #333;
  }

  @media screen and (max-width: 991px) {
    .lan-dain-container {
      display: none; /* hide on mobile */
    }
  }
</style>

<div class="lan-dain-container">

  <!-- Supplier لین دین -->
  <a href="supplier_trade.php?id=cash&invoice=<?php echo $finalcode ?>" class="lan-dain-card supplier-card">
    <h4>سپلائر لین دین</h4>
    <p>سپلائرز کے ساتھ مالی لین دین کی تفصیلات</p>
  </a>

  <!-- Customer لین دین -->
  <a href="customer_trade.php?id=cash&invoice=<?php echo $finalcode ?>" class="lan-dain-card customer-card">
    <h4>کسٹمر لین دین</h4>
    <p>کسٹمرز کے ساتھ مالی لین دین کی تفصیلات</p>
  </a>

</div>
<div class="clearfix"></div>

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