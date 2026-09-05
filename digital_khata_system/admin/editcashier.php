
<!-- ============================================ -->
<!-- editcashier.php - Edit Cashier Form -->
<!-- ============================================ -->

<?php
include('../connect.php');
$id = $_GET['id'];
$result = $db->prepare("SELECT * FROM user WHERE id = :id");
$result->bindParam(':id', $id);
$result->execute();
$row = $result->fetch();
?>

<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" rel="stylesheet">

<form action="updatecashier.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
<center>
  <h4 style="font-family: 'Noto Nastaliq Urdu' !important;"><i class="icon-edit icon-large"></i> کیشیئر میں ترمیم کریں</h4>
</center>
<hr>
<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">
  <input type="hidden" name="id" value="<?php echo $row['id']; ?>">

  <span>نام:</span>
  <input type="text" style="width:265px; height:30px;" name="name" value="<?php echo $row['name']; ?>" required><br>

  <span>صارف نام:</span>
  <input type="text" style="width:265px; height:30px;" name="username" value="<?php echo $row['username']; ?>" required><br>

  <span>نیا پاس ورڈ:</span>
  <input type="password" style="width:265px; height:30px;" name="password" placeholder="خالی چھوڑیں اگر تبدیل نہیں کرنا"><br>

  <span>عہدہ:</span>
  <input type="text" style="width:265px; height:30px;" name="position" value="<?php echo $row['position']; ?>" readonly><br>

  <div style="float:left; margin-left:10px;">
    <button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;">
      <i class="icon icon-save icon-large"></i> اپ ڈیٹ کریں
    </button>
  </div>
</div>
</form>
