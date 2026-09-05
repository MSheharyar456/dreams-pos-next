<?php
session_start();
include('../connect.php');
$a = $_POST['code'];
$b = $_POST['name'];
$e = $_POST['supplier'];
$f = $_POST['qty'];
$g = $_POST['o_price'];
$i = $_POST['gen'];
$j = $_POST['date_arrival'];
$k = $_POST['total_price']; // Make sure the name matches input field

// $k = $_POST['qty_sold'];
if ($f <= 0) {
    echo "<script>alert('Quantity must be greater than 0.'); window.history.back();</script>";
    exit();
}

// query
$sql = "INSERT INTO products (product_code,product_name,supplier,qty,o_price,gen_name,date_arrival,price,onhand_qty) 
        VALUES (:a,:b,:e,:f,:g,:i,:j,:k,:f)";
$q = $db->prepare($sql);
$q->execute(array(
    ':a' => $a,
    ':b' => $b,
    ':e' => $e,
    ':f' => $f,
    ':g' => $g,
    ':i' => $i,
    ':j' => $j,
    ':k' => $k
));
header("location: products.php");
?><html><body><a href="products.php"><button class="btn btn-success btn-block btn-large" style="width:267px;"><i class="icon icon-save icon-large"></i> Back</button> </a></body></html>