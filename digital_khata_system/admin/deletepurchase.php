<?php
include('../connect.php');

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Prepare the delete statement
    $result = $db->prepare("DELETE FROM purchase_item WHERE purchase_id = :id");
    $result->bindParam(':id', $id);

    try {
        $result->execute();
        echo "Deleted Successfully";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "No ID received";
}
?>
