<?php 
header('Content-Type: application/json');
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

$ini_array = parse_ini_file("../cred.ini");

$mysqli = new mysqli('127.0.0.1', $ini_array['user'], $ini_array['password'], 'apab');
if ($mysqli->connect_errno) {
    echo "Sorry, this website is experiencing problems.";
    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysqli->connect_errno . "\n";
    echo "Error: " . $mysqli->connect_error . "\n";
    exit;
}

$sql = "SELECT * FROM status ORDER BY idstatus DESC LIMIT 1";
if (!$result = $mysqli->query($sql)) {
    echo "Sorry, the website is experiencing problems.";

    echo "Error: Our query failed to execute and here is why: \n";
    echo "Query: " . $sql . "\n";
    echo "Errno: " . $mysqli->errno . "\n";
    echo "Error: " . $mysqli->error . "\n";
    exit;
}

$entity = $result->fetch_assoc();
echo json_encode($entity);

$result->free();
$mysqli->close();
?>
