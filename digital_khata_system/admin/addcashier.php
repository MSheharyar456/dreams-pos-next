<!-- ============================================ -->
<!-- addcashier.php - Add New Cashier Form -->
<!-- ============================================ -->

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">

<form action="savecashier.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
<center>
  <h4 style="font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon-plus-sign icon-large"></i> کیشیئر شامل کریں</h4>
</center>
<hr>
<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
  <span>نام:</span>
  <input type="text" style="width:265px; height:30px;" name="name" required><br>

  <span>صارف نام:</span>
  <input type="text" style="width:265px; height:30px;" name="username" required><br>

  <span>پاس ورڈ:</span>
  <input type="password" style="width:265px; height:30px;" name="password" required><br>

  <span>عہدہ:</span>
  <input type="text" style="width:265px; height:30px;" name="position" value="cashier" readonly><br>

  <div style="float:left; margin-left:10px;">
    <button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;">
      <i class="icon icon-save icon-large"></i> محفوظ کریں
    </button>
  </div>
</div>
</form>
