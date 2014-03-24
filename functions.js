(function() {
	var jsonWorker = {};	
	localStorage.$webCensor_language = localStorage.$webCensor_language || "eng";	
	localStorage.$webCensor_words = localStorage.$webCensor_words || "";	
	localStorage.$webCensor_userWords = localStorage.$webCensor_userWords || "";
	localStorage.$webCensor_activated = localStorage.$webCensor_activated || "true";
	localStorage.$webCensor_replacer = localStorage.$webCensor_replacer || "*****";

	chrome.runtime.sendMessage({type: "getLocal"}, function(response) {	
	  for(var element in response){ 
	  	localStorage["$webCensor_"+element] = response[element];
	  }
	});

	chrome.runtime.onMessage.addListener(optionsUpdateCallback);

	function optionsUpdateCallback(request, sender, sendResponse) {
		if (request.type == "updateOptions") {
			for(var element in request.data){ 
			  	localStorage["$webCensor_"+element] = request.data[element];
			}
			jsonWorker.sendRequest();
		}
	    
	}


	jsonWorker.sendRequest = function() { 
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);
		xmlhttp.onreadystatechange = function() {
		  if (xmlhttp.readyState == 4) {
		    if(xmlhttp.status == 200) {
		    	var data = JSON.parse(xmlhttp.responseText);    			    	
		    	localStorage.$webCensor_words = data[localStorage.$webCensor_language].join("|");	    	
		    	changeWords(); 
		    }
		  }
		}
		xmlhttp.send(null);
	};
	
	if(localStorage.$webCensor_words != '') {
		changeWords();
	} else {
		jsonWorker.sendRequest();
	}

	function changeWords() {

		if(localStorage.$webCensor_activated != "true") {
			return false;
		}

		var badWords = (localStorage.$webCensor_userWords != "") ? localStorage.$webCensor_words+"|"+localStorage.$webCensor_userWords : localStorage.$webCensor_words;		

		var regExp = new RegExp('\\b('+badWords+')\\b', "gi");  
		var walker = document.createTreeWalker(
		    document.body, 
		    NodeFilter.SHOW_TEXT, 
		    null, 
		    false
		);
		var node;

		var replacer = localStorage.$webCensor_replacer;

		while(node = walker.nextNode()) {			
		    node.nodeValue = node.nodeValue.replace(regExp, replacer);
		}	

	}
	
	document.addEventListener("DOMSubtreeModified", refreshDomAjax, false);

	var busy = false; 
	function refreshDomAjax(e) {		
		if(!busy)  {
			setTimeout(function() { 
				changeWords();
				busy = false;
			}, 700);
		}
		busy = true;
	}
})();