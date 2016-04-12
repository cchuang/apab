<?php 
//header('Content-Type: application/json;charset=UTF-8');
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

if (!isset($_GET["action"])) {
	exit;
}

// get the slide # 
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
$mysqli->query("set names 'utf8'");
$stmt = $mysqli->stmt_init();

// update the number of page
if ($_GET["action"] == "update_page") {

//INSERT INTO status (slideno, path) SELECT slideno + 1 AS slideno, path FROM status ORDER BY idstatus DESC LIMIT 1;
	$query_str = "SELECT `status`.`id`,slideno,path,opt_type,`events`.`id` AS event_id,events.name AS event_name FROM status JOIN events on status.event_id=events.id WHERE events.live=1 ORDER BY `status`.`id` DESC LIMIT 1";
	$res = $mysqli->query($query_str);
	$ret = $res->fetch_assoc();

	if ($stmt->prepare("INSERT INTO status (event_id, slideno, path, opt_type) VALUES (?, ?, ?, ?)")) {
		$stmt->bind_param('iiss', $ret["event_id"], $slideno, $ret["path"], $ret['opt_type']);
		$stmt->execute();
	}

	$res = $mysqli->query($query_str);
	$ret = $res->fetch_assoc();
	echo json_encode($ret);

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
