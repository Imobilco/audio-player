/**
 * Context object that receives all playback events from playback controller
 * and do something (e.g. updates playhead position of player's DOM representation)
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * @include "EventDispatcher.js"
 * @include "utils.js"
 */
var playbackContext = (function(){
	var dispatcher = new EventDispatcher,
		/** @type {Element} Root element of for player controls */
		root,
		/** @type {Element} Playhead control */
		ct_playhead,
		
		/** @type {Element} Progress bar control */
		ct_progress,
		
		/** @type {Element} Progress bar shaft */
		ct_shaft,
		
		/** @type {Element} Play button that contains play progress */
		ct_play_button,
		
		max_play_progress = 0;
		
	function updateUI(position, duration) {
		if (!root)
			return;
			
		var max_width = ct_shaft.offsetWidth - ct_playhead.offsetWidth,
			prc = position / duration,
			pos_x = Math.round(max_width * prc);
			
		setCSS(ct_playhead, {left: pos_x});
		setCSS(ct_progress, {width: pos_x});
		updatePlayProgress(prc);
	}
	
	function updatePlayProgress(prc) {
		if (max_play_progress < prc)
			max_play_progress = prc;
			
		setCSS(ct_play_button, {backgroundPosition: Math.round(-20 * (1 - max_play_progress)) + 'px 0px'});
	}
		
	dispatcher.addEventListener('play', function() {
		if (root)
			addClass(root, 'imob-player-playing');
	});
	
	dispatcher.addEventListener('pause', function() {
		if (root)
			removeClass(root, 'imob-player-playing');
	});
	
	dispatcher.addEventListener('playing', function(evt) {
		updateUI(evt.data.position, evt.data.duration);
	});
		
	return {
		dispatchEvent: function(type, args) {
			dispatcher.dispatchEvent(type, args);
		},
		
		addEventListener: function(type, fn, only_once) {
			dispatcher.addEventListener(type, fn, only_once);
		},
		
		removeEventListener: function(type, fn) {
			dispatcher.removeEventListener(type, fn);
		},
		
		/**
		 * Binds element as player container
		 * @param {Element} elem
		 */
		bindElement: function(elem) {
			root = elem;
			ct_playhead = getOneByClass('imob-player-playhead', root);
			ct_progress = getOneByClass('imob-player-progress', root);
			ct_shaft = getOneByClass('imob-player-shaft', root);
			ct_play_button = getOneByClass('imob-player-play-button', root);
		},
		
		/**
		 * Updates UI, basically on playback
		 * @param {Number} position Media duration 
		 * @param {Number} duration Current media playback position 
		 */
		updateUI: updateUI,
		
		updatePlayProgress: updatePlayProgress,
		
		/**
		 * @return {Element}
		 */
		getRoot: function() {
			return root;
		}
	}})();
