/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../imob_player.js"
 */(function(){
	var tracks_last_played = {},
		is_dirty = false,
		is_playing = false,
		timer;
	
	/**
	 * Returns ID of currently played or activated track
	 * @return {String}
	 */
	function getActiveTrackId() {
		var active_pl = imob_player.getActivePlaylist();
		if (active_pl) {
			return active_pl.getTrackId( active_pl.getUIContext().getRoot() );
		}
	}
	
	/**
	 * Load saved data from localStorage
	 * @return {Object} object with key/value pair where <code>key</code> is
	 * track ID and <code>value</code> is last played data
	 */
	function loadDataLocally(callback) {
		var storage = window.localStorage,
			key, data,
			re_key = /^track__/,
			result = {};
			
		for (var i = 0, il = storage.length; i < il; i++) {
			key = storage.key(i);
			if (re_key.test(key) && (data = storage.getItem(key))) {
				result[key.replace(re_key, '')] = JSON.parse(data);
			}
		}
		
		if (callback)
			callback(result);
		
		return result;
	}
	
	/**
	 * Updates playlist with last played data
	 * @param {Playlist} playlist
	 * @param {Object} last_played_data
	 */
	function updatePlaylist(playlist, last_played_data) {
		for (var p in last_played_data) if (last_played_data.hasOwnProperty(p)) {
			if (playlist.hasTrackId(p)) {
				/** @type {Element} */
				var elem = playlist.getTrackUI(p);
			}
		}
	}
	
	function storeDataLocally() {
		var storage = window.localStorage,
			track_id = getActiveTrackId(),
			data = JSON.stringify(createLastPlayedObject());
			
		console.log('storing last played data', track_id, data);
		storage.setItem('track__' + track_id, data);
	}
	
	function createLastPlayedObject() {
		return {
			time: +new Date,
			pos: imob_player.getMedia().getPosition()
		};
	}
	
	function store(force) {
		if (is_dirty || force) {
			storeDataLocally();
			is_dirty = false;
		}
	}
	
	function startPlaybackListener() {
		if (timer)
			clearTimeout(timer);
			
		// store data each 3 seconds
		timer = setTimeout(playbackListener, 3000);
	}
	
	function playbackListener() {
		store();
		if (is_playing) {
			startPlaybackListener();
		}
	}
	
	imob_player.getEventManager().addEventListener(EVT_PLAYING, function() {
		is_dirty = true;
	});
	
	// force data store on pause
	imob_player.getEventManager().addEventListener(EVT_PAUSE, function() {
		store(true);
		is_playing = false;
	});
	
	imob_player.getEventManager().addEventListener(EVT_PLAY, function() {
		is_playing = true;
		startPlaybackListener();
	});
	
	imob_player.getEventManager().addEventListener(EVT_PLAYLIST_CREATED, function(evt) {
		/** @type {Playlist} */
		var playlist = evt.data;
		
	});
})();