(function() {
	var jsonWorker = {};
	localStorage.$webCensor_words = localStorage.$webCensor_words || "";
	localStorage.$webCensor_language = localStorage.$webCensor_language || "eng";
	localStorage.$webCensor_userWords = localStorage.$webCensor_userWords || "";
	
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
		}
	    
	}

	jsonWorker.getXmlHttp = function() { 
		var xmlhttp;
		try {
		    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
			    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
			    xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		   xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	};	

	jsonWorker.sendRequest = function() { 
		var xmlhttp = jsonWorker.getXmlHttp();	
		xmlhttp.open('GET', chrome.extension.getURL(localStorage.$webCensor_language+'.json'), true);
		xmlhttp.onreadystatechange = function() {
		  if (xmlhttp.readyState == 4) {
		    if(xmlhttp.status == 200) {
		    	var data = JSON.parse(xmlhttp.responseText);    			    	
		    	localStorage.$webCensor_words = data.words.join("|");	    	
		    	changeWords(); 
		    }
		  }
		}
		xmlhttp.send(null);
	};
	
	if(typeof localStorage.$webCensor_words == 'string' && localStorage.$webCensor_words != '') {
		changeWords();
	} else {
		jsonWorker.sendRequest();
	}

	function changeWords() {
		var badWords = (localStorage.$webCensor_userWords != "") ? localStorage.$webCensor_words+"|"+localStorage.$webCensor_userWords : localStorage.$webCensor_words;		
		console.log(badWords);
		var regExp = new RegExp('\\b('+badWords+')\\b', "gi");  
		var walker = document.createTreeWalker(
		    document.body, 
		    NodeFilter.SHOW_TEXT, 
		    null, 
		    false
		);
		var node;

		while(node = walker.nextNode()) {			
		    node.nodeValue = node.nodeValue.replace(regExp, '****');
		}		
	}
	
	window.addEventListener('DOMContentLoaded', addDomListener, false );

	function addDomListener() { 		
		document.addEventListener("DOMSubtreeModified", function(e) {
			var badWords = (localStorage.$webCensor_userWords != "") ? localStorage.$webCensor_words+"|"+localStorage.$webCensor_userWords : localStorage.$webCensor_words;	
			var regExp = new RegExp('\\b('+badWords+')\\b', "gi");		
		 	
		 	if(typeof e.target.innerText != "undefined" && (e.target.childElementCount == 0 || e.target.nodeType  == 3) ) {
		    	e.target.innerText = e.target.innerText.replace(regExp, '****');
		  	}
		}, false);		
	
	}
})();