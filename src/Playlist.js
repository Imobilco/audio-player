/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "interfaces/IPlaylist.js"
 * @include "playerUIFactory.js"
 * @include "playbackProxy.js"
 * @include "playbackContext.js"
 * @include "utils.js"
 * 
 */

(function(){
	var is_global_events_bound = false,
		player_root_class = 'imob-player',
		active_player_class = 'imob-player-active';
	
	function bindGlobalEvents() {
		if (is_global_events_bound)
			return;
			
		is_global_events_bound = true;
	}
	
	/**
	 * Search for specified element, bubbling up the tree
	 * @param {Element} elem Element where to start searching
	 * @param {String} search_class Element's class to search for
	 * @return {Element|null} 
	 */
	function bubbleSearch(elem, search_class) {
		do {
			if (hasClass(elem, search_class))
				return elem;
			if (hasClass(elem, player_root_class))
				break;
		} while (elem = elem.parentNode);
		
		return null;
	}
	
	
	/**
	 * Binds local events on container for speed improvement
	 * @param {Playlist} ctx
	 */
	function bindLocalEvents(ctx) {
		addEvent(ctx.continer, 'click', function(evt) {
			ctx.dispatchEvent(evt);
		});
	}
	
	/**
	 * Dispatches incoming event
	 * @param {Event} evt
	 */
	function dispatchEvent(evt) {
		switch (evt.type) {
			case 'click':
				if (bubbleSearch(evt.target, 'imob-player-play-button')) {
					switchTrack(bubbleSearch(evt.target, player_root_class));
				}
				
				break;
		}
	}
	
	/**
	 * Play specified track
	 */
	function switchTrack(player_elem) {
		
	}
	
	
	/**
	 * Playlist controller
	 * @class
	 * @param {IPlaylist} list List of available tracks
	 * @param {Element} container Element where to store player controls
	 * @param {playbackProxy} proxy Media proxy element
	 */
	var Playlist = this.Playlist = function(list, container, proxy) {
		this.list = list;
		this.continer = container;
		/** @type {playbackProxy} */
		this.proxy = proxy;
		
		/** @type {Element[]} */
		this._tracks_ui = [];
		
		// create player controls
		var track, item, f = document.createDocumentFragment();
		for (var i = 0, il = list.tracks.length; i < il; i++) {
			/** @type {IPlaylistItem} */
			track = list.tracks[i];
			
			item = playerUIFactory(track);
			item.setAttribute('data-playitem-id', track.id);
			f.appendChild(item);
			this._tracks_ui.push(item);
		}
		
		bindGlobalEvents();
		bindLocalEvents(this);
		
		
		// add children on page
		container.appendChild(f);
	};
	
	Playlist.prototype = {
		/**
		 * Dispatches incoming event
		 * @param {Event} evt
		 */
		dispatchEvent: function(evt) {
			switch (evt.type) {
				case 'click':
					if (bubbleSearch(evt.target, 'imob-player-play-button')) {
						this.switchTrack(bubbleSearch(evt.target, player_root_class));
						evt.stopPropagation();
					}
					
					
					break;
			}
		},
		
		/**
		 * Play specified track
		 * @param {Element} player_elem
		 */
		switchTrack: function(player_elem) {
			if (hasClass(player_elem, active_player_class)) { // player is already active
				this.proxy.togglePlayback();
				return;
			}
			
			var track_id = player_elem.getAttribute('data-playitem-id');
			if (track_id) {
				var track;
				for (var i = 0, il = this.list.tracks.length; i < il; i++) {
					track = this.list.tracks[i];
					if (track.id == track_id) {
						// disable previuos track
						for (var j = 0, jl = this._tracks_ui.length; j < jl; j++) {
							removeClass(this._tracks_ui[j], active_player_class);
						}
						
						//activate current track
						addClass(player_elem, active_player_class);
						
						this.proxy.setSource(track.location);
						this.proxy.getContext().bindElement(player_elem);
						this.proxy.play();
						
						return;
					}
				}
			}
			
			console.log('track not found');
		}
	}
})();