<?php
	$timeSeconds = $_GET['timeSeconds'];
	include 'php_functions.php';

	$timeMinutes = getTimeMinutes($timeSeconds);

	echo $timeMinutes;
?>