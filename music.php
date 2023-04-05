<?php


	$id = $_GET['id'];
	include 'curl_function.php';

	/*$array_response = getArrayDeezer("https://api.deezer.com/track/65723649", $certificate, false, $show_PHP_warnings);*/

	$array_response = getArrayDeezer("https://api.deezer.com/track/".$id, $certificate, false, $show_PHP_warnings);

	print_r($array_response['preview']);


?>