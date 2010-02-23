<?php
include_once 'jsmin-1.1.1.php';
include_once 'utilities.php';

$base = "http://localhost/";
$path = @$_REQUEST["path"];
$data = @$_REQUEST["data"];

file_put_contents($path, $data);
?>