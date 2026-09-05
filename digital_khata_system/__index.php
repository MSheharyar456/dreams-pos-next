<?php
// Database configuration
$host = 'localhost';     // Database host
$dbname = 'pos_sales'; // Database name
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
}

// Include the database connection


try {
    // SQL query to select all users from the 'user' table
    $query = "SELECT * FROM user";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    // Fetch all results
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check if users exist
    if ($users) {
        echo "<h2>Users List</h2>";
        echo "<table border='1'>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                </tr>";

        // Loop through each user and display data in table rows
        foreach ($users as $user) {
            echo "<tr>
                    <td>{$user['id']}</td>
                    <td>{$user['username']}</td>
                    <td>{$user['email']}</td>
                </tr>";
        }
        echo "</table>";
    } else {
        echo "No users found.";
    }
} catch (PDOException $e) {
    // If there is an error with the query, show error
    echo 'Query failed: ' . $e->getMessage();
}
?>