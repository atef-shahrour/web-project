<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "game_winners";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT username FROM players_who_have_won";
$result = $conn->query($sql);

$usernames = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $usernames[] = $row['username'];
    }
}

header('Content-Type: application/json');
echo json_encode($usernames);

$conn->close();
?>
