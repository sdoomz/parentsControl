(function() {
	var LANG = 'eng';
	var jsonWorker = {};

	jsonWorker.LANG = "eng";
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
		xmlhttp.open('GET', chrome.extension.getURL(jsonWorker.LANG+'.json'), true);
		xmlhttp.onreadystatechange = function() {
		  if (xmlhttp.readyState == 4) {
		    if(xmlhttp.status == 200) {
		    	var data = JSON.parse(xmlhttp.responseText);    			    	
		    	localStorage.webCensorData = data.words.join("|");	    	
		    	changeWords();
		    }
		  }
		};
		xmlhttp.send(null);
	};
	
	if(typeof window.localStorage.webCensorData == 'string' && window.localStorage.webCensorData != '') {
		changeWords();
	} else {
		jsonWorker.sendRequest();
	}

	function changeWords() {
		var badWords = localStorage.webCensorData;		
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
			var badWords = localStorage.webCensorData;
			var regExp = new RegExp('\\b('+badWords+')\\b', "gi");		
		 	
		 	if(typeof e.target.innerText != "undefined" && (e.target.childElementCount == 0 || e.target.nodeType  == 3) ) {
		    	e.target.innerText = e.target.innerText.replace(regExp, '****');
		  	}
		}, false);		
	
	}
})();