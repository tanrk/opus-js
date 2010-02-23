<?php

function fetchText($inPath) {
	// CURL version supports URLs, we could have a version that just uses filesystem 
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $inPath);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	return curl_exec($ch);
}

function concatFiles($inList, $inRoot) {
	//echo "<hr/>";
	$s = "";
	foreach ($inList as $i) {
		if ($i) {
			//echo urlencode($i)."<br/>";
			$i = str_replace(" ", "%20", $i);
			//echo $inRoot . $i ."<br/>";
			$x = fetchText($inRoot . $i);
			if ($x[0] === '<') {
				echo "<b style='background-color:red;'>Failure</b> loading: $inRoot$i<br/>";
				continue;
			}
			//echo htmlspecialchars($x)."<br/>";
			if ($x) {
				$s .= $x;
			}
		}
	}
	//echo "<hr/>";
	return $s;
}

function stripBOM($inString) {
	if (strlen($inString) > 3 && ord($inString[0]) == 0xEF && ord($inString[1]) == 0xBB && ord($inString[2]) == 0xBF) {
		return substr($inString, 3);
	}
	return $inString;
}

?>