<?php
    // ڈیٹا بیس کنیکشن فائل شامل کریں
    include('../connect.php');

    // یو آر ایل سے سپلائر کا آئی ڈی حاصل کریں
    $id = $_GET['id'];

    // سپلائر کی معلومات حاصل کرنے کے لیے کوئری تیار کریں
    $result = $db->prepare("SELECT * FROM supliers WHERE suplier_id = :userid");
    $result->bindParam(':userid', $id);
    $result->execute();

    // جب تک ریکارڈ موجود ہوں، ان کو لوپ کے ذریعے حاصل کریں
    for($i = 0; $row = $result->fetch(); $i++) {
?>

<!-- سی ایس ایس فائل شامل کریں -->
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />

<!-- فارم جو سپلائر کی معلومات میں ترمیم کے لیے استعمال ہوگا -->
<form action="saveeditsupplier.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<center><h4><i class="icon-edit icon-large"></i> سپلائر میں ترمیم کریں</h4></center><hr>

<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<!-- سپلائر کا چھپا ہوا (hidden) ID -->
<input type="hidden" name="memi" value="<?php echo $id; ?>" />


<span>کمپنی کا نام : </span><input type="text" style="width:265px; height:30px;" name="companyname" value="<?php echo $row['contact_person']; ?>" required/><br>

<!-- سپلائر کا نام -->
<span>سپلائر کا نام : </span>
<input type="text" style="width:265px; height:30px;" name="sname" value="<?php echo $row['suplier_name']; ?>" /><br>

<!-- ایڈریس -->
<span>پتہ : </span>
<input type="text" style="width:265px; height:30px;" name="address" value="<?php echo $row['suplier_address']; ?>" /><br>

<!-- فون نمبر -->
<span>رابطہ نمبر : </span>
<input type="text" style="width:265px; height:30px;" name="contact" value="<?php echo $row['suplier_contact']; ?>" /><br>

<!-- نوٹ -->
<span>نوٹ : </span>
<textarea style="width:265px; height:80px;" name="note"><?php echo $row['note']; ?></textarea><br>

<!-- سیو بٹن -->
<div style="float:left; margin-left:10px;">
    <button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;">
        <i class="icon icon-save icon-large"></i> تبدیلیاں محفوظ کریں
    </button>
</div>

</div>

</form>

<?php
    } // for loop ختم
?>
