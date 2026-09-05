<?php
include('../connect.php');

// Get product_id from URL
$id = $_GET['id'];

// Fetch the existing purchase record
$result = $db->prepare("SELECT * FROM purchase_item WHERE purchase_id = :id");
$result->bindParam(':id', $id);
$result->execute();
$row = $result->fetch(PDO::FETCH_ASSOC);
?>

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />

<form action="update_purchase.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
<center><h4><i class="icon-edit icon-large"></i> پروڈکٹ میں ترمیم کریں</h4></center>

<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<input type="hidden" name="id" value="<?php echo $row['purchase_id']; ?>" />

<span>انوائس نمبر: </span>
<input type="text" style="width:265px; height:30px;" name="invoice" value="<?php echo $row['invoice']; ?>" /><br>

<span>ڈسٹریبیوٹر کا نام: </span>
<input type="text" style="width:265px; height:30px;" name="distributor" value="<?php echo $row['distributor']; ?>" Required/><br>

<span>موصول ہونے کی تاریخ: </span>
<input type="date" style="width:265px; height:30px;" name="date" value="<?php echo $row['date']; ?>" /><br>

<span>کل رقم: </span>
<input type="text" style="width:265px; height:30px;" name="amount" value="<?php echo $row['amount']; ?>" /><br>

<span>ادا شدہ رقم: </span>
<input type="text" style="width:265px; height:30px;" name="paid_amount" value="<?php echo $row['paid_amount']; ?>" /><br>

<span>بقایا رقم: </span>
<input type="text" style="width:265px; height:30px;" name="p_amount" value="<?php echo $row['p_amount']; ?>" /><br>

<span>تفصیلات: </span>
<textarea style="width:265px; height:50px;" name="remarks"><?php echo $row['remarks']; ?></textarea><br> 
 
<div style="float:left; margin-left:10px;">
<button class="btn btn-success btn-block btn-large" style="width:267px;font-family: 'Noto Nastaliq Urdu' !important">
    <i class="icon icon-save icon-large"></i> اپڈیٹ کریں
</button>
</div>

</div>
</form>
