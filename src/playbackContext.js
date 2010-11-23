/**
 * Context object that receives all playback events from playback controller
 * and do something (e.g. updates playhead position of player's DOM representation)
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * @include "EventDispatcher.js"
 * @include "utils.js"
 * @include "playbackProxy.js"
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
		
		max_play_progress = 0,
		is_dragging = false,
		
		/** Dragging start point */
		drag_start_pos = {},
		/** Max slider head position */
		max_slider_pos = 0,
		
		/** @type {playbackProxy} Backreference to proxy media element */
		proxy;
		
	function updateUI(position, duration) {
		if (!root)
			return;
			
		updateMaxSliderPos();
		movePlayhead(position / duration);
	}
	
	function updateMaxSliderPos() {
		max_slider_pos = ct_shaft.offsetWidth - ct_playhead.offsetWidth;
	}
	
	function movePlayhead(prc) {
		var pos_x = Math.round(max_slider_pos * prc);
			
		setCSS(ct_playhead, {left: pos_x});
		setCSS(ct_progress, {width: pos_x});
		updatePlayProgress(prc);
	}
	
	function updatePlayProgress(prc) {
		if (max_play_progress < prc)
			max_play_progress = prc;
			
		setCSS(ct_play_button, {backgroundPosition: Math.round(-20 * (1 - max_play_progress)) + 'px 0px'});
	}
	
	function toNum(val) {
		return parseInt(val, 10) || 0;
	}
	
	function minmax(val, abs_min, abs_max) {
		return Math.min(abs_max, Math.max(abs_min, val));
	}
	
	function getCoordSource(evt, touch_event) {
		if (evt.type == touch_event) {
			var touches = evt.changedTouches;
			return touches[touches.length - 1];
		} else {
			return evt;
		}
	}
	
	function updateSlider(delta) {
		// высчитываем текущую позицию головки слайдера
		var pos = Math.min(max_slider_pos, Math.max(0, drag_start_pos.tx + delta));
		movePlayhead(pos / max_slider_pos)
	}
	
	/**
	 * Начинаем перетаскивание слайдера
	 * @param {Event} evt
	 */
	function startDrag(evt) {
		var offset = getOffset(ct_playhead.offsetParent),
			coord_source = getCoordSource(evt, 'touchstart');
		
		drag_start_pos.x = coord_source.pageX;
		drag_start_pos.y = coord_source.pageY;
		drag_start_pos.tx = 0;
		drag_start_pos.ty = 0;
		
		is_dragging = true;
		
		// ставим головку в точку, куда тыкнули мышью
		updateSlider(coord_source.pageX - offset.x - ct_playhead.offsetWidth / 2);
		drag_start_pos.tx = toNum(getCSS(ct_playhead, 'left'));
		
		evt.preventDefault();
		return false;
	}
	
	/**
	 * Обработчик события по перетаскиванию слайдера
	 * @param {Event} evt
	 */
	function doDrag(evt) {
		if (is_dragging) {
			var coord_source = getCoordSource(evt, 'touchmove');
			updateSlider(coord_source.pageX - drag_start_pos.x);
			
			evt.preventDefault();
			return false;
		}
	}
	
	/**
	 * Останавливаем перетаскивание слайдера
	 */
	function stopDrag() {
		is_dragging = false;
	}
	
	addEvent(document, 'mousemove touchmove', doDrag);
	addEvent(document, 'mouseup touchend', stopDrag);
		
	dispatcher.addEventListener('play', function() {
		if (root)
			addClass(root, 'imob-player-playing');
	});
	
	dispatcher.addEventListener('pause', function() {
		if (root)
			removeClass(root, 'imob-player-playing');
	});
	
	dispatcher.addEventListener('playing seek', function(evt) {
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
			if (root !== elem) {
				this.unbindCurrentElement();
				
				ct_playhead = getOneByClass('imob-player-playhead', elem);
				ct_progress = getOneByClass('imob-player-progress', elem);
				ct_shaft = getOneByClass('imob-player-shaft', elem);
				ct_play_button = getOneByClass('imob-player-play-button', elem);
				updateMaxSliderPos();
				
				addEvent(ct_shaft, 'mousedown touchstart', startDrag);
				root = elem;
			}
		},
		
		unbindCurrentElement: function() {
			if (root && ct_shaft)
				removeEvent(ct_shaft, 'mousedown touchstart', startDrag);
				
			root = null;
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
		},
		
		/**
		 * Set backreference to media proxy element
		 * @param {playbackProxy} p
		 */
		setProxy: function(p) {
			proxy = p;
		},
		
		/**
		 * Returns reference to media proxy element
		 * @return {playbackProxy}
		 */
		getProxy: function() {
			return proxy;
		}
	}})();
