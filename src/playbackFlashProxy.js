/**
 * Controls audio file playback with Flash backend, 
 * sending playback events to context object.
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "playbackContext.js"
 * @include "eventManager.js"
 * @include "interfaces/IPlaylist.js"
 * @include "./lib/jwplayer/jwplayer.js"
 */
var playbackFlashProxy = (function(){
	/** @type {jwplayer} Media source */
	var media = null,
		/** @type {playbackContext} Player context UI */
		context,
		
		is_loop = false,
		last_seek_pos = 0,
		_options = {},
		
		/** 
		 * Position (in seconds) where media should start playing after data 
		 * becomes available. Set <code>null</code> if not start position 
		 * required
		 */
		start_pos = null;
		
	/**
	 * @param {Event}
	 */
	function onPlaybackStart(evt) {
		eventManager.dispatchEvent(EVT_PLAY);
	}
	
	/**
	 * @param {Event}
	 */
	function onPlaybackPause(evt) {
		pause();
	}
	
	/**
	 * Progress of media loading
	 * @param {Event} evt
	 */
	function onProgress(evt) {
		var start = last_seek_pos / evt.duration;
			
		eventManager.dispatchEvent(EVT_LOAD_PROGRESS, {
			start: start,
			end: Math.min(start + evt.bufferPercent / 100, 1)
		});
	}
	
	/**
	 * Playback reached the end of the track
	 * @param {Event} evt
	 */
	function onEnded(evt) {
		seek(0);
		
		if (is_loop)
			play();
		else
			pause();
		
		eventManager.dispatchEvent('ended');
	}
	
	/**
	 * Seek current track at specified position
	 * @param {Number} pos New position (in seconds)
	 */
	function seek(pos) {
		last_seek_pos = pos;
		media.seek(pos);
		var duration = media.getDuration();
		eventManager.dispatchEvent(EVT_SEEK, {
			position: pos,
			percent: pos / duration,
			duration: duration
		});
	}
	
	/**
	 * Is media currently playing
	 * @return {Boolean}
	 */
	function isPlaying() {
		return media.getState() == 'PLAYING';
	}
	
	
	/**
	 * Pause playback
	 * @param {Boolean} force Force pause regardless of media <code>paused</code>
	 * state. Firefox 3.5+ may run a looped media playback even if <code>paused</code>
	 * state is <code>true</code> so this flag will force media to stop  
	 */
	function pause(force) {
		if (isPlaying() || force) {
			media.pause(true);
			eventManager.dispatchEvent(EVT_PAUSE);
		}
	}
	
	function play() {
		media.play(true);
	}
	
	function updateContext(evt) {
		eventManager.dispatchEvent(EVT_PLAYING, {
			position: evt.position,
			duration: evt.duration
		});
	}
	
	function delegateEvent(evt) {
		eventManager.dispatchEvent(evt.type);
	}
		
	return {
		/**
		 * Init proxy
		 * @param {HTMLMediaElement} media
		 * @param {playbackContext} context
		 */
		init: function(options, ctx) {
			if (media === null) {
				var container = createElement('div');
				container.id = 'imob-jw-player';
				document.body.appendChild(container);
				
				media = jwplayer(container).setup({
					flashplayer: options.swf_url,
					width: 1,
					height: 1,
					events: {
						onPlay: onPlaybackStart,
						onPause: onPlaybackPause,
						onComplete: onEnded,
						onTime: updateContext,
						onBufferChange: onProgress
					}
				});
				
				delete options.swf_url;
				_options = options;
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
				
				last_seek_pos = 0;
				media.load(mergeObjects(_options, {
					duration: track.duration / 1000,
					file: track.location
				}));
				
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
			var item = media.getPlaylistItem(); 
			return item ? item.file : null;
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
			return media.getVolume();
		},
		
		/**
		 * Set new volume
		 * @param {Number} val New volume (from 0.0 to 1.0)
		 */
		setVolume: function(val) {
			media.setVolume(val * 100);
			eventManager.dispatchEvent(EVT_VOLUME, val);
		},
		
		/**
		 * Toggles playback of current track
		 */
		togglePlayback: function() {
			if (!this.isPlaying())
				this.play();
			else
				this.pause();
		},
		
		/**
		 * Returns current playback position (in seconds)
		 * @return {Number}
		 */
		getPosition: function() {
			return media.getPosition();
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
			return is_loop;
		},
		
		/**
		 * Enable or disable current track playback looping
		 * @param {Boolean} val
		 */
		setLoop: function(val) {
			is_loop = !!val;
			eventManager.dispatchEvent(EVT_LOOPING_CHANGED, false);
		},
		
		/**
		 * Check if current media is playing
		 * @return {Boolean}
		 */
		isPlaying: isPlaying,
		
		/**
		 * Returns duration (number of seconds) of currently played media
		 * @return {Number}
		 */
		getDuration: function() {
			return media.getDuration();
		},
		
		/**
		 * Text if current proxy backend is supported by browser
		 * @return {Boolean}
		 */
		isSupported: function() {
			return jwplayer.utils.hasFlash();
		},
		
		/**
		 * Returns proxy type ('html5' or 'flash')
		 * @return {String}
		 */
		getType: function() {
			return 'flash';
		},
		/**
		 * Check if current proxy can play specified media type
		 * @param {String} type File type ('mp3', 'ogg', etc.)
		 */
		canPlayType: function(type) {
			type = type.toLowerCase();
			return type == 'flv' || type == 'mp3';
		}
	};
})();