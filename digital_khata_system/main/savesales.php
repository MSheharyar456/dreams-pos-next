<?php
session_start();


include('../connect.php');
$a = $_POST['invoice'];
$b = $_POST['cashier'];
$c = $_POST['date'];
$d = $_POST['ptype'];
$e = $_POST['amount'];
$i = $_POST['cash'];
$rem = $_POST['remarks'];


$z = $_POST['profit'];
$cname = $_POST['customer_name'];
$cid = $_POST['customer_id'];

// amount total rupees
//cash i
if($d=='credit') {
$f = $_POST['due'];
$sql = "INSERT INTO sales (invoice_number,cashier,date,type,amount,profit,due_date,name) VALUES (:a,:b,:c,:d,:e,:z,:f,:g)";
$q = $db->prepare($sql);
$q->execute(array(':a'=>$a,':b'=>$b,':c'=>$c,':d'=>$d,':e'=>$e,':z'=>$z,':f'=>$f,':g'=>$cname));
header("location: preview.php?invoice=$a");
exit();
}
if ($d == 'cash') {
    $c = $_POST['date'];
    $date = DateTime::createFromFormat('m/d/y', $c);
    $y = $date->format('Y-m-d');
    //$e = $e - $discount;
    if ($e > $i) {
        $ltype = 'Baqaya len';
        $bal = $e - $i;
    } else if ($i > $e) {
        $ltype = 'Baqaya den';
        $bal = $i - $e;
    } else {
        $ltype = '2';
        $bal = 'paid';
    }

    $f = $i;

    // 👇 If customer_id is empty, insert into customer table first
    if (empty($cid)) {
        $cname = $_POST['customer_name'];

        $insertCustomerSQL = "INSERT INTO customer (customer_name) VALUES (:name)";
        $stmt = $db->prepare($insertCustomerSQL);
        $stmt->execute([':name' => $cname]);

        // Get the last inserted ID
        $cid = $db->lastInsertId();
    }
    print_r($cid);
    // Insert into sales table
    $sql = "INSERT INTO sales (invoice_number, cashier, date, type, amount, profit, due_date, name) 
            VALUES (:a, :b, :c, :d, :e, :z, :f, :g)";
    $q = $db->prepare($sql);
    $q->execute(array(
        ':a' => $a,
        ':b' => $b,
        ':c' => $c,
        ':d' => $d,
        ':e' => $e,
        ':z' => $z,
        ':f' => $f,
        ':g' => $cname,
    ));

    // Insert into udhar_customer
    $sql = "INSERT INTO udhar_customer (invoice_no, customer_id, cashier, date, amount, paid_amount, balance, due_date, remarks, loan) 
            VALUES (:a, :b, :cid, :y, :e, :d, :bal, :f, :rem, :ltype)";
    $q = $db->prepare($sql);
    $q->execute(array(
        ':a' => $a,
        ':b' => $b,
        ':cid' => $cid,
        ':y' => $y,
        ':e' => $e,
        ':d' => $f,
        ':bal' => $bal,
        ':f' => $i,
        ':rem' => $rem,
        ':ltype' => $ltype
    ));

    

    header("location: preview.php?invoice=$a");
    exit();
}

// query



?>