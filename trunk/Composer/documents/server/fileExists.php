<?php
	require_once("./param.php");
	require_once("./config.php");

	session_start();
	$root = @$_SESSION["root"] or "";

	param("path", "");

	$result = @file_exists($FILES_PATH . $root . $path) ? "true" : "false";
	echo "$result";
?>