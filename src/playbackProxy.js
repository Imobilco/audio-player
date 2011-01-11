/**
 * Controls audio file playback, sending playback events to context object
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "playbackContext.js"
 * @include "eventManager.js"
 * @include "interfaces/IPlaylist.js"
 */
var playbackProxy = (function(){
	/** @type {Element} Media source */
	var media = null,
		/** @type {playbackContext} Player context UI */
		context,
		
		play_timer,
		/** 
		 * Position (in seconds) where media should start playing after data 
		 * becomes available. Set <code>null</code> if not start position 
		 * required
		 */
		start_pos = null,
		
		mime_types = {
			mp3: 'audio/mpeg',
			ogg: 'audio/ogg'
		},
		
		/**
		 * Identifies resource as ready to be played
		 */
		resource_ready = false,
		ready_to_play = false,
		need_to_play = false;
		
	function canPlay(type) {
		var r = media.canPlayType(type);
		return r && r != 'no';
	}
		
	/**
	 * @param {Event}
	 */
	function onPlaybackStart(evt) {
		clearTimer();
		eventManager.dispatchEvent(EVT_PLAY);
		play_timer = setInterval(updateContext, 15);
	}
	
	/**
	 * @param {Event}
	 */
	function onPlaybackPause(evt) {
		pause();
	}
	
	/**
	 * Playback reached the end of the track
	 * @param {Event} evt
	 */
	function onEnded(evt) {
		if (!media.loop) {
			seek(0);
			pause();
		}
			
		delegateEvent(evt);
	}
	
	/**
	 * Progress of media loading
	 * @param {Event} evt
	 */
	function onProgress(evt) {
		var start = 0,
			end = 0;
			
		if (media.buffered) {
			var range = media.buffered;
			if (range.length) {
				start = range.start(0) / media.duration;
				end = range.end(range.length - 1) / media.duration;
			}
		} else if ('loaded' in evt) {
			start = 0;
			end = evt.loaded / evt.total
		}
		
		eventManager.dispatchEvent(EVT_LOAD_PROGRESS, {
			start: start,
			end: end
		});
	}
	
	/**
	 * Handles media data loading
	 * @param {Event} evt
	 */
	function onReadyStateChange(evt) {
		resource_ready = true;
		if (start_pos !== null) {
			seek(start_pos);
			play();
			start_pos = null;
		}
	}
	
	/**
	 * Seek current track at specified position
	 * @param {Number} pos New position (in seconds)
	 */
	function seek(pos) {
		if (media.readyState == media.HAVE_NOTHING) {
			// delay seeking before data is loaded
			start_pos = pos;
		} else {
			media.currentTime = pos;
			eventManager.dispatchEvent(EVT_SEEK, {
				position: pos,
				percent: pos / media.duration,
				duration: media.duration
			});
		}
	}
	
	/**
	 * Pause playback
	 * @param {Boolean} force Force pause regardless of media <code>paused</code>
	 * state. Firefox 3.5+ may run a looped media playback even if <code>paused</code>
	 * state is <code>true</code> so this flag will force media to stop  
	 */
	function pause(force) {
		clearTimer();
		if (!media.paused || force) {
			media.pause();
			eventManager.dispatchEvent(EVT_PAUSE);
		}
	}
	
	function play() {
		if (!resource_ready)
			media.load();
		media.play();
	}
	
	function clearTimer() {
		if (play_timer)
			clearInterval(play_timer);
	}
	
	function updateContext() {
		if (resource_ready)
			eventManager.dispatchEvent(EVT_PLAYING, {
				position: media.currentTime,
				duration: media.duration
			});
	}
	
	function delegateEvent(evt) {
		eventManager.dispatchEvent(evt.type);
	}
		
	/**
	 * Attaches playback events to media element to keep track of its progress
	 * @param {Element} elem
	 */
	function attachEvents(elem) {
		addEvent(elem, 'play', onPlaybackStart);
		addEvent(elem, 'pause ended', onPlaybackPause);
		addEvent(elem, 'ended', onEnded);
		
		addEvent(elem, 'progress', onProgress);
		
		addEvent(elem, 'loadedmetadata', onReadyStateChange);
	}
	
	return {
		/**
		 * Init proxy
		 * @param {Object} options
		 * @param {playbackContext} context
		 */
		init: function(options, ctx) {
			if (media === null) {
				media = new Audio;
			}
			
			// TODO add some options
			
			if (!media.hasAttachedEvents) {
				attachEvents(media);
				media.hasAttachedEvents = true;
			}
				
			if (ctx)
				this.setContext(ctx);
		},
		
		/**
		 * Sets player UI context
		 * @param {playbackContext} ctx
		 */
		setContext: function(ctx) {
			context = ctx;
			context.setProxy(this);
		},
		
		/**
		 * Returns player UI context
		 * @return {playbackContext}
		 */
		getContext: function() {
			return context;
		},
		
		/**
		 * Set current playback media source
		 * @param {IPlaylistItem} track
		 */
		setSource: function(track) {
			var last_source = this.getSource();
			if (last_source != track.location) {
				if (last_source)
					this.pause();
				
				eventManager.dispatchEvent(EVT_SOURCE_BEFORE_CHANGE, {
					currentSource: this.getSource(),
					newSource: track.location
				});
				
				resource_ready = false;
				media.src = track.location;
				
				eventManager.dispatchEvent(EVT_SOURCE_CHANGED, {
					currentSource: this.getSource(),
					lastSource: last_source
				});
			}
		},
		
		/**
		 * Returns current playback source url
		 * @return {String}
		 */
		getSource: function() {
			return media.currentSrc;
		},
		
		/**
		 * Start playback of current source
		 */
		play: play,
		
		/**
		 * Pause playback
		 */
		pause: pause,
		
		/**
		 * Returns current source volume
		 * @return {Number} from 0.0 to 1.0
		 */
		getVolume: function() {
			return media.volume;
		},
		
		/**
		 * Set new volume
		 * @param {Number} val New volume (from 0.0 to 1.0)
		 */
		setVolume: function(val) {
			media.volume = parseFloat(val);
			eventManager.dispatchEvent(EVT_VOLUME, media.volume);
		},
		
		/**
		 * Toggles playback of current track
		 */
		togglePlayback: function() {
			if (media.paused)
				this.play();
			else
				this.pause();
		},
		
		/**
		 * Returns current playback position (in seconds)
		 * @return {Number}
		 */
		getPosition: function() {
			return media.currentTime;
		},
		
		/**
		 * Set new playback position (synonym of <code>seek()</code>)
		 * @param {Number} val New position (in seconds)
		 */
		setPosition: function(val) {
			seek(val);
		},
		
		/**
		 * Seek current track at specified position
		 * @param {Number} pos New position (in seconds)
		 */
		seek: seek,
		
		/**
		 * Seek current track at specified position
		 * @param {Number} pos New position (from 0.0 to 1.0)
		 */
		seekPercent: function(pos) {
			seek(this.getDuration() * pos);
		},
		
		/**
		 * Check if current track playback is looped
		 * @return {Boolean}
		 */
		getLoop: function() {
			return media.loop;
		},
		
		/**
		 * Enable or disable current track playback looping
		 * @param {Boolean} val
		 */
		setLoop: function(val) {
			media.loop = !!val;
			eventManager.dispatchEvent(EVT_LOOPING_CHANGED, media.loop);
		},
		
		/**
		 * Check if current media is playing
		 * @return {Boolean}
		 */
		isPlaying: function() {
			return !media.paused;
		},
		
		/**
		 * Returns duration (number of seconds) of currently played media
		 * @return {Number}
		 */
		getDuration: function() {
			return media.duration;
		},
		
		/**
		 * Text if current proxy backend is supported by browser
		 * @return {Boolean}
		 */
		isSupported: function() {
			var audio = document.createElement('audio');
			return !!audio.canPlayType;
		},
		
		/**
		 * Returns proxy type ('html5' or 'flash')
		 * @return {String}
		 */
		getType: function() {
			return 'html5';
		},
		
		/**
		 * Check if current proxy can play specified media type
		 * @param {String} type File type ('mp3', 'ogg', etc.)
		 */
		canPlayType: function(type) {
			type = (type || '').toLowerCase();
			return (type in mime_types) ? canPlay(mime_types[type]) : false;
		}
	};
})();