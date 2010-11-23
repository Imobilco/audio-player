/**
 * Controls audio file playback, sending playback events to context object
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "playbackContext.js"
 */

var playbackProxy = (function(){
	/** @type {Element} Media source */
	var media,
		/** @type {playbackContext} Player context UI */
		context,
		
		play_timer;
		
	/**
	 * @param {Event}
	 */
	function onPlaybackStart(evt) {
		clearTimer();
		play_timer = setInterval(updateContext, 100);
		context.dispatchEvent('play');
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
	 * Seek current track at specified position
	 * @param {Number} pos New position (in seconds)
	 */
	function seek(pos) {
		media.currentTime = pos;
		context.dispatchEvent('seek', {
			position: pos,
			percent: pos / media.duration,
			duration: media.duration
		});
	}
	
	/**
	 * Pause playback
	 */
	function pause() {
		media.pause();
		clearTimer();
		context.dispatchEvent('pause');
	}
	
	function clearTimer() {
		if (play_timer)
			clearInterval(play_timer);
	}
	
	function updateContext() {
		if (context) {
			context.dispatchEvent('playing', {
				position: media.currentTime,
				duration: media.duration
			});
		}
	}
	
	function delegateEvent(evt) {
		if (context) {
			context.dispatchEvent(evt.type);
		}
	}
		
	/**
	 * Attaches playback events to media element to keep track of its progress
	 * @param {Element} elem
	 */
	function attachEvents(elem) {
		addEvent(elem, 'play', onPlaybackStart);
		addEvent(elem, 'pause ended', onPlaybackPause);
		addEvent(elem, 'ended', onEnded);
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
			if (this.getSource() != url) {
				this.pause();
				media.src = url;
				context.dispatchEvent('source_change', this.getSource());
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
			context.dispatchEvent('volume', media.volume);
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
			context.dispatchEvent('loop', media.volume);
		},
		
		/**
		 * Check if current media is playing
		 * @return {Boolean}
		 */
		isPlaying: function() {
			return !media.paused;
		}
		
	};
})();