<!DOCTYPE html>
<html>
<head>
<?php require_once ('auth.php');?>
<title>
Bill Printing
</title>
 <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link href="css/css2.css" media="screen" rel="stylesheet" type="text/css" />
  <link href="https://fonts.googleapis.com/earlyaccess/notonastaliqurdudraft.css" rel="stylesheet">
<style>
  body{
	  font-family: 'Noto Nastaliq Urdu' !important;

  }
  .urdu-text {
font-family: 'Noto Nastaliq Urdu' !important;
direction: rtl;
text-align: right;
}


@media print {
  html, body {
    width: 100%;
    height: auto;
	z-index: 0.9;
    overflow: visible;
  }
  .no-print {
    display: none !important;
  }

  .content, .container-fluid, .row-fluid, .span10 {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table, tr, td, th {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  body {
    font-size: 12px !important;
    line-height: 1.2 !important;
  }

  table th, table td {
    padding: 5px !important;
    font-size: 12px !important;
  }

  .content {
    padding: 10px !important;
    margin: 0 !important;
  }

  * {
    box-sizing: border-box;
  }
  @page {
    size: A4 portrait;
    margin: 1cm;
  }

  table {
    page-break-after: auto;
    break-after: auto;
  }

  .record {
    page-break-inside: avoid;
  }

  .no-break {
    page-break-inside: avoid !important;
  }

  @page {
    size: A4 portrait;
    margin: 1cm;
  }
}

</style>

<style type="text/css">
    
      .sidebar-nav {
        padding: 9px 0;
      }
	  @media print {
    a:after {
        content:" (" attr(href) ") ";
        /* color: $primary; */
    }
}

@page {
    margin-top: 2cm;
    margin-bottom: 2cm;
    margin-left: 2cm;
    margin-right: 2cm;
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
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>
<script language="javascript">
function Clickheretoprint()
{ 
  var disp_setting="toolbar=yes,location=no,directories=yes,menubar=yes,"; 
      disp_setting+="scrollbars=yes,width=auto, height=auto, left=100, top=25"; 
  var content_vlue = document.getElementById("content").innerHTML; 

  var docprint=window.open("","",disp_setting); 
   docprint.document.open(); 
   docprint.document.write('</head><body onLoad="self.print()" style="width: auto; font-size: 13px;  text-align-center">');          
   docprint.document.write(content_vlue); 
   
   //docprint.document.write("testing print"); 
   
   docprint.document.close(); 
   docprint.focus(); 
}
</script>
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
timeValue += (hours >= 12) ? " P.M." : " A.M."
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
	  <div class="span2">
        <div class="well sidebar-nav">
        <ul class="nav nav-list">
		
    <li ><a href="index.php"><i class="icon-dashboard icon-2x"></i> ڈیش بورڈ </a></li> 
	<li class="active"><a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-shopping-cart icon-2x"></i> فروخت</a></li>             
			<li ><a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a></li>
			<li><a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a></li>
			<li><a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a></li>
			<li><a href="salesreport.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ</a></li>				<li><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> سیلز انوینٹری</a></li>
			<li><a href="purchase_invoice.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> خریداری انوائس</a></li>
			<div style="margin-top: 30px;"></div>
			
			<li>
			<div class="hero-unit-clock">
			<form name="clock">
<font color="white">وقت: <br></font>&nbsp;<input style="width:150px;" type="submit" class="trans" name="face" value=""></form>
			</div>
			</li>
			</ul>          
          </div><!--/.well -->
        </div><!--/span-->
		
	<div class="span10">
	<a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><button class="btn btn-default"><i class="icon-arrow-left"></i> Back to Sales</button></a>

<div class="content" id="content"  style="page-break-inside: avoid; break-inside: avoid;">
<div style="max-width: 800px; margin: 0 auto; padding: 30px; background: #fff; border: 1px solid #ccc; border-radius: 10px;">
	<div style="width: 100%; height: 300px;" >
	<div style="width: 100%; text-align: center;">
	<div style="margin-left: 20px; font-weight: bold; font-size: 50px; direction: rtl; text-align: center;">
	<br>
    شہباز سولر سسٹم
    <br><br> <br><br>
    <div style="margin-left: 20px; font-weight: bold; font-size: 30px; direction: rtl; text-align: center;">
        <!-- شہباز سولر سسٹم:  -->
		        <br>فروخت کی رسید
        <br><br><br>
        گاہک کا نام: <?php echo $name; ?>
    </div>
</div>
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
	
	<div style="width: 633px; direction: rtl; height: 180px; margin-bottom:10px">
	<table cellpadding="8" cellspacing="4" style="font-size: 25px; width: 100%;">
		
	<tr>
    <td>ٹرانزیکشن آئی ڈی:</td>
    <td><?php echo $transaction_id ?></td>
</tr>

<tr>
    <td>انوائس:</td>
    <td><?php echo $invoice ?></td>
</tr>

<br>

<tr>
    <td>تاریخ:</td>
    <td><?php echo $date ?></td>
</tr>
	</table>
	
	</div>
	<div class="clearfix"></div>
	</div>
	<br>
	<br>
	<div style="width: 40px; line-height: 50px; margin-top: 100px, ">
	<table border="1" cellpadding="12" cellspacing="8" style="  font-size: 28px; line-height: 50px; margin-left: 163px;  margin-top: 50px;" width="100%">
		<thead>
			<tr>
				<th width="60"> پروڈکٹ کا نام </th>
				<!--<th> Des </th>-->
				<th> مقدار </th>
				<th> قیمت </th>
				<th> کل رقم </th>
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
				<td><?php echo $row['gen_name']; ?></td>
				<!--<td><?php //echo $row['name']; ?></td>-->
				<td><?php echo $row['qty']; ?></td>
				<td>
				<?php
				$ppp=$row['price'];
				echo formatMoney($ppp, true);
				?>
				
				</td>

				
				<td>
				<?php
				$ppp=$row['amount'];
				echo formatMoney($ppp, true);
				?>
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
					
					<td colspan="5" style=" text-align:right;"><strong style="font-size: 30px;">کل مجموعی رقم: &nbsp;</strong><!--</td>-->
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
					<td colspan="5"style=" text-align:right;"><strong style="font-size: 30px; color: #222222;">موصول شدہ نقد رقم:&nbsp;</strong><!--</td>-->
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
					<td colspan="5" style=" text-align:right;"><strong style="font-size: 12px; color: #222222;">
					<font style="font-size:20px;">
					<?php
					if($pt=='cash'){
					echo 'DISCOUNT:';
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
					echo formatMoney($amount, true);
					}
					?>
					</strong></td>
					
				</tr>
				<tr>
					<td colspan="5" style=" text-align:center;"><strong style="font-size: 12px; color: #222222;">
					<font style="font-size:20px;">
					<b>Software is Powered By Softzone </b>
					<br> Contact No: 0332-7109900
					</strong></td>
					
				</tr>
				
		</tbody>
	</table>
	
	</div>
	</div>
	</div>
	</div>
<div class="pull-right" style="margin-right:800px;">
		<a href="javascript:Clickheretoprint()" style="font-size:80px;"><button class="btn btn-success btn-large"><i class="icon-print"></i> Print</button></a>
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
