<?php
// Start session only if it hasn't started yet
if (session_status() == PHP_SESSION_NONE) {
    session_set_cookie_params(0, "/");
    ini_set('session.cookie_lifetime', 0);
    session_start();
}

/*$host = "localhost";
$dbname = "sales";
$username = "root";
$password = "";*/

/*$dbname = 'pos_sales'; // Database name
$username = 'msherax_pos'; // Database username
$password = 'R_T.RzF,@KD$'; // Database password

try {
    // Create a PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // If connection fails, show error
    echo 'Connection failed: ' . $e->getMessage();
}*/
?>
<?php

//echo phpinfo(); exit;

	// session_set_cookie_params(86400);
	// ini_set('session.gc_maxlifetime', 86400);

/* Database config */
$db_host		= 'localhost';
// $db_user		= 'lepatech_msherax';
// $db_pass		= '[cgc^9A^gZqcY!=k]';
$db_user		= 'root';
$db_pass		= '';
$db_database	= 'pos';

/* End config */
$db = new PDO('mysql:host='.$db_host.';dbname='.$db_database, $db_user, $db_pass);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

?>