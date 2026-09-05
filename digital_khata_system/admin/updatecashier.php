
<!-- ============================================ -->
<!-- updatecashier.php - Update Cashier -->
<!-- ============================================ -->

<?php
session_start();
include('../connect.php');

$id = $_POST['id'];
$name = $_POST['name'];
$username = $_POST['username'];
$password = $_POST['password'];
$position = $_POST['position'];
$password = password_hash($password, PASSWORD_DEFAULT);
// If password is empty, don't update it
if(empty($password)) {
    $sql = "UPDATE user SET name = :name, username = :username, position = :position WHERE id = :id";
    $q = $db->prepare($sql);
    $q->execute(array(':name'=>$name, ':username'=>$username, ':position'=>$position, ':id'=>$id));
} else {
    $sql = "UPDATE user SET name = :name, username = :username, password = :password, position = :position WHERE id = :id";
    $q = $db->prepare($sql);
    $q->execute(array(':name'=>$name, ':username'=>$username, ':password'=>$password, ':position'=>$position, ':id'=>$id));
}

header("location: cashier.php");
?>
