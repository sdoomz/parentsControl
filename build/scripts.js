chrome.runtime.onMessage.addListener(function(e,t,n){if(e.type=="getLocal")n(localStorage.getItem("_wcoptions"))});(function(){function d(){var e=c.value.trim().replace(/(\r\n|\n|\r)/gm,"|");safeWords=h.value.trim().replace(/(\r\n|\n|\r)/gm,"|");var r=document.getElementById("languages");var i=r.options[r.selectedIndex].value;var s=document.getElementsByName("replacer");var o=0;while(!s[o].checked){o++}var u=s[o];var a=document.getElementsByName("custom")[0].value;var f=document.getElementsByName("activate")[0].checked;if(u.value==4&&a!=""&&typeof a!="undefined"){n.setValue("replacer",a);n.setValue("customReplacer",a)}else{n.setValue("replacer",t[u.value]||t[1])}n.setValue({active:f,replacerPosition:u.value||1,language:i,userWords:e,safeWords:safeWords});var l=n.getSettings();chrome.tabs.query({active:true,currentWindow:true},function(e){chrome.tabs.sendMessage(e[0].id,{type:"update",data:{language:l.language,userWords:l.userWords,replacer:l.replacer,active:l.active,safeWords:safeWords}},function(){window.close()})})}var e="_wcoptions";var t={1:"*****",2:"@#$%&!",3:"[censored]"};var n=new _$WebCensorStorageMgr({name:e});var r=n.getSettings();var i={language:r.language||"eng",userWords:r.userWords||"",replacer:r.replacer||"*****",replacerPosition:r.replacerPosition||1,customReplacer:r.customReplacer||"",safeWords:r.safeWords||"",active:r.hasOwnProperty("active")&&r.active!=null?r.active:true};n.saveSettings(i);var s=document.getElementsByName("replacer");for(var o=0,u=s.length;o<u;o++){s[o].checked=false}var a=document.getElementById("val"+i.replacerPosition);var f=document.getElementsByName("custom")[0].value=i.customReplacer;if(a){a.checked=true}else{s[0].checked=true}document.getElementsByName("activate")[0].checked=n.getValue("active")==true?true:false;var l=document.getElementById("save");var c=document.getElementById("stop-wordsarea");var h=document.getElementById("safe-wordsarea");var p=document.getElementById("languages");l.addEventListener("click",d,false);c.value=i.userWords.split("|").join("\n");h.value=i.safeWords.split("|").join("\n");for(var o=0,u=p.options.length;o<u;o++){if(p.options[o].value==n.getValue("language")){p.options[o].setAttribute("selected","selected")}}})()