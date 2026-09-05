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
<title >
ڈیجی کھاتہ سسٹم
</title>
 <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
    <style type="text/css">
    
      .sidebar-nav {
        padding: 9px 0;
      }
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="src/facebox.css" media="screen" rel="stylesheet" type="text/css" />
<link href="css/css2.css" media="screen" rel="stylesheet" type="text/css" />


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
<?php
	require_once('auth.php');
	session_set_cookie_params(86400);
	ini_set('session.gc_maxlifetime', 86400);
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
<body>

<!------------------  نیویگیشن بار یہاں شروع ہوتا ہے   --------------->
<?php include('navfixed.php');?>
	<?php
	
	session_set_cookie_params(86400);
	ini_set('session.gc_maxlifetime', 86400);
	
	$position=$_SESSION['SESS_LAST_NAME'];
	if($position=='cashier') {
		
	?>

<a href="../index.php">لاگ آؤٹ</a>
<?php
}
if($position=='cashier') {
?>


		<div class="container-fluid">
		<div class="row-fluid">
<?php include('includes/sidebar.php');?>
		
	<div class="span10">
	<div class="contentheader">
			<i class="icon-dashboard"></i> ڈیش بورڈ
			</div>
			<ul class="breadcrumb">
			<li class="active">ڈیش بورڈ</li>
			</ul>
			
			<font style=" font:bold 44px 'Aleo'; /* text-shadow:1px 1px 25px #000; */ color:#3D708DFF;   font-family: 'Noto Nastaliq Urdu' !important; "><center>ڈیجی کھاتہ سسٹم</center></font>
			
			
<div id="mainmain">
<a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-shopping-cart icon-2x"></i><br> فروخت</a>               
<a href="products.php"><i class="icon-list-alt icon-2x"></i><br> مصنوعات</a>      
<a href="customer.php"><i class="icon-group icon-2x"></i><br> گاہک</a>     
<a href="supplier.php"><i class="icon-group icon-2x"></i><br> سپلائرز</a>     
<a href="salesreport.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i><br> فروخت رپورٹ</a>
<a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i><br> سیلز انوینٹری</a>
<a href="trade.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-bar-chart icon-2x"></i><br> لین دین</a>
<a href="../index.php"><font color="red"><i class="icon-off icon-2x"></i></font><br> لاگ آؤٹ</a> 

<?php
}
?>
<div class="clearfix"></div>
</div>
</div>
</div>
</div>
</body>
<?php include('footer.php'); ?>
</html>
