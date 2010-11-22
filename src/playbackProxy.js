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
		addEvent(elem, 'ended', delegateEvent);
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
		pause: function() {
			media.pause();
			onPlaybackPause();
		},
		
		/**
		 * Get/set new volume
		 * @param {Number} [val] New volume (from 0.0 to 1.0)
		 * @return {Number} current volume (from 0.0 to 1.0)
		 */
		volume: function(val) {
			if (typeof val != 'undefined')
				media.volume = parseFloat(val);
				
			return media.volume;
		},
		
		togglePlayback: function() {
			if (media.paused)
				this.play();
			else
				this.pause();
		}
	};
})();