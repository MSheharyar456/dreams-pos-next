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
	require_once('auth.php'); // توثیق کی فائل شامل کریں
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

<!-- پاپ اپ کیلئے -->
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

<script language="javascript" type="text/javascript">
// گھڑی دکھانے کا کوڈ
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
  timeValue += (hours >= 12) ? " شام" : " صبح"
  document.clock.face.value = timeValue;
  timerID = setTimeout("showtime()",1000);
  timerRunning = true;
}
function startclock() {
  stopclock();
  showtime();
}
window.onload=startclock;
</script>

<body>
<?php include('navfixed.php');?>

<div class="container-fluid">
  <div class="row-fluid">
    <?php include('includes/sidebar.php');?>

    <div class="span10">
      <div class="contentheader">
        <i class="icon-group"></i> سپلائرز
      </div>
      <ul class="breadcrumb">
        <li><a href="index.php">ڈیش بورڈ</a></li> /
        <li class="active">سپلائرز</li>
      </ul>

      <div style="margin-top: -19px; margin-bottom: 21px;">
        <a href="index.php"><button class="btn btn-default btn-large" style="float: left; margin-bottom: 5px; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-circle-arrow-left icon-large"></i> واپس</button></a>
        <?php 
          include('../connect.php');
          $result = $db->prepare("SELECT * FROM supliers ORDER BY suplier_id DESC");
          $result->execute();
          $rowcount = $result->rowcount();
        ?>
        <div style="text-align:center;">
          کل سپلائرز کی تعداد: <font color="green" style="font:bold 22px 'Aleo';"><?php echo $rowcount;?></font>
        </div>
      </div>
	  <br>

      <input type="text" name="filter" style="height:50px; margin-top: -1px; margin-bottom: 5px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl" value="" id="filter" placeholder="سپلائر تلاش کریں..." autocomplete="off" />
      <a rel="facebox" href="addsupplier.php"><button type="submit" class="btn btn-info" style="float:right; width:230px; height:35px; margin-bottom: 5px; font-family: 'Noto Nastaliq Urdu' !important;" /><i class="icon-plus-sign icon-large"></i> سپلائر شامل کریں</button></a><br><br>

      <table class="table table-bordered table-striped table-hover" id="resultTable" data-responsive="table" style="text-align: left;">
        <thead>
          <tr>
            <th> کمپنی کا نام </th>
            <th> سپلائر کا نام </th>
            <th> پتہ </th>
            <th> رابطہ نمبر </th>
            <th> نوٹ </th>
            <th width="120"> کارروائی </th>
          </tr>
        </thead>
        <tbody>
          <?php
            include('../connect.php');
            $result = $db->prepare("SELECT * FROM supliers ORDER BY suplier_id DESC");
            $result->execute();
            for($i=0; $row = $result->fetch(); $i++){
          ?>
          <tr class="record">
          <td><?php echo $row['contact_person']; ?></td>

          <td><?php echo $row['suplier_name']; ?></td>
           
           
            <td><?php echo $row['suplier_address']; ?></td>
            <td><?php echo $row['suplier_contact']; ?></td>
           
            <td><?php echo $row['note']; ?></td>
            <td>
              <a rel="facebox" href="editsupplier.php?id=<?php echo $row['suplier_id']; ?>"><button class="btn btn-warning btn-mini" style="font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon-edit"></i> </button></a>
              <button class="btn btn-danger delbutton btn-mini" id="<?php echo $row['suplier_id']; ?>" style="" title="Click to Delete the customer">
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
                    url: "deletesupplier.php", // Make sure this matches your PHP file name
                    data: info,
                    success: function (response) {
                        response = response.trim();
                        if (response === "balance_not_zero") {
                            Swal.fire(
                                'انتباہ',
                                'پہلے لین دین کھاتہ کلیئر کریں، پھر حذف کریں کیونکہ اس کے حذف ہونے سے ادھار کھاتہ بھی ختم ہو جائے گا۔',
                                'warning'
                            );
                        } else if (response === "deleted") {
                            $("#" + del_id).parents("tr").animate({
                                backgroundColor: "#fbc7c7"
                            }, "fast").animate({
                                opacity: "hide"
                            }, "slow", function () {
                                $(this).remove();
                            });

                            Swal.fire(
                                'حذف ہو گیا!',
                                'سپلائر کو کامیابی سے حذف کر دیا گیا ہے۔',
                                'success'
                            );
                        } else {
                            Swal.fire(
                                'خرابی',
                                'سپلائر حذف نہیں ہو سکا۔',
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
</body>
<?php include('footer.php');?>
</html>
