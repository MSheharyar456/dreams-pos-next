<html>
<head>
<title>Checkout</title>
<meta charset="UTF-8">

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
<script>
function suggest(inputString){
		if(inputString.length == 0) {
			$('#suggestions').fadeOut();
		} else {
		$('#country').addClass('load');
			$.post("autosuggestname.php", {queryString: ""+inputString+""}, function(data){
				if(data.length >0) {
					$('#suggestions').fadeIn();
					$('#suggestionsList').html(data);
					$('#country').removeClass('load');
				}
			});
		}
	}

	function fill(thisValue) {
		$('#country').val(thisValue);
		setTimeout("$('#suggestions').fadeOut();", 600);
	}

</script>

<style>
#result {
	height:20px;
	font-size:16px;
	font-family: 'Noto Nastaliq Urdu' !important;
		color:#333;
	padding:5px;
	margin-bottom:10px;
	background-color:#FFFF99;
}
#country{
	border: 1px solid #999;
	background: #EEEEEE;
	padding: 5px 10px;
	box-shadow:0 1px 2px #ddd;
    -moz-box-shadow:0 1px 2px #ddd;
    -webkit-box-shadow:0 1px 2px #ddd;
}
.suggestionsBox {
	position: absolute;
	left: 10px;
	margin: 0;
	width: 268px;
	top: 40px;
	padding:0px;
	background-color: #000;
	color: #fff;
}
.suggestionList {
	margin: 0px;
	padding: 0px;
}
.suggestionList ul li {
	list-style:none;
	margin: 0px;
	padding: 6px;
	border-bottom:1px dotted #666;
	cursor: pointer;
}
.suggestionList ul li:hover {
	background-color: #FC3;
	color:#000;
}
ul {
	font-family: 'Noto Nastaliq Urdu' !important;
	font-size:11px;
	color:#FFF;
	padding:0;
	margin:0;
}

.load{
background-image:url(loader.gif);
background-position:right;
background-repeat:no-repeat;
}

#suggest {
	position:relative;
}
.combopopup{
	padding:3px;
	width:268px;
	border:1px #CCC solid;
}

</style>	
</head>
<body onLoad="document.getElementById('country').focus();">
<form action="newc_save_sales.php" method="post">
<div id="ac">



<center><h4 style="direction: rtl; font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon icon-money icon-large"></i> رقم درج کریں:</h4></center><hr>



<input type="hidden" name="date" value="<?php echo date("m/d/y"); ?>" />
<input type="hidden" name="invoice" value="<?php echo $_GET['invoice']; ?>" />
<input type="hidden" name="ptype" value="<?php echo $_GET['pt']; ?>" />
<input type="hidden" name="cashier" value="<?php echo $_GET['cashier']; ?>" />
<input type="hidden" name="profit" value="<?php echo $_GET['totalprof']; ?>" />
<center>

<div style="direction: rtl; font-family: 'Noto Nastaliq Urdu' !important; margin-top: 15px;">

<!-- Text input with datalist -->
<input list="customers" name="customer_name" id="customerInput" required
    style="width: 260px; height: 40px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right; margin-bottom: 20px;"
    placeholder="گاہک کا نام منتخب کریں یا نیا درج کریں">
</div>

<datalist id="customers">
    <?php
    include('../connect.php');
    $result = $db->prepare("SELECT * FROM customer ORDER BY customer_name ASC");
    $result->execute();
    while($row = $result->fetch()){
    ?>
    <option data-id="<?php echo $row['customer_id']; ?>" value="<?php echo $row['customer_name']; ?>">
    <?php } ?>
</datalist>

<!-- Hidden field to store ID (only if user selects from suggestions) -->
<input type="hidden" name="customer_id" id="customerId">

      <div class="suggestionsBox" id="suggestions" style="display: none;">
      <div class="suggestionList" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;" id="suggestionsList"> &nbsp; </div>
      </div>

	  <div style="margin-bottom: 15px; font-size: 16px; margin-left: 200px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;">کل رقم</div>


<input type="number" name="amount" placeholder="" style="width: 268px; height:30px;  margin-bottom: 15px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;"  required/><br>

<div style="margin-bottom: 15px; font-size: 16px; margin-left: 200px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;">ادا شدہ رقم</div>

<input type="number" name="cash" placeholder="نقد رقم" style="width: 268px; height:30px;  margin-bottom: 15px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;"  required/><br>
<!--<input type="number" name="discount" placeholder="Discount" style="width: 245px; height:30px;  margin-bottom: 15px;"/> <br> -->
<!-- <input type="number" name="balance" placeholder="" style="width: 200px; height:30px;  margin-bottom: 15px;"/> Balance:<br> -->
<div style="margin-bottom: 15px; font-size: 16px; margin-left: 90px; font-family: 'Noto Nastaliq Urdu' !important; direction: rtl;">لین دین کی صورت میں تفصیل:</div>
<textarea style="width:265px; height:50px;" name="remarks"></textarea><br>
<?php

?>
<div>
<button class="btn btn-success btn-block btn-large" style="height: 60px;width:280px;font-family: 'Noto Nastaliq Urdu' !important; "> محفوظ کریں</button>
</div>

</center>
</div>
</form>

<script>
document.getElementById('customerSelect').addEventListener('change', function() {
    var selectedOption = this.options[this.selectedIndex];
    document.getElementById('customerName').value = selectedOption.getAttribute('data-name');
});
</script>

</body>
</html>