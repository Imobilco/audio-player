/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../imob_player.js"
 */(function(){
	var tracks_last_played = {},
		is_dirty = false,
		is_playing = false,
		has_storage = window.localStorage && window.JSON,
		/** 
		 * Play threshold (in percents) when to restore last played data.
		 * If played length is less than this threshold, data won't be restored 
		 */
		min_threshold = 0.05,
		/**
		 * Max threshold. Track is recognized as completely played if its play 
		 * position is greater than max threshold.
		 */
		max_threshold = 0.98,
		/** Max played position */
		max_play_pos = 0,
		/** @type {Element} Play button that reflexes max played position */
		play_btn,
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
		if (!has_storage)
			return {};
			
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
		return padNum(dt.getDate()) + '.' + padNum(dt.getMonth() + 1) + '.' + padNum(dt.getFullYear());
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
					
				if (prc > min_threshold && prc < max_threshold) {
					// adjust play progress
					setCSS(last_played_progress, {width: ( (1 - prc) * 100 ) + '%'});
					shaft.appendChild(last_played_progress);
				}
				
				// format date
				addText(getOneByClass('imob-player-track-last-play', elem), makeLastPlayedDate(data.time))
				if (data.max)
					setCSS(play_btn, {backgroundPosition: Math.round(-20 * (1 - data.max * 1000 / track.duration)) + 'px 0px'});
			}
		}
	}
	
	function storeDataLocally() {
		if (!has_storage) return;
		
		var storage = window.localStorage,
			track_id = getActiveTrackId(),
			data = JSON.stringify(createLastPlayedObject());
			
		storage.setItem('track__' + track_id, data);
	}
	
	function createLastPlayedObject() {
		return {
			time: +new Date,
			pos: imob_player.getMedia().getPosition(),
			max: max_play_pos
		};
	}
	
	function store(force) {
		if (is_dirty || force) {
			storeDataLocally();
			is_dirty = false;
		}
	}
	
	function stopTimer() {
		if (timer)
			clearTimeout(timer);
	}
	
	function startPlaybackListener() {
		stopTimer();
			
		// store data each 3 seconds
		timer = setTimeout(playbackListener, 3000);
	}
	
	function playbackListener() {
		store();
		if (is_playing) {
			startPlaybackListener();
		}
	}
	
	function updateMaxPlayPos(pos) {
		if (pos > max_play_pos) {
			max_play_pos = Math.min(pos, media.getDuration());
			
			var media = imob_player.getMedia();
			
			if (!play_btn)
				play_btn = getOneByClass('imob-player-play-button', 
					media.getContext().getRoot());
					
			setCSS(play_btn, {backgroundPosition: Math.round(-20 * (1 - max_play_pos / media.getDuration())) + 'px 0px'});
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
	
	evt_manager.addEventListener(EVT_PLAYING, function(evt) {
		is_dirty = true;
		updateMaxPlayPos(evt.data.position);
	});
	
	// force data store on pause
	evt_manager.addEventListener(EVT_PAUSE, function() {
		stopTimer();
		store(true);
		is_playing = false;
	});
	
	evt_manager.addEventListener(EVT_PLAY, function(evt) {
		is_playing = true;
		play_btn = null;
		var track_id = imob_player.getActiveTrackId();
		
		max_play_pos = 0;
		if (track_id && track_id in tracks_last_played) {
			max_play_pos = tracks_last_played[track_id].max || 0;
		}
		
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
			var track = imob_player.getTrackById(track_id),
				prc = data.pos * 1000 / track.duration;
			
			if (prc > min_threshold && prc < max_threshold) {
				media.setPosition(data.pos);
				// force UI update
				media.getContext().updateUI(data.pos, playlist.findTrack(track_id).duration / 1000);
			}
			
			data.was_restored = true;
//			if (!data.was_restored) {
//			}
		}
	});
	
	// LOC start module
	load();
})();