<?php
	$tracklistURL = $_GET['tracklistURL'];
	include 'php_functions.php';

	$array_response = getArrayDeezer($tracklistURL, $certificate, false, false, $show_PHP_warnings);

	echo($array_response);
?>