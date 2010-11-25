/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../imob_player.js"
 */(function(){
	var tracks_last_played = {},
		is_dirty = false,
		is_playing = false,
		/** 
		 * Play threshold (in percents) when to restore last played data.
		 * If played length is less than this threshold, data won't be restored 
		 */
		threshold = 0.05,
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
	 * Formats last played date in dd.mm.yyyy format
	 * @param {Number} milliseconds
	 */
	function makeLastPlayedDate(milliseconds) {
		var dt = new Date(milliseconds);
		return padNum(dt.getDate()) + '.' + padNum(dt.getMonth()) + '.' + padNum(dt.getFullYear());
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
				var elem = playlist.getTrackUI(p),
					/** @type {IPlaylistItem} */
					track = playlist.findTrack(p),
					data = last_played_data[p],
					play_btn = getOneByClass('imob-player-play-button', elem),
					shaft = getOneByClass('imob-player-shaft', elem),
					last_played_progress = createElement('div', 'imob-player-last-played-progress'),
					prc = data.pos * 1000 / track.duration;
					
				if (prc > threshold) {
					// adjust play progress
					setCSS(play_btn, {backgroundPosition: Math.round(-20 * (1 - prc)) + 'px 0px'});
					setCSS(last_played_progress, {width: ( (1 - prc) * 100 ) + '%'});
					
					// format date
					addText(getOneByClass('imob-player-track-last-play', elem), makeLastPlayedDate(data.time))
					shaft.appendChild(last_played_progress);
				}
			}
		}
	}
	
	function storeDataLocally() {
		var storage = window.localStorage,
			track_id = getActiveTrackId(),
			data = JSON.stringify(createLastPlayedObject());
			
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
	
	/**
	 * Loads last-played data and updates playlists
	 */
	function load() {
		tracks_last_played = loadDataLocally();
		var pls = imob_player.getAllPlaylists();
		for (var i = 0, il = pls.length; i < il; i++) {
			updatePlaylist(pls[i], tracks_last_played);
		}
		
		// add handler for newly created playlists
		imob_player.getEventManager().addEventListener(EVT_PLAYLIST_CREATED, function(evt) {
			updatePlaylist(evt.data, tracks_last_played);
		});
	}
	
	var evt_manager = imob_player.getEventManager();
	
	evt_manager.addEventListener(EVT_PLAYING, function() {
		is_dirty = true;
	});
	
	// force data store on pause
	evt_manager.addEventListener(EVT_PAUSE, function() {
		store(true);
		is_playing = false;
	});
	
	evt_manager.addEventListener(EVT_PLAY, function(evt) {
		is_playing = true;
		startPlaybackListener();
	});
	
	evt_manager.addEventListener(EVT_SOURCE_CHANGED, function() {
		// try to restore playback position, if available
		/** @type {playbackProxy} */
		var media = imob_player.getMedia(),
			track_id = imob_player.getActiveTrackId(),
			playlist = imob_player.getPlaylistForTrack(track_id);
			
		if (track_id && track_id in tracks_last_played) {
			// we have restored last play data
			var data = tracks_last_played[track_id];
			if (!data.was_restored) {
				media.setPosition(data.pos);
				// force UI update
				media.getContext().updateUI(data.pos, playlist.findTrack(track_id).duration / 1000);
				data.was_restored = true;
			}
		}
	});
	
	
	
	// LOC start module
	load();
})();