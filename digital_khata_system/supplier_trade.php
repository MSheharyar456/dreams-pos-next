<?php
session_start();

?><!DOCTYPE html>
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
شہباز سولر سسٹم
</title>
<?php
	require_once('auth.php');
?>
       
		<link href="vendors/uniform.default.css" rel="stylesheet" media="screen">
  <link href="css/bootstrap.css" rel="stylesheet">
  <script src="js/application.js" type="text/javascript" charset="utf-8"></script>

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
<link rel="stylesheet" type="text/css" href="tcal.css" />
<script type="text/javascript" src="tcal.js"></script>
<script language="javascript">
function Clickheretoprint() {
    var printContent = document.getElementById("divtoprint").innerHTML;
    var docprint = window.open("", "_blank", "width=auto,height=auto,left=0,top=25");

    docprint.document.open();
    docprint.document.write('<html><head><title>Print</title>');

    // Include external font and styling
    docprint.document.write('<link href="css/css2.css" rel="stylesheet" type="text/css">');
    docprint.document.write('<style>');
    
    docprint.document.write("body { font-family: 'Noto Nastaliq Urdu', serif !important; text-align: center; font-size: 12px !important; margin: 20px; }");
    docprint.document.write("table { width: 100%; border-collapse: collapse !important; }");
    docprint.document.write("table, th, td { border: 1px solid black !important; }");
    docprint.document.write("th, td { padding: 0px; text-align: center; }");
    docprint.document.write("h3 { margin: 0px 0; }");
    docprint.document.write('</style>');

    docprint.document.write('</head><body onload="window.focus();">');
    docprint.document.write(printContent);
    docprint.document.write('</body></html>');
    docprint.document.close();

    // Delay to allow styles and fonts to load before printing
    setTimeout(function () {
        docprint.focus();
        docprint.print();
        docprint.close();
    }, 500);
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
    thead th {
      font-size: 8px !important; /* You can make it smaller if you like */
    }
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
	<li ><a href="sales.php?id=cash&invoice=<?php echo $finalcode ?>">
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

            <li class="active"><a href="trade.php?id=cash&invoice=<?php echo $finalcode ?>"><i class="icon-bar-chart icon-2x"></i> لین دین</a></li>

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
			<!-- <i class="icon-money"> --></i> سپلائر کا لین دین
			</div>
			<ul class="breadcrumb">
			<a href="index.php"><li>ڈیش بورڈ</li></a> /
			<li class="active">سپلائر کا لین دین</li>
			</ul>
      
<div style="margin-top: -19px; margin-bottom: 21px;">
<a  href="index.php"><button class="btn btn-default btn-large" style="float: left; font-family: 'Noto Nastaliq Urdu' !important;">
<i class="icon icon-circle-arrow-left icon-large"></i> واپس جائیں</button></a>
<div class="pull-right" style="margin-right:100px; display: none">
		<a href="javascript:Clickheretoprint()" style="font-size:80px;"><button class="btn btn-success btn-large" style="font-family: 'Noto Nastaliq Urdu' !important; float: left; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;"><i class="icon-print"></i> پرنٹ کریں</button></a>
		</div>

<?php 
			include('../connect.php');
				$result = $db->prepare("SELECT * FROM udhar_suplier ORDER BY suplier_id DESC");
				$result->execute();
				$rowcount = $result->rowcount();
			?>
			<div style="text-align:center;">
		کل سپلائر کی تعداد: <font color="green" style="font:bold 22px 'Aleo';"><?php echo $rowcount;?></font>
	</div>

    		

</div>
<br>
<input type="text" name="filter" style="direction: rtl;height:50px;  font-family: 'Noto Nastaliq Urdu' !important;" id="filter" placeholder="سپلائر تلاش کریں..." autocomplete="off" />
<a rel="facebox" href="adds_udhar.php?pt=<?php echo $_GET['id']?>&invoice=<?php echo $_GET['invoice']?>&total=<?php echo $fgfg ?>&totalprof=<?php echo $asd ?>&cashier=<?php echo $_SESSION['SESS_FIRST_NAME']?>><Button type="submit" class="btn btn-info" style="  align-content: center;float:right; width:190px; height:40px;  font-family: 'Noto Nastaliq Urdu' !important;direction: rtl;" /><i class="icon-plus-sign icon-large"></i> نیا سپلائر کا لین دین</button></a><br><br>

<div class="content" id="divtoprint">

<table class="table table-bordered table-hover table-striped" id="resultTable" data-responsive="table" style="text-align: center;" >
	<thead>
  <tr height="50px" style="font-size: 24px !important; ">
    <th width="8%">سپلائر کا نام</th>
    <th width="8%">انوائس نمبر</th>
    <th width="8%">تاریخ</th>
    <th width="8%">رقم</th>
    <th width="9%">ادا شدہ رقم</th>
  
    <th width="9%">بقایا دینا ہے</th>
    <th width="9%">بقایا لینا ہے</th>
    <th width="10%">اپ ڈیٹ کی تاریخ</th>
    <th >ریمارکس</th>
    <th style="display: none">قرض</th>
    <th width="6%">کارروائی</th>
</tr>
	</thead>
	<tbody>
  <?php
        include('../connect.php');
        $result = $db->prepare("SELECT * FROM udhar_suplier");
        $result->execute();

        $total_amount = 0;
        $total_paid = 0;
        $total_balance = 0;
        $total_balance1 = 0;

        while ($row = $result->fetch()) {
            $total_amount += $row['amount'];
            $total_paid += $row['paid_amount'];
            if ($row['loan'] == 'Baqaya len') {
                $total_balance += $row['balance'];
            }
            if ($row['loan'] == 'Baqaya den') {
                $total_balance1 += $row['balance'];
            }

            // Fetch supplier name
            $supplier_id = $row['suplier_id'];
            $stmt = $db->prepare("SELECT suplier_name FROM supliers WHERE suplier_id = ?");
            $stmt->execute([$supplier_id]);
            $supplier = $stmt->fetch();
            $supplier_name = $supplier ? $supplier['suplier_name'] : 'نام موجود نہیں';
        ?>

      <tr class="record" id="row_<?php echo $row['id']; ?>">
      <td><?php echo $supplier_name; ?></td>
                <td><?php echo $row['invoice_no']; ?></td>
                <td style="direction: ltr !important;"><?php echo $row['date']; ?></td>
                <td><?php echo number_format($row['amount'], 2); ?></td>
                <td>
  <?php echo number_format(abs($row['paid_amount']), 2); ?>
</td>

                <td style="color: <?php echo ($row['loan'] == 'Baqaya len') ? '#da4f49' : 'black'; ?>">
                    <?php echo ($row['loan'] == 'Baqaya len') ? number_format(abs($row['balance']), 2) : ''; ?>
                </td>

                <td style="color: <?php echo ($row['loan'] == 'Baqaya den') ? '#63C592FF' : 'black'; ?>">
                    <?php echo ($row['loan'] == 'Baqaya den') ? number_format(abs($row['balance']), 2) : ''; ?>
                </td>
                <td><?php echo $row['updation_date']; ?></td>
                <td style="font-family: 'Noto Nastaliq Urdu' !important;direction: rtl !important;"><?php echo $row['remarks']; ?></td>
                <td style="display: none"><?php echo $row['loan']; ?></td>

                <td width="90">
                    <a class='facebox' title="سپلائر کو ترمیم کرنے کے لیے کلک کریں" rel="facebox"
                        href="editsudhar.php?id=<?php echo $row['id']; ?>&type=<?php echo $row['loan']; ?>&invoice_no=<?php echo $row['invoice_no']; ?>&amount=<?php echo $row['amount']; ?>&paid_amount=<?php echo $row['paid_amount']; ?>&balance=<?php echo $row['balance']; ?>"
                        style="font-family: 'Noto Nastaliq Urdu' !important;">
                        <button class="btn btn-warning btn-mini" style="margin-bottom: 5px;">
                            <i class="icon-edit"></i>
                        </button>
                    </a>
                    <button class="btn btn-danger delbutton btn-mini" id="<?php echo $row['id']; ?>" style="" title="Click to Delete the customer">
	    		<i class="icon-trash "></i>
		</button>
                </td>
      			</tr>
			<?php
				}
			?>
			<tr style="">
			<th> </th>
			<th>  </th>
			<th>  </th>
	
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b>  کل رقم : </b></td>
			<td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل ادا شدہ رقم </b></td>
      <td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل بقایا لینا ہے</b></td>
      <td style="font-family: 'Noto Nastaliq Urdu' !important;"><b> کل بقایا دینا ہے</b></td>
			<th>  </th>
      <th>  </th>
      <th>  </th>
      
		</tr>
			<tr>
      <th height="40" colspan="3" style="text-align: center; font-family: 'Noto Nastaliq Urdu' !important; padding-left: 20px; padding-top: 20px; font-size: 16px"><strong>کل مجموعی رقم: </strong></th>
            <td style="text-align: center; font-family: 'Noto Nastaliq Urdu' !important; padding-left: 20px; padding-top: 10px;"><strong><?php echo number_format($total_amount, 2); ?></strong></td>
            <td style="text-align: center; font-family: 'Noto Nastaliq Urdu' !important; padding-left: 20px; padding-top: 10px;"><strong><?php echo number_format($total_paid, 2); ?></strong></td>
            <td style="text-align: center; font-family: 'Noto Nastaliq Urdu' !important; padding-left: 20px; padding-top: 10px; color: #63C592FF"><strong><?php echo number_format($total_balance, 2); ?></strong></td>
            <td style="text-align: center; font-family: 'Noto Nastaliq Urdu' !important; padding-left: 20px; padding-top: 10px;;color: #da4f49;"><strong><?php echo number_format(abs($total_balance1), 2); ?></strong></td>
            <td colspan="3"></td>
  			</tr>
	</tbody>
</table><br>

<!--<a rel="facebox" href="alert.php?pt=<?php //echo $_GET['id']?>&invoice=<?php //echo $_GET['invoice']?>&total=<?php //echo $fgfg ?>&totalprof=<?php //echo $asd ?>&cashier=// echo $_SESSION['SESS_FIRST_NAME']?>"><button Style="width:200px; height:50px; background-color: #A5DCE9 !important; color: #EA6A02!important; align: left !important;" class="btn btn-info"><i class="icon icon-save icon-large"></i> Return Product</button></a>-->
<div class="clearfix"></div>
<div>
</div>
</div>
</div>





<script src="js/jquery.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script type="text/javascript">
$(document).ready(function () {
    $(".delbutton").click(function (e) {
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
                    url: "delete_sudhar.php",
                    data: info,
                    success: function (response) {
                        if (response.trim() === "balance_not_zero") {
                            Swal.fire(
                                'انتباہ',
                                'پہلے لین دین کھاتہ کلیئر کریں، پھر حذف کریں۔',
                                'warning'
                            );
                        } else if (response.trim() === "deleted") {
                            $("#" + del_id).parents("tr").animate({
                                backgroundColor: "#fbc7c7"
                            }, "fast").animate({
                                opacity: "hide"
                            }, "slow", function () {
                                $(this).remove();
                            });

                            Swal.fire(
                                'حذف ہو گیا!',
                                'پروڈکٹ کو کامیابی سے حذف کر دیا گیا ہے۔',
                                'success'
                            );
                        } else {
                            Swal.fire(
                                'خرابی',
                                'پروڈکٹ حذف نہیں ہو سکی۔',
                                'error'
                            );
                        }
                    },
                    error: function () {
                        Swal.fire(
                            'خرابی',
                            'سرور سے جواب نہیں آیا۔',
                            'error'
                        );
                    }
                });
            }
        });
    });
});
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