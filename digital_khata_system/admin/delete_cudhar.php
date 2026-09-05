<?php
include('../connect.php');

$id = $_GET['id'];

// Check balance first
$check = $db->prepare("SELECT balance FROM udhar_customer WHERE id = :id");
$check->bindParam(':id', $id);
$check->execute();
$row = $check->fetch();

if ($row && $row['balance'] != 0) {
    echo "balance_not_zero";
    exit();
}


// Proceed to delete
$del = $db->prepare("DELETE FROM udhar_customer WHERE id = :id");
$del->bindParam(':id', $id);
if ($del->execute()) {
    echo "deleted";
} else {
    echo "error";
}
?>
