(function() { 
	var badWords = ['regexp', 'web', 'porn', 'ass', 'hardcore', 'slut', 'sluts', 'anal', 'fuck'].join("|");
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
})();