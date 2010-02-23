<?php
	$FILES_PATH = "./../files/";
	$USERS_PATH = "./../users/";
    //
    $path = $_SERVER['HTTP_REFERER'];
    $path = parse_url($path);
    $path = $path['path'];
    $path = split("/", $path);
    array_pop($path);
    array_pop($path);
    array_pop($path);
    $path = join($path, "/");
    //
    session_set_cookie_params(0, $path);
	session_name("opus-user");
?>