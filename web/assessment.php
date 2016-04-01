<?php 
header('Content-Type: application/json');
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

if (!isset($_GET["action"])) {
	exit;
}

$items = array("精彩", "不錯", "無感", "困惑", "無趣");
// query the list 
if ($_GET["action"] == "ls_items") {
	echo json_encode($items);
	exit;
}

if ($_GET["action"] == "do") {
	$retval = urldecode($_GET["val"]);
	// Ban invalid inputs. 
	if (!in_array($retval, $items)) {
		exit;
	}
} else {
	exit;
}

// get user ip
if(!empty($_SERVER['HTTP_CLIENT_IP'])){
   $userip = $_SERVER['HTTP_CLIENT_IP'];
}else if(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
   $userip = $_SERVER['HTTP_X_FORWARDED_FOR'];
}else{
   $userip= $_SERVER['REMOTE_ADDR'];
}

// get user slide info
if (isset($_GET['slideno'])) {
	$slideno = $_GET['slideno'];
} else {
	$slideno = 1;
}


$ini_array = parse_ini_file("../cred.ini");
$mysqli = new mysqli('127.0.0.1', $ini_array['user'], $ini_array['password'], 'apab');
if ($mysqli->connect_errno) {
    echo "Sorry, this website is experiencing problems.";
    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysqli->connect_errno . "\n";
    echo "Error: " . $mysqli->connect_error . "\n";
    exit;
}

$stmt = $mysqli->stmt_init();
if ($stmt->prepare("INSERT INTO audience_resp (handle, val, agent, ip, slideno) VALUES (?, ?, ?, ?, ?)")) {
	$stmt->bind_param('ssssi', $handle, $retval, $_SERVER['HTTP_USER_AGENT'], $userip, $slideno);
	$handle = 'assessment.php';
	$retval = urlencode($retval);
	$stmt->execute();
}
$stmt->close();

$mysqli->close();
header('Location: index.html');
?>
