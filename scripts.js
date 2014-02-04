(function() { 	
	var textarea = document.getElementsByTagName("textarea")[0];
	
	var words = window.localStorage.webCensorData.split("|").join("\n");
	textarea.value = 'words';
	
	var send = document.getElementById("save");	

	send.addEventListener("click", updateLocalData, false);

	function updateLocalData () {
		var data = textarea.value.split("\n").join("|");
		window.localStorage.webCensorData = data;
	}
})();