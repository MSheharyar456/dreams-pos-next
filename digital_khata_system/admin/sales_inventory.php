<?php
session_start();

if (!isset($_SESSION['SESS_LAST_NAME']) || $_SESSION['SESS_LAST_NAME'] !== 'admin') {
    // Redirect if not cashier
    header("Location: ../index.php");
    exit();
}
?>
<html>
<head>
<title>
ڈیجی کھاتہ سسٹم

</title>

<?php 
require_once('auth.php');
?>
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
<!--sa poip up-->
<script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<script src="lib/jquery.js" type="text/javascript"></script>
<script src="src/facebox.js" type="text/javascript"></script>

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

<script type="text/javascript">
  jQuery(document).ready(function($) {
    $('a[rel*=facebox]').facebox({
      loadingImage : 'src/loading.gif',
      closeImage   : 'src/closelabel.png'
    })
  })
</script>
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
	<div class="contentheader">
			<i class="icon-bar-chart"></i> مصنوعات کی فہرست
			</div>
		<br>

		<a  href="index.php"><button class="btn btn-default btn-large" style="float: left; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
			<!--<div style="float:right;">		
		<button  style="float:left;" class="btn btn-success btn-mini"><a href="javascript:Clickheretoprint()"> Print</button></a>
		</div>--><div class="pull-right" style="margin-right:100px;">		<a href="javascript:Clickheretoprint()" style="font-size:20px;"><button style="font-family: 'Noto Nastaliq Urdu' !important;" class="btn btn-success btn-large"><i class="icon-print"></i> پرنٹ</button></a>		</div>
		<br>
		<br>
		<br>


		<input type="text" style="padding:20px; margin-top: 10px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;" name="filter" value="" id="filter" placeholder="یہاں تلاش کریں" autocomplete="off" />
		<div class="content" id="content">
		<br><br><br><br>
		<center><strong>مصنوعات کی فہرست</strong></center>
		<table class="table table-bordered table-striped table-hover" id="resultTable" data-responsive="table" style="text-align: left;">
			<thead>
				<tr>
				
				<th width="10%"> انوائس نمبر </th>
			
				<th width="10%"> نام </th>
				<th width="12%"> رسید </th>
			<th width="9%"> تاریخ </th>

			<th> قیمتِ خرید</th>
			<th> قیمتِ فروخت</th>
			
			<th> مقدار </th>

			<th width="8%"> کل رقم </th>
			<th width="9%"> منافع </th>

			<th> کاروائی </th>
				</tr>
			</thead>
			<tbody>
		
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
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM sales_order ORDER BY transaction_id DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['invoice']; ?></td>
			<td><?php echo $row['gen_name']; ?></td>

			<td><?php echo $row['invoice']; ?></td>
			<td><?php echo $row['date']; ?></td>
			
			<td><?php
			$price=$row['price'];
			echo formatMoney($price, true);
			?></td>
			<td><?php
			$oprice=$row['o_price'];
			echo formatMoney($oprice, true);
			?></td>
	
	<td><?php echo $row['qty']; ?></td>
			
			
			<td><?php
			$oprice=$row['amount'];
			echo formatMoney($oprice, true);
			?></td>

			<td><?php
			$pprice=$row['profit'];
			echo formatMoney($pprice, true);
			?></td>
			<td> 
			<button class="btn btn-danger delbutton btn-mini" id="<?php echo $row['transaction_id']; ?>" style="" title="Click to Delete the customer">
	    		<i class="icon-trash "></i>
		</button>
			</tr>
			<?php
				}
			?>
			
			<tr>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				<th></th>
				
				<th>کل رقم</th>
				<th>کل منافع</th>
				<th></th>
			<tr>
				
			<tr>
				<th colspan="7"><strong style="font-size: 16px; color: #222222; padding-top: 10px; padding-left: 10px; " > کل مجموعی رقم: </strong></th>
				<th colspan="1"><strong style="font-size: 13px; color: #222222;">
				<?php
				$resultas = $db->prepare("SELECT sum(amount) from sales_order");
				// $resultas->bindParam(':a', $sdsd);
				// $resultas->bindParam(':a', $sdsd);

				$resultas->execute();
				for($i=0; $rowas = $resultas->fetch(); $i++){
				$fgfg=$rowas['sum(amount)'];
				echo formatMoney($fgfg, true);
				}
				?>
				</strong></th>
				<th colspan="1"><strong style="font-size: 13px; color: #222222;">
				<?php
				$resultas = $db->prepare("SELECT sum(profit) from sales_order");
				// $resultas->bindParam(':b', $sdsd);
				// $resultas->bindParam(':b', $sdsd);

				$resultas->execute();
				for($i=0; $rowas = $resultas->fetch(); $i++){
				$fgfg=$rowas['sum(profit)'];
				echo formatMoney($fgfg, true);
				}
				?>
				
					</th>
					
					<th></th>
			</tr>
		
		
		
		
		
	</tbody>
</table>
<div class="clearfix"></div>
</div>
</div>
</div>
</div>

<script src="js/jquery.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script src="js/jquery.js"></script>
  <script type="text/javascript">
$(document).ready(function() {
    $(".delbutton").click(function(e) {
        e.preventDefault();
        var del_id = $(this).attr("id");
        var info = 'id=' + del_id;

        Swal.fire({
            title: 'کیا آپ واقعی حذف کرنا چاہتے ہیں؟',
            text: 'یہ عمل واپس نہیں لیا جا سکتا!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ہاں، حذف کریں!',
            cancelButtonText: 'منسوخ کریں',
			customClass: {
        confirmButton: 'urdu-text',
        cancelButton: 'urdu-text'
    }
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "GET",
                    url: "deletesalesinventory.php",
                    data: info,
                    success: function(response) {
                        $("#" + del_id).parents("tr").animate({
                            backgroundColor: "#fbc7c7"
                        }, "fast").animate({
                            opacity: "hide"
                        }, "slow", function() {
                            $(this).remove();
                        });

                        Swal.fire(
                            'حذف ہو گیا!',
                            'پروڈکٹ کو کامیابی سے حذف کر دیا گیا ہے۔',
                            'success'
                        );
                    },
                    error: function() {
                        Swal.fire(
                            'خرابی',
                            'پروڈکٹ حذف نہیں ہو سکی۔',
                            'error'
                        );
                    }
                });
            }
        });
    });
});

</script>


</body>
<?php include('footer.php');?>

</html>