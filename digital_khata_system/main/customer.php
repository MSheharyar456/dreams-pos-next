<?php
session_start();

if (!isset($_SESSION['SESS_LAST_NAME']) || $_SESSION['SESS_LAST_NAME'] !== 'cashier') {
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

	
    <link href="css/bootstrap-responsive.css" rel="stylesheet">


<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!--sa poip up-->
<script src="jeffartagame.js" type="text/javascript" charset="utf-8"></script>
<script src="js/application.js" type="text/javascript" charset="utf-8"></script>
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
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
<link rel="stylesheet" href="css/font-awesome.min.css">
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
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      .sidebar-nav {
        padding: 9px 0;
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
<div class="container-fluid">
      <div class="row-fluid">
	  	  <?php include('includes/sidebar.php');?>

	<div class="span10">
	<div class="contentheader">
			<i class="icon-group"></i> گاہک
			</div>
			<ul class="breadcrumb">
	<li><a href="index.php">ڈیش بورڈ</a></li> /
	<li class="active">گاہک</li>
</ul>

<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: left; font-family: 'Noto Nastaliq Urdu' !important;">
<i class="icon icon-circle-arrow-left icon-large"></i> واپس جائیں</button></a>
<?php 
			include('../connect.php');
				$result = $db->prepare("SELECT * FROM customer ORDER BY customer_id DESC");
				$result->execute();
				$rowcount = $result->rowcount();
			?>
			<div style="text-align:center;">
		کل گاہکوں کی تعداد: <font color="green" style="font:bold 22px 'Aleo';"><?php echo $rowcount;?></font>
	</div>
</div>
<br>
<input type="text" name="filter" style="height:50px;  font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;" id="filter" placeholder="گاہک تلاش کریں..." autocomplete="off" />
<a rel="facebox" href="addcustomer.php"><Button type="submit" class="btn btn-info" style="float:right; width:230px; height:40px;  font-family: 'Noto Nastaliq Urdu' !important;direction: rtl;" /><i class="icon-plus-sign icon-large"></i> نیا گاہک شامل کریں</button></a><br><br>

<table class="table table-bordered table-striped table-hover" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr>
		<th width="17%"> مکمل نام </th>
			<th width="10%"> پتہ </th>
			<th width="10%"> رابطہ نمبر</th>
			<th width="23%"> مصنوعات کا نام</th>
			
			<th width="17%"> نوٹ </th>
			<th width="14%"> کارروائی </th>
		</tr>
	</thead>
	<tbody>
		
			<?php
				include('../connect.php');
				$result = $db->prepare("SELECT * FROM customer ORDER BY customer_id DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
			?>
			<tr class="record">
			<td><?php echo $row['customer_name']; ?></td>
			<td><?php echo $row['address']; ?></td>
			<td><?php echo $row['contact']; ?></td>
			<td><?php echo $row['prod_name']; ?></td>
			<td><?php echo $row['note']; ?></td>

			<td><a class='facebox' title="صارف کو ترمیم کرنے کے لیے کلک کریں" rel="facebox" href="editcustomer.php?id=<?php echo $row['customer_id']; ?>" style="font-family: 'Noto Nastaliq Urdu' !important;"><button style="margin-bottom: 5px; font-family: 'Noto Nastaliq Urdu' !important;" class="btn btn-warning btn-mini" ><i class="icon-edit"></i></button></a> 
	
			<button class="btn btn-danger delbutton btn-mini" id="<?php echo $row['customer_id']; ?>" style="" title="Click to Delete the customer">
	    		<i class="icon-trash "></i>
		</button>
           </td>
			</tr>
			<?php
				}
			?>
		
	</tbody>
</table>
<div class="clearfix"></div>

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
                    url: "deletecustomer.php",
                    data: info,
                    success: function(response) {
                        if (response.trim() === "udhar_balance_not_zero") {
                            Swal.fire(
                                'ادھار کلیئر کریں!',
                                'پہلے ادھار لین دین کھاتہ کلیئر کریں، کیونکہ حذف کرنے سے ادھار کھاتہ بھی حذف ہو جائے گا۔',
                                'warning'
                            );
                        } else if (response.trim() === "deleted") {
                            $("#" + del_id).parents("tr").animate({
                                backgroundColor: "#fbc7c7"
                            }, "fast").animate({
                                opacity: "hide"
                            }, "slow", function() {
                                $(this).remove();
                            });

                            Swal.fire(
                                'حذف ہو گیا!',
                                'کسٹمر کامیابی سے حذف ہو گیا ہے۔',
                                'success'
                            );
                        } else {
                            Swal.fire(
                                'خرابی',
                                'کسٹمر حذف نہیں ہو سکا۔',
                                'error'
                            );
                        }
                    },
                    error: function() {
                        Swal.fire(
                            'خرابی',
                            'سرور سے رابطہ نہیں ہو سکا۔',
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