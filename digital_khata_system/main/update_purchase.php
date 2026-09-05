<?php
session_start();
include('../connect.php');

$id = $_POST['id'];
$invoice = $_POST['invoice'];
$distributor = $_POST['distributor'];
$date = $_POST['date'];
$amount = $_POST['amount'];
$paid_amount = $_POST['paid_amount'];
$p_amount = $_POST['p_amount'];
$remarks = $_POST['remarks'];

// Update query
$sql = "UPDATE purchase_item 
        SET invoice = :invoice, 
            distributor = :distributor, 
            date = :date, 
            amount = :amount, 
            paid_amount = :paid_amount, 
            p_amount = :p_amount, 
            remarks = :remarks 
        WHERE purchase_id = :id";

$q = $db->prepare($sql);
$q->execute(array(
    ':invoice' => $invoice,
    ':distributor' => $distributor,
    ':date' => $date,
    ':amount' => $amount,
    ':paid_amount' => $paid_amount,
    ':p_amount' => $p_amount,
    ':remarks' => $remarks,
    ':id' => $id
));

header("location: purchase_invoice.php");
?>
