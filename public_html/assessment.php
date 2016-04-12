<?php 
header('Content-Type: application/json;charset=UTF-8');
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

if (!isset($_GET["action"])) {
	exit;
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
$mysqli->query("set names 'utf8'");
$stmt = $mysqli->stmt_init();

// query the list 
if ($_GET["action"] == "ls_items") {
	$opt_type = "GENLIKE";
	if (isset($_GET["opt_type"])) {
		$opt_type = $_GET["opt_type"];
	}

	$stmt->prepare("SELECT `id`, `option` FROM options WHERE type=?");
	$stmt->bind_param('s', $opt_type);
	$stmt->execute();
	$res = $stmt->get_result();
	echo json_encode($res->fetch_all(MYSQLI_ASSOC));

	$stmt->close();
	$mysqli->close();
	exit;
}

if ($_GET["action"] != "do") {
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

// get opt_type
if (isset($_GET['opt_type'])) {
	$opt_type = $_GET['opt_type'];
} else {
	$opt_type = "GENLIKE";
}

$optid = $_GET["opt_id"];
$eventid = $_GET["event_id"];
//TODO: get user seat

if ($stmt->prepare("INSERT INTO audience_resp (opt_type, opt_id, event_id, agent, ip, slideno) VALUES (?, ?, ?, ?, ?, ?)")) {
	$stmt->bind_param('ssissi', $opt_type, $optid, $eventid, $_SERVER['HTTP_USER_AGENT'], $userip, $slideno);
	$stmt->execute();
}
$stmt->close();

$mysqli->close();
echo json_encode(["status"=>"Success"]);
?>
