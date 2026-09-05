<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!-- Urdu font from Google -->

<script>
function validateForm() {
    const qty = document.forms["productForm"]["qty"].value;
    if (qty === "" || parseInt(qty) <= 0) {
        alert("مقدار صفر سے زیادہ ہونی چاہیے۔");
        return false; // prevent form submission
    }
    return true;
}
</script>

<form name="productForm" action="saveproduct.php" method="post" onsubmit="return validateForm();"
style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
<center>
  <h4 style="font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon-plus-sign icon-large"></i> پروڈکٹ شامل کریں</h4>
</center>
<hr>
<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
  <span>برانڈ کا نام:</span>
  <input type="text" style="width:265px; height:30px;" name="code"><br>

  <span>مصنوعات کا نام:</span>
  <input type="text" style="width:265px; height:30px;" name="gen" required><br>

  <span>زمرہ / تفصیل:</span>
  <textarea style="width:265px; height:50px;" name="name"></textarea><br>

  <span>تاریخ آمد:</span>
  <input type="date" style="width:265px; height:30px;" name="date_arrival"><br>

  <span>قیمتِ خرید:</span>
  <input type="text" id="txt2" style="width:265px; height:30px;" name="o_price" onkeyup="sum()" onchange="sum()" required><br>

  <span>سپلائر:</span>
  <select name="supplier" style="width:265px; height:30px; margin-left:-5px;" required>
    <option></option>
    <?php
    include('../connect.php');
    $result = $db->prepare("SELECT * FROM supliers");
    $result->execute(); 
    for($i=0; $row = $result->fetch(); $i++){
    ?>
      <option><?php echo $row['suplier_name']; ?></option>
    <?php
    }
    ?>
  </select><br>

  <span>مقدار:</span>
  <input type="number" style="width:265px; height:30px;" min="0" id="txt11" onkeyup="sum()" onchange="sum()" name="qty" required><br>

  <span style="display:none">کل قیمت:</span>
  <input type="hidden" style="width:265px; height:30px;" id="total_price" name="total_price" readonly><br>

  <div style="float:left; margin-left:10px;">
    <button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;">
      <i class="icon icon-save icon-large"></i> محفوظ کریں
    </button>
  </div>
</div>
</form>
