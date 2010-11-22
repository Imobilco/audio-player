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
		active_player_class = 'imob-player-active',
		default_options = {
			auto_next: true
		};
	
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
	 * Returns playlist's ID of the track
	 * @param {Element} elem UI element that represents track
	 * @return {String|null}
	 */
	function getTrackId(elem) {
		return elem ? elem.getAttribute('data-playitem-id') : null;
	}
	
	
	/**
	 * Binds local events on container for speed improvement
	 * @param {Playlist} ctx
	 */
	function bindLocalEvents(ctx) {
		var wrapped = function(evt) {
			ctx.dispatchEvent(evt);
		};
		
		addEvent(ctx.continer, 'click', wrapped);
		ctx.proxy.getContext().addEventListener('ended', wrapped);
	}
	
	/**
	 * Playlist controller
	 * @class
	 * @param {IPlaylist} list List of available tracks
	 * @param {Element} container Element where to store player controls
	 * @param {playbackProxy} proxy Media proxy element
	 */
	var Playlist = this.Playlist = function(list, container, proxy, options) {
		this.list = list;
		this.continer = container;
		/** @type {playbackProxy} */
		this.proxy = proxy;
		
		this.options = mergeObjects(default_options, options || {});
		
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
				case 'ended':
					var cur_track_ix = this.getTrackIndex(this.proxy.getContext().getRoot());
					if (cur_track_ix != -1 && cur_track_ix < this.list.tracks.length - 1) {
						this.switchTrack(this._tracks_ui[cur_track_ix + 1]);
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
			
			var track = this.findTrack(player_elem);
			if (track) {
				// disable previuos track
				for (var j = 0, jl = this._tracks_ui.length; j < jl; j++) {
					removeClass(this._tracks_ui[j], active_player_class);
				}
				
				//activate current track
				addClass(player_elem, active_player_class);
				
				this.proxy.setSource(track.location);
				this.proxy.getContext().bindElement(player_elem);
				this.proxy.play();
			} else {
				console.log('track not found');
			}
		},
		
		/**
		 * Finds track record in playlist by its ID or UI element
		 * @return {IPlaylistItem|null}
		 */
		findTrack: function(item) {
			var ix = this.getTrackIndex(item);
			return ix != -1 ? this.list.tracks[ix] : null;
		},
		
		/**
		 * Returns track's index in playlist by its ID or UI element
		 * @param {String|Element} item Track ID or UI element's pointer
		 * @return {Number} Zero-based index or -1 if track wasn't found
		 */
		getTrackIndex: function(item) {
			if (typeof item != 'string') {
				item = getTrackId(bubbleSearch(item, player_root_class))
			}
			
			if (item) {
				for (var i = 0, il = this.list.tracks.length; i < il; i++) {
					if (this.list.tracks[i].id == item)
						return i;
				}
			}
			
			return -1;
		},
		
		/**
		 * Returns option value
		 * @return {Object}
		 */
		getOption: function(name) {
			return this.options[name];
		}
	}
})();