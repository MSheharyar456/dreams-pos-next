<!-- ============================================ -->
<!-- savecashier.php - Save New Cashier -->
<!-- ============================================ -->

<?php
session_start();
include('../connect.php');

$name = $_POST['name'];
$username = $_POST['username'];
$password = $_POST['password'];
$position = $_POST['position'];
$password = password_hash($password, PASSWORD_DEFAULT);
// Check if username already exists
$check = $db->prepare("SELECT * FROM user WHERE username = :username");
$check->bindParam(':username', $username);
$check->execute();

if($check->rowCount() > 0) {
    echo "<script>alert('یہ صارف نام پہلے سے موجود ہے۔ برائے مہربانی دوسرا صارف نام استعمال کریں۔'); window.location='cashier.php';</script>";
} else {
    $sql = "INSERT INTO user (name, username, password, position) VALUES (:name, :username, :password, :position)";
    $q = $db->prepare($sql);
    $q->execute(array(':name'=>$name, ':username'=>$username, ':password'=>$password, ':position'=>$position));
    
    header("location: cashier.php");
}
?>
