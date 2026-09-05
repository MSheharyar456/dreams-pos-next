<?php
session_start();
include('../connect.php');
$a = $_POST['sname'];
$d = $_POST['companyname'];

$b = $_POST['address'];
$c = $_POST['contact'];
$e = $_POST['note'];
// query
$sql = "INSERT INTO supliers (suplier_name,suplier_address,suplier_contact,contact_person,note) VALUES (:a,:b,:c,:d,:e)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e));
header("location: supplier.php");


?>