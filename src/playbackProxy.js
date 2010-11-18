/**
 * Controls audio file playback, sending playback events to context object
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "PlaybackContext.js"
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
		if (context)
			context.updateUI(media.currentTime, media.duration);
	}
		
	/**
	 * Attaches playback events to media element to keep track of its progress
	 * @param {Element} elem
	 */
	function attachEvents(elem) {
		addEvent(elem, 'play', onPlaybackStart);
		addEvent(elem, 'pause', onPlaybackPause);
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
		}
	}
})();