function _$WebCensorStorageMgr(e){this.name=e.name}_$WebCensorStorageMgr.prototype={getSettings:function(){var e=localStorage.getItem(this.name);return e?JSON.parse(e):{}},saveSettings:function(e){localStorage.setItem(this.name,JSON.stringify(e))},getValue:function(e){var t=this.getSettings();return t?t[e]:null},setValue:function(e,t){var n=this.getSettings();if(typeof e==="string"){n[e]=t;this.saveSettings(n)}else if(typeof e==="object"){for(var r in e){n[r]=e[r]}this.saveSettings(n)}else{return false}}}