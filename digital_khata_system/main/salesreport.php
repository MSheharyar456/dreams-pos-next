<?php
session_start();

if (!isset($_SESSION['SESS_LAST_NAME']) || $_SESSION['SESS_LAST_NAME'] !== 'cashier') {
    // Redirect if not cashier
    header("Location: ../index.php");
    exit();
}
?>
<head>
<title>
شہباز سولر سسٹم
</title>
 <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
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
</style>
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


<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link rel="stylesheet" type="text/css" href="tcal.css" />
<script type="text/javascript" src="tcal.js"></script>
<script language="javascript">
function Clickheretoprint()
{ 
  var disp_setting="toolbar=yes,location=no,directories=yes,menubar=yes,"; 
      disp_setting+="scrollbars=yes,width=700, height=400, left=100, top=25"; 
  var content_vlue = document.getElementById("content").innerHTML; 
  
  var docprint=window.open("","",disp_setting); 
   docprint.document.open(); 
   docprint.document.write('<link href="css/css2.css" rel="stylesheet" type="text/css">');
  docprint.document.write('<style>');
  docprint.document.write("body { font-family: 'Noto Nastaliq Urdu' !important;  text-align: center; font-size: 14px; } ");
  docprint.document.write(".table-bordered, .table-bordered th, .table-bordered td { border: 1px solid black; border-collapse: collapse; text-align: center; }");
  docprint.document.write("table { margin: 0 auto; }"); // <-- This is the fix 
  docprint.document.write('</style>');
  docprint.document.write('</head><body onLoad="self.print()">');

   docprint.document.write(content_vlue); 
   docprint.document.close(); 
   docprint.focus(); 
}
</script>


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
<div class="container-fluid">
      <div class="row-fluid">
	 	  <?php include('includes/sidebar.php');?>

	<div class="span10">
	<div class="contentheader">
         	<i class="icon-bar-chart"></i> فروخت رپورٹ
			</div>
			<ul class="breadcrumb">
			<li><a href="index.php">ڈیش بورڈ</a></li> /
			<li class="active">فروخت رپورٹ</li>
			</ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: none; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
	
		
		<div class="pull-right" style="margin-right:100px;">
		<a href="javascript:Clickheretoprint()" style="font-size:80px;"><button class="btn btn-success btn-large" style="font-family: 'Noto Nastaliq Urdu' !important; float: left; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;"><i class="icon-print"></i> پرنٹ کریں</button></a>
		</div>

</div>
<form action="salesreport.php" method="get">
	<div >
<center ><strong> <span style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; ">  <input autocomplete="off" type="text" style="width: 223px; height:30px; padding-right: 30px" name="d2" class="tcal" value="" />   سے <input autocomplete="off" type="text" style="width: 223px; height:30px; padding-right: 30px" name="d1" class="tcal" value="" />  تک </span>
 <button class="btn btn-info" style="width: 123px; height:35px; margin-top:-8px;margin-left:8px;  font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; " type="submit"><i class="icon icon-search icon-large"></i> تلاش کریں</button>
</strong></center>
</div>
</form>
<div class="content" id="content">
<div style="font-weight:bold; text-align:center;font-size:14px;margin-bottom: 15px;  direction: rtl;">
فروخت رپورٹ &nbsp;<?php echo $_GET['d1'] ?>&nbsp;سے :&nbsp;<?php echo $_GET['d2'] ?>
</div>
<table border="0" class="table table-bordered table-striped table-hover" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
		<th width="10%"> انوائس نمبر </th>

		<th width="10%"> گاہک کا نام </th>

			<th width="10%"> ٹرانزیکشن کی تاریخ </th>
			<th width="10%"> کل رقم </th>
			<th width="10%"> وصول کی گئی رقم </th>
			<th width="10%"> منافع ہوگا</th>
			<th width="10%"> فی الحال منافع</th>
			
			<th width="10%">بقایا دینا ہے</th>
			<th width="10%">بقایا لینا ہے</th>
			<th width="5%">تفصیل</th>
            
			
				</tr>
	</thead>
	<tbody>
		
			<?php
						$total_profit = 0;
						$total_balance = 0;
						$total_balance1 = 0;
				
				include('../connect.php');
				$d1=$_GET['d1'];
				$d2=$_GET['d2'];
				$result = $db->prepare("SELECT * FROM sales WHERE date BETWEEN :a AND :b ORDER by transaction_id DESC ");
				$result->bindParam(':a', $d1);
				$result->bindParam(':b', $d2);
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
				     if($row['due_date'] > $row['amount']) {
						$total_balance += abs($row['amount'] - $row['due_date']);
					} 
					if ($row['amount'] > $row['due_date']) {
						$total_balance1 += $row['amount'] - $row['due_date'];
					}  

		
			?>
			<tr class="record">
			<td><?php echo $row['invoice_number']; ?></td>

			<td><?php echo $row['name']; ?></td>

			<td><?php echo $row['date']; ?></td>
			
			<td><?php
			$dsdsd1=$row['amount'];
			echo formatMoney($dsdsd1, true);
			?></td>
			
			<td><?php
			$dsdsd2=$row['due_date'];
			echo formatMoney($dsdsd2, true);
			?></td>

<td><?php
			$dsdsd2=$row['profit'];
			echo formatMoney($dsdsd2, true);
			?></td>



			<td>
			<?php
				$due_date = (float)$row['due_date'];
				$amount = (float)$row['amount'];
				$profit = (float)$row['profit'];
				$invoice = $row['invoice_number'];

				if ($due_date >= $amount) {
					$dsdsd2 = $profit;
				} else {
					$dsdsd2 = 0;
					$result1 = $db->prepare("SELECT * FROM sales_order WHERE invoice = :invoice");
					$result1->bindParam(':invoice', $invoice);
					$result1->execute();

					for ($i = 0; $row2 = $result1->fetch(); $i++) {
						$qty = $row2['qty'];
						$price = $row2['price'];
						if ($due_date > ($price * $qty) && $amount > $due_date) {
							$dsdsd2 = $due_date - ($price * $qty);
						}
					}
				}

				$total_profit += $dsdsd2;
				echo formatMoney($dsdsd2, true);
				?>

		</td>

			<!--    DISCOUNT QUERIES     -->
			

						<?php
           $dsdsd3 = abs(($row['due_date'] > $row['amount']) ? $row['amount'] - $row['due_date'] : 0);

			$color1 =  '#da4f49' ;
			?>
			<td style="color: <?= $color1 ?>;">
				<?= formatMoney($dsdsd3, true); ?>
			</td>
			


			
			<?php
			$dsdsd3 = ($row['amount'] > $row['due_date']) ? $row['amount'] - $row['due_date'] : '';

			$color =   '#63C592FF' ;
			?>
			<td style="color: <?= $color ?>;">
				<?= formatMoney($dsdsd3, true); ?>
			</td>
			
			<td>
			<button class="btn btn-info viewbutton" id="<?php echo $row['invoice_number']; ?>" title="پروڈکٹ دیکھنے کے لیے کلک کریں۔">
        <i class="icon-eye-open"></i> <!-- or use 'fas fa-eye' if using Font Awesome -->
    </button>
</td>			<!--    DISCOUNT QUERIES END    -->
		
			
			
			
			</tr>
			<?php
				}
			?>
		
	</tbody>
	<tr>
			<th> </th>
			<th>  </th>
			<th>  </th>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b>  کل رقم : </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل وصول کی گئی رقم  </b></td>			
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل منافع ہوگا </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b>کل فی الحال منافع </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b>کل بقایا دینا </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل بقایا لینا ہے </b></td>
		<th></th>
		</tr>
		

		
		
		<thead>
		<tr>
		
			<th colspan="3" style="border-top:1px solid #999999; font-family: 'Noto Nastaliq Urdu' !important;" > کل مجموعی رقم: </th>
			
			<th colspan="1" style="border-top:1px solid #999999">
			<?php 

				$resultia = $db->prepare("SELECT sum(amount) FROM sales WHERE date BETWEEN :c AND :d");
				$resultia->bindParam(':c', $d1);
				$resultia->bindParam(':d', $d2);
				$resultia->execute();
				for($i=0; $cxz = $resultia->fetch(); $i++){
				$zxc=$cxz['sum(amount)'];
				echo formatMoney($zxc, true);
				}
				?>
		
				</th>
			
			
			<th colspan="1" style="border-top:1px solid #999999"> 
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
				
				$d1=$_GET['d1'];
				$d2=$_GET['d2'];
				$results = $db->prepare("SELECT sum(due_date) FROM sales WHERE date BETWEEN :a AND :b");
				$results->bindParam(':a', $d1);
				$results->bindParam(':b', $d2);
				$results->execute();
				for($i=0; $rows = $results->fetch(); $i++){
				$dsdsd=$rows['sum(due_date)'];
				echo formatMoney($dsdsd, true);
				}
				
				?>
			</th>
			
			
			<th colspan="1" style="border-top:1px solid #999999">
			<?php 
				$resultia = $db->prepare("SELECT sum(profit) FROM sales WHERE date BETWEEN :c AND :d");
				$resultia->bindParam(':c', $d1);
				$resultia->bindParam(':d', $d2);
				$resultia->execute();
				for($i=0; $cxz = $resultia->fetch(); $i++){
				$zxc=$cxz['sum(profit)'];
				echo formatMoney($zxc, true);
				}
				?>
		
				</th>
			
			<th>
			<?php
			echo formatMoney($total_profit, true);
			?>
			</th>

						

			<!--  Sum of Discount Queries-->
		    <th style="color: <?= $color1 ?>;">
				<?php
			echo formatMoney($total_balance, true);
			?>
			</th>
			<th style="color: <?= $color ?>;">
				<?php
			echo formatMoney($total_balance1, true);
			?>
			</th>
			
			<!-- END Sum of Discount Queries End    -->
			
			
			
			
			<th></th>
			
		</tr>
		
		
		
	</thead>
</table>
</div>
<div class="clearfix"></div>
</div>
</div>
</div>

</body>
<script src="js/jquery.js"></script>

	
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="js/jquery.js"></script>

<script type="text/javascript">
$(document).ready(function() {
    // View button click
    $(".viewbutton").click(function(e) {
        e.preventDefault();
        var invoiceNumber = $(this).attr("id");

        $.ajax({
            type: "POST", // or GET if your backend supports it
            url: "get_remarks.php",
            data: { invoice_number: invoiceNumber },
            success: function(response) {
                Swal.fire({
                    title: 'ریمارکس',
                    text: response,
                    icon: 'info',
                    confirmButtonText: 'بند کریں',
                    customClass: {
                        confirmButton: 'urdu-text'
                    }
                });
            },
            error: function() {
                Swal.fire(
                    'خرابی',
                    'ریمارکس لوڈ نہیں ہو سکے۔',
                    'error'
                );
            }
        });
    });
});

</script>

</script>
<?php include('footer.php');?>
</html>