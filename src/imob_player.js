/**
 * Global object for playlist player framework 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "playbackProxy.js"
 * @include "playbackContext.js"
 * @include "eventManager.js"
 * @include "Playlist.js"
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
		active_playlist;
	
	// save all created playlists
	eventManager.addEventListener(EVT_PLAYLIST_CREATED, function(evt) {
		all_playlists.push(evt.data);
	});
	
	// store active playlist
	eventManager.addEventListener(EVT_PLAY, function() {
		var track_ui = playbackProxy.getContext().getRoot(),
			track_id = getTrackId(track_ui);
			
		active_playlist = null;
		for (var i = 0, il = all_playlists.length; i < il; i++) {
			if (all_playlists[i].hasTrackId(track_id)) {
				console.log('store active playlist', all_playlists[i]);
				active_playlist = all_playlists[i];
				break;
			}
		}
	});
	
	
	return {
		/**
		 * Returns proxy object used for media playback
		 * @return {playbackProxy}
		 */
		getMedia: function() {
			return playbackProxy;
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
		}
	};
})();
	
		