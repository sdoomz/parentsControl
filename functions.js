(function() {
	var Utils = {
		debounce : function(fn, timeout, invokeAsap, ctx) {
			if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
				ctx = invokeAsap;
				invokeAsap = false;
			}
			var timer;

			return function() {
				var args = arguments;
	            ctx = ctx || this;

				invokeAsap && !timer && fn.apply(ctx, args);

				clearTimeout(timer);

				timer = setTimeout(function() {
					!invokeAsap && fn.apply(ctx, args);
					timer = null;
				}, timeout);

			};
		}
	};

	var App = {
		storage: new StorageMgr({name: '_$webCensor'}),	
		defaults: {
			language  : 'eng', 
			words     : '',
			userWords : '',
			safeWords : '',
			replacer  : '*****',
			active    : true
		},

		sendRequest: function() { 
			var me = this;
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);
			
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		    		var data = JSON.parse(xmlhttp.responseText); 
		    		var storage = me.storage; 			    	
		    		var list = data[storage.getValue('language')].join('|');

		    		storage.setValue('words', list)
		    		
		    		if (storage.getValue('active') == true)
		    			me.replaceProfanity(); 

		    		console.log('settings recived', storage);
			  	}
			}

			xmlhttp.send(null);
		},

		optionsUpdateCallback: function(request, sender, sendResponse) {
			if (request.type == 'update') {	
				var storage = this.storage;
				console.log('reguest response', request.data, storage);
				storage.setValue(request.data)

				if (storage.getValue('words') == null || (storage.getValue('language') != request.data.language)) {
					this.sendRequest();
				} else {
					if (storage.getValue('active') == true)
			    		this.replaceProfanity(); 
				}		
				
				var reload = confirm('You may need to reload page to update changes. Are you sure you want to reload page right now?');

				if (reload) {
					window.location.reload();
				}
			}		    
		},

		replaceProfanity: Utils.debounce(function() {
			var storage = this.storage;
			console.log('changes words');

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

			var regExp = this.createRegExp(stopWords.split('|'));

			while (node = walker.nextNode()) {			
			    node.nodeValue = node.nodeValue.replace(regExp, replacer);
			}

			this.changeInputValues(regExp, replacer);
		}, 300),
		
		changeInputValues: function(regExp, replacer) {			
			var walker = document.getElementsByTagName('input');
			var node;

			for (var i = walker.length - 1; i >= 0; i--) {
				if (walker[i].value && typeof walker[i].value == 'string') {					
					walker[i].value = walker[i].value.replace(regExp, replacer);
				}
			};

			return this;		
		},	

		createRegExp: function(stopWords, safeWords) { 
			var stopWords = stopWords || this.storage.getValue('words').split('|');
			var safeWords = safeWords || this.storage.getValue('safeWords');
	 		
	 		if (safeWords.length) {
		 		var regExp = new RegExp('\\b('+safeWords+')\\b', 'gi');  

				for (var i = stopWords.length - 1; i >= 0; i--) {
					if (stopWords[i].search(regExp) != -1) {
						stopWords.splice(i, 1);
					}
				};
			}

			return new RegExp('\\b('+stopWords.join('|')+')\\b', 'gi');
		}, 

		attachHandlers: function() {
			var me = this;

			chrome.runtime.sendMessage({type: 'getLocal'}, function (response) {
				var data = JSON.parse(response);
			  	me.storage.setValue(data);
			});

			chrome.runtime.onMessage.addListener(this.optionsUpdateCallback.bind(this));

			document.addEventListener("DOMSubtreeModified", function() {
				console.log('DOMSubtreeModified');
				
				me.replaceProfanity();
			}, false);
		},

		init: function() {
			var defStore = this.storage.getSettings();			
			var defaults = this.defaults;
			var me = this;
			
			for (var prop in defaults) {
				if (prop in defStore) defaults[prop] = defStore[prop];				
			}
		
			this.storage.saveSettings(defaults);
			this.attachHandlers();

			if ( this.storage.getValue('words') == '') {
				this.sendRequest();
			} 
		}
	};

	App.init();
})();