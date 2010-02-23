<?php
	require_once("./param.php");
	require_once("./config.php");

	session_start();
	$root = @$_SESSION["root"] or "";

	param("path", "");

	@readfile($FILES_PATH . $root . $path);
?>