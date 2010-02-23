<?php
	function param($inName, $inDefault) {
		// extremely picky pattern intended to defang REQUEST data
		$WHITE_LIST_PATTERN = '/(\d\w -_\/)*/i';
		$WHITE_LIST_REPLACE = '${1}';
		if (isset($_REQUEST[$inName])) {
			// caveat: vulnerability
			$GLOBALS[$inName] = preg_replace($WHITE_LIST_PATTERN, $WHITE_LIST_REPLACE, $_REQUEST[$inName]);
		} else {
			$GLOBALS[$inName] = $inDefault;
		}
	}
?>