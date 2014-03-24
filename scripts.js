chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "getLocal")
      sendResponse(localStorage);
});

(function() {
	localStorage.language = localStorage.language || "eng";
	localStorage.userWords = localStorage.userWords || "";
	localStorage.replacer = localStorage.replacer || "*****";
	localStorage.replacerPosition = localStorage.replacerPosition || 1;
	localStorage.customReplacer = localStorage.customReplacer || "";
	localStorage.active = localStorage.active || "true";

	var replacerArr = document.getElementsByName('replacer');

	for(var i = 0, len = replacerArr.length; i < len; i++){
		replacerArr[i].checked = false;
	}

	var checkedInp = document.getElementById('val'+localStorage.replacerPosition);
	var customStr = document.getElementsByName('custom')[0].value = localStorage.customReplacer;

	if(checkedInp){
		checkedInp.checked = true;
	} else {
		replacerArr[0].checked = true;
	}

	document.getElementsByName('activate')[0].checked = (localStorage.active == "true") ? true : false;


	var send = document.getElementById("save");	
	var textarea = document.getElementsByTagName("textarea")[0];
	send.addEventListener("click", updateLocalData, false);
	textarea.value = localStorage.userWords.split("|").join("\n");

	var select = document.getElementById("languages");

	for(var i = 0, len = select.options.length; i < len; i++){ 
		if(select.options[i].value == localStorage.language) { 
			select.options[i].setAttribute("selected", "selected");
		}
	}

	function updateLocalData () {	

		var data = textarea.value.replace(/\s+/g, '|').replace(/^\|+|\|+$/g, '');
		var e = document.getElementById("languages");
		var language = e.options[e.selectedIndex].value;

		var replacerArr = document.getElementsByName('replacer');
		var i = 0;

		while(!replacerArr[i].checked){
			i++;
		}

		
		var checked = replacerArr[i];
		var customReplacer = document.getElementsByName('custom')[0].value;

		var active = document.getElementsByName('activate')[0].checked;
		localStorage.active = active;

		if(checked.value == 2) {
			localStorage.replacer = "@#$%&!";
		} else if(checked.value == 3){
			localStorage.replacer = "[censored]";
		} else if(checked.value == 4 && customReplacer != '' && typeof customReplacer != "undefined"){
			localStorage.replacer = customReplacer;
			localStorage.customReplacer = customReplacer;
		} else {
			localStorage.replacer = "*****";			
		}

		localStorage.replacerPosition = checked.value || 1;

		localStorage.language = language;
		localStorage.userWords = data;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {
		  		type: "updateOptions", 
		  		data:{
		  			language:localStorage.language,
		  			userWords:localStorage.userWords,
		  			replacer:localStorage.replacer,
		  			activated:localStorage.active
		  		}
		  });
		});

		window.close();
	}
})();



