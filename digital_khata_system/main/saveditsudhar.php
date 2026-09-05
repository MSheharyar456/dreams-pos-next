<?php
include('../connect.php');


date_default_timezone_set('Asia/Karachi'); // ✅ Set time zone

$id = $_POST['id'];
$suplier_id = $_POST['type'];
$cash = $_POST['cash'];
$invoice_no = $_POST['invoice_no'];


$amount = $_POST['amount'];
$paid_amount = $_POST['paid_amount'];
$balance = $_POST['balance'];
$remarks = $_POST['remarks'];
$loan = $_POST['type'];
$updation_date = date("Y-m-d H:i:s"); // ✅ Current date and time

// Loan logic
if ($loan == "Baqaya den") {
    $balance = $balance -  $cash;
    $paid_amount = $paid_amount - $cash;
        if ($paid_amount > $amount) {
        $loan = 'Baqaya dena';
    }
    else {
        $loan = 'Baqaya len';
    }

    
} else {

    $balance = $balance - $cash;
    $paid_amount = $paid_amount + $cash;
    if ($amount > $paid_amount) {
        $loan = 'Baqaya len';
    }
    else{
        $loan = 'Baqaya den';
    }
}

// ✅ Updated query with updated_at
$sql = "UPDATE udhar_suplier SET 
     
    amount = ?, 
    paid_amount = ?, 
    balance = ?, 
    remarks = ?, 
    loan = ?, 
    updation_date = ?
    WHERE id = ?";

$q = $db->prepare($sql);
$q->execute([
      
    $amount, 
    $paid_amount, 
    $balance, 
    $remarks, 
    $loan, 
    $updation_date, 
    $id
]);

header("location: supplier_trade.php");
exit();
?>
