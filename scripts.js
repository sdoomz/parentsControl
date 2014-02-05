chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "getLocal")
      sendResponse(localStorage);
});

(function() {
	localStorage.language = localStorage.language || "eng";
	localStorage.userWords = localStorage.userWords || "";	
	
	var send = document.getElementById("save");	
	var textarea = document.getElementsByTagName("textarea")[0];
	send.addEventListener("click", updateLocalData, false);
	textarea.value = localStorage.userWords.split("|").join("\n");

	var select = document.getElementById("languages");

	for(var i = 0, len = select.options.length; i < len; i++){ 
		if(select.options[i].value == localStorage.language) { 
			select.options[i].setAttribute("selected", "selected");
		}
	}

	function updateLocalData () {		
		var data = textarea.value.replace(/\s+/g, '|').replace(/^\|+|\|+$/g, '');
		var e = document.getElementById("languages");
		var language = e.options[e.selectedIndex].value;

		localStorage.language = language;
		localStorage.userWords = data;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {
		  		type: "updateOptions", 
		  		data:{
		  			language:localStorage.language,
		  			userWords:localStorage.userWords
		  		}
		  });
		});
	}
})();



