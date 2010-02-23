<?php
	require_once("./param.php");
	require_once("./config.php");
	require_once("./fileapi.php");

	param("user", "nobody");
	param("password", "");
	
	$pass = @file_get_contents($USERS_PATH . $user, FILE_TEXT);
	if ($pass == "") {
		print "bad user (" . $USERS_PATH . $user . ")";
		exit;
	}
	//
	// Strip out one flavor of BOM marker (the VWD kind)
	if (strlen($pass) > 3 && ord($pass[0]) == 239 && ord($pass[1]) == 187 && ord($pass[2]) == 191) {
		$pass = substr($pass, 3);
	}
		
	/*
	// For examining the contents of the user file character by character
	for ($i = 0; $i < strlen($pass); $i++) {
		print ord($pass[$i]) . ": " . $pass[$i] . "\n";
	}
	*/
	//
	//if (strcmp($pass, $password)) {
	if ($pass != $password) {
		//print "---";
		//var_dump($pass);
		//print "---";
		//var_dump($password);
		//print "[$pass][$password] " + strcmp($pass, $password);
		//print "---";
		//print "bad password (" . $pass . " vs " . $password . ")";
		print "bad password";
		exit;
	}

	session_start();

	// don't allow session fixation (require a fresh id)
	session_regenerate_id();

	$_SESSION["user"] = $user;
	$root = $_SESSION["root"] = $user . "/";

	makePath($FILES_PATH . $root);
?>