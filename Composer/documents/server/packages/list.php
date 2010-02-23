<?php
	require "../JSON.php";
	
	function listFolders($inPath) {
		$output = array();
		if ($dh = opendir($inPath)) {
			while (($file = readdir($dh)) !== false) {
				if (is_dir($inPath . $file) && $file != '.' && $file !='..' && $file != ".svn") {
					array_push($output, $file);
				}
			}
			closedir($dh);
			return $output;
		}
	}
	
	// FIXME: adhoc... 
	// if all libraries have a info.json file, could just scan for those...
	// here just looking for all second level folders
	function listLibraries($inPrefix="", $inPath) {
		$output = array();
		$baseList = listFolders($inPath);
		foreach($baseList as $l) {
			array_push($output, "$inPrefix$l");
		}
		return $output;
	}
	
	$libraryPath = "../../../../opus/library/";
	$list = listLibraries("opus.", $libraryPath);
	
	$json = new Services_JSON;
	echo $json->encode($list);
?>