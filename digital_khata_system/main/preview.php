<?php
session_start();

if (!isset($_SESSION['SESS_LAST_NAME']) || $_SESSION['SESS_LAST_NAME'] !== 'cashier') {
    // Redirect if not cashier
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
<?php require_once ('auth.php');?>
<title>
بل پرنٹنگ
</title>
 <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link href="css/css2.css" media="screen" rel="stylesheet" type="text/css" />

<style>
@media print {
  body {
    margin: 0;
    padding: 0;
    font-size: 12pt;
  }

  .invoice {
    border: 1px solid #000; /* Always visible */
    padding: 20px;
    page-break-inside: avoid;
  }

  * {
    box-sizing: border-box;
  }

  /* Avoid unwanted spacing or page breaks */
  .no-break {
    page-break-inside: avoid;
  }

  /* Remove background colors/images which might not print properly */
  body, .invoice {
    background: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page {
  size: A4;
  margin: 1cm; /* Or set to 0 for full-page */
}
* {
  box-sizing: border-box;
}

}

body{
	  font-family: 'Noto Nastaliq Urdu' !important;

  }
  .urdu-text {
font-family: 'Noto Nastaliq Urdu' !important;
direction: rtl;
text-align: right;
}
    
 	 

.book-date {
    page-break-after: always;
}

.post-content {
    page-break-before: always;
}

p { 
  page-break-inside: avoid;
}
.sidebar-nav {
  padding:
9px 0;
}
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
<script language="javascript">
function Clickheretoprint() { 
  var disp_setting="toolbar=yes,location=no,directories=yes,menubar=yes,"; 
//  for recipent type is 
  //  var disp_setting="width=300,height=500,top=25,left=100";

  disp_setting+="scrollbars=yes,width=700, height=auto, left=100, top=25"; 

  var content_value = document.getElementById("content").innerHTML; 

  var docprint = window.open("", "", disp_setting); 
  docprint.document.open(); 

  // Include the font link and custom style for printing
  docprint.document.write('<html><head>');
  docprint.document.write('<link href="css/css2.css" rel="stylesheet" type="text/css">');
  docprint.document.write('<style>');
docprint.document.write(`
  body, table, tr, td, th {
    font-family: 'Noto Nastaliq Urdu', serif !important;
    font-size: 12px !important;
    line-height: 2.5 !important;
    padding: 2px !important;
    margin: 0 !important;
    border-collapse: collapse !important;
  }
  .print-bordered, .print-bordered td, .print-bordered th {
    border: 1px solid black !important;
  }
	  .buty-text {
    font-size: 9px !important;
    font-family: 'Alo' !important;
    color: #222222 !important;
  }
  .buty {
    margin-left: 30px !important;
    text-align: left;
  }


  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`);

docprint.document.write('</style>');
   docprint.document.write('</head><body onLoad="self.print()">');

  docprint.document.write(content_value); 
  docprint.document.write('</body></html>'); 
  docprint.focus();
  docprint.document.close(); 
  docprint.focus(); 
}</script>
<?php
$invoice=$_GET['invoice'];
include('../connect.php');
$result = $db->prepare("SELECT * FROM sales WHERE invoice_number= :userid");
$result->bindParam(':userid', $invoice);
$result->execute();
for($i=0; $row = $result->fetch(); $i++){
$cname=$row['name'];
$invoice=$row['invoice_number'];
$date=$row['date'];
$cash=$row['due_date'];
$cashier=$row['cashier'];
$name=$row['name'];
$transaction_id=$row['transaction_id'];
$pt=$row['type'];
$am=$row['amount'];
if($pt=='cash'){
$cash=$row['due_date'];
$amount=$cash-$am;
}
}
?>
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
<body>

<?php include('navfixed.php');?>
	
	<div class="container-fluid">
      <div class="row-fluid">
	 	  	  <?php include('includes/sidebar.php');?>

		
	<div class="span10">
	<a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><button class="btn btn-default" style=" font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon-arrow-left"></i> فروخت پر واپس جائیں</button></a>

<div class="content" id="content">
<div style="">
	<div style="" >
	<div style="">
	<div style=" text-align:center; font:bold 24px 'Noto Nastaliq Urdu';">ڈیجی کھاتہ سسٹم
	
<div style="margin-top: 40px; margin-bottom: 40px;" >
 </div>
	</div>
	
	<!-- DG Pharmacy	<br>
	DG Eye & General Hospital, DG Khan<br>	<br> -->
	
	<div>
	<?php
	$resulta = $db->prepare("SELECT * FROM customer WHERE customer_name= :a");
	$resulta->bindParam(':a', $cname);
	$resulta->execute();
	for($i=0; $rowa = $resulta->fetch(); $i++){
	$address=$rowa['address'];
	$contact=$rowa['contact'];
	}
	?>
	</div>
	</div>
	<div style=" display: flex;
  flex-direction: column; align-items: center; margin-left: 70px ; margin-top: -10px; margin-bottom: 10px;">
	<table border="0" cellpadding="8" cellspacing="4"  style="font-family: 'Noto Nastaliq Urdu';   direction: rtl; ">
		

	<tr width="100" style="font-family: 'Noto Nastaliq Urdu', serif !important;  !important; text-align: center">
    <td style="font-size: 14px; text-align: center !important">
        گاہک کا نام
    </td>
	<td><?php echo $name; ?></td>
</tr>
	 
	
<!-- Visible labels -->

		<tr>
			<td style="font-size: 14px;">انوائس</td>
			<td style="font-size: 14px;"><?php echo $invoice ?></td>
		</tr>

		<br>

		<tr>
			<td style="font-size: 14px;">تاریخ</td>
			<td style="font-size: 14px;"><?php echo $date ?></td>
		</tr>
		
	</table>
	
	</div>
	<div class="clearfix"></div>
	</div>
	<div style=" display: flex;
  flex-direction: column; align-items: center ">
	<table border="1" class="print-bordered"  cellpadding="12" cellspacing="8" style=" font-family: 'Noto Nastaliq Urdu'; ">
		<thead>
			<tr>
				<!--<th> Des </th>-->
				<th style="font-size: 13px;"> کل رقم </th>
		
				<th style="font-size: 14px;"> مقدار </th>
				<th style="font-size: 14px;"> قیمت </th>

				<th style="font-size: 14px;"> پروڈکٹ </th>
				
			</tr>
		</thead>
		<tbody>
			
				<?php
					$id=$_GET['invoice'];
					$result = $db->prepare("SELECT * FROM sales_order WHERE invoice= :userid");
					$result->bindParam(':userid', $id);
					$result->execute();
					for($i=0; $row = $result->fetch(); $i++){
						$dfdf=$row['amount'];
						//echo 'dfdf?: ' . $dfdf . ' | <br>';
						//var_dump($dfdf);
				?>
				<tr class="record">
				
								<td style="text-align: center; font-size: 14px;">
				<?php
				$ppp=$row['amount'];
				echo formatMoney($ppp, true);
				?>
				</td>
		
								<td style="text-align: center; font-family: Alo; font-size: 14px;"><?php echo $row['qty']; ?></td>
				<td style="font-size: 14px;">
				<?php
				$ppp=$row['o_price'];
				echo formatMoney($ppp, true);
				?>
				
				<td style="text-align: center; font-size: 14px !important;" id="productName"><?php echo $row['gen_name']; ?></td>

				</td>

				
				
				
				
				<?php
				//if($pt=='cash'){
				//echo formatMoney($amount, true);
				//	}
					
					//echo formatMoney($cash, true);
				//$ddd=$row['discount'];
				//echo formatMoney($ddd, true);
				?>
				
				
				
				
				<?php
				
				//echo formatMoney($cash, true);
				//echo formatMoney($dfdf, true);
				?>
				
				</tr>
				<?php
					}
				?>
			
				<tr>
					
					<td colspan="5" style=" text-align:right; font-size: 14px;"><strong style="">کل مجموعی رقم: &nbsp;&nbsp;</strong><!--</td>-->
					<!--<td colspan="2"><strong style="font-size: 12px;">-->
					<?php
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
					
				</tr>
				<?php if($pt=='cash'){
				?>
				
				<tr>
					<td colspan="5"style=" text-align:right;font-size: 14px;"><strong style="">موصول شدہ نقد رقم:&nbsp;&nbsp;</strong><!--</td>-->
					<!--<td colspan="2"><strong style="font-size: 12px; color: #222222;">-->
					<?php
					echo formatMoney($cash, true);
					?>
					</strong></td>
				</tr>
				
				<?php
				}
				?>
				<tr>
					<td colspan="5" style=" text-align:right; font-size: 14px;"><strong style="">
					<font style="font-family: 'Noto Nastaliq Urdu'; direction: rtl;">
					<?php
					if($pt=='cash'){
					echo 'بقایا رقم:';
					}
					if($pt=='credit'){
					echo 'Due Date:';
					}
					?>&nbsp;
					</strong><!--</td>-->
					<!--<td colspan="2"><strong style="font-size: 15px; color: #222222;">-->
					<?php
					
					if($pt=='credit'){
					echo $cash;
					}
					if($pt=='cash'){
						echo formatMoney(abs((int)$amount), true);
					}
					?>
					</strong></td>
					
				</tr>
				
				
		</tbody>
	</table>
	<div  class="buty" style=" color: #222222;  margin-left: 80px;">
					<font class="buty-text" style="font-size:10px;">
					<b>Developed By Softzone 0332-7764415 </b>
					
				</div>
	</div>
	</div>
	</div>
	</div>
<div class="pull-right" style="margin-right:480px;">
		<a href="javascript:Clickheretoprint()" style="font-size:80px;"><button class="btn btn-success btn-large" style="  font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;"><i class="icon-print"></i> پرنٹ کریں</button></a>


	</div>	
</div>
</div>

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
					
?>
<script>
  // Wait for DOM to be fully loaded
  window.onload = function() {
    // Get the hidden product name
    var productName = document.getElementById("productName").innerText;

    // Set it in the visible cell
    document.getElementById("givename").innerText = productName;
  };
</script>
