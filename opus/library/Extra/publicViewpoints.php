<?php 
	// create curl resource 
	$ch = curl_init(); 

	// set url 
	curl_setopt($ch, CURLOPT_URL, "http://public-viewpoints.appspot.com/get_viewpoint?random=true&format=csv"); 

	curl_exec($ch);

	// close curl resource to free up system resources 
	curl_close($ch);
?>