<?php

    // ڈیٹا بیس کنکشن شامل کریں
	include('../connect.php');

	// یو آر ایل سے آئی ڈی حاصل کریں
	$id=$_GET['id'];

	// کسٹمر کا ڈیٹا حاصل کرنے کا SQL کوئری
	$result = $db->prepare("SELECT * FROM customer WHERE customer_id= :userid");

	// کوئری میں پیرامیٹر بائنڈ کریں
	$result->bindParam(':userid', $id);

	// کوئری چلائیں
	$result->execute();

	// ریکارڈ حاصل کرنے کا لوپ
	for($i=0; $row = $result->fetch(); $i++){

?>

<!-- اسٹائل شیٹ شامل کریں -->
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />

<!-- فارم کا آغاز -->
<form action="saveeditcustomer.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<center><h4><i class="icon-edit icon-large"></i> کسٹمر میں ترمیم کریں</h4></center>

<hr>

<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<!-- چھپی ہوئی فیلڈ جس میں کسٹمر کی آئی ڈی ہے -->
<input type="hidden" name="memi" value="<?php echo $id; ?>" />

<!-- مکمل نام -->
<span>مکمل نام: </span><input type="text" style="width:265px; height:30px;" name="name" value="<?php echo $row['customer_name']; ?>" /><br>

<!-- پتہ -->
<span>پتہ: </span><input type="text" style="width:265px; height:30px;" name="address" value="<?php echo $row['address']; ?>" /><br>

<!-- رابطہ -->
<span>رابطہ: </span><input type="text" style="width:265px; height:30px;" name="contact" value="<?php echo $row['contact']; ?>" /><br>

<!-- پراڈکٹ کا نام -->
<span>پراڈکٹ کا نام: </span><textarea style="width:265px; height:60px;" name="prod_name"><?php echo $row['prod_name']; ?></textarea><br>

<!-- کل رقم -->
<span>کل رقم: </span><input type="text" style="width:265px; height:30px;" name="memno" value="<?php echo $row['membership_number']; ?>" /><br>

<!-- نوٹ -->
<span>نوٹ: </span><textarea style="height:60px; width:265px;" name="note"><?php echo $row['note'];?></textarea><br>

<!-- متوقع تاریخ -->
<span>متوقع تاریخ: </span><input type="date" style="width:265px; height:30px;" name="date" value="<?php echo $row['expected_date']; ?>" placeholder="تاریخ"/><br>

<!-- محفوظ کرنے کا بٹن -->
<div style="float:left; margin-left:10px;">
<button class="btn btn-success btn-block btn-large" style="width:267px;  font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-save icon-large"></i> تبدیلیاں محفوظ کریں</button>
</div>

</div>

</form>

<?php

} // لوپ کا اختتام

?>
