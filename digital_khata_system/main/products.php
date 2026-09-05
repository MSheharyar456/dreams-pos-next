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

<script>
function sum() {
    const qty = parseFloat(document.getElementById('txt11').value);
    const price = parseFloat(document.getElementById('txt2').value);
    const total = qty * price;

    if (!isNaN(total)) {
        document.getElementById('total_price').value = total.toFixed(2); // 2 decimal places
    } else {
        document.getElementById('total_price').value = '';
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
			<i class="icon-table"></i> مصنوعات
			</div> 
			<ul class="breadcrumb">
			<li><a href="index.php">ڈیش بورڈ</a></li> /
			<li class="active">مصنوعات</li>
			</ul>

			<div style="margin-top: -19px; margin-bottom: 21px;">
			<a  href="index.php"><button class="btn btn-default btn-large" style="float: left; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
			<?php 
			include('../connect.php');
				$result = $db->prepare("SELECT * FROM products ORDER BY qty_sold DESC");
				$result->execute();
				$rowcount = $result->rowcount();
			?>
			
			<?php 
				$result = $db->prepare("SELECT * FROM products where qty < 10 ORDER BY product_id DESC");
				$result->execute();
				$rowcount123 = $result->rowcount();
			?>						<!--SUM OF ALL PURCHASE-->
			<?php 				
			$result = $db->prepare("SELECT sum(o_price) From products");
			$result->execute();
			$rowcountsum = $result->rowcount();
			?>		
									<!--SUM OF ALL Sales-->
			
			<?php 				
			$result = $db->prepare("SELECT sum(price) From products");
			$result->execute();
			$rowcountsum1 = $result->rowcount();
			?>						
			<!--SUM OF ALL PURCHASE END-->
				<div style="text-align:center;">
				کل مصنوعات کی تعداد:  <font color="green" style="font:bold 22px 'Noto Nastaliq Urdu';">[<?php echo $rowcount;?>]</font>
			</div>
			<div style="text-align:center;">
			<div style="direction: rtl; font: bold 22px 'Noto Nastaliq Urdu';">
    10 سے کم مقدار والی مصنوعات 
    <span style="direction: ltr; color: rgb(255, 95, 66) !important;">
        [<?php echo $rowcount123; ?>]
    </span>
</div>

			</div>						
			<!-- <div style="text-align:center;">			TOTAL STOCK PURCHASE AMOUTN:<font style="color:rgb(255, 95, 66);; font:bold 22px 'Aleo';">[<span id="stk_purchase_amount"></span>]</font></div>
			<div style="text-align:center;">			TOTAL STOCK SALES AMOUTN:<font style="color:rgb(255, 95, 66);; font:bold 22px 'Aleo';">[<span id="stk_sales_amount"></span>]</font></div> -->
			
			<!-- Remaining Stock Details-->
			<?php
			
				$result = $db->prepare("SELECT *, SUM(o_price * qty) AS total3 FROM products ORDER BY product_id DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
				$asd=$row['total3'];

				
			?>
			<!-- <div style="text-align:center;">
			REMAINING STOCK AMOUTN:
			<font style="color:rgb(255, 95, 66);; font:bold 22px 'Aleo';">[<span>
			<?php 
			$asd=$row['total3'];
			echo formatMoney($asd, true);
				}
			?>
			
			
			</span>]
		
			</font> 			
			</div> -->
</div>


<input type="text" style="height:50px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;" name="filter" value="" id="filter" placeholder="مصنوع تلاش کریں..." autocomplete="off" />
<a rel="facebox" href="addproduct.php"><Button type="submit" class="btn btn-info" style="float:right; width:230px; height:35px;direction: rtl; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;" /><i class="icon-plus-sign icon-large"></i> نئی مصنوع شامل کریں</button></a><br><br>
<table class="hoverTable table-striped table-hover table-bordered" id="resultTable" data-responsive="table" style="text-align: left;">
	<thead>
			<tr style="">
			<th width="12%"> کمپنی کا نام</th>
        <th width="14%"> مصنوعات کا نام</th>
        <th width="13%"> زمرہ / تفصیل</th>
        <th width="7%"> سپلائر</th>
        <th width="15%"> موصول ہونے کی تاریخ</th>
        <th width="6%">قیمتِ خرید</th>
		<th width="6%">کل مقدار</th>

        <th width="6%"> باقی مقدار</th>
		
        <th width="8%"> کل قیمت</th>
        <th width="8%"> عمل</th>
			</tr>
	</thead>
	<tbody>
		
			<?php			$stock_purchase_amount = [];			$sales_purchase_amount = [];
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
				$result = $db->prepare("SELECT *, o_price * qty_sold as total, price * qty as total1 FROM products ORDER BY product_id DESC");
				$result->execute();
				for($i=0; $row = $result->fetch(); $i++){
				$total=$row['total'];
				$total3=$row['total1'];
				$availableqty=$row['qty'];
				if ($availableqty < 10) {
				echo '<tr class="alert alert-warning record" style="color: #827272;">';
				}
				else {
				echo '<tr class="record">';
				}
			?>
		

			<td><?php echo $row['product_code']; ?></td>
			<td><?php echo $row['gen_name']; ?></td>
			<td><?php echo $row['product_name']; ?></td>
			<td><?php echo $row['supplier']; ?></td>
			<td><?php echo $row['date_arrival']; ?></td>
		
			
			
			<!-- Umair Queries Try-->
			<?php
			
		 
			?>
			<!-- END-->
			<td>
			<?php
			
		
			 
			
			$total2=$row['o_price'];
			echo formatMoney($total2, true);
				
			?>
			</td>	
			<td><?php echo $row['onhand_qty']; ?></td>
			
			<td><?php echo $row['qty']; ?></td>
			
			
			<!--Purchase Total Amount-->
		
			
			  
			<!--Sale Total Amount-->
			<td>
			<?php
			
		
			 
			
			$total2=$row['price'];
			echo formatMoney($total2, true);
				
			?>
			</td>
			<td><a rel="facebox"  title="Click to edit the product" href="editproduct.php?id=<?php echo $row['product_id']; ?>"> <button style="margin-bottom: 5px" class="btn btn-warning"><i class="icon-edit"></i> </button> </a>
			<button class="btn btn-danger delbutton" id="<?php echo $row['product_id']; ?>" title="Click to Delete the product">
    <i class="icon-trash"></i>
</button>

 </td>
			</tr>
			<?php
				}			
			?>
	</tbody>
</table><?php	//echo '<pre>stk: '; print_r($stk_purchase_amount);	//echo '<pre>sales:'; print_r($sales_purchase_amount); echo '</pre></pre>';	?>
<div class="clearfix"></div>
</div>
</div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    const qtyLeftInput = document.getElementById("txt11"); // QTY Left
    const qtySoldInput = document.querySelector("input[name='sold']"); // QTY Sold

    // Calculate total stock only ONCE from values fetched from database
    const totalQty = parseInt(qtyLeftInput.value || 0) + parseInt(qtySoldInput.value || 0);

    // When user changes Sold
    qtySoldInput.addEventListener("input", function () {
        let sold = parseInt(this.value) || 0;

        // Prevent exceeding total stock
        if (sold > totalQty) {
            sold = totalQty;
            this.value = sold;
        }

        qtyLeftInput.value = totalQty - sold;
    });

    // When user changes Left
    qtyLeftInput.addEventListener("input", function () {
        let left = parseInt(this.value) || 0;

        // Prevent exceeding total stock
        if (left > totalQty) {
            left = totalQty;
            this.value = left;
        }

        qtySoldInput.value = totalQty - left;
    });
});
</script>

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
                    url: "deleteproduct.php",
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