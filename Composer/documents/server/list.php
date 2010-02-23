<?php
	header("Content-Type: text/plain");

	require_once("./JSON.php");
	require_once("./param.php");
	require_once("./config.php");
	require_once("./fileapi.php");

	session_start();

	$root = @$_SESSION["root"] or "";
	if (!$root) {
		print '""';
		exit;
	}

	param("path", "");
	param("extensions", null);
	param("types", null);

	// FIXME: vulnerable viz $path
	$json = new Services_JSON;
	print $json->encode(readPathDir($FILES_PATH . $root . $path , $extensions, $types));
?>