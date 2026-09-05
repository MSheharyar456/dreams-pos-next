<html>
<head>
<title>
شہباز سولر سسٹم
</title>

<?php 
require_once('auth.php');
?>
 <link href="css/bootstrap.css" rel="stylesheet">

    <link rel="stylesheet" type="text/css" href="css/DT_bootstrap.css">
  
  <link rel="stylesheet" href="css/font-awesome.min.css">
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

<script>
function sum() {
            var txtFirstNumberValue = document.getElementById('txt1').value;
            var txtSecondNumberValue = document.getElementById('txt2').value;
            var result = parseInt(txtFirstNumberValue) - parseInt(txtSecondNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt3').value = result;
				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt11').value;
            var result = parseInt(txtFirstNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt22').value = result;				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt11').value;
            var txtSecondNumberValue = document.getElementById('txt33').value;
            var result = parseInt(txtFirstNumberValue) + parseInt(txtSecondNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt55').value = result;
				
            }
			
			 var txtFirstNumberValue = document.getElementById('txt4').value;
			 var result = parseInt(txtFirstNumberValue);
            if (!isNaN(result)) {
                document.getElementById('txt5').value = result;
				}
			
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
	<li ><a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-shopping-cart icon-2x"></i> فروخت</a></li>             
			<li><a href="products.php"><i class="icon-list-alt icon-2x"></i> مصنوعات</a></li>
			<li ><a href="customer.php"><i class="icon-group icon-2x"></i> گاہک</a></li>
			<li ><a href="supplier.php"><i class="icon-group icon-2x"></i> سپلائرز</a></li>
			<li ><a href="salesreport.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> فروخت رپورٹ</a></li>
			<li ><a href="sales_inventory.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> سیلز انوینٹری</a></li>
			<li class="active"><a href="purchase_invoice.php?d1=0&d2=0"><i class="icon-bar-chart icon-2x"></i> خریداری انوائس</a></li>
			<br><br><br><br><br><br>		
			
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
	<div class="contentheader">
			<i class="icon-table"></i> خریداری انوائس
			</div> 
			<ul class="breadcrumb">
			<li><a href="index.php">ڈیش بورڈ</a></li> /
			<li class="active">خریداری انوائس</li>
			</ul>


<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: left; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس </button></a>

</br>
</br></br>

			<?php 
			include('../connect.php');
				$result = $db->prepare("SELECT * FROM products ORDER BY qty_sold DESC");
				$result->execute();
				$rowcount = $result->rowcount();
				
				
			?>
			
			
</div>
  
<input type="text" style="height:50px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;" name="filter" value="" id="filter" placeholder="خریداری انوائس تلاش کریں..." autocomplete="off" />
<a rel="facebox" href="add_invoice.php"> <Button type="submit" class="btn btn-info" style="direction: rtl; float:right; width:230px; height:35px; font-family: 'Noto Nastaliq Urdu' !important;" /><i class="icon-plus-sign icon-large"></i> خریداری انوائس شامل کریں</button></a><br><br>
<table class="hoverTable table-hover table-striped table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
		<tr> 
			<th width="12%"> انوائس نمبر</th>
			<th width="14%"> تقسیم کار کرنے والا</th>
			<th width="13%"> موصول کی تاریخ</th>
			<th width="12%"> کل رقم</th>
			<th width="12%"> ادا کی گئی رقم</th>
			<th width="12%"> باقی رقم</th>
			<th width="12%"> ریمارکس</th>
			<th width="8%">  عمل</th>
		</tr> 
	</thead>
	<tbody> 
		<?php 
		$result = $db->prepare("SELECT * FROM purchase_item ORDER BY purchase_id DESC");
		$result->execute();
		while($row = $result->fetch()) {
			$purchase_url = "purchase_details.php?invoice=" . urlencode($row['invoice']);
		?>
		<tr onclick="window.location='<?php echo $purchase_url; ?>'" style="cursor:pointer;">
			<td><?php echo $row['invoice']; ?></td>
			<td><?php echo $row['distributor']; ?></td>
			<td><?php echo $row['date']; ?></td>
			<td><?php echo $row['amount']; ?></td>
			<td><?php echo $row['paid_amount']; ?></td>
			<td><?php echo $row['p_amount']; ?></td>
			<td><?php echo $row['remarks']; ?></td>
			<td style="cursor:default;">
				<a rel="facebox" title="Click to edit the product" href="editpurchase.php?id=<?php echo $row['purchase_id']; ?>" onclick="event.stopPropagation();">
					<button class="btn btn-warning"><i class="icon-edit"></i></button>
				</a>
				<a href="#" id="<?php echo $row['purchase_id']; ?>" class="delbutton" title="Click to Delete the product"><button class="btn btn-danger"><i class="icon-trash"></i></button></a>			</td>
		</tr>
		<?php } ?>
	</tbody>
</table>

<div class="clearfix"></div>
</div>
</div>
</div>

<script src="js/jquery.js"></script>
  <script type="text/javascript">
$(document).ready(function() {
    $(".delbutton").click(function() {
        var del_id = $(this).attr("id"); // Get the id of the clicked delete button
        var info = 'id=' + del_id; // Prepare data for deletion
        
        // Confirm deletion action
        if (confirm("کیا آپ واقعی اس پروڈکٹ کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں لیا جا سکتا")) {
            $.ajax({
                type: "GET",
                url: "deletepurchase.php", // The URL for deletion
                data: info, // Send the product id to delete
                success: function(response) {
                    // On success, animate the product row and remove it
                    $("#" + del_id).parents("tr").animate({
                        backgroundColor: "#fbc7c7"
                    }, "fast").animate({
                        opacity: "hide"
                    }, "slow", function() {
                        $(this).remove(); // Remove the row after animation
                    });
                },
                error: function() {
                    alert("There was an error deleting the product.");
                }
            });
        }
        return false; // Prevent default action
    });
});

</script>

</script>
</body>
<?php include('footer.php');?>

</html>
