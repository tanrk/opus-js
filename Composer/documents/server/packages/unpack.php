<?php
	require "../JSON.php";
	
	function get_tempdir($dir, $prefix='') {
		$dir = str_ireplace("\\", "/", $dir);
		$dir .= (substr($dir, -1) != '/') ? "/" : "";
		do {
			$path = $dir.$prefix.mt_rand(0, 9999999);
		} while (!mkdir($path));
		return $path;
	}
	
	function zip_extract($inFile, $inExtractPath) {
		echo "Extracting: $inFile to $inExtractPath";
		$zip = new ZipArchive;
		$a = $zip->open($inFile);
		if ($a) {
				$zip->extractTo($inExtractPath);
				$zip->close();
				return true;
		}
	}
	
	function getPackageInfo($inFile) {
		$zip = new ZipArchive; 
		if ($zip->open($inFile)) {
			for($i = 0; $i < $zip->numFiles; $i++) {
				if (preg_match("/info.json$/", $zip->getNameIndex($i))) {
					$json = new Services_JSON;
					return $json->decode($zip->getFromIndex($i));
				}
			}
			$zip->close();
		}
	}
	
	function getPrefixPath($inPrefix, $inPath) {
		$r = "";
		while (!preg_match("/" . preg_quote($inPrefix, "/") . "/", $inPath)) {
			$s = strpos($inPrefix, "/")+1;
			$r .= substr($inPrefix, 0, $s);
			$inPrefix = substr($inPrefix, $s);
		}
		return $r;
	}
	
	// note: packages are named "vendor.name" and go into a folder $libraryPath/vendor/name
	// here we check the zip to determine if files are already embedded in one of these folders
	// and return the proper folder to extract the zip to inside libraryPath
	function getExtractDir($inFile, $inPackageName) {
		$fullPath = str_replace(".", "/", $inPackageName) . "/";
		$zip = new ZipArchive;
		if ($zip->open($inFile)) {
			// checking the last file is ad hoc and may not work
			$a = $zip->getNameIndex($zip->numFiles - 1);
			$folder = getPrefixPath($fullPath, $a);
			$zip->close();
			return $folder;
		}
	}
	
	$libraryPath = "../../../../opus/library/";
	
	$package = $_REQUEST["package"];
	
	if ($package) {
		//
		// copy file to temporary location
		$dir = get_tempdir(".", "package") . "/";
		$filename = substr($package, strrpos($package, "/")+1);
		@mkdir($dir, true);
		$t = $dir .$filename;
		copy($package, $t);
		$package = $t;
		//
		// get info
		$info = getPackageInfo($package);
		//
		// unzip
		$extractPath = $libraryPath . getExtractDir($package, $info->name);
		zip_extract($package, $extractPath);
		//
		// cleanup
		unlink($package);
		rmdir($dir);
	}
?>