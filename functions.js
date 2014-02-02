(function() { 
	var badWords = [
	'bitch', 
	'dick', 
	'porn', 
	'ass', 	
	'slut', 
	'sluts', 
	'anal', 
	'fuck',
	'fucked',
	'fucker',
	'fuckface',
	'fucking', 
	'squirt', 
	'squirting',	
	'cum', 
	'cumshot', 
	'bitch',
	'asshole',
	'cock',
	'cocks',
	'blow job',
	'whore',
	'shithead',
	'dickhead',
	'faggot',
	'fucked-up',
	'pussy',
	'bastard',
	'anus',
	'jerk',
	'jerking',
	'creature',
	'bloke',
	'dickhead',	
	'piss', 
	'shit',
	'sucker',
	'bullshit',
	'cunt',
	's.o.b',
	'fart',
	'motherfucker',
	'masturbation',
	'blowjob',
	'blowjobs',
	'handjob',
	'handjobs'
	].join("|");
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