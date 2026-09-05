<?php

	include('../connect.php');

	$id=$_GET['id'];

	$result = $db->prepare("SELECT * FROM products WHERE product_id= :userid");

	$result->bindParam(':userid', $id);

	$result->execute();

	for($i=0; $row = $result->fetch(); $i++){

?>

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!-- گوگل نستعلیق اردو فونٹ شامل کریں -->

<form action="saveeditproduct.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<center><h4><i class="icon-edit icon-large"></i> پروڈکٹ میں ترمیم کریں</h4></center>

<hr>

<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<input type="hidden" name="memi" value="<?php echo $id; ?>" />

<span>برانڈ کا نام : </span><input type="text" style="width:265px; height:30px;"  name="code" value="<?php echo $row['product_code']; ?>" Required/><br>

<span>مصنوعات کا نام : </span><input type="text" style="width:265px; height:30px;"  name="gen" value="<?php echo $row['gen_name']; ?>" /><br>

<span>زمرہ / تفصیل : </span><textarea style="width:265px; height:50px;" name="name"><?php echo $row['product_name']; ?> </textarea><br>

<span>آمد کی تاریخ : </span><input type="date" style="width:265px; height:30px;" name="date_arrival" value="<?php echo $row['date_arrival']; ?>" /><br>

<span>قیمتِ خرید: </span><input type="text" style="width:265px; height:30px;" id="txt2" name="o_price" value="<?php echo $row['o_price']; ?>" onkeyup="sum()" onchange="sum()" Required/><br>

<span>سپلائر : </span>

<select name="supplier" style="width:265px; height:30px; margin-left:-5px;">
    <option selected><?php echo $row['supplier']; ?></option>

    <?php
    $results = $db->prepare("SELECT * FROM supliers");
    $results->execute();

    while ($rows = $results->fetch()) {
        if ($rows['suplier_name'] != $row['supplier']) {
    ?>
        <option><?php echo $rows['suplier_name']; ?></option>
    <?php
        }
    }
    ?>
</select><br>

<span>باقی مقدار : </span><input type="number" style="width:265px; height:30px;" min="0" name="qty" onkeyup="sum()" id="txt11" onchange="sum()" value="<?php echo $row['qty']; ?>" /><br>

<span style='display:none'>کل قیمت : </span><input type="hidden" style="width:265px; height:30px;" id="total_price" name="total_price" value="<?php echo $row['price']; ?>" readonly><br>

<div style="float:left; margin-left:10px;">
<button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-save icon-large"></i> تبدیلیاں محفوظ کریں</button>

</div>

</div>

</form>

<?php

}

?>
