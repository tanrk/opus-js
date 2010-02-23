<?php
	require_once("./config.php");
	require_once("./param.php");
	require_once("./fileapi.php");

	session_start();
	$root = @$_SESSION["root"] or "";
	if (!$root) {
		print '"write: permission denied, no logged in user"';
		exit;
	}

	param("path", "");

	makePath($FILES_PATH . $root . $path);
?>