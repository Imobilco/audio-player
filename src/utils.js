/**
 * Набор вспомогательных библиотек
 *
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */

/**
 * Удаляет пробелы в начале и в конце строки
 * @param {String} text
 * @return {String}
 */
function trim(text) {
	return (text || '').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
}

/**
 * Вспомогательная функция, которая пробегается по всем элементам массива
 * <code>ar</code> и выполняет на каждом элементе его элементе функцию
 * <code>fn</code>. <code>this</code> внутри этой функции указывает на
 * элемент массива
 *
 * @param {Array}
 *            ar Массив, по которому нужно пробежаться
 * @param {Function}
 *            fn Функция, которую нужно выполнить на каждом элементе массива
 * @param {Boolean}
 *            forward Перебирать значения от начала массива (п умолчанию: с
 *            конца)
 */
function walkArray(ar, fn, forward) {
	if (forward) {
		for (var i = 0, len = ar.length; i < len; i++)
			if (fn.call(ar[i], i, ar[i]) === false)
				break;
	} else {
		for (var i = ar.length - 1; i >= 0; i--)
			if (fn.call(ar[i], i, ar[i]) === false)
				break;
	}
}

/**
 * Преобразует один массив элементов в другой с помощью функции callback. Взято в jQuery
 *
 * @param {Array} elems
 * @param {Function} callback
 * @return {Array}
 */
function mapArray(elems, callback) {
	var ret = [];

	// Go through the array, translating each of the items to their
	// new value (or values).
	for (var i = 0, length = elems.length; i < length; i++) {
		var value = callback(elems[i], i);

		if (value != null)
			ret[ret.length] = value;
	}

	return ret.concat.apply([], ret);
}

/**
 * Проверяет, является ли строка последовательностью пробельных символов
 *
 * @param str
 */
function isWhiteSpace(str) {
	return !(/[^\s\n\r]/).test(str);
}


/**
 * Создает новый элемент
 *
 * @param {String}
 *            name
 * @param {String}
 *            class_name
 * @return {Element}
 */
function createElement(name, class_name) {
	var elem = document.createElement(name);
	if (class_name)
		elem.className = class_name;

	return elem;
}

/**
 * Проверяет, есть ли класс у элемента
 *
 * @param {Element} elem
 * @param {String} class_name
 * @return {Boolean}
 */
function hasClass(elem, class_name) {
	class_name = ' ' + class_name + ' ';
	var _cl = elem.className;
	return _cl && (' ' + _cl + ' ').indexOf(class_name) >= 0;
}

function toggleClass(elem, class_name, cond) {
	if (typeof cond == 'undefined')
		cond = hasClass(elem, class_name);
		
	if (cond)
		removeClass(elem, class_name);
	else
		addClass(elem, class_name);
}

/**
 * Добавляет класс элементу
 *
 * @param {Element} elem
 * @param {String} class_name
 */
function addClass(elem, class_name) {
	var classes = [];
	walkArray(class_name.split(/\s+/g), function(i, n) {
		if (n && !hasClass(elem, n))
			classes.push(n);
	});

	if (classes.length)
		elem.className += (elem.className ? ' ' : '') + classes.join(' ');
}

/**
 * Удаляет класс у элемента
 *
 * @param {Element} elem
 * @param {String} class_name
 */
function removeClass(elem, class_name) {
	var elem_class = elem.className || '';
	walkArray(class_name.split(/\s+/g), function(i, n) {
		elem_class = elem_class.replace(new RegExp('\\b' + n + '\\b'), '');
	});

	elem.className = trim(elem_class);
}

/**
 * Возвращает список элементов с заданным классом
 * @param {String} class_name Имя класса
 * @param {Element|Document} [context] Контекстный элемент
 * @return {NodeList}
 */
function getByClass(class_name, context) {
	return (context || document).getElementsByClassName(class_name);
}

/**
 * Возвращает один элемент с заданным классом
 * @param {String} class_name Имя класса
 * @param {Element|Document} [context] Контекстный элемент
 * @return {Element}
 */
function getOneByClass(class_name, context) {
	var list = getByClass(class_name, context);
	return list ? list[0] : null;
}

/**
 * Показывает элемент на странице
 *
 * @param {Element}
 *            elem
 */
function showElement(elem) {
	removeClass(elem, 'imob-hidden');
}

/**
 * Прячет элемент на странице
 *
 * @param {Element}
 *            elem
 */
function hideElement(elem) {
	addClass(elem, 'imob-hidden');
}

/**
 * Удаляет элемент из DOM-дерева
 *
 * @param {Element}
 *            elem
 */
function removeElement(elem) {
	if (elem && elem.parentNode)
		elem.parentNode.removeChild(elem);
}

/**
 * Добавляет событие элементу
 *
 * @param {Element} elem
 * @param {String} type
 * @param {Function} fn
 */
function addEvent(elem, type, fn) {
	var items = type.split(/\s+/);
	for (var i = 0; i < items.length; i++) {
		elem.addEventListener(items[i], fn, false);
	}
}

/**
 * Удаляет событие с элемента
 * @param {Element} elem
 * @param {String} type
 * @param {Function} fn
 */
function removeEvent(elem, type, fn) {
	var items = type.split(/\s+/);
	for (var i = 0; i < items.length; i++) {
		elem.removeEventListener(items[i], fn, false);
	}
}

/**
 * Добавляет слушателя на событие onDomContentLoaded
 * @type {Function} fn Слушатель
 */
function addDomReady(fn) {
	addEvent(document, 'DOMContentLoaded', fn);
}

var toCamelCase = (function() {
	var cache = {}, camel = function(str, p1) {
		return p1.toUpperCase();
	}, re = /\-(\w)/g;

	return function(name) {
		if (!cache[name])
			cache[name] = name.replace(re, camel);

		return cache[name];
	};
})();

var use_w3c = document.defaultView && document.defaultView.getComputedStyle;

/**
 * Возвращает значение CSS-свойства <b>name</b> элемента <b>elem</b>
 * @author John Resig (http://ejohn.org)
 * @param {Element} elem Элемент, у которого нужно получить значение CSS-свойства
 * @param {String|Array} name Название CSS-свойства
 * @return {String|Object}
 */
function getCSS(elem, name, force_computed) {
	var cs, result = {}, n, name_camel, is_array = name instanceof Array;

	var rnumpx = /^-?\d+(?:px)?$/i,
		rnum = /^-?\d(?:\.\d+)?/,
		rsuf = /\d$/,
		ret,
		suffix;

	var _name = is_array ? name : [name];
	for (var i = 0, il = _name.length; i < il; i++) {
		n = _name[i];
		name_camel = toCamelCase(n);

		// If the property exists in style[], then it's been set
		// recently (and is current)
		if (!force_computed && elem.style[name_camel]) {
			result[n] = result[name_camel] = elem.style[name_camel];
		}
		// Or the W3C's method, if it exists
		else if (use_w3c) {
			if (!cs)
				cs = window.getComputedStyle(elem, "");
			result[n] = result[name_camel] = cs && cs.getPropertyValue(n);
		} else if ( elem.currentStyle ) {
			ret = elem.currentStyle[n] || elem.currentStyle[name_camel];
			var style = elem.style || elem;
			
			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
				// Remember the original values
				var left = style.left, rsLeft = elem.runtimeStyle.left;

				// Put in the new values to get a computed value out
				elem.runtimeStyle.left = elem.currentStyle.left;
				suffix = rsuf.test(ret) ? 'em' : '';
				style.left = name_camel === "fontSize" ? "1em" : (ret + suffix || 0);
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
			}

			result[n] = result[name_camel] = ret;
		}
	}

	return is_array ? result : result[toCamelCase(name)];
}

/**
 * Выставлет элементу CSS-правила, указанные в объекте <code>params</code>
 *
 * @param {Element}
 *            elem
 * @param {Object}
 *            params Хэш из CSS-свойств
 */
function setCSS(elem, params) {
	if (!elem)
		return;
	
	var props = [],
		num_props = {'line-height': 1, 'z-index': 1, opacity: 1};

	for (var p in params) if (params.hasOwnProperty(p)) {
		var name = p.replace(/([A-Z])/g, '-$1').toLowerCase(),
			value = params[p];
		props.push(name + ':' + ((typeof(value) == 'number' && !(name in num_props)) ? value + 'px' : value));
	}

	elem.style.cssText += ';' + props.join(';');
}

/**
 * Получает смещение элемента относительно родителя
 *
 * @param {Element}
 *            elem
 * @param {Element}
 *            [parent]
 */
function getOffset(elem, parent) {
	parent = parent || document;
	var x = 0, y = 0;

	do {
		x += elem.offsetLeft;
		y += elem.offsetTop;
		elem = elem.offsetParent;
	} while (elem && elem != parent);

	return {
		x : x,
		y : y
	};
}

/**
 * Удаляет содержимое элемента
 * @param {Element} elem
 * @return {Element}
 */
function emptyElement(elem) {
	while (elem.firstChild)
		elem.removeChild(elem.firstChild);
		
	return elem;
}

/**
 * Показываем элемент
 * @param {Element} elem
 * @param {String} [type] Тип элемента (по умолчанию 'block')
 */
function showElement(elem, type) {
	type = type || 'block';
	elem.style.display = type;
}

/**
 * Скрываем элемент
 * @param {Element} elem
 */
function hideElement(elem) {
	elem.style.display = 'none';
}

/**
 * Объединяет несколько объектов в один
 * @param {Object} ...args Объекты которые нужно объединить
 * @return {Object}
 */
function mergeObjects() {
	var result = {};
	for (var i = 0, il = arguments.length; i < il; i++) {
		/** @type {Object} */
		var obj = arguments[i];
		for (var p in obj) if (obj.hasOwnProperty(p))
			result[p] = obj[p];
	}

	return result;
}

function minmax(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function numParam(value) {
	return parseInt(value, 10) || 0;
}

/**
 * Добавляет текстовый нод в элемент
 * @param {Element} elem
 * @param {Element} text
 */
function addText(elem, text) {
	elem.appendChild(document.createTextNode(text));
}

/**
 * Возвращает текущее время в виде количества секунд
 * @return {Number}
 */
function now() {
	return (new Date).getTime();
}

/**
 * Возвращает текстовое содержимое элемента
 * @param {Element} elem
 * @return {String}
 */
function getText(elem) {
	if ('innerText' in elem)
		return elem.innerText;
	else if (elem.firstChild)
		return elem.firstChild.nodeValue;
	else
		return '';
}

function emptyFn() {
	
}

/**
 * Конвертирует параметр в будевое значение
 * @param {Object} val
 * @return {Boolean}
 */
function toBoolean(val) {
	if (typeof val == 'boolean')
		return val;
	else if (typeof val == 'number')
		return !!val;
	else if (!val)
		return false;
	else 
		return (val == 'true' || val == 'yes' || val == '1'); 
	
}