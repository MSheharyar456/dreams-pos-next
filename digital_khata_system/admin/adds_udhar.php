<html>
<head>
<title>سپلائر ادھار</title>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js"></script>
<link href="css/css2.css" media="screen" rel="stylesheet" type="text/css" />
<meta charset="UTF-8">

<style>
	body {
		font-family: 'Noto Nastaliq Urdu' !important;
	}
	.urdu-text {
		font-family: 'Noto Nastaliq Urdu' !important;
		direction: rtl;
		text-align: right;
	}
</style>

</head>
<body onLoad="document.getElementById('supplierInput').focus();">
<form action="saveudhar_supplier.php" method="post">
<div id="ac">

<center><h4 style="direction: rtl; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-money icon-large"></i> سپلائر کی ادھار معلومات درج کریں</h4></center><hr>

<input type="hidden" name="date" value="<?php echo date("m/d/y"); ?>" />
<input type="hidden" name="invoice" value="<?php echo $_GET['invoice']; ?>" />
<input type="hidden" name="ptype" value="<?php echo $_GET['pt']; ?>" />
<input type="hidden" name="cashier" value="<?php echo $_GET['cashier']; ?>" />

<center>

<div style="direction: rtl; margin-top: 15px;">
	<input list="suppliers" name="supplier_name" id="supplierInput" required
		style="width: 260px; height: 40px; direction: rtl; text-align: right; font-family: 'Noto Nastaliq Urdu' !important;"
		placeholder="سپلائر کا نام منتخب کریں یا درج کریں">
</div>

<datalist id="suppliers">
    <?php
    include('../connect.php');
    $result = $db->prepare("SELECT * FROM supliers ORDER BY suplier_name ASC");
    $result->execute();
    while($row = $result->fetch()){
    ?>
    <option value="<?php echo $row['suplier_name']; ?>">
    <?php } ?>
</datalist>

<input type="hidden" name="supplier_id" id="supplierId">


<div style="margin-bottom: 15px; font-size: 16px; margin-left: 200px; font-family: 'Noto Nastaliq Urdu' !important; margin-top: 10px">کل رقم</div>
<input type="number" name="amount" style="width: 268px; height:30px; margin-bottom: 15px; direction: rtl; text-align: right;" required/><br>

<div style="margin-bottom: 15px; font-size: 16px; margin-left: 200px; font-family: 'Noto Nastaliq Urdu' !important;">ادا شدہ رقم</div>
<input type="number" name="paid_amount" style="width: 268px; height:30px; margin-bottom: 15px; direction: rtl; text-align: right;" required/><br>

<div style="margin-bottom: 15px; font-size: 16px; margin-left: 90px; font-family: 'Noto Nastaliq Urdu' !important;">لین دین کی تفصیل</div>
<textarea style="width:265px; height:50px;" name="remarks"></textarea><br>

<div>
	<button class="btn btn-success btn-block btn-large" style="height: 60px;width:280px;font-family: 'Noto Nastaliq Urdu' !important;">محفوظ کریں</button>
</div>

</center>
</div>
</form>
</body>
</html>
