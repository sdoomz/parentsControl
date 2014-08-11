chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == 'getLocal')
     	sendResponse(localStorage.getItem('_wcoptions'));
});

(function() {
	var name = '_wcoptions';

	var extension = {

	};
	
	var replacer = {
		1 : '*****',
		2 : '@#$%&!',
		3 : '[censored]'
	};

	var storage = new StorageMgr({
		name: name
	});

	var defStore = storage.getSettings();
	var defaults = {
		language         : defStore.language         || 'eng',
		userWords        : defStore.userWords        || '',
		replacer         : defStore.replacer         || '*****',
		replacerPosition : defStore.replacerPosition || 1,
		customReplacer   : defStore.customReplacer   || '',
		safeWords	     : defStore.safeWords 		 || '',
		active           : (defStore.hasOwnProperty('active') && defStore.active != null) ? defStore.active : true
	};

	storage.saveSettings(defaults);

	var replacerArr = document.getElementsByName('replacer');

	for(var i = 0, len = replacerArr.length; i < len; i++){
		replacerArr[i].checked = false;
	}

	var checkedInp = document.getElementById('val'+defaults.replacerPosition);
	var customStr = document.getElementsByName('custom')[0].value = defaults.customReplacer;

	if(checkedInp){
		checkedInp.checked = true;
	} else {
		replacerArr[0].checked = true;
	}

	document.getElementsByName('activate')[0].checked = (storage.getValue('active') == true) ? true : false;

	var send     	  = document.getElementById('save');	
	var stopWordsArea = document.getElementById('stop-wordsarea');
	var safeWordsArea = document.getElementById('safe-wordsarea');
	var select    	  = document.getElementById('languages');

	send.addEventListener('click', updateLocalData, false);
	stopWordsArea.value = defaults.userWords.split('|').join('\n');
	safeWordsArea.value = defaults.safeWords.split('|').join('\n');

	for (var i = 0, len = select.options.length; i < len; i++) {

		if (select.options[i].value == storage.getValue('language')) { 
			select.options[i].setAttribute('selected', 'selected');
		}
	
	}

	function updateLocalData () {	
		var stopWords = stopWordsArea.value.trim().replace(/(\r\n|\n|\r)/gm, '|');
			safeWords = safeWordsArea.value.trim().replace(/(\r\n|\n|\r)/gm, '|');

		var e = document.getElementById('languages');
		var language = e.options[e.selectedIndex].value;
		var replacerArr = document.getElementsByName('replacer');
		var i = 0;

		while(!replacerArr[i].checked){
			i++;
		}
	
		var checked = replacerArr[i];
		var customReplacer = document.getElementsByName('custom')[0].value;
		var active = document.getElementsByName('activate')[0].checked;			

		if (checked.value == 4 && customReplacer != '' && typeof customReplacer != 'undefined') {
			storage.setValue('replacer', customReplacer);
			storage.setValue('customReplacer', customReplacer);	
		}
		else {
			storage.setValue('replacer', (replacer[checked.value] || replacer[1]));	
		}
		
		storage.setValue({
			active 			 : active, 
			replacerPosition : checked.value || 1,
			language 		 : language,
			userWords	     : stopWords,
			safeWords 		 : safeWords
		});

		var localData = storage.getSettings();		

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			  chrome.tabs.sendMessage(tabs[0].id, {
			  		type: 'update', 
			  		data:{
			  			language  : localData.language,
			  			userWords : localData.userWords,
			  			replacer  : localData.replacer,
			  			active    : localData.active,
			  			safeWords : safeWords,		  			
			  		}
			  }, function() {
			  		window.close();
			  });
		});		
	}
})();