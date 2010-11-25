/**
 * Controls audio file playback, sending playback events to context object
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "playbackContext.js"
 * @include "eventManager.js"
 */

var playbackProxy = (function(){
	/** @type {Element} Media source */
	var media,
		/** @type {playbackContext} Player context UI */
		context,
		
		play_timer,
		/** 
		 * Position (in seconds) where media should start playing after data 
		 * becomes available. Set <code>null</code> if not start position 
		 * required
		 */
		start_pos = null,
		
		/**
		 * Identifies resource as ready to be played
		 */
		resource_ready = false;
		
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
		var range = media.buffered;
		eventManager.dispatchEvent(EVT_LOAD_PROGRESS, {
			start: range.start(0) / media.duration,
			end: range.end(range.length - 1) / media.duration
		});
	}
	
	/**
	 * Handles media data loading
	 * @param {Event} evt
	 */
	function onReadyStateСhange(evt) {
		resource_ready = true;
		var media = evt.target;
		if (start_pos !== null) {
			seek(start_pos);
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
	 */
	function pause() {
		clearTimer();
		if (!media.paused) {
			media.pause();
			eventManager.dispatchEvent(EVT_PAUSE);
		}
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
		
		addEvent(elem, 'loadedmetadata', onReadyStateСhange);
	}
	
	return {
		/**
		 * Init proxy
		 * @param {HTMLMediaElement} media
		 * @param {playbackContext} context
		 */
		init: function(elem, ctx) {
			media = elem;
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
		 * @param {String} url
		 */
		setSource: function(url) {
			var last_source = this.getSource();
			if (last_source != url) {
				if (last_source)
					this.pause();
				
				eventManager.dispatchEvent(EVT_SOURCE_BEFORE_CHANGE, {
					currentSource: this.getSource(),
					newSource: url
				});
				
				resource_ready = false;
				media.src = url;
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
		play: function() {
			media.play();
		},
		
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
			this.seek(val);
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
			seek(media.duration * pos);
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
			eventManager.dispatchEvent(EVT_LOOPING_CHANGED, media.volume);
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
		}
		
	};
})();