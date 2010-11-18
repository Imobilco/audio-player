/**
 * Базовый механизм слайдера
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "utils.js"
 * @include "EventDispatcher.js
 */(function(){
	
	var is_dragging = false,
		/** @type {Element} Текущий слайдер, который таскаем */
		cur_slider = null,
		start_pos = {
			x: 0,
			tx: 0
		},
		
		/** Хранилище данных для элемента */
		elem_data = {},
		_data_id = 0,
		
		/** Настройки слайдера по умолчанию */
		default_settings = {
			dir: 'x',
			discrete: true,
			min: 0,
			max: 100,
			max_pos: 100,
			value: null
		};
		
	/**
	 * Возвращает идентификатор хранилища данных для объекта
	 * @param {Element} elem
	 * @return {String}
	 */
	function getDataId(elem) {
		var data_id = elem.getAttribute('sliderData');
		if (!data_id) {
			data_id = 'slider' + (_data_id++);
			elem.setAttribute('sliderData', data_id);
			elem_data[data_id] = {};
		}
		
		return data_id;
	}
		
	/**
	 * Получает данные из хранилища элемента
	 * @param {Element} elem 
	 * @param {String} name Ключ для получения данных
	 * @return {Object|null}
	 */
	function getData(elem, name) {
		var id = getDataId(elem);
		if (name in elem_data[id])
			return elem_data[id][name];
		else
			return null;
	}
	
	/**
	 * Записывает данные в хранилище элемента
	 * @param {Element} elem
	 * @param {String} name
	 * @param {Object} value
	 */
	function setData(elem, name, value) {
		elem_data[getDataId(elem)][name] = value;
	}
	
	function sliderHost(elem) {
		var dispatcher = new EventDispatcher();
		return {
			/**
			 * Возвращает текущее значение слайдера
			 * @return {Number}
			 */
			getSliderValue: function(axis) {
				var settings = getData(elem, 'slider_settings');
				return settings.value;
			},
			
			/**
			 * Устанавливает новое значение слайдера
			 * @param {Number} val
			 */
			setSliderValue: function(value) {
				if (!getData(elem, 'slider_inited')) {
					// слайдер ещё не определён, сохраним данные в отдельном поле
					setData(elem, 'slider_init_values', {x: value});
				} else {
					setSliderValue(elem, value);
				}
			},
			
			addListener: function(type, listener, only_once) {
				dispatcher.addEventListener(type, listener, only_once);
			},
			
			removeListener: function(type, listener) {
				dispatcher.removeEventListener(type, listener);
			},
			
			dispatchEvent: function(type, args) {
				args = args || {};
				args.slider = elem;
				dispatcher.dispatchEvent(type, args);
			}
		}
	}
	
	function toNum(val) {
		return parseInt(val, 10) || 0;
	}
	
	function minmax(val, abs_min, abs_max) {
		return Math.min(abs_max, Math.max(abs_min, val));
	}
	
	/**
	 * Парсит настройки слайдера
	 * @param {Element}
	 */
	function parseSettings(elem) {
		var elem_settings = (elem.getAttribute('data-slider') || '').toLowerCase(),
			min = elem.getAttribute('min') || null,
			max = elem.getAttribute('max') || null,
			value = null,
			params = {};
		
		walkArray(elem_settings.split(','), function(i, n) {
			n = trim(n);
			
			var kv = n.split(':'),
				k = kv[0],
				v = kv[1] || '';
				
			switch (k) {
				case 'min':
					min = parseFloat(v); break;
				case 'max':
					max = parseFloat(v); break;
				case 'value':
					value = parseFloat(v); break;
				case 'min_x':
				case 'max_x':
				case 'min_y':
				case 'max_y':
				case 'value_x':
				case 'value_y':
					params[k] = parseFloat(v); break;
				case 'dir':
					if (v in allowed_dirs)
						params[k] = v;
					break;
				case 'discrete':
					params[k] = (v in allowed_bool); break;
			}
		}, true);
		
		if (min !== null) {
			if (!('min_x' in params)) params.min_x = toNum(min);
			if (!('min_y' in params)) params.min_y = toNum(min);
		}
		
		if (max !== null) {
			if (!('max_x' in params)) params.max_x = toNum(max);
			if (!('max_y' in params)) params.max_y = toNum(max);
		}
		
		if (value !== null) {
			if (!('value_x' in params)) 
				params.value_x = minmax(value, params.min_x, params.max_x);
			
			if (!('value_y' in params)) 
				params.value_y = minmax(value, params.min_y, params.max_y);
		}
		
		// добавляем недостающие параметры
		for (var p in default_settings) if (default_settings.hasOwnProperty(p)) {
			if (!(p in params))
				params[p] = default_settings[p];
		}
		
		return params;
	}
	
	/**
	 * Инициализация слайдера: добавление событий, парсинг настроек
	 * @param {Element} elem Контейнер слайдера
	 * @return {sliderHost}
	 */
	function initSlider(elem) {
		if (getData(elem, 'slider_inited'))
			return;
		
		var settings = parseSettings(elem);
		
		// собираем элементы, необходимые для слайдера
		var slider_elems = {
			container: elem,
			thumb: getOneByClass('imob-slider-thumb', elem), // головка
			shaft: hasClass(elem, 'imob-slider-shaft') ? elem : getOneByClass('imob-slider-shaft', elem), // шахта
			label: getOneByClass('imob-slider-label')  // подпись
		};
		
		// сохраняем шаблон для подписи
		if (slider_elems.label)
			slider_elems.label_template = (getText(slider_elems.label) || '0').replace(/\d+(?:[\.,]\d+)?/, '%d');
			
		setData(slider_elems.shaft, 'slider_elems', slider_elems);
		setData(elem, 'slider_elems', slider_elems);
			
		// получаем максимальное значение позиции головки
		var thumb_width = slider_elems.thumb.offsetWidth + parseInt(getCSS(slider_elems.thumb, 'margin-left')) + parseInt(getCSS(slider_elems.thumb, 'margin-right')),
			thumb_height = slider_elems.thumb.offsetHeight + parseInt(getCSS(slider_elems.thumb, 'margin-top')) + parseInt(getCSS(slider_elems.thumb, 'margin-bottom')),
			shaft_width = slider_elems.shaft.offsetWidth,
			shaft_height = slider_elems.shaft.offsetHeight;
		
		settings.max_pos_x = shaft_width - thumb_width;
		settings.max_pos_y = shaft_height - thumb_height;
		
		setData(elem, 'slider_settings', settings);
		
		// Восстановливаем позицию головки из настроек
		var default_value = {
				x: settings.value_x,
				y: settings.value_y
			},
			init_value = getData(elem, 'slider_init_values');
			
		if (init_value) {
			default_value.x = init_value.x;
			default_value.y = init_value.y;
		}
		
		var host = sliderHost(elem)
		
		setSliderValue(elem, default_value.x, default_value.y, true);
		setData(elem, 'slider_inited', true);
		setData(elem, 'host', host);
		
		addEvent(slider_elems.shaft, 'mousedown touchstart', startDrag);
		return host;
	}
	
	function setSliderValue(slider, value_x, value_y, force) {
		var settings = getData(slider, 'slider_settings');
		
		if (arguments.length == 2)
			value_y = value_x;
			
		value_x = minmax(toNum(value_x || 0), settings.min_x, settings.max_x);
		value_y = minmax(toNum(value_y || 0), settings.min_y, settings.max_y);
			
		var is_changed = false,
			elems = getData(slider, 'slider_elems'),
			dx = settings.max_x - settings.min_x,
			dy = settings.max_y - settings.min_y,
			allow_x = settings.dir.indexOf('x') != -1,
			allow_y = settings.dir.indexOf('y') != -1;
			
		if (settings.discrete) {
			value_x = Math.round(value_x);
			value_y = Math.round(value_y);
		}
			
		var prc_x = (value_x - settings.min_x) / dx,
			prc_y = (value_y - settings.min_y) / dy;
			
		var pos_x = Math.round(prc_x * settings.max_pos_x),
			pos_y = Math.round(prc_y * settings.max_pos_y);
			
		is_changed = force || (value_x != settings.value_x || value_y != settings.value_y);
		
		if (is_changed) {
			if (allow_x)
				setCSS(elems.thumb, {left: pos_x});
				
			if (allow_y)
				setCSS(elems.thumb, {top: pos_y});
				
			settings.value_x = value_x;
			settings.value_y = value_y;
			
			// есть шаблон к подписи, меняем её
			if ('label_template' in elems && elems.label) {
				elems.label.innerHTML = elems.label_template.replace('%d', getData(elems.container, 'host').getSliderValue());
			}
			
			imob_slider.dispatchEvent(elems.container, 'slider_move', {
				x: value_x, 
				y: value_y
			});
		}
	}
	
	function updateCurrentSlider(delta_x, delta_y) {
		if (cur_slider) {
			var slider = cur_slider,
				settings = getData(slider, 'slider_settings'),
				dx = settings.max_x - settings.min_x,
				dy = settings.max_y - settings.min_y;
				
			// высчитываем текущую позицию головки слайдера
			var pos_x = Math.min(settings.max_pos_x, Math.max(0, start_pos.tx + delta_x)),
				pos_y = Math.min(settings.max_pos_y, Math.max(0, start_pos.ty + delta_y));
				
			// считаем текущее значение слайдера исходя из позиции головки
			var value_x = pos_x / settings.max_pos_x * dx + settings.min_x,
				value_y = pos_y / settings.max_pos_y * dy + settings.min_y;
				
			setSliderValue(slider, value_x, value_y);	
		}
	}
	
	function getCoordSource(evt, touch_event) {
		if (evt.type == touch_event) {
			var touches = evt.changedTouches;
			return touches[touches.length - 1];
		} else {
			return evt;
		}
	}
	
	/**
	 * Начинаем перетаскивание слайдера
	 * @param {Event} evt
	 */
	function startDrag(evt) {
		var elems = getData(this, 'slider_elems');
		var offset = getOffset(elems.thumb.parentNode);
		
		var coord_source = getCoordSource(evt, 'touchstart');
		
		start_pos.x = coord_source.pageX;
		start_pos.y = coord_source.pageY;
		start_pos.tx = 0;
		start_pos.ty = 0;
		
		is_dragging = true;
		cur_slider = elems.container;
		
		// ставим головку в точку, куда тыкнули мышью
		var new_pos = updateCurrentSlider(coord_source.pageX - offset.x, coord_source.pageY - offset.y);
		start_pos.tx = toNum(getCSS(elems.thumb, 'left'));
		start_pos.ty = toNum(getCSS(elems.thumb, 'top'));
		
		evt.preventDefault();
		return false;
	}
	
	/**
	 * Обработчик события по перетаскиванию слайдера
	 * @param {Event} evt
	 */
	function doDrag(evt) {
		if (is_dragging && cur_slider) {
			var coord_source = getCoordSource(evt, 'touchmove');
			
			var cur_x = coord_source.pageX,
				cur_y = coord_source.pageY;
				
			updateCurrentSlider(cur_x - start_pos.x, cur_y - start_pos.y);
			
			evt.preventDefault();
			return false;
		}
	}
	
	/**
	 * Останавливаем перетаскивание слайдера
	 */
	function stopDrag() {
		is_dragging = false;
		cur_slider = null;
	}
	
	addEvent(document, 'mousemove touchmove', doDrag);
	addEvent(document, 'mouseup touchend', stopDrag);
	
	return {
		/**
		 * @return {sliderHost}
		 */
		init: function(elem){
			return initSlider(elem);
		},
		
		addListener: function(elem, type, listener, only_once) {
			var host = getData(elem, 'host');
			if (host) {
				host.addListener(type, listener, only_once);
			}
		},
		
		removeListener: function(elem, type, listener) {
			var host = getData(elem, 'host');
			if (host) {
				host.removeListener(type, listener);
			}
		},
		
		dispatchEvent: function(elem, type, args) {
			var host = getData(elem, 'host');
			if (host) {
				host.dispatchEvent(type, args);
			}
		},
		
		setValue: function(elem, value_x, value_y) {
			var host = getData(elem, 'host');
			if (host) {
				host.setSliderValue(value_x, value_y);
			}
		},
		
		getValue: function(elem, axis) {
			var host = getData(elem, 'host');
			if (host) {
				return host.getSliderValue(axis);
			}
		}
	};
})();