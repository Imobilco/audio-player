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
 */

var playbackFlashProxy = (function(){
	/** @type {Element} Media source */
	var media = null,
		/** @type {playbackContext} Player context UI */
		context,
		cur_source = null,
		cur_volume = 1,
		
		re_msie = /(msie) ([\w.]+)/,
		is_msie = re_msie.test(navigator.userAgent.toLowerCase()),
		
		config = {
			id: 'imob-player',
			fid: 'imob-player-backend-flash',
			swf: '../src/Jplayer.swf',
			volume: cur_volume * 100
		},
		
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
		resource_ready = false,
		ready_to_play = false,
		need_to_play = false;
		
	/**
	 * Flash interface for sending events
	 */
	var flash_iface = {
		onLoadProgress: function(loaded, total) {
			eventManager.dispatchEvent(EVT_LOAD_PROGRESS, {
				start: 0,
				end: loaded / total
			});
		},
		
		onPlaybackStart: function() {
			console.log('playback start');
			try {
				onPlaybackStart();
			} catch (e) {
				console.log(e);
			}
		}
	}
		
		
	function initFlash(config) {
		if(is_msie) {
			var html_obj = '<object id="' + config.fid + '"';
			html_obj += ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
			html_obj += ' codebase="' + document.URL.substring(0,document.URL.indexOf(':')) + '://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"'; // Fixed IE non secured element warning.
			html_obj += ' type="application/x-shockwave-flash"';
			html_obj += ' width="1" height="1">';
			html_obj += '</object>';

			var obj_param = new Array();
			obj_param[0] = '<param name="movie" value="' + config.swf + '" />';
			obj_param[1] = '<param name="quality" value="high" />';
			obj_param[2] = '<param name="FlashVars" value="id=' + escape(config.id) + '&fid=' + escape(config.fid) + '&vol=' + config.volume + '" />';
			obj_param[3] = '<param name="allowScriptAccess" value="always" />';
			obj_param[4] = '<param name="bgcolor" value="#ffffff" />';
	
			var ie_dom = document.createElement(html_obj);
			for(var i=0; i < obj_param.length; i++) {
				ie_dom.appendChild(document.createElement(obj_param[i]));
			}
			
			return ie_dom;
		} else {
			var html_embed = '<embed name="' + config.fid + '" id="' + config.fid + '" src="' + config.swf + '"';
			html_embed += ' width="1" height="1" bgcolor="#ffffff"';
			html_embed += ' quality="high" FlashVars="id=' + escape(config.id) + '&fid=' + escape(config.fid) + '&vol=' + config.volume + '"';
			html_embed += ' allowScriptAccess="always"';
			html_embed += ' type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
			
			return html_embed;
		}
	}
	
	function getMovie(config) {
		if (media === null) {
			var parent = createElement('div', 'imob-player-flash-wrap'),
				player = initFlash(config);
				
			if (typeof player == 'string')
				parent.innerHTML = player;
			else
				parent.appendChild(player);
				
			document.body.appendChild(parent);
			media = document[config.fid];
		}
		
		return media;
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
//		if (!media.loop) {
//			seek(0);
//			pause();
//		}
			
		delegateEvent(evt);
	}
	
	/**
	 * Handles media data loading
	 * @param {Event} evt
	 */
	function onReadyStateСhange(evt) {
		resource_ready = true;
		if (start_pos !== null) {
			seek(start_pos);
			play();
			start_pos = null;
		}
	}
	
	/**
	 * Listenes to network events of media element and controls media 
	 * playablility
	 * @param {Event} evt
	 */
	function networkListener(evt) {
//		console.log('got', evt.type);
	}
	
	/**
	 * Seek current track at specified position
	 * @param {Number} pos New position (in seconds)
	 */
	function seek(pos) {
		getMovie().fl_play_head_time_mp3(pos);
		eventManager.dispatchEvent(EVT_SEEK, {
			position: pos,
			percent: pos / media.duration,
			duration: media.duration
		});
	}
	
	/**
	 * Pause playback
	 * @param {Boolean} force Force pause regardless of media <code>paused</code>
	 * state. Firefox 3.5+ may run a looped media playback even if <code>paused</code>
	 * state is <code>true</code> so this flag will force media to stop  
	 */
	function pause(force) {
		clearTimer();
		if (media.fl_is_playing() || force) {
			media.fl_pause_mp3();
			eventManager.dispatchEvent(EVT_PAUSE);
		}
	}
	
	function play() {
//		if (!resource_ready)
//			media.load();
		media.fl_play_mp3();
	}
	
	function clearTimer() {
		if (play_timer)
			clearInterval(play_timer);
	}
	
	function updateContext() {
//		if (resource_ready)
			eventManager.dispatchEvent(EVT_PLAYING, {
				position: media.fl_get_position(),
				duration: media.fl_get_duration()
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
		init: function(cfg, ctx) {
			cfg = mergeObjects(config, cfg || {});
			
			var parent = createElement('div', 'imob-player-flash-wrap'),
				player = initFlash(cfg);
				
			if (typeof player == 'string')
				parent.innerHTML = player;
			else
				parent.appendChild(player);
				
			document.body.appendChild(parent);
			media = document[config.fid];
				
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
				getMovie().fl_setFile_mp3(url);
				
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
			return cur_source;
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
			return cur_volume;
		},
		
		/**
		 * Set new volume
		 * @param {Number} val New volume (from 0.0 to 1.0)
		 */
		setVolume: function(val) {
			getMovie().fl_volume_mp3(val * 100);
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
			return getMovie().fl_get_position();
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
			// FIXME брать из флэша
			return false;
		},
		
		/**
		 * Enable or disable current track playback looping
		 * @param {Boolean} val
		 */
		setLoop: function(val) {
			// FIXME писать во флэш
//			media.loop = !!val;
			eventManager.dispatchEvent(EVT_LOOPING_CHANGED, false);
		},
		
		/**
		 * Check if current media is playing
		 * @return {Boolean}
		 */
		isPlaying: function() {
			console.log('is playing', media.fl_is_playing());
			return media.fl_is_playing();
		},
		
		/**
		 * Returns duration (number of seconds) of currently played media
		 * @return {Number}
		 */
		getDuration: function() {
			return media.fl_get_duration();
		},
		
		flashCall: function(name) {
			if (name in flash_iface) {
				var args = Array.prototype.splice.call(arguments, 1);
				flash_iface[name].apply(flash_iface, args);
			} else {
				console.log('no', name)
			}
		}
	};
})();