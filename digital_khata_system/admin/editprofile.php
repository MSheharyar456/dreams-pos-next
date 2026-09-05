<?php
session_start();
include('../connect.php');

$id = $_SESSION['SESS_MEMBER_ID']; // Logged-in user ID

$result = $db->prepare("SELECT * FROM user WHERE id = :userid");
$result->bindParam(':userid', $id);
$result->execute();

for ($i = 0; $row = $result->fetch(); $i++) {
?>
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />
<!-- گوگل نستعلیق اردو فونٹ شامل کریں -->

<form action="saveeditprofile.php" method="post" enctype="multipart/form-data" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<center><h4><i class="icon-edit icon-large"></i> پروفائل میں ترمیم کریں</h4></center>
<hr>

<div id="ac" style="font-family: 'Noto Nastaliq Urdu' !important; direction: rtl; text-align: right;">

<input type="hidden" name="memi" value="<?php echo $id; ?>" />

<span>نام :</span>
<input type="text" style="width:250px; height:30px;" name="name" value="<?php echo htmlspecialchars($row['name']); ?>" required /><br>

<span>یوزر نیم :</span>
<input type="text" style="width:250px; height:30px;" name="username" value="<?php echo htmlspecialchars($row['username']); ?>" required /><br>

<span>پوزیشن :</span>
<input type="text" style="width:250px; height:30px;" name="position" value="<?php echo htmlspecialchars($row['position']); ?>" required /><br>

<span>نیا پاس ورڈ (اختیاری) :</span>
<input type="password" style="width:250px; height:30px;" name="password" placeholder="اگر تبدیل کرنا چاہیں" /><br>

<span>پروفائل تصویر :</span><br>
<span>
<?php if (!empty($row['profile_image'])) { ?>
  <img src="<?php echo htmlspecialchars($row['profile_image']); ?>" alt="Profile" width="30" height="30" style="border-radius:50%; border:1px solid #ccc; margin-bottom:5px;"><br>
<?php } ?>
</span>
<input type="file" style="width:250px; height:30px;" name="profile_image" /><br>

<div style="float:left; margin-left:10px;">
  <button class="btn btn-success btn-block btn-large" style="width:267px; font-family: 'Noto Nastaliq Urdu' !important;">
    <i class="icon icon-save icon-large"></i> تبدیلیاں محفوظ کریں
  </button>
</div>

</div>

</form>

<?php
}
?>
