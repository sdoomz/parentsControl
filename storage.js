function StorageMgr(options) {
	this.name = options.name;
}

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
}