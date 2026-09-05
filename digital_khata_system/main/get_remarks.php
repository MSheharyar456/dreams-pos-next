<?php
include('../connect.php'); // same as used in delete script

if (isset($_POST['invoice_number'])) {
    $invoice_number = $_POST['invoice_number'];

    $stmt = $db->prepare("SELECT remarks FROM udhar_customer WHERE invoice_no = :invoice_number");
    $stmt->bindParam(':invoice_number', $invoice_number);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        echo $row['remarks'];
    } else {
        echo "کوئی ریکارڈ نہیں ملا۔";
    }
} else {
    echo "انویس نمبر فراہم نہیں کیا گیا۔";
}
?>
