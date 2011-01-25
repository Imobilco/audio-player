/**
 * Global object for playlist player framework 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "playbackProxy.js"
 * @include "playbackFlashProxy.js"
 * @include "playbackContext.js"
 * @include "eventManager.js"
 * @include "Playlist.js"
 * @include "imob_player.js"
 */var imob_player = (function(){
	/**
	 * List of all instatiated playlists
	 * @type {Playlist[]}
	 */
	var all_playlists = [],
		/** 
		 * Pointer to playlist that contains currently playing track
		 * @type {Playlist} 
		 */
		active_playlist,
		default_options = {
			swf_url: '../src/lib/jwplayer/player.swf',
			provider: 'http'
		},
		media,
		options = {},
		check_order = ['flv', 'mp3', 'ogg'];
		
	/**
	 * Search for playlist that contains played track
	 * @return {Playlist}
	 */
	function getPlaylistForTrack(track_id) {
		for (var i = 0, il = all_playlists.length; i < il; i++) {
			if (all_playlists[i].hasTrackId(track_id)) {
				return all_playlists[i];
			}
		}
	}
	
	// save all created playlists
	eventManager.addEventListener(EVT_PLAYLIST_CREATED, function(evt) {
		all_playlists.push(evt.data);
	});
	
	// store active playlist
	eventManager.addEventListener(EVT_PLAY, function() {
		var track_ui = imob_player.getMedia().getContext().getRoot();
		active_playlist = getPlaylistForTrack( getTrackId(track_ui) );
	});
	
	function initMedia() {
		media = playbackProxy.isSupported() ? playbackProxy : playbackFlashProxy;
		media.init(options, playbackContext);
	}
	
	return {
		
		/**
		 * Returns proxy object used for media playback
		 * @return {playbackProxy}
		 */
		getMedia: function() {
			return media;
		},
		
		/**
		 * Force media player to use specified proxy
		 * @param {playbackProxy} proxy
		 */
		setMedia: function(proxy, opt) {
			media = proxy;
			options = mergeObjects(default_options, opt || {});
			media.init(options, playbackContext);
		},
		
		/**
		 * Return specified media proxy object
		 * @param {String} name Proxy name ('html5' or 'flash')
		 */
		getProxy: function(name) {
			if ((name || '').toLowerCase() == 'html5')
				return playbackProxy;
			else
				return playbackFlashProxy;
		},
		
		/**
		 * Returns event manager that dispatches all event inside player framework
		 * @return {EventDispatcher}
		 */
		getEventManager: function() {
			return eventManager;
		},
		
		/**
		 * Returns class that constructs playlist
		 */
		getPlaylistClass: function() {
			return Playlist;
		},
		
		/**
		 * Returns list of all constructed playlists
		 * @return {Playlist[]}
		 */
		getAllPlaylists: function() {
			return all_playlists;
		},
		
		/**
		 * @return {Playlist}
		 */
		getActivePlaylist: function() {
			return active_playlist;
		},
		
		/**
		 * Returns ID of currently active or played track
		 * @return {String}
		 */
		getActiveTrackId: function() {
			return getTrackId( this.getMedia().getContext().getRoot() );
		},
		
		/**
		 * Search for playlist that contains played track
		 * @param {String} track_id
		 * @return {Playlist}
		 */
		getPlaylistForTrack: getPlaylistForTrack,
		
		/**
		 * Returns playlist item by its ID
		 * @param {String} id
		 * @return {IPlaylistItem}
		 */
		getTrackById: function(id) {
			var pl = getPlaylistForTrack(id);
			return pl ? pl.findTrack(id) : null;
		},
		
		/**
		 * Setup player for initial use
		 * @param {Object} opt Player options
		 */
		setup: function(opt) {
			options = mergeObjects(default_options, opt || {});
			
			if (!media)
				initMedia();
		},
		
		/**
		 * Create playlist item from loaded and parsed playlist data
		 * @param {Object} files Hash of playlist files, organized by their extension
		 * @param {Element} container Where to place all UI data
		 * @return {Playlist}
		 */
		createPlaylist: function(files, container, opt) {
			this.setup(opt);
			
			for (var i = 0, il = check_order.length; i < il; i++) {
				var ext = check_order[i];
				if (ext in files && media.canPlayType(ext)) {
					return new Playlist(files[ext], container, media);
				}
			}
		}
	};
})();
	
		