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
        },

        merge: function(obj, options) {
            if (typeof options === 'undefined') return false;

            var obj = obj || {};

            for (var el in options) {
                if (el in obj ) {
                    continue;
                } else {
                    obj[el] = options[el];
                }
            }

            return obj;
        }
    };


    var App = {     

        replacer: {
            1 : '*****',
            2 : '@#$%&!',
            3 : '[censored]',
            4 : null
        }, 
        
        defaults :{
            language         : 'eng',
            replacer         : 1,
            customReplacer   : '',
            localWords       : null,
            userWords        : [],
            safeWords        : [],
            active           : true
        },  

        settings:null, // chrome storage copy 

        replaceProfanity: Utils.debounce(function() {
            var settings = this.settings;           
            var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);               
            var regExp = this.createRegExp();                       
            var node, replacer;

            if (settings.replacer == 4) { 
                replacer = settings.customReplacer;
            } else if (settings.replacer < 4 && settings.replacer > 0) { 
                replacer = this.replacer[settings.replacer];
            } else {
                replacer = this.replacer['1'];
            }

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

        createRegExp: function() {
            var settings = this.settings;
            var stopWords = Array.prototype.concat(settings.userWords, settings.localWords[settings.language]);
            var safeWords = settings.safeWords.join('|');

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

        attachListeners: function() {
            var me = this;

            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request.type == 'update') {
                        var reload = confirm('Settings was updated. You need to reload page to see changes. Are you sure you want to reload page right now?');
                        
                        if (reload) {
                          window.location.reload();
                        }                   
                    }               
             });
        },
        
        _getLocalWordsList: function(lang) {        
            var xmlhttp = new XMLHttpRequest();         
            xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);

            xmlhttp.send(null);

            return xmlhttp;
        },

        getDefaultSettings: function (lang) {
            var me = this;          

            chrome.storage.local.get('settings', function(response) {
                var settings = response.hasOwnProperty('settings') ? response.settings : {}
                var settings = Utils.merge(settings, me.defaults)
                var language = lang || settings.language;       

                if (settings.localWords) { 
                    me.init();
                } else {
                    var request = me._getLocalWordsList();

                    request.onreadystatechange = function() {
                        if (request.readyState == 4 && request.status == 200) {
                            var response        = JSON.parse(request.responseText);                 
                            settings.localWords = response;
                            settings.language   = language;                     

                            me.settings = settings;

                            chrome.storage.local.set({'settings': settings}, function() {
                                me.init();
                            });                                                                                                                         
                        }
                    }
                }               
            });     
        },  

        init: function() {          
            var me = this;

            chrome.storage.local.get('settings', function(response) {
                me.settings = response.settings;

                if (me.settings['active'] != true) return;              
                document.addEventListener("DOMSubtreeModified", me.replaceProfanity.bind(me), false);
            });                                 
        }
    };
    
    App.getDefaultSettings();
    App.attachListeners();
})();