<?php

// configuration

include('../connect.php');



// new data

$id = $_POST['memi'];

$d = $_POST['companyname'];

$a = $_POST['sname'];


$b = $_POST['address'];

$c = $_POST['contact'];


$e = $_POST['note'];

// query

$sql = "UPDATE supliers 

        SET suplier_name=?, suplier_address=?, suplier_contact=?, contact_person=?, note=?

		WHERE suplier_id=?";

$q = $db->prepare($sql);

$q->execute(array($a,$b,$c,$d,$e,$id));

header("location: supplier.php");



?>