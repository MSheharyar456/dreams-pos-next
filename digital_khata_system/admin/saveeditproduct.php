<?php

// configuration

include('../connect.php');



// new data

$id = $_POST['memi'];

$a = $_POST['code'];

$z = $_POST['gen'];

$b = $_POST['name'];

// $c = $_POST['exdate'];

// $d = $_POST['price'];

$e = $_POST['supplier'];

$f = $_POST['qty'];

$h = $_POST['o_price'];

// $h = $_POST['profit'];

$i = $_POST['date_arrival'];

// $j = $_POST['sold'];

$k = $_POST['total_price']; // Make sure the name matches input field

// query

$sql = "UPDATE products 

        SET product_code=?, gen_name=?, product_name=?, supplier=?, qty=?, o_price=?, date_arrival=?, price=?

		WHERE product_id=?";

$q = $db->prepare($sql);

$q->execute(array($a,$z,$b,$e,$f,$h,$i,$k,$id));

header("location: products.php");



?>