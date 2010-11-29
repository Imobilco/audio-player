/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "interfaces/IPlaylist.js"
 * @include "playerUIFactory.js"
 * @include "playbackProxy.js"
 * @include "playbackContext.js"
 * @include "utils.js"
 * @include "eventManager.js"
 */

(function(){
	var is_global_events_bound = false,
		player_root_class = 'imob-player',
		active_player_class = 'imob-player-active',
		default_options = {
			auto_next: true // TODO implement
		},
		/** @type {Playlist} Pointer to playlist that contains currently playing track*/
		active_playlist;
	
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
		var wrapped = function(evt) {
			ctx.dispatchEvent(evt);
		};
		
		addEvent(ctx.continer, 'click', wrapped);
		eventManager.addEventListener('ended', wrapped);
	}
	
	var _id = 0;
	function generateId() {
		return '__playlist' + (_id++);
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
		this.id = generateId();
		
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
		
		eventManager.dispatchEvent(EVT_PLAYLIST_CREATED, this);
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
					if (!this.proxy.getLoop()) {
						var cur_track_ix = this.getTrackIndex(this.proxy.getContext().getRoot());
						if (cur_track_ix != -1 && cur_track_ix < this.list.tracks.length - 1) {
							this.switchTrack(this._tracks_ui[cur_track_ix + 1]);
						} else {
							this.proxy.pause(true);
						}
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
				this.proxy.getContext().bindElement(player_elem);
				this.proxy.setSource(track.location);
				this.proxy.play();
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
		 * Returns track internal ID
		 * @param {Number|Element} track Track index or its UI element
		 * @return {String}
		 */
		getTrackId: function(track) {
			if (typeof item == 'number')
				return this.list.tracks[track].id;
			else
				return getTrackId(track);
		},
		
		/**
		 * Check if current playlist contains track with specified ID
		 * @param {String} id
		 * @return {Boolean}
		 */
		hasTrackId: function(id) {
			return this.getTrackIndex(id) !== -1;
		},
		
		/**
		 * Returns option value
		 * @return {Object}
		 */
		getOption: function(name) {
			return this.options[name];
		},
		
		/**
		 * Returns UI context that represents player interface
		 * @return {playbackContext}
		 */
		getUIContext: function() {
			return this.proxy.getContext();
		},
		
		/**
		 * Returns UI element bound to media track
		 * @param {Number|String} track Track index or ID
		 * @return {Element}
		 */
		getTrackUI: function(track) {
			if (typeof track != 'number')
				track = this.getTrackIndex(track);
				
			return this._tracks_ui[track];
		},
		
		/**
		 * Returns list of tracks
		 * @return {IPlaylistItem[]}
		 */
		getTracks: function() {
			return this.list.tracks;
		},
		
		/**
		 * Returns playlist id
		 */
		getId: function() {
			return this.id;
		}
	};
})();