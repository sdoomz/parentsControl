(function() {
	function StorageMgr(options) {
		this.name = options.name;
	};

	StorageMgr.prototype = {	
		getSettings: function() {
			var obj = localStorage.getItem(this.name);
						
			return obj ? JSON.parse(obj) : {};
		},

		saveSettings: function(obj) {
			localStorage.setItem(this.name, JSON.stringify(obj))
		},

		getValue: function (field) {
			var obj = this.getSettings();

			return obj ? obj[field] : null;
		},

		setValue: function (data, value) {
			var obj = this.getSettings();

			if (typeof data === 'string') {
				obj[data] = value;
				this.saveSettings(obj);		
			}
			else if (typeof data === 'object') {
				for (var prop in data) {
					obj[prop] = data[prop]
				}
				this.saveSettings(obj);	
			}
			else {
				return false;
			}
		}
	};

	var jsonWorker = {};
	var name = '_$webCensor';	

	var storage = new StorageMgr({
		name: name
	});

	var defStore = storage.getSettings();

	var defaults = {
		language  : defStore.language  || 'eng', 
		words     : defStore.words     || '',
		userWords : defStore.userWords || '',
		safeWords : defStore.safeWords || '',
		replacer  : defStore.replacer  || '*****',
		active    : (defStore.hasOwnProperty('active') && defStore.active != null) ? defStore.active : true
	};

	storage.saveSettings(defaults);

	chrome.runtime.sendMessage({type: 'getLocal'}, function (response) {
		var data = JSON.parse(response);
	  	storage.setValue(data);
	});

	chrome.runtime.onMessage.addListener(optionsUpdateCallback);

	function optionsUpdateCallback(request, sender, sendResponse) {
		if (request.type == 'update') {	

			storage.setValue(request.data)

			if (storage.getValue('words') == null || (storage.getValue('language') != request.data.language)) {
				jsonWorker.sendRequest();
			} else {
				if (storage.getValue('active') == true)
		    		changeWords(); 
			}		
			
			var reload = confirm('You may need to reload page to update changes. Are you sure you want to reload page right now?');

			if (reload) {
				window.location.reload();
			}

		}
	    
	}

	jsonWorker.sendRequest = function() { 
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);
		
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
		    	if(xmlhttp.status == 200) {
		    		var data = JSON.parse(xmlhttp.responseText);   			    	
		    		var list = data[storage.getValue('language')].join('|');

		    		storage.setValue('words', list)
		    		
		    		if (storage.getValue('active') == true)
		    			changeWords(); 
		    	}
		  	}
		}

		xmlhttp.send(null);
	};
	
	if ( storage.getValue('words') == '') {
		jsonWorker.sendRequest();
	} 

	function changeWords() {
		if ( storage.getValue('active') != true) {
			return false;
		}	

		var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
		var node;
		var replacer = storage.getValue('replacer');
		var stopWords = storage.getValue('words');

		if (storage.getValue('userWords') != '') {
			stopWords += '|' + storage.getValue('userWords');
		}

		var regExp = createRegExp(stopWords.split('|'));

		while (node = walker.nextNode()) {			
		    node.nodeValue = node.nodeValue.replace(regExp, replacer);
		}	
	}

	function createRegExp (stopWords, safeWords) { 
		var stopWords = stopWords || storage.getValue('words').split('|');
		var safeWords = safeWords || storage.getValue('safeWords');
 		
 		if (safeWords.length) {
	 		var regExp = new RegExp('\\b('+safeWords+')\\b', 'gi');  

			for (var i = stopWords.length - 1; i >= 0; i--) {
				if (stopWords[i].search(regExp) != -1) {
					stopWords.splice(i, 1);
				}
			};
		}

		return new RegExp('\\b('+stopWords.join('|')+')\\b', 'gi');
	} 
	
	document.addEventListener("DOMSubtreeModified", refreshDomAjax, false);

	var busy = false; 

	function refreshDomAjax(e) {		
		if(!busy && (storage.getValue('active') == true))  {
			setTimeout(function() { 
				changeWords();
				busy = false;
			}, 700);
		}
		busy = true;
	}

})();