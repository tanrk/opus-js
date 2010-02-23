<?php
	require_once("./param.php");
	require_once("./config.php");
	require_once("./fileapi.php");

	session_start();

	$root = @$_SESSION["root"] or null;
	if (!$root) {
		print '"write: permission denied, no logged in user"';
		exit;
	}

	param("path", "");

	$content = $_POST["content"];
	if (get_magic_quotes_gpc()) {
		$content = stripslashes($content);
	}

	writeFile($FILES_PATH . $root . $path, $content);
	print "write: $path ok";
?>