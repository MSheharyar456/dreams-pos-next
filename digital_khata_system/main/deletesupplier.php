<?php
include('../connect.php');

$id = $_GET['id'];

// First check balance from udhar_suplier table
$check = $db->prepare("SELECT balance FROM udhar_suplier WHERE suplier_id = :id");
$check->bindParam(':id', $id);
$check->execute();
$row = $check->fetch();

// If record exists and balance is not zero (either below 0 or above 0)
if ($row && $row['balance'] != 0) {
    echo "balance_not_zero";
    exit();
}

// Now delete from supliers table
$del = $db->prepare("DELETE FROM supliers WHERE suplier_id = :id");
$del->bindParam(':id', $id);

if ($del->execute()) {
    echo "deleted";
} else {
    echo "error";
}
?>
