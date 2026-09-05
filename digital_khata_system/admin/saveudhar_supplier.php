<?php
session_start();



include('../connect.php');
$a = $_POST['invoice'];
$b = $_POST['cashier'];
$c = $_POST['date'];
$d = $_POST['ptype'];
$e = $_POST['amount'];
$i = $_POST['paid_amount'];
$rem = $_POST['remarks'];

$cname = $_POST['supplier_name'];
$cid = $_POST['supplier_id'];

// amount total rupees
//cash i
if ($d == 'cash') {
    $c = $_POST['date'];
    $date = DateTime::createFromFormat('m/d/y', $c);
    $c = $date->format('Y-m-d');

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
        $cname = $_POST['supplier_name'];

        $insertCustomerSQL = "INSERT INTO supliers (suplier_name) VALUES (:name)";
        $stmt = $db->prepare($insertCustomerSQL);
        $stmt->execute([':name' => $cname]);

        // Get the last inserted ID
        $cid = $db->lastInsertId();
    }

    echo '<pre>' . $bal . '</pre>';
    // Insert into sales table

    // Insert into udhar_customer
    $sql = "INSERT INTO udhar_suplier (invoice_no, suplier_id, date, amount, paid_amount, balance, due_date, remarks, loan) 
            VALUES (:a, :cid, :c, :e, :d, :bal, :f, :rem, :ltype)";
    $q = $db->prepare($sql);
    $q->execute(array(
        ':a' => $a,
        ':cid' => $cid,
        ':c' => $c,
        ':e' => $e,
        ':d' => $f,
        ':bal' => $bal,
        ':f' => $i,
        ':rem' => $rem,
        ':ltype' => $ltype
    ));

    header("location: supplier_trade.php?invoice=$a");
    exit();
}

// query



?>