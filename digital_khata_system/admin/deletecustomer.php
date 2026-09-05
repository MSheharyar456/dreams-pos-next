<?php
include('../connect.php');

$id = $_GET['id'];

// First check udhar_customer table for matching customer_id
$check = $db->prepare("SELECT balance FROM udhar_customer WHERE customer_id = :id");
$check->bindParam(':id', $id);
$check->execute();
$row = $check->fetch();

// If a record exists and balance is not zero, block deletion
if ($row && $row['balance'] != 0) {
    echo "udhar_balance_not_zero";
    exit();
}

// Now delete from customer table
$del = $db->prepare("DELETE FROM customer WHERE customer_id = :id");
$del->bindParam(':id', $id);

if ($del->execute()) {
    echo "deleted";
} else {
    echo "error";
}
?>
