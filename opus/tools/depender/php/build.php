<?php
include_once 'jsmin-1.1.1.php';
include_once 'utilities.php';

// FIXME: quicky way to allow for different server ports
//$base = "http://localhost:89/";
$base = $_SERVER['SERVER_ADDR'] . ":" . $_SERVER['SERVER_PORT'];

$path = @$_REQUEST["path"];
$list = @$_REQUEST["list"];
$prefix = @$_REQUEST["prefix"];

$files = explode(",", $list);

// Slow
/*
$s = concatFiles($files, $base);
$s = JSMin::minify($s);
$s = $prefix . $s;
file_put_contents($path, $s);
echo htmlspecialchars($s);
*/

// Still slow
$fp = fopen($path, 'w');
fwrite($fp, stripBOM($prefix));
foreach ($files as $i) {
	if ($i) {
		//echo $i."<br/>";
        $x = fetchText($base . $i);
   		if ($x[0] === '<') {
			echo "<b style='background-color:red;'>Failure</b> loading: $base$i<br/>";
			continue;
		}
		$t = stripBOM($x);
		if ($t) {
			// JSMin seems to be the cause of slowness
			$t = JSMin::minify($t);
			fwrite($fp, $t);
			//echo htmlspecialchars($t);
		}
	}
}
fclose($fp);

echo "<b>Finished.</b>";

?>