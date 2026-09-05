<?php

session_start();

include('../connect.php');

$a = $_POST['invoice'];

$b = $_POST['distributor'];

$c = $_POST['date'];

$d = $_POST['amount'];

$e = $_POST['paid_amount'];

$f = $_POST['p_amount'];

$g = $_POST['remarks'];




// query

$sql = "INSERT INTO purchase_item (invoice,distributor,date,amount,paid_amount,p_amount,remarks) VALUES (:a,:b,:c,:d,:e,:f,:g)";

$q = $db->prepare($sql);

$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e,':f'=>$f,':g'=>$g));

header("location: purchase_invoice.php");





?>