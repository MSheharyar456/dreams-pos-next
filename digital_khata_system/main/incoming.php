<?php

session_start();

include('../connect.php');

$a = $_POST['invoice'];
$b = $_POST['product'];
$c = intval($_POST['qty']); // Convert quantity to integer
$w = $_POST['pt'];
$date = $_POST['date'];
$discount = floatval($_POST['discount']); // Convert discount to float
$original_price = $_POST['price_sold'];

// Fetch product details
$result = $db->prepare("SELECT * FROM products WHERE product_id = :userid");
$result->bindParam(':userid', $b);
$result->execute();

$row = $result->fetch();


if ($row) {
    $asasa = floatval($row['o_price']); // Ensure price is a float
    $code = $row['product_code'];
    $gen = $row['gen_name'];
    $name = $row['product_name'];
    $p = floatval($row['profit']); // Ensure profit is a float
} else {
    die("Error: Product not found.");
}

// Edit quantity in the products table
$sql = "UPDATE products SET qty = qty - ? WHERE product_id = ?";
$q = $db->prepare($sql);
$q->execute(array($c, $b));

// Calculate final amount and profit
$fffffff = $original_price - $discount; // Now both are float
$d = $fffffff * $c; // Multiply by quantity (safe calculation)

$prf = $original_price - $asasa; // Now both are float
$profit = $prf * $c; // Safe profit calculation

// Insert into sales_order table
$sql = "INSERT INTO sales_order (invoice, product, qty, amount, name, price, profit, product_code, gen_name, date,o_price) 
        VALUES (:a, :b, :c, :d, :e, :f, :h, :i, :j, :k, :l)";

$q = $db->prepare($sql);
$q->execute(array(
    ':a' => $a,
    ':b' => $b,
    ':c' => $c,
    ':d' => $d,
    ':e' => $name,
    ':f' => $asasa,
    ':h' => $profit,
    ':i' => $code,
    ':j' => $gen,
    ':k' => $date,
    ':l' => $original_price
));

// Redirect back to sales page
header("location: sales.php?id=$w&invoice=$a");
exit();

?>


<!-- <?php

// session_start();

include('../connect.php');

$a = $_POST['invoice'];

$b = $_POST['product'];

$c = $_POST['qty'];
$z = $_POST['qt_sold'];

$w = $_POST['pt'];

$date = $_POST['date'];

$discount = $_POST['discount'];

$result = $db->prepare("SELECT * FROM products WHERE product_id= :userid");

$result->bindParam(':userid', $b);

$result->execute();

for($i=0; $row = $result->fetch(); $i++){

$asasa=$row['O_price'];

$code=$row['product_code'];

$gen=$row['gen_name'];

$name=$row['product_name'];

$p=$row['profit'];

}



//edit qty

// Update product stock and qty_sold
$sql = "UPDATE products 
        SET qty = qty - ?, 
            qty_sold = qty_sold + ? 
        WHERE product_id = ?";
$q = $db->prepare($sql);
$q->execute(array($c, $c, $b));


$fffffff=$asasa-$discount;

$d=$fffffff*$c;

$profit=$p*$c;

// query

$sql = "INSERT INTO sales_order (invoice,product,qty,amount,name,price,profit,product_code,gen_name,date) VALUES (:a,:b,:c,:d,:e,:f,:h,:i,:j,:k)";

$q = $db->prepare($sql);

$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$name,':f'=>$asasa,':h'=>$profit,':i'=>$code,':j'=>$gen,':k'=>$date));

header("location: sales.php?id=$w&invoice=$a");





?> -->