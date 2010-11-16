/**
 * Audio player
 * @class
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */var AudioPlayer = (function(){
	/**
	 * Use single instance of internal audio player for better performance
	 * and control
	 */
	var audio_instance,
		format = 'mp3';
	
	// get info about current environment
	if (window.Audio) {
		audio_instance = new Audio();
		audio_instance.autoplay = false;
		audio_instance.loop = false;
		audio_instance.preload = false;
		
		if (canPlay(audio_instance, 'audio/mpeg'))
			format = 'mp3';
		else if (canPlay(audio_instance, 'audio/ogg'))
			format = 'ogg';
		else
			format = '';
	}
	
	var env = {
		is_native: !!audio_instance && format
	};
	
	/**
	 * Check if media source can play specified media type
	 * @param {MediaSource} media
	 * @param {String} mime
	 * @return {Boolean}
	 */
	function canPlay(media, mime) {
		var r = media.canPlayType('audio/mpeg');
		return r && r != 'no';
	}
	
	/**
	 * Native HTML5 audioplayer
	 * @class
	 * @param {XSPF|String} src Playlist or url to playable file
	 * @param {Object} options Options for current player
	 * @param {Boolean} options.autoplay Automatically play first file
	 * @param {Boolean} options.autobuffer Automatically start downloading first file
	 */
	function NativePlayer(src, options) {
		
	}
	
	NativePlayer.prototype = {
		/**
		 * Play current audio file or file from playlist by index
		 */
		play: function(ix) {
			
		},
		
		/**
		 * Pause playback
		 */
		pause: function() {
			
		},
		
		/**
		 * Stops playback and rewinds current track at the beginning
		 */
		stop: function() {
			
		},
		
		/**
		 * Check if there's next track in the queue
		 * @return {Boolean}
		 */
		hasNext: function() {
			
		},
		
		/**
		 * Check if there's previous track in the queue
		 * @return {Boolean}
		 */
		hasPrev: function() {
			
		},
		
		/**
		 * Go to next track. Returns current object for chaining
		 * @return {Player}
		 */
		next: function() {
			
		},
		
		/**
		 * Go to previous track. Returns current object for chaining
		 * @return {Player}
		 */
		prev: function() {
			
		},
		
		/**
		 * Returns total amount of tracks in playlist
		 */
		length: function() {
			
		},
		
		/**
		 * Sets or returns new volume
		 * @param {Number} val New volume (from 0 to 1)
		 * @return {Number} Current volume
		 */
		volume: function(val) {
			
		},
		
		/**
		 * Move playhead of current track at specified position
		 * @param {Number} pos New position (from 0 to 1)
		 */
		goTo: function(pos) {
			
		},
		
		/**
		 * Returns current playhead position (from 0 to 1)
		 * @return {Number}
		 */
		getPosition: function() {
			
		},
		
		/**
		 * Returns current playhead position in time (seconds)
		 * @return {Number}
		 */
		getTime: function() {
			
		},
		
		/**
		 * Returns duration of current of specified by <code>ix</code> param
		 * track
		 * @return {Number} Duration in seconds
		 */
		getDuration: function(ix) {
			
		},
		
		/**
		 * Returns index of current track in playlist
		 * @return {Number}
		 */
		getIndex: function() {
			
		}
	};
	
	return NativePlayer || {}; // || {} is needed for Spket editor to show code outline
})();