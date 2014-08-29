(function() {	
	chrome.runtime.onMessage.addListener(
	  function(request, sender, callback) {
	    if (request.type == 'getDefault') { 	
	    	//callback.call(callback, 'prestart');
	    	callback.call(callback, 'prestart3', Ext);

	    	Ext.getLocalWordsList(null, callback);
		}			
	});
	
	var Ext = {
		storage  : new StorageMgr({name: '_wcoptions'}),
		options :{
			language         : 'eng',			
			replacer         : '*****',
			replacerPosition : 1,
			customReplacer   : '',
			localWords 		 : '',
			userWords        : '',
			safeWords	     : '',
			active           : true
		},

		replacer: {
			1 : '*****',
			2 : '@#$%&!',
			3 : '[censored]'
		}, 

		elements: {
			saveBtn 	  : document.getElementById('save'),
			stopWordsArea : document.getElementById('stop-wordsarea'),
			safeWordsArea : document.getElementById('safe-wordsarea'),
			langs 	 	  : document.getElementById('languages')
		},

		getReplacerArr: function() {
			return document.getElementsByName('replacer') || null;
		},

		getLocalWordsList: function(lang, callback) {		
			var xmlhttp = new XMLHttpRequest();
			var language = lang || this.storage.getValue('language') || options.lang;
			var me = this;

			xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);
			
			console.log('callback here', callback);
			callback.call(null, 'start');

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		    		var data = JSON.parse(xmlhttp.responseText); 		    	
		    		var list = data[language].join('|');
		    		var userWords = me.storage.getValue('userWords');
		    		var newStr = userWords.length ? userWords + '|' + list : list;

		    		me.storage.setValue('userWords', newStr);	    		
			  		
			  		me.init();
			  	}

				if (typeof callback === 'function')
					callback();
				
				callback.call(callback, 'event');	
			}

			callback.call(callback, 'end');

			xmlhttp.send(null);
		},
		
		setActiveByDefault: function() {
			var activate = document.getElementsByName('activate')[0];

			activate.checked = (this.storage.getValue('active') == true) ? true : false;
		},

		setReplacerByDefault: function() {
			var field = document.getElementById('val'+this.options.replacerPosition);
			
			if (field)
				field.checked = true;
			else 
				this.getReplacerArr()[0].checked = true;			
		},

		init: function() {
			var st, el, defStore, options;	

			st       = this.storage;
			el 	     = this.elements;
			defStore = this.storage.getSettings();
			options  = this.options;			

			for (var prop in options) {				
				if (prop in defStore) options[prop] = defStore[prop];			
			}

			st.saveSettings(options);

			var replacerArr = this.getReplacerArr();
			
			for(var i = 0, len = replacerArr.length; i < len; i++){
				replacerArr[i].checked = false;
			}

			this.setReplacerByDefault();
			this.setActiveByDefault();

			el.saveBtn.addEventListener('click', this.updateLocalData.bind(this), false);
		
			el.stopWordsArea.value = options.userWords.split('|').join('\n');
			el.value = options.safeWords.split('|').join('\n');

			for (var i = 0, len = el.langs.options.length; i < len; i++) {

				if (el.langs.options[i].value == st.getValue('language'))
					el.langs.options[i].setAttribute('selected', 'selected');				
			}

			this.getLocalWordsList();
		},

		updateLocalData: function() {
			var el 			= this.elements;
			var stopWords   = el.stopWordsArea.value.trim().replace(/(\r\n|\n|\r)/gm, '|');
			var safeWords   = el.safeWordsArea.value.trim().replace(/(\r\n|\n|\r)/gm, '|');			
			var language    = el.langs.options[el.langs.selectedIndex].value;
			var replacerArr = this.getReplacerArr();
			var i = 0;

			while (!replacerArr[i].checked)
				i++;
	
			var checked = replacerArr[i];
			var customReplacer = document.getElementsByName('custom')[0].value;
			var active = document.getElementsByName('activate')[0].checked;			

			if (checked.value == 4 && customReplacer != '' && typeof customReplacer != 'undefined') {
				this.storage.setValue('replacer', customReplacer);
				this.storage.setValue('customReplacer', customReplacer);	
			}
			else {
				this.storage.setValue('replacer', (this.replacer[checked.value] || this.replacer[1]));	
			}
			
			this.storage.setValue({
				active 			 : active, 
				replacerPosition : checked.value || 1,
				language 		 : language,
				userWords	     : stopWords,
				safeWords 		 : safeWords
			});

			this.sendData();
		},

		sendData: function() {			
			var data  = this.storage.getSettings();					

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				  chrome.tabs.sendMessage(tabs[0].id, {
				  		type: 'update', 
				  		data:{
				  			language  : data.language,
				  			userWords : data.userWords,
				  			replacer  : data.replacer,
				  			active    : data.active,
				  			safeWords : data.safeWords,		  			
				  		}
				  }, function() {
				  		window.close();
				  });
			});		
		}
	};	

})();