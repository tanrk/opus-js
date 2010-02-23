<?php
	function popPath($inFilePath) {
		// remove the filename
		$p = split("/", $inFilePath);
		array_pop($p);
		$p = join("/", $p);
		return $p;
	}

	function makePath($inFilePath) {
		// make the directories
		if ($inFilePath) {
			@mkdir("./" . $inFilePath, 0777, true);
		}
	}

	function writeFile($inPath, $inContent) {
		makePath(popPath($inPath));
		$f = @fopen($inPath, 'w');
		if (!$f) {
			return false;
		} else {
			$bytes = fwrite($f, $inContent);
			fclose($f);
			return $bytes;
		}
	}

	function readPathDir($inPath, $inExtensions, $inTypes) {
		$output = array();
		if (is_dir($inPath)) {
			if ($dh = opendir($inPath)) {
				while (($file = readdir($dh)) !== false) {
					$ext = substr($file, strrpos($file, '.') + 1);
					$filetype = filetype($inPath.$file);
					if (/*$file != "." && $file != ".." &&*/ $file != "server" && (!$inExtensions || strpos($inExtensions, $ext)!==false) && (!$inTypes || strpos($inTypes, $filetype)!==false)) {
						$a = array('name' => $file, 'type' => $filetype, 'ext' => $ext);
						array_push($output, $a);
					}
				}
				closedir($dh);
			}
		}
		return $output;
	}
?>