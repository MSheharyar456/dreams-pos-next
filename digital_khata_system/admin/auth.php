<?php

	//Start session
	error_reporting(1);
	session_start();

	

	//echo '<pre>'; print_r($_SESSION); echo '</pre>'; exit;

	//Check whether the session variable SESS_MEMBER_ID is present or not

	if(!isset($_SESSION['SESS_MEMBER_ID']) || (trim($_SESSION['SESS_MEMBER_ID']) == '')) {

		header("location: ../index.php");

		exit();

	}

?>