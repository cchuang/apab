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
$mysqli->query("SET time_zone='+8:00'");
$stmt = $mysqli->stmt_init();

if (isset($_GET["duration"])) {
	$duration = $_GET["duration"];
} else {
	$duration = 600;
}

// Get the current active event
$query_str = "SELECT `status`.`id`,slideno,path,opt_type, status.event_id,events.name AS event_name, default_opt_type FROM status JOIN events on status.event_id=events.id WHERE events.live=1 ORDER BY `status`.`id` DESC LIMIT 1";
$res = $mysqli->query($query_str);
$ret = $res->fetch_assoc();
$event_id = $ret["event_id"];

// Get observed users
$stmt->prepare("SELECT seatno FROM winevents WHERE event_id = ? GROUP BY seatno ORDER BY seatno");
$stmt->bind_param('i', $event_id);
$stmt->execute();
$obs_users = $stmt->get_result()->fetch_all();

// update the number of page
if ($_GET["action"] == "update_page") {

	if ($stmt->prepare("INSERT INTO status (event_id, slideno, path, opt_type) VALUES (?, ?, ?, ?)")) {
		$stmt->bind_param('iiss', $event_id, $slideno, $ret["path"], $ret['default_opt_type']);
		$stmt->execute();
	}

	$res = $mysqli->query($query_str);
	$ret = $res->fetch_assoc();
	echo json_encode($ret);
} else if ($_GET["action"] == "get_idle_users") {
	$stmt->prepare("SELECT seatno,MAX(`time`),MAX(timestampdiff(SECOND,time,NOW())) as diff FROM apab.audience_resp WHERE timestampdiff(SECOND,time,NOW()) < ? AND event_id = ? GROUP BY seatno;");
	$stmt->bind_param('ii', $duration, $event_id);
	$stmt->execute();
	$res = $stmt->get_result();
	$idle_users = $res->fetch_all();
	echo json_encode(array('not_idle_users' => $idle_users, 'obs_users' => $obs_users));
} else if ($_GET["action"] == "get_unfocused_users") {
	// Get 'blur' users at which seatno and time
	$query_blur_users = "SELECT t.seatno,t.latest FROM apab.winevents INNER JOIN (SELECT seatno,MAX(`timestamp`) AS latest FROM apab.winevents WHERE event_id= ? GROUP BY seatno) AS t ON winevents.timestamp=t.latest AND winevents.seatno=t.seatno WHERE winevents.winevent='blur'";
	$stmt->prepare("SELECT * FROM (" . $query_blur_users . ") AS bu WHERE timestampdiff(SECOND,bu.latest,NOW()) > ? ORDER BY seatno");
	$stmt->bind_param('ii', $event_id, $duration);
	$stmt->execute();
	$res = $stmt->get_result();
	$unfocused_user = $res->fetch_all();
	echo json_encode($unfocused_user);
}

$stmt->close();

$mysqli->close();
?>
