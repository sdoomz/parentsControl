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
		// storage: new StorageMgr({name: '_$webCensor'}),	
		// options: {
		// 	language  : 'eng', 			
		// 	stopWords : '',
		// 	safeWords : '',
		// 	replacer  : '*****',
		// 	active    : true
		// },

		options: null,		

		optionsUpdateCallback: function(request, sender, sendResponse) {
			if (request.type == 'update') {	
				var storage = this.storage;

				console.log('reguest response', request.data, storage);				
				storage.setValue(request.data)

				if (storage.getValue('active') == true)
		    		this.replaceProfanity(); 		
				
				var reload = confirm('You may need to reload page to update changes. Are you sure you want to reload page right now?');

				if (reload) {
					window.location.reload();
				}
			}		    
		},

		replaceProfanity: Utils.debounce(function() {
			var storage = this.storage;
			console.log('replaceProfanity');

			// if ( storage.getValue('active') != true) {
			// 	return false;
			// }	

			var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
			var node;
			var replacer = storage.getValue('replacer');
			var stopWords = storage.getValue('stopWords');
			
			var regExp = this.createRegExp(stopWords.split('|'));
			console.log('Stop words!!!', stopWords, regExp, storage.getSettings());

			return;

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
			var stopWords = stopWords || this.storage.getValue('stopWords').split('|');
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

		getDefaulOptions: function() {
			var me = this;

			chrome.runtime.sendMessage({type: 'getDefault'}, function (response, res) {
				//var data = JSON.parse(response);
				
				// var options = {
				// 	language  : data.language || this.language, 			
				// 	stopWords : data.userWords || this.stopWords,
				// 	safeWords : data.safeWords || this.safeWords,
				// 	replacer  : data.replacer || this.replacer,
				// 	active    : data.active || this.active
				// };

				console.log('recived data', response, res);
			  	//me.storage.setValue(options);

			  	// me.init();
			});
		},
			


		init: function() {
			var defStore = this.storage.getSettings();			
			var options = this.options;
			var me = this;

			this.getDefaulOptions();
			chrome.runtime.onMessage.addListener(this.optionsUpdateCallback.bind(this));			

			if (defStore['active'] != true) return;

			for (var prop in options) {
				if (prop in defStore) options[prop] = defStore[prop];				
			}
		
			this.storage.saveSettings(options);
			document.addEventListener("DOMSubtreeModified", function() {
				
				console.log('DOMSubtreeModified');				
				me.replaceProfanity();
			}, false);
		}
	};
	
	App.getDefaulOptions();
})();