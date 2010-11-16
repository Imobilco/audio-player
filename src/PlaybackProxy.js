/**
 * Controls audio file playback, sending playback events to context object
 * @class
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 */function PlaybackProxy(media) {
	this._media = media;
	
	/** Context object which will receive all playback events */
	this.context = null;
	
	// attach events to the media source
}