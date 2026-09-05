<?php
session_start();
include('../connect.php');

// Get logged-in user ID
$user_id = $_SESSION['SESS_MEMBER_ID'];

// Get form data
$username = $_POST['username'];
$name = $_POST['name'];
$password = $_POST['password'];
$position = $_POST['position'];

// Validate
if (empty($username) || empty($name)) {
    echo "<script>alert('تمام فیلڈز لازمی ہیں۔'); window.history.back();</script>";
    exit();
}

// Handle profile image upload
$profile_image = null;

if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] == 0) {
    $target_dir = "../uploads/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $filename = basename($_FILES["profile_image"]["name"]);
    $target_file = $target_dir . time() . "_" . $filename;
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($imageFileType, $allowedTypes)) {
        echo "<script>alert('صرف JPG، JPEG، PNG یا GIF فائل اپلوڈ کی جا سکتی ہے۔'); window.history.back();</script>";
        exit();
    }

    if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
        $profile_image = $target_file;
    } else {
        echo "<script>alert('تصویر اپلوڈ کرنے میں مسئلہ آیا۔'); window.history.back();</script>";
        exit();
    }
}

try {
    // Build SQL query dynamically
    if (!empty($password)) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        if ($profile_image) {
            $sql = "UPDATE user SET username=:username, name=:name, password=:password, position=:position, profile_image=:profile_image WHERE id=:id";
        } else {
            $sql = "UPDATE user SET username=:username, name=:name, password=:password, position=:position WHERE id=:id";
        }
    } else {
        if ($profile_image) {
            $sql = "UPDATE user SET username=:username, name=:name, position=:position, profile_image=:profile_image WHERE id=:id";
        } else {
            $sql = "UPDATE user SET username=:username, name=:name, position=:position WHERE id=:id";
        }
    }

    $q = $db->prepare($sql);
    $params = [
        ':username' => $username,
        ':name' => $name,
        ':position' => $position,
        ':id' => $user_id
    ];
    if (!empty($password)) $params[':password'] = $hashedPassword;
    if ($profile_image) $params[':profile_image'] = $profile_image;

    $q->execute($params);

    echo "<script>alert('پروفائل کامیابی سے اپڈیٹ ہوگیا۔'); window.location='index.php';</script>";

} catch (PDOException $e) {
    echo "<script>alert('Error: " . $e->getMessage() . "'); window.history.back();</script>";
}
?>
