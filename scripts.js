(function() {
    var Ext = {

        elements: {
            saveBtn       : document.getElementById('save'),
            stopWordsArea : document.getElementById('stop-wordsarea'),
            safeWordsArea : document.getElementById('safe-wordsarea'),
            langs         : document.getElementById('languages'),
            replacers     : document.getElementsByName('replacer'),
            isactive      : document.getElementById('isactive')
        },

        settings: null,

        setActiveByDefault: function() {
            var activate = this.elements.isactive;

            activate.checked = (this.settings.active == true) ? true : false;
        },

        _uncheckAllReplacers: function() {
            var replacers = this.elements.replacers;

            for (var i = 0, len = replacers.length; i < len; i++) {
                replacers[i].checked = false;
            }
        },

        _getCheckedReplacer: function() {
            var replacers = this.elements.replacers;

            for (var i = replacers.length - 1; i >= 0; i--) {
                if (replacers[i].checked) return replacers[i];
            };

            return null;
        },

        setReplacerByDefault: function() {
            var field = document.getElementById('val' + this.settings.replacer);
            this._uncheckAllReplacers();

            if (field) {
                field.checked = true;
            } else {
                this.elements.replacers[0].checked = true;
            }
        },

        validateTextArea: function(text) {
            var text = text.replace(/\s*[\r\n]+\s*/g, '\n').replace(/^\s+|\s+$/g, '');

            return text.length ? text.split('\n') : [];
        },

        updateLocalData: function() {
            var elements = this.elements;
            var settings = this.settings;
            var checkedReplacer = this._getCheckedReplacer();

            var exports = {
                userWords: this.validateTextArea(elements.stopWordsArea.value),
                safeWords: this.validateTextArea(elements.safeWordsArea.value),
                language: elements.langs.options[elements.langs.selectedIndex].value,
                active: document.getElementsByName('isactive')[0].checked,
                replacer: checkedReplacer.value,
                customReplacer: document.getElementsByName('custom')[0].value
            };

            for (var prop in exports) {
                if (settings.hasOwnProperty(prop)) {
                    settings[prop] = exports[prop];
                }
            }

            this.sendData(settings);
        },

        sendData: function(settings) {
            var settings = settings || this.settings;

            chrome.storage.local.set({
                'settings': settings
            }, function(response) {
                window.close()
            });

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'update'
                });
            });
        },

        init: function() {
            var settings = this.settings;
            var elements = this.elements;

            this.setReplacerByDefault();
            this.setActiveByDefault();

            elements.saveBtn.addEventListener('click', this.updateLocalData.bind(this), false);

            elements.stopWordsArea.value = settings.userWords.join('\n');
            elements.safeWordsArea.value = settings.safeWords.join('\n');

            for (var i = 0, len = elements.langs.options.length; i < len; i++) {
                if (elements.langs.options[i].value == settings.language) {
                    elements.langs.options[i].setAttribute('selected', 'selected');
                }
            }
        },

        getSettings: function() {
            var me = this;

            chrome.storage.local.get('settings', function(response) {
                me.settings = response.settings;
                me.init();
            });
        }
    };

    Ext.getSettings();

})();