
<!-- ============================================ -->
<!-- deletecashier.php - Delete Cashier -->
<!-- ============================================ -->

<?php
session_start();
include('../connect.php');

$id = $_GET['id'];

$sql = "DELETE FROM user WHERE id = :id";
$q = $db->prepare($sql);
$q->execute(array(':id'=>$id));

header("location: cashier.php");
?>