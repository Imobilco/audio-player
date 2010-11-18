/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */function EventDispatcher() {
	this.listenerChain = {};
	
}

EventDispatcher.prototype = {
	/**
	 * Adds event listener
	 * @param {String|Array} type Event name(s), an array of strings or space-separated string
	 * @param {Function} listener Event listener
	 * @param {Boolean} only_once Run listener only once and then remove itself
	 */
	addEventListener : function(type, listener, only_once){
		if(!listener instanceof Function)
			throw new Error("Listener isn't a function");
			
		type = typeof(type) == 'string' ? type.split(' ') : type;
		
		var chain = this.listenerChain;
		for (var i = 0; i < type.length; i++) {
			if (!chain[type[i]])
				chain[type[i]] = [];
				
			if (!this.hasEventListener(type[i], listener))
				chain[type[i]].push({
					once: !!only_once,
					fn: listener
				});
		}
	},
	
	/**
	 * Check if listener already bound
	 * @param {String} type Event name
	 * @param {Function} [listener] Event listener. If not provided, this will 
	 * test listener chain of passed type exists
	 * @return {Boolean}
	 */
	hasEventListener : function(type, listener) {
		var list = this.listenerChain[type];
		if (!listener)
			return !!list;
		else {
			for (var i = 0, il = list.length; i < il; i++) {
				if (list[i].fn === listener)
					return true;
			}
			
			return false;
		}
	},

	/**
	 * Removes event listener
	 * @param {String|Array} type Event name(s), an array of strings or space-separated string
	 * @param {Function} [listener] Event listener. If not provided, all event 
	 * of passed type will be removed
	 */
	removeEventListener : function(type, listener){
		if(!this.hasEventListener(type))
			return false;
		
		if (!listener)
			this.listenerChain[type] = null;
		else {
			var list = this.listenerChain[type];
			for (var i = 0, il = list.length; i < il; i++) {
				if(list[i].fn === listener)
					list.splice(i, 1);
			}
		}
		
		return true;
	},
	
	/**
	 * Dispatches event
	 * @param {String} type Event name
	 * @param {Object} [args] List of additional arguments passed to listener
	 * as <code>event.data</code>
	 * @return {Boolean} If event was successfully dispatched
	 */
	dispatchEvent : function(type, args){
		if(!this.hasEventListener(type))
			return false;
			
		var list = this.listenerChain[type],
			to_delete = [],
			evt = {
				type: type,
				target: this
			};
			
		if (typeof args != 'undefined')
			evt.data = args;
			
		for (var i = 0, il = list.length; i < il; i++) {
			list[i].fn(evt);
			if (list[i].once)
				to_delete.push(list[i].fn);
		}
			
		for (var j = 0, jl = to_delete.length; j < jl; j++) {
			this.removeEventListener(type, to_delete[j]);
		}
			
		return true;
	}
}