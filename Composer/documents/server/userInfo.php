<?php
	require_once("./JSON.php");
	require_once("./param.php");
	require_once("./config.php");

	session_start();

	$root = @$_SESSION["root"] or "";

	$json = new Services_JSON;
	//print $json->encode(array("path" => $FILES_PATH . $root, "session" => $_SESSION));
	print $json->encode($_SESSION);
?>