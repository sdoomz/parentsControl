(function() {
	var LANG = 'eng';
	var DATA = null;
	function getXmlHttp(){
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
	}

	var xmlhttp = getXmlHttp();	
	xmlhttp.open('GET', chrome.extension.getURL(LANG+'.json'), true);
	xmlhttp.onreadystatechange = function() {
	  if (xmlhttp.readyState == 4) {
	    if(xmlhttp.status == 200) {
	    	DATA = JSON.parse(xmlhttp.responseText);
	    	changeWords(DATA.words.join("|")); 
	    }
	  }
	};
	xmlhttp.send(null);

	function changeWords(badWords) {
		var regExp = new RegExp('\\b('+badWords+')\\b', "gi");  
		var walker = document.createTreeWalker(
		    document.body, 
		    NodeFilter.SHOW_TEXT, 
		    null, 
		    false
		);
		var node;

		while(node = walker.nextNode()) {
			console.log(node);
		    node.nodeValue = node.nodeValue.replace(regExp, '****');
		}		
	}
})();