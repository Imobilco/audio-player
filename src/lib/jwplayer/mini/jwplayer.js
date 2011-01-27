/**
 * JW Player namespace definition
 * @version 5.4
 */
var jwplayer = function(container) {
	return jwplayer.constructor(container);
};

jwplayer.constructor = function(container) {
};

var $jw = jwplayer;

jwplayer.version = '5.4.1530';/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.utils = function() {
	};
	
	/** Returns the true type of an object **/
	
	/**
	 *
	 * @param {Object} value
	 */
	jwplayer.utils.typeOf = function(value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (value instanceof Array) {
					s = 'array';
				}
			} else {
				s = 'null';
			}
		}
		return s;
	};
	
	/** Merges a list of objects **/
	jwplayer.utils.extend = function() {
		var args = jwplayer.utils.extend['arguments'];
		if (args.length > 1) {
			for (var i = 1; i < args.length; i++) {
				for (var element in args[i]) {
					args[0][element] = args[i][element];
				}
			}
			return args[0];
		}
		return null;
	};
	
	/**
	 * Returns a deep copy of an object.
	 * @param {Object} obj
	 */
	jwplayer.utils.clone = function(obj) {
		var result;
		var args = jwplayer.utils.clone['arguments'];
		if (args.length == 1) {
			switch (jwplayer.utils.typeOf(args[0])) {
				case "object":
					result = {};
					for (var element in args[0]) {
						result[element] = jwplayer.utils.clone(args[0][element]);
					}
					break;
				case "array":
					result = [];
					for (var element in args[0]) {
						result[element] = jwplayer.utils.clone(args[0][element]);
					}
					break;
				default:
					return args[0];
					break;
			}
		}
		return result;
	};
	
	/** Returns the extension of a file name **/
	jwplayer.utils.extension = function(path) {
		path = path.substring(path.lastIndexOf("/") + 1, path.length);
		path = path.split("?")[0];
		if (path.lastIndexOf('.') > -1) {
			return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
		}
		return "";
	};
	
	/** Updates the contents of an HTML element **/
	jwplayer.utils.html = function(element, content) {
		element.innerHTML = content;
	};
	
	/** Appends an HTML element to another element HTML element **/
	jwplayer.utils.append = function(originalElement, appendedElement) {
		originalElement.appendChild(appendedElement);
	};
	
	/** Wraps an HTML element with another element **/
	jwplayer.utils.wrap = function(originalElement, appendedElement) {
		originalElement.parentNode.replaceChild(appendedElement, originalElement);
		appendedElement.appendChild(originalElement);
	};
	
	/** Loads an XML file into a DOM object **/
	jwplayer.utils.ajax = function(xmldocpath, completecallback, errorcallback) {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			// IE>7, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {
			// IE6
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					if (completecallback) {
						completecallback(xmlhttp);
					}
				} else {
					if (errorcallback) {
						errorcallback(xmldocpath);
					}
				}
			}
		};
		xmlhttp.open("GET", xmldocpath, true);
		xmlhttp.send(null);
		return xmlhttp;
	};
	
	/** Loads a file **/
	jwplayer.utils.load = function(domelement, completecallback, errorcallback) {
		domelement.onreadystatechange = function() {
			if (domelement.readyState === 4) {
				if (domelement.status === 200) {
					if (completecallback) {
						completecallback();
					}
				} else {
					if (errorcallback) {
						errorcallback();
					}
				}
			}
		};
	};
	
	/** Finds tags in a DOM, returning a new DOM **/
	jwplayer.utils.find = function(dom, tag) {
		return dom.getElementsByTagName(tag);
	};
	
	/** **/
	
	/** Appends an HTML element to another element HTML element **/
	jwplayer.utils.append = function(originalElement, appendedElement) {
		originalElement.appendChild(appendedElement);
	};
	
	/**
	 * Detects whether the current browser is IE (version 8 or below).
	 * Technique from http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	 * Note - this detection no longer works for IE9.
	 **/
	jwplayer.utils.isIE = function() {
		return (!+"\v1");
	};
	
	/**
	 * Detects whether the current browser is Android 2.0, 2.1 or 2.2 which do have some support for HTML5
	 **/
	jwplayer.utils.isLegacyAndroid = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/android 2.[012]/i) !== null);
	};
	
	
	/**
	 * Detects whether the current browser is mobile Safari.
	 **/
	jwplayer.utils.isIOS = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/iP(hone|ad)/i) !== null);
	};
	
	jwplayer.utils.getFirstPlaylistItemFromConfig = function(config) {
		var item = {};
		var playlistItem;
		if (config.playlist && config.playlist.length) {
			playlistItem = config.playlist[0];
		} else {
			playlistItem = config;
		}
		item.file = playlistItem.file;
		item.levels = playlistItem.levels;
		item.streamer = playlistItem.streamer;
		item.playlistfile = playlistItem.playlistfile;
		if (item.file && item.file.toLowerCase().indexOf("youtube.com") > -1) {
			item.provider = "youtube";
		}
		if (item.streamer && item.streamer.toLowerCase().indexOf("rtmp://") == 0) {
			item.provider = "rtmp";
		}
		if (playlistItem.type) {
			item.provider = playlistItem.type.toLowerCase();
		} else if (playlistItem.provider) {
			item.provider = playlistItem.provider.toLowerCase();
		}
		
		return item;
	}
	
	/**
	 * Detects whether Flash supports this configuration
	 * @param config (optional) If set, check to see if the first playable item
	 */
	jwplayer.utils.flashSupportsConfig = function(config) {
		if (jwplayer.utils.hasFlash()) {
			if (config) {
				var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
				if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
					return true;
				} else if (item.file) {
					return jwplayer.utils.flashCanPlay(item.file, item.provider);
				} else if (item.levels && item.levels.length) {
					for (var i = 0; i < item.levels.length; i++) {
						if (item.levels[i].file && jwplayer.utils.flashCanPlay(item.levels[i].file, item.provider)) {
							return true;
						}
					}
				}
			} else {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Determines if a Flash can play a particular file, based on its extension
	 */
	jwplayer.utils.flashCanPlay = function(file, provider) {
		var providers = ["video", "http", "sound", "image"];
		// Provider is set, and is not video, http, sound, image - play in Flash
		if (provider && (providers.toString().indexOf(provider < 0))) {
			return true;
		}
		var extension = jwplayer.utils.extension(file);
		// If there is no extension, use Flash
		if (!extension) {
			return true;
		}
		// Extension is in the extension map, but not supported by Flash - fail
		if (jwplayer.utils.extensionmap[extension] !== undefined &&
		jwplayer.utils.extensionmap[extension].flash === undefined) {
			return false;
		}
		return true;
	};
	
	/**
	 * Detects whether the html5 player supports this configuration.
	 *
	 * @param config (optional) If set, check to see if the first playable item
	 * @return {Boolean}
	 */
	jwplayer.utils.html5SupportsConfig = function(config) {
		var vid = document.createElement('video');
		if (!!vid.canPlayType) {
			if (config) {
				var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
				if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
					return true;
				} else if (item.file) {
					return jwplayer.utils.html5CanPlay(vid, item.file, item.provider, item.playlistfile);
				} else if (item.levels && item.levels.length) {
					for (var i = 0; i < item.levels.length; i++) {
						if (item.levels[i].file && jwplayer.utils.html5CanPlay(vid, item.levels[i].file, item.provider, item.playlistfile)) {
							return true;
						}
					}
				}
			} else {
				return true;
			}
		}
		
		return false;
	};
	
	/**
	 * Determines if a video element can play a particular file, based on its extension
	 * @param {Object} video
	 * @param {Object} file
	 * @param {Object} provider
	 * @param {Object} playlistfile
	 * @return {Boolean}
	 */
	jwplayer.utils.html5CanPlay = function(video, file, provider, playlistfile) {
		// Don't support playlists
		if (playlistfile) {
			return false;
		}
		
		// YouTube is supported
		if (provider && provider == "youtube") {
			return true;
		}
		
		// If a provider is set, only proceed if video
		if (provider && provider != "video" && provider != "http") {
			return false;
		}
		
		var extension = jwplayer.utils.extension(file);
		
		// Check for Android, which returns false for canPlayType
		if (jwplayer.utils.isLegacyAndroid() && extension.match(/m4v|mp4/)) {
			return true;
		}
		
		// Last, but not least, ask the browser
		return jwplayer.utils.browserCanPlay(video, extension);
	};
	
	/**
	 *
	 * @param {DOMElement} video tag
	 * @param {String} extension
	 * @return {Boolean}
	 */
	jwplayer.utils.browserCanPlay = function(video, extension) {
		var sourceType;
		// OK to use HTML5 with no extension
		if (!extension) {
			return true;
		} else if (jwplayer.utils.extensionmap[extension] !== undefined && jwplayer.utils.extensionmap[extension].html5 === undefined) {
			return false;
		} else if (jwplayer.utils.extensionmap[extension] !== undefined && jwplayer.utils.extensionmap[extension].html5 !== undefined) {
			sourceType = jwplayer.utils.extensionmap[extension].html5;
		} else {
			sourceType = 'video/' + extension + ';';
		}
		
		return video.canPlayType(sourceType);
	}
	
	/**
	 *
	 * @param {Object} config
	 */
	jwplayer.utils.downloadSupportsConfig = function(config) {
		if (config) {
			var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
			
			if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
				return true;
			} else if (item.file) {
				return jwplayer.utils.canDownload(item.file, item.provider, item.playlistfile);
			} else if (item.levels && item.levels.length) {
				for (var i = 0; i < item.levels.length; i++) {
					if (item.levels[i].file && jwplayer.utils.canDownload(item.levels[i].file, item.provider, item.playlistfile)) {
						return true;
					}
				}
			}
		} else {
			return true;
		}
	};
	
	/**
	 *
	 * @param {Object} file
	 * @param {Object} provider
	 * @param {Object} playlistfile
	 */
	jwplayer.utils.canDownload = function(file, provider, playlistfile) {
		// Don't support playlists
		if (playlistfile) {
			return false;
		}
		
		var providers = ["image", "sound", "youtube", "http"];
		// If the media provider is supported, return true
		if (provider && (providers.toString().indexOf(provider) > -1)) {
			return true;
		}
		
		// If a provider is set, only proceed if video
		if (!provider || (provider && provider == "video")) {
			var extension = jwplayer.utils.extension(file);
			
			// Only download if it's in the extension map or YouTube
			if (extension && jwplayer.utils.extensionmap[extension]) {
				return true;
			}
		}
		
		return false;
	};
	
	/**
	 * Replacement for "outerHTML" getter (not available in FireFox)
	 */
	jwplayer.utils.getOuterHTML = function(element) {
		if (element.outerHTML) {
			return element.outerHTML;
		} else {
			var parent = element.parentNode;
			var tmp = document.createElement(parent.tagName);
			tmp.appendChild(element);
			var elementHTML = tmp.innerHTML;
			parent.appendChild(element);
			return elementHTML;
		}
	};
	
	/**
	 * Replacement for outerHTML setter (not available in FireFox)
	 */
	jwplayer.utils.setOuterHTML = function(element, html) {
		if (element.outerHTML) {
			element.outerHTML = html;
		} else {
			var el = document.createElement('div');
			el.innerHTML = html;
			var range = document.createRange();
			range.selectNodeContents(el);
			var documentFragment = range.extractContents();
			element.parentNode.insertBefore(documentFragment, element);
			element.parentNode.removeChild(element);
		}
	};
	
	/**
	 * Detects whether or not the current player has flash capabilities
	 * TODO: Add minimum flash version constraint: 9.0.115
	 */
	jwplayer.utils.hasFlash = function() {
		return (typeof navigator.plugins != "undefined" && typeof navigator.plugins['Shockwave Flash'] != "undefined") || (typeof window.ActiveXObject != "undefined");
	};
	
	/**
	 * Extracts a plugin name from a string
	 */
	jwplayer.utils.getPluginName = function(pluginName) {
		if (pluginName.lastIndexOf("/") >= 0) {
			pluginName = pluginName.substring(pluginName.lastIndexOf("/") + 1, pluginName.length);
		}
		if (pluginName.lastIndexOf("-") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf("-"));
		}
		if (pluginName.lastIndexOf(".swf") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf(".swf"));
		}
		return pluginName;
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.utils.getAbsolutePath = function(path, base) {
		if (base === undefined) {
			base = document.location.href;
		}
		if (path === undefined) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = base.substring(0, base.indexOf("://") + 3);
		var domain = base.substring(protocol.length, base.indexOf('/', protocol.length + 1));
		var patharray;
		if (path.indexOf("/") === 0) {
			patharray = path.split("/");
		} else {
			var basepath = base.split("?")[0];
			basepath = basepath.substring(protocol.length + domain.length + 1, basepath.lastIndexOf('/'));
			patharray = basepath.split("/").concat(path.split("/"));
		}
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if (!patharray[i] || patharray[i] === undefined || patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + domain + "/" + result.join("/");
	};
	
	function isAbsolutePath(path) {
		if (path === null) {
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	jwplayer.utils.mapEmpty = function(map) {
		for (var val in map) {
			return false;
		}
		return true;
	};
	
	jwplayer.utils.mapLength = function(map) {
		var result = 0;
		for (var val in map) {
			result++;
		}
		return result;
	};
	
	/** Logger **/
	jwplayer.utils.log = function(msg, obj) {
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			if (obj) {
				console.log(msg, obj);
			} else {
				console.log(msg);
			}
		}
	};
	
	jwplayer.utils.css = function(domelement, styles, debug) {
		if (domelement !== undefined) {
			for (var style in styles) {
				try {
					if (typeof styles[style] === "undefined") {
						continue;
					} else if (typeof styles[style] == "number" && !(style == "zIndex" || style == "opacity")) {
						if (isNaN(styles[style])) {
							continue;
						}
						if (style.match(/color/i)) {
							styles[style] = "#" + jwplayer.utils.strings.pad(styles[style].toString(16), 6);
						} else {
							styles[style] = Math.ceil(styles[style]) + "px";
						}
					}
					domelement.style[style] = styles[style];
				} catch (err) {
				}
			}
		}
	};
	
	jwplayer.utils.isYouTube = function(path) {
		return path.indexOf("youtube.com") > -1;
	};
	
	jwplayer.utils.getYouTubeId = function(path) {
		path.indexOf("youtube.com" > 0);
	};
	
	/**
	 *
	 * @param {Object} domelement
	 * @param {Object} value
	 */
	jwplayer.utils.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
	};
	
	/**
	 * Stretches domelement based on stretching. parentWidth, parentHeight, elementWidth,
	 * and elementHeight are required as the elements dimensions change as a result of the
	 * stretching. Hence, the original dimensions must always be supplied.
	 * @param {String} stretching
	 * @param {DOMElement} domelement
	 * @param {Number} parentWidth
	 * @param {Number} parentHeight
	 * @param {Number} elementWidth
	 * @param {Number} elementHeight
	 */
	jwplayer.utils.stretch = function(stretching, domelement, parentWidth, parentHeight, elementWidth, elementHeight) {
		if (typeof parentWidth == "undefined" || typeof parentHeight == "undefined" || typeof elementWidth == "undefined" || typeof elementHeight == "undefined") {
			return;
		}
		var xscale = parentWidth / elementWidth;
		var yscale = parentHeight / elementHeight;
		var x = 0;
		var y = 0;
		domelement.style.overflow = "hidden";
		jwplayer.utils.transform(domelement, "");
		var style = {};
		switch (stretching.toLowerCase()) {
			case jwplayer.utils.stretching.NONE:
				// Maintain original dimensions
				style.width = elementWidth;
				style.height = elementHeight;
				break;
			case jwplayer.utils.stretching.UNIFORM:
				// Scale on the dimension that would overflow most
				if (xscale > yscale) {
					// Taller than wide
					style.width = elementWidth * yscale;
					style.height = elementHeight * yscale;
				} else {
					// Wider than tall
					style.width = elementWidth * xscale;
					style.height = elementHeight * xscale;
				}
				break;
			case jwplayer.utils.stretching.FILL:
				// Scale on the smaller dimension and crop
				if (xscale > yscale) {
					style.width = elementWidth * xscale;
					style.height = elementHeight * xscale;
				} else {
					style.width = elementWidth * yscale;
					style.height = elementHeight * yscale;
				}
				break;
			case jwplayer.utils.stretching.EXACTFIT:
				// Distort to fit
				jwplayer.utils.transform(domelement, ["scale(", xscale, ",", yscale, ")", " translate(0px,0px)"].join(""));
				style.width = elementWidth;
				style.height = elementHeight;
				break;
			default:
				break;
		}
		style.top = (parentHeight - style.height) / 2;
		style.left = (parentWidth - style.width) / 2;
		jwplayer.utils.css(domelement, style);
	};
	
	jwplayer.utils.stretching = {
		"NONE": "none",
		"FILL": "fill",
		"UNIFORM": "uniform",
		"EXACTFIT": "exactfit"
	};
})(jwplayer);
/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

    jwplayer.utils.mediaparser = function() {};

	var elementAttributes = {
		element: {
			width: 'width',
			height: 'height',
			id: 'id',
			'class': 'className',
			name: 'name'
		},
		media: {
			src: 'file',
			preload: 'preload',
			autoplay: 'autostart',
			loop: 'repeat',
			controls: 'controls'
		},
		source: {
			src: 'file',
			type: 'type',
			media: 'media',
			'data-jw-width': 'width',
			'data-jw-bitrate': 'bitrate'
				
		},
		video: {
			poster: 'image'
		}
	};
	
	var parsers = {};
	
	jwplayer.utils.mediaparser.parseMedia = function(element) {
		return parseElement(element);
	};
	
	function getAttributeList(elementType, attributes) {
		if (attributes === undefined) {
			attributes = elementAttributes[elementType];
		} else {
			jwplayer.utils.extend(attributes, elementAttributes[elementType]);
		}
		return attributes;
	}
	
	function parseElement(domElement, attributes) {
		if (parsers[domElement.tagName.toLowerCase()] && (attributes === undefined)) {
			return parsers[domElement.tagName.toLowerCase()](domElement);
		} else {
			attributes = getAttributeList('element', attributes);
			var configuration = {};
			for (var attribute in attributes) {
				if (attribute != "length") {
					var value = domElement.getAttribute(attribute);
					if (!(value === "" || value === undefined || value === null)) {
						configuration[attributes[attribute]] = domElement.getAttribute(attribute);
					}
				}
			}
			//configuration.screencolor =
			var bgColor = domElement.style['#background-color'];
			if (bgColor && !(bgColor == "transparent" || bgColor == "rgba(0, 0, 0, 0)")) {
				configuration.screencolor = bgColor;
			}
			return configuration;
		}
	}
	
	function parseMediaElement(domElement, attributes) {
		attributes = getAttributeList('media', attributes);
		var sources = [];
		if (jwplayer.utils.isIE()) {
			// IE6/7/8 case
			var currentElement = domElement.nextSibling;
			if (currentElement !== undefined){
				while(currentElement.tagName.toLowerCase() == "source") {
					sources.push(parseSourceElement(currentElement));
					currentElement = currentElement.nextSibling;
				}				
			}
		} else {
			//var sourceTags = domElement.getElementsByTagName("source");
			var sourceTags = jwplayer.utils.selectors("source", domElement);
			for (var i in sourceTags) {
				if (!isNaN(i)){
					sources.push(parseSourceElement(sourceTags[i]));					
				}
			}
		}
		var configuration = parseElement(domElement, attributes);
		if (configuration.file !== undefined) {
			sources[0] = {
				'file': configuration.file
			};
		}
		configuration.levels = sources;
		return configuration;
	}
	
	function parseSourceElement(domElement, attributes) {
		attributes = getAttributeList('source', attributes);
		var result = parseElement(domElement, attributes);
		result.width = result.width ? result.width : 0;
		result.bitrate = result.bitrate ? result.bitrate : 0;
		return result;
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		return result;
	}
	
	/** For IE browsers, replacing a media element's contents isn't possible, since only the start tag 
	 * is matched by document.getElementById.  This method traverses the elements siblings until it finds 
	 * the closing tag.  If it can't find one, it will not remove the element's siblings.
	 * 
	 * @param toReplace The media element to be replaced
	 * @param html The replacement HTML code (string)
	 **/
	jwplayer.utils.mediaparser.replaceMediaElement = function(toReplace, html) {
		if (jwplayer.utils.isIE()) {
			var endTagFound = false;
			var siblings = [];
			var currentSibling = toReplace.nextSibling;
			while (currentSibling && !endTagFound) {
				siblings.push(currentSibling);
				if (currentSibling.nodeType == 1 && currentSibling.tagName.toLowerCase() == ("/")+toReplace.tagName.toLowerCase() ) {
					endTagFound = true;
				}
				currentSibling = currentSibling.nextSibling;
			}
			if (endTagFound) {
				while (siblings.length > 0) {
					var element = siblings.pop();
					element.parentNode.removeChild(element);
				}
			}
			
			// TODO: This is not required to fix [ticket:1094], but we may want to do it anyway
			// jwplayer.utils.setOuterHTML(toReplace, html);
			toReplace.outerHTML = html;
		}
	};
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jwplayer);
/**
 * Selectors for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.utils.selectors = function(selector, parent) {
		if (parent === undefined) {
			parent = document;
		}
		selector = jwplayer.utils.strings.trim(selector);
		var selectType = selector.charAt(0);
		if (selectType == "#") {
			return parent.getElementById(selector.substr(1));
		} else if (selectType == ".") {
			if (parent.getElementsByClassName) {
				return parent.getElementsByClassName(selector.substr(1));
			} else {
				return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
			}
		} else {
			if (selector.indexOf(".") > 0) {
				var selectors = selector.split(".");
				return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
			} else {
				return parent.getElementsByTagName(selector);
			}
		}
		return null;
	};
	
	jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className, parent) {
		var elements = [];
		if (parent === undefined) {
			parent = document;
		}
		var selected = parent.getElementsByTagName(tagName);
		for (var i = 0; i < selected.length; i++) {
			if (selected[i].className !== undefined) {
				var classes = selected[i].className.split(" ");
				for (var classIndex = 0; classIndex < classes.length; classIndex++) {
					if (classes[classIndex] == className) {
						elements.push(selected[i]);
					}
				}
			}
		}
		return elements;
	};
})(jwplayer);
/**
 * String utilities for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.utils.strings = function() {
	};
	
	/** Removes whitespace from the beginning and end of a string **/
	jwplayer.utils.strings.trim = function(inputString) {
		return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
	};
	
	/**
	 * Pads a string
	 * @param {String} string
	 * @param {Number} length
	 * @param {String} padder
	 */
	jwplayer.utils.strings.pad = function (string, length, padder) {
		if (!padder){
			padder = "0";
		}
		while (string.length < length) {
			string = padder + string;
		}
		return string;
	}
	
})(jwplayer);/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	var _colorPattern = new RegExp(/^(#|0x)[0-9a-fA-F]{3,6}/);
	
	jwplayer.utils.typechecker = function(value, type) {
		type = type === null ? _guessType(value) : type;
		return _typeData(value, type);
	};
	
	function _guessType(value) {
		var bools = ["true", "false", "t", "f"];
		if (bools.toString().indexOf(value.toLowerCase().replace(" ", "")) >= 0) {
			return "boolean";
		} else if (_colorPattern.test(value)) {
			return "color";
		} else if (!isNaN(parseInt(value, 10)) && parseInt(value, 10).toString().length == value.length) {
			return "integer";
		} else if (!isNaN(parseFloat(value)) && parseFloat(value).toString().length == value.length) {
			return "float";
		}
		return "string";
	}
	
	function _typeData(value, type) {
		if (type === null) {
			return value;
		}
		
		switch (type) {
			case "color":
				if (value.length > 0) {
					return _stringToColor(value);
				}
				return null;
			case "integer":
				return parseInt(value, 10);
			case "float":
				return parseFloat(value);
			case "boolean":
				if (value.toLowerCase() == "true") {
					return true;
				} else if (value == "1") {
					return true;
				}
				return false;
		}
		return value;
	}
	
	function _stringToColor(value) {
		switch (value.toLowerCase()) {
			case "blue":
				return parseInt("0000FF", 16);
			case "green":
				return parseInt("00FF00", 16);
			case "red":
				return parseInt("FF0000", 16);
			case "cyan":
				return parseInt("00FFFF", 16);
			case "magenta":
				return parseInt("FF00FF", 16);
			case "yellow":
				return parseInt("FFFF00", 16);
			case "black":
				return parseInt("000000", 16);
			case "white":
				return parseInt("FFFFFF", 16);
			default:
				value = value.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, "$2");
				if (value.length == 3) {
					value = value.charAt(0) + value.charAt(0) + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2);
				}
				return parseInt(value, 16);
		}
		
		return parseInt("000000", 16);
	}
	
})(jwplayer);
/**
 * JW Player Media Extension to Mime Type mapping
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.utils.extensionmap = {
		"flv": {
			//"html5": "video/x-flv",
			"flash": "video"
		},
		"f4a": {
			"html5": "audio/mp4"
		},
		"f4b": {
			"html5": "audio/mp4",
			"flash": "video"
		},
		"f4p": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"f4v": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"mov": {
			"html5": "video/quicktime",
			"flash": "video"
		},
		"m4a": {
			"html5": "audio/mp4",
			"flash": "video"
		},
		"m4b": {
			"html5": "audio/mp4"
		},
		"m4p": {
			"html5": "audio/mp4"
		},
		"m4v": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"mkv": {
			"html5": "video/x-matroska"
		},
		"mp4": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"mp3": {
			//"html5": "audio/mp3",
			"flash": "sound"
		}
	};
})(jwplayer);
/**
 * API for the JW Player
 * @author Pablo
 * @version 5.4
 */
(function(jwplayer) {
	var _players = [];
	
	jwplayer.constructor = function(container) {
		return jwplayer.api.selectPlayer(container);
	};
	
	jwplayer.api = function() {
	};
	
	jwplayer.api.events = {
		API_READY: 'jwplayerAPIReady',
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
		JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
		JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
		JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
		JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
		JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
		JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
		JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState',
		JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
		JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem'
	};
	
	jwplayer.api.events.state = {
		BUFFERING: 'BUFFERING',
		IDLE: 'IDLE',
		PAUSED: 'PAUSED',
		PLAYING: 'PLAYING'
	};
	
	jwplayer.api.PlayerAPI = function(container) {
		this.container = container;
		this.id = container.id;
		
		var _listeners = {};
		var _stateListeners = {};
		var _readyListeners = [];
		var _player = undefined;
		var _playerReady = false;
		var _queuedCalls = [];
		
		var _originalHTML = jwplayer.utils.getOuterHTML(container);
		
		var _itemMeta = {};
		var _currentItem = 0;
		
		/** Use this function to set the internal low-level player.  This is a javascript object which contains the low-level API calls. **/
		this.setPlayer = function(player) {
			_player = player;
		};
		
		this.stateListener = function(state, callback) {
			if (!_stateListeners[state]) {
				_stateListeners[state] = [];
				this.eventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, stateCallback(state));
			}
			_stateListeners[state].push(callback);
			return this;
		};
		
		function stateCallback(state) {
			return function(args) {
				var newstate = args.newstate, oldstate = args.oldstate;
				if (newstate == state) {
					var callbacks = _stateListeners[newstate];
					if (callbacks) {
						for (var c = 0; c < callbacks.length; c++) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, {
									oldstate: oldstate,
									newstate: newstate
								});
							}
						}
					}
				}
			};
		}
		
		this.addInternalListener = function(player, type) {
			player.jwAddEventListener(type, 'function(dat) { jwplayer("' + this.id + '").dispatchEvent("' + type + '", dat); }');
		};
		
		this.eventListener = function(type, callback) {
			if (!_listeners[type]) {
				_listeners[type] = [];
				if (_player && _playerReady) {
					this.addInternalListener(_player, type);
				}
			}
			_listeners[type].push(callback);
			return this;
		};
		
		this.dispatchEvent = function(type) {
			if (_listeners[type]) {
				var args = translateEventResponse(type, arguments[1]);
				for (var l = 0; l < _listeners[type].length; l++) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, args);
					}
				}
			}
		};
		
		function translateEventResponse(type, eventProperties) {
			var translated = jwplayer.utils.extend({}, eventProperties);
			if (type == jwplayer.api.events.JWPLAYER_FULLSCREEN && !translated.fullscreen) {
				translated.fullscreen = translated.message == "true" ? true : false;
				delete translated.message;
			} else if (typeof translated.data == "object") {
				// Takes ViewEvent "data" block and moves it up a level
				translated = jwplayer.utils.extend(translated, translated.data);
				delete translated.data;
			}
			
			var rounders = ["position", "duration", "offset"];
			for (var rounder in rounders) {
				if (translated[rounders[rounder]]) {
					translated[rounders[rounder]] = Math.round(translated[rounders[rounder]] * 1000) / 1000;
				}
			}
			
			return translated;
		}
		
		this.callInternal = function(funcName, args) {
			if (_playerReady) {
				if (typeof _player != "undefined" && typeof _player[funcName] == "function") {
					if (args !== undefined) {
						return (_player[funcName])(args);
					} else {
						return (_player[funcName])();
					}
				}
				return null;
			} else {
				_queuedCalls.push({
					method: funcName,
					parameters: args
				});
			}
		};
		
		this.playerReady = function(obj) {
			_playerReady = true;
			if (!_player) {
				this.setPlayer(document.getElementById(obj.id));
			}
			this.container = document.getElementById(this.id);
			
			for (var eventType in _listeners) {
				this.addInternalListener(_player, eventType);
			}
			
			this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, function(data) {
				if (data.index !== undefined) {
					_currentItem = data.index;
				}
				_itemMeta = {};
			});
			
			this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function(data) {
				jwplayer.utils.extend(_itemMeta, data.metadata);
			});
			
			this.dispatchEvent(jwplayer.api.events.API_READY);
			
			while (_queuedCalls.length > 0) {
				var call = _queuedCalls.shift();
				this.callInternal(call.method, call.parameters);
			}
		};
		
		this.getItemMeta = function() {
			return _itemMeta;
		};
		
		this.getCurrentItem = function() {
			return _currentItem;
		};
		
		this.destroy = function() {
			_listeners = {};
			_queuedCalls = [];
			if (jwplayer.utils.getOuterHTML(this.container) != _originalHTML) {
				jwplayer.api.destroyPlayer(this.id, _originalHTML);
			}
		};
		
		
		/** Using this function instead of array.slice since Arguments are not an array **/
		function slice(list, from, to) {
			var ret = [];
			if (!from) {
				from = 0;
			}
			if (!to) {
				to = list.length - 1;
			}
			for (var i = from; i <= to; i++) {
				ret.push(list[i]);
			}
			return ret;
		}
		
	};
	
	jwplayer.api.PlayerAPI.prototype = {
		// Player properties
		container: undefined,
		options: undefined,
		id: undefined,
		
		// Player Getters
		getBuffer: function() {
			return this.callInternal('jwGetBuffer');
		},
		getDuration: function() {
			return this.callInternal('jwGetDuration');
		},
		getFullscreen: function() {
			return this.callInternal('jwGetFullscreen');
		},
		getHeight: function() {
			return this.callInternal('jwGetHeight');
		},
		getLockState: function() {
			return this.callInternal('jwGetLockState');
		},
		getMeta: function() {
			return this.getItemMeta();
		},
		getMute: function() {
			return this.callInternal('jwGetMute');
		},
		getPlaylist: function() {
			var playlist = this.callInternal('jwGetPlaylist') || [];
			for (var i = 0; i < playlist.length; i++) {
				if (playlist[i].index === undefined) {
					playlist[i].index = i;
				}
			}
			return playlist;
		},
		getPlaylistItem: function(item) {
			if (item === undefined) {
				item = this.getCurrentItem();
			}
			return this.getPlaylist()[item];
		},
		getPosition: function() {
			return this.callInternal('jwGetPosition');
		},
		getState: function() {
			return this.callInternal('jwGetState');
		},
		getVolume: function() {
			return this.callInternal('jwGetVolume');
		},
		getWidth: function() {
			return this.callInternal('jwGetWidth');
		},
		
		// Player Public Methods
		setFullscreen: function(fullscreen) {
			if (fullscreen === undefined) {
				this.callInternal("jwSetFullscreen", !this.callInternal('jwGetFullscreen'));
			} else {
				this.callInternal("jwSetFullscreen", fullscreen);
			}
			return this;
		},
		setMute: function(mute) {
			if (mute === undefined) {
				this.callInternal("jwSetMute", !this.callInternal('jwGetMute'));
			} else {
				this.callInternal("jwSetMute", mute);
			}
			return this;
		},
		lock: function() {
			return this;
		},
		unlock: function() {
			return this;
		},
		load: function(toLoad) {
			this.callInternal("jwLoad", toLoad);
			return this;
		},
		playlistItem: function(item) {
			this.callInternal("jwPlaylistItem", item);
			return this;
		},
		playlistPrev: function() {
			this.callInternal("jwPlaylistPrev");
			return this;
		},
		playlistNext: function() {
			this.callInternal("jwPlaylistNext");
			return this;
		},
		resize: function(width, height) {
			this.container.width = width;
			this.container.height = height;
			return this;
		},
		play: function(state) {
			if (typeof state == "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPlay", state);
			}
			return this;
		},
		pause: function(state) {
			if (typeof state == "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPause", state);
			}
			return this;
		},
		stop: function() {
			this.callInternal("jwStop");
			return this;
		},
		seek: function(position) {
			this.callInternal("jwSeek", position);
			return this;
		},
		setVolume: function(volume) {
			this.callInternal("jwSetVolume", volume);
			return this;
		},
		
		// Player Events
		onBufferChange: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback);
		},
		onBufferFull: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback);
		},
		onError: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback);
		},
		onFullscreen: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback);
		},
		onMeta: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback);
		},
		onMute: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback);
		},
		onPlaylist: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback);
		},
		onPlaylistItem: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback);
		},
		onReady: function(callback) {
			return this.eventListener(jwplayer.api.events.API_READY, callback);
		},
		onResize: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback);
		},
		onComplete: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback);
		},
		onTime: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback);
		},
		onVolume: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback);
		},
		
		// State events
		onBuffer: function(callback) {
			return this.stateListener(jwplayer.api.events.state.BUFFERING, callback);
		},
		onPause: function(callback) {
			return this.stateListener(jwplayer.api.events.state.PAUSED, callback);
		},
		onPlay: function(callback) {
			return this.stateListener(jwplayer.api.events.state.PLAYING, callback);
		},
		onIdle: function(callback) {
			return this.stateListener(jwplayer.api.events.state.IDLE, callback);
		},
		
		setup: function(options) {
			return this;
		},
		remove: function() {
			this.destroy();
		},
		
		// Player plugin API
		initializePlugin: function(pluginName, pluginCode) {
			return this;
		}
		
	};
	
	jwplayer.api.selectPlayer = function(identifier) {
		var _container;
		
		if (identifier === undefined) {
			identifier = 0;
		}
		
		if (identifier.nodeType) {
			// Handle DOM Element
			_container = identifier;
		} else if (typeof identifier == 'string') {
			// Find container by ID
			_container = document.getElementById(identifier);
		}
		
		if (_container) {
			var foundPlayer = jwplayer.api.playerById(_container.id);
			if (foundPlayer) {
				return foundPlayer;
			} else {
				// Todo: register new object
				return jwplayer.api.addPlayer(new jwplayer.api.PlayerAPI(_container));
			}
		} else if (typeof identifier == 'number') {
			return jwplayer.getPlayers()[identifier];
		}
		
		return null;
	};
	
	jwplayer.api.playerById = function(id) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == id) {
				return _players[p];
			}
		}
		return null;
	};
	
	jwplayer.api.addPlayer = function(player) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p] == player) {
				return player; // Player is already in the list;
			}
		}
		
		_players.push(player);
		return player;
	};
	
	jwplayer.api.destroyPlayer = function(playerId, replacementHTML) {
		var index = -1;
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == playerId) {
				index = p;
				continue;
			}
		}
		if (index >= 0) {
			var toDestroy = document.getElementById(_players[index].id);
			if (toDestroy) {
				if (replacementHTML) {
					jwplayer.utils.setOuterHTML(toDestroy, replacementHTML);
				} else {
					var replacement = document.createElement('div');
					replacement.setAttribute('id', toDestroy.id);
					toDestroy.parentNode.replaceChild(replacement, toDestroy);
				}
			}
			_players.splice(index, 1);
		}
		
		return null;
	};
	
	// Can't make this a read-only getter, thanks to IE incompatibility.
	jwplayer.getPlayers = function() {
		return _players.slice(0);
	};
	
})(jwplayer);

var _userPlayerReady = (typeof playerReady == 'function') ? playerReady : undefined;

playerReady = function(obj) {
	var api = jwplayer.api.playerById(obj.id);
	if (api) {
		api.playerReady(obj);
	}
	
	if (_userPlayerReady) {
		_userPlayerReady.call(this, obj);
	}
};
/**
 * Embedder for the JW Player
 * @author Pablo
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.embed = function() {
	};
	
	jwplayer.embed.Embedder = function(playerApi) {
		this.constructor(playerApi);
	};
	
	function _playerDefaults() {
		return [{
			type: "flash",
			src: "player.swf"
		}, {
			type: 'html5'
		}, {
			type: 'download'
		}];
	}
	
	jwplayer.embed.defaults = {
		width: 400,
		height: 300,
		players: _playerDefaults(),
		components: {
			controlbar: {
				position: 'over'
			}
		}
	};
	
	jwplayer.embed.Embedder.prototype = {
		config: undefined,
		api: undefined,
		events: {},
		players: undefined,
		
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, jwplayer.embed.defaults, mediaConfig, this.api.config));
		},
		
		embedPlayer: function() {
			// TODO: Parse playlist for playable content
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
					case 'flash':
						if (jwplayer.utils.flashSupportsConfig(this.config)) {
							if (this.config.file && !this.config.provider) {
								switch (jwplayer.utils.extension(this.config.file).toLowerCase()) {
									case "webm":
									case "ogv":
									case "ogg":
										this.config.provider = "video";
										break;
								}
							}
							
							// TODO: serialize levels & playlist, de-serialize in Flash
							if (this.config.levels || this.config.playlist) {
								this.api.onReady(this.loadAfterReady(this.config));
							}
							
							// Make sure we're passing the correct ID into Flash for Linux API support
							this.config.id = this.api.id;
							
							var flashPlayer = jwplayer.embed.embedFlash(document.getElementById(this.api.id), player, this.config);
							this.api.container = flashPlayer;
							this.api.setPlayer(flashPlayer);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'html5':
						if (jwplayer.utils.html5SupportsConfig(this.config)) {
							var html5player = jwplayer.embed.embedHTML5(document.getElementById(this.api.id), player, this.config);
							this.api.container = document.getElementById(this.api.id);
							this.api.setPlayer(html5player);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'download':
						if (jwplayer.utils.downloadSupportsConfig(this.config)) {
							var item = jwplayer.utils.getFirstPlaylistItemFromConfig(this.config);
							var downloadplayer = jwplayer.embed.embedDownloadLink(document.getElementById(this.api.id), player, this.config);
							this.api.container = document.getElementById(this.api.id);
							this.api.setPlayer(downloadplayer);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
				}
			} else {
				var _wrapper = document.createElement("div");
				this.api.container.appendChild(_wrapper);
				_wrapper.style.position = "relative";
				var _text = document.createElement("p");
				_wrapper.appendChild(_text);
				_text.innerHTML = "No suitable players found";
				jwplayer.embed.embedLogo(jwplayer.utils.extend({position: "bottom-right", margin: 0},this.config.components.logo), "none", _wrapper, this.api.id);
			}
			
			this.setupEvents();
			
			return this.api;
		},
		
		setupEvents: function() {
			for (var evt in this.events) {
				if (typeof this.api[evt] == "function") {
					(this.api[evt]).call(this.api, this.events[evt]);
				}
			}
		},
		
		loadAfterReady: function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					if (!item) {
						item = loadParams;
					}
					if (!item.image) {
						item.image = loadParams.image;
					}
					if (!item.levels) {
						item.levels = loadParams.levels;
					}
					this.load(item);
				}
			};
		},
		
		parseConfig: function(config) {
			var parsedConfig = jwplayer.utils.extend({}, config);
			for (var option in parsedConfig) {
				if (option.indexOf(".") > -1) {
					var path = option.split(".");
					for (var edge in path) {
						if (edge == path.length - 1) {
							config[path[edge]] = parsedConfig[option];
						} else {
							if (config[path[edge]] === undefined) {
								config[path[edge]] = {};
							}
							config = config[path[edge]];
						}
					}
				}
			}
						
			if (typeof parsedConfig.playlist == "string") {
			 	if (!parsedConfig.components.playlist){
					parsedConfig.components.playlist = {};
				}
				parsedConfig.components.playlist.position = parsedConfig.playlist;
				delete parsedConfig.playlist;
			}
			
			if (typeof parsedConfig.controlbar == "string") {
			 	if (!parsedConfig.components.controlbar){
					parsedConfig.components.controlbar = {};
				}
				parsedConfig.components.controlbar.position = parsedConfig.controlbar;	
				delete parsedConfig.controlbar;
			}
			
			if (parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig.events;
			}
			if (parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig.players;
			}
			if (parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}

			if (parsedConfig.components) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parseComponents(parsedConfig.components));
				}
			}
			
			return parsedConfig;
		}
		
	};
	
	jwplayer.embed.embedFlash = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, _options);
		
		var width = params.width;
		delete params.width;
		
		var height = params.height;
		delete params.height;
		
		delete params.levels;
		delete params.playlist;
		
		var wmode = "opaque";
		if (params.wmode) {
			wmode = params.wmode;
		}
		
		jwplayer.embed.parseConfigBlock(params, 'components');
		jwplayer.embed.parseConfigBlock(params, 'providers');
		
		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' +
			'width="' +
			width +
			'" height="' +
			height +
			'" ' +
			'id="' +
			_container.id +
			'" name="' +
			_container.id +
			'">';
			html += '<param name="movie" value="' + _player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="wmode" value="' + wmode + '">';
			html += '<param name="flashvars" value="' +
			jwplayer.embed.jsonToFlashvars(params) +
			'">';
			html += '</object>';
			if (_container.tagName.toLowerCase() == "video") {
				jwplayer.utils.mediaparser.replaceMediaElement(_container, html);
			} else {
				// TODO: This is not required to fix [ticket:1094], but we may want to do it anyway 
				// jwplayer.utils.setOuterHTML(_container, html);
				_container.outerHTML = html;
			}
			return document.getElementById(_container.id);
		} else {
			var obj = document.createElement('object');
			obj.setAttribute('type', 'application/x-shockwave-flash');
			obj.setAttribute('data', _player.src);
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', _container.id);
			obj.setAttribute('name', _container.id);
			jwplayer.embed.appendAttribute(obj, 'allowfullscreen', 'true');
			jwplayer.embed.appendAttribute(obj, 'allowscriptaccess', 'always');
			jwplayer.embed.appendAttribute(obj, 'wmode', wmode);
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
			_container.parentNode.replaceChild(obj, _container);
			return obj;
		}
	};
	
	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "";
			var playerOptions = jwplayer.utils.extend({
				screencolor: '0x000000'
			}, options);
			jwplayer.embed.parseConfigBlock(playerOptions, 'components');
			// TODO: remove this requirement from the html5 player (sources instead of levels)
			if (playerOptions.levels && !playerOptions.sources) {
				playerOptions.sources = options.levels;
			}
			if (playerOptions.skin && playerOptions.skin.toLowerCase().indexOf(".zip") > 0) {
				playerOptions.skin = playerOptions.skin.replace(/\.zip/i, ".xml");
			}
			return new (jwplayer.html5(container)).setup(playerOptions);
		} else {
			return null;
		}
	};
	
	jwplayer.embed.embedLogo = function(logoConfig, mode, container, id) {
		var _defaults = {
			prefix: 'http://l.longtailvideo.com/'+mode+'/',
			file: "logo.png",
			link: "http://www.longtailvideo.com/players/jw-flv-player/",
			margin: 8,
			out: 0.5,
			over: 1,
			timeout: 3,
			hide: false,
			position: "bottom-left"
		};
		
		var _css = jwplayer.utils.css;
		
		var _logo;
		var _settings;
		
		_setup();
		
		function _setup() {
			_setupConfig();
			_setupDisplayElements();
			_setupMouseEvents();
		}
		
		function _setupConfig() {
			if (_defaults.prefix) {
				var version = jwplayer.version.split(/\W/).splice(0, 2).join("/");
				if (_defaults.prefix.indexOf(version) < 0) {
					_defaults.prefix += version + "/";
				}
			}
			
			_settings = jwplayer.utils.extend({}, _defaults);
		}
		
		function _getStyle() {
			var _imageStyle = {
				border: "none",
				textDecoration: "none",
				position: "absolute",
				cursor: "pointer",
				zIndex: 10
			};
			_imageStyle.display = _settings.hide ? "none" : "block";
			var positions = _settings.position.toLowerCase().split("-");
			for (var position in positions) {
				_imageStyle[positions[position]] = _settings.margin;
			}
			return _imageStyle;
		}
		
		function _setupDisplayElements() {
			_logo = document.createElement("img");
			_logo.id = id + "_jwplayer_logo";
			_logo.style.display = "none";
			
			_logo.onload = function(evt) {
				_css(_logo, _getStyle());
				_outHandler();
			};
			
			if (!_settings.file) {
				return;
			}
			
			if (_settings.file.indexOf("http://") === 0) {
				_logo.src = _settings.file;
			} else {
				_logo.src = _settings.prefix + _settings.file;
			}
		}
		
		if (!_settings.file) {
			return;
		}
		
		
		function _setupMouseEvents() {
			if (_settings.link) {
				_logo.onmouseover = _overHandler;
				_logo.onmouseout = _outHandler;
				_logo.onclick = _clickHandler;
			} else {
				this.mouseEnabled = false;
			}
		}
		
		
		function _clickHandler(evt) {
			if (typeof evt != "undefined") {
				evt.preventDefault();
				evt.stopPropagation();
			}
			if (_settings.link) {
				window.open(_settings.link, "_blank");
			}
			return;
		}
		
		function _outHandler(evt) {
			if (_settings.link) {
				_logo.style.opacity = _settings.out;
			}
			return;
		}
		
		function _overHandler(evt) {
			if (_settings.hide) {
				_logo.style.opacity = _settings.over;
			}
			return;
		}
		
		container.appendChild(_logo);
	}
	
	jwplayer.embed.embedDownloadLink = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, _options);
		
		var _display = {};
		var _width = _options.width ? _options.width : 480;
		if (typeof _width != "number") {
			_width = parseInt(_width, 10);
		}
		var _height = _options.height ? _options.height : 320;
		if (typeof _height != "number") {
			_height = parseInt(_height, 10);
		}
		var _file, _image, _cursor;
		
		var item = {};
		if (_options.playlist && _options.playlist.length) {
			item.file = _options.playlist[0].file;
			_image = _options.playlist[0].image;
			item.levels = _options.playlist[0].levels;
		} else {
			item.file = _options.file;
			_image = _options.image;
			item.levels = _options.levels;
		}
		
		if (item.file) {
			_file = item.file;
		} else if (item.levels && item.levels.length) {
			_file = item.levels[0].file;
		}
		
		_cursor = _file ? "pointer" : "auto";
		
		var _elements = {
			display: {
				style: {
					cursor: _cursor,
					width: _width,
					height: _height,
					backgroundColor: "#000",
					position: "relative",
					textDecoration: "none",
					border: "none",
					display: "block"
				}
			},
			display_icon: {
				style: {
					cursor: _cursor,
					position: "absolute",
					display: _file ? "block" : "none",
					top: 0,
					left: 0,
					border: 0,
					margin: 0,
					padding: 0,
					zIndex: 3,
					width: 50,
					height: 50,
					backgroundImage: ""
				}
			},
			display_iconBackground: {
				style: {
					cursor: _cursor,
					position: "absolute",
					display: _file ? "block" : "none",
					top: ((_height - 50) / 2),
					left: ((_width - 50) / 2),
					border: 0,
					width: 50,
					height: 50,
					margin: 0,
					padding: 0,
					zIndex: 2,
					backgroundImage: ""
				}
			},
			display_image: {
				style: {
					width: _width,
					height: _height,
					display: _image ? "block" : "none",
					position: "absolute",
					cursor: _cursor,
					left: 0,
					top: 0,
					margin: 0,
					padding: 0,
					textDecoration: "none",
					zIndex: 1,
					border: "none"
				}
			}
		};
		
		var createElement = function(tag, element, id) {
			var _element = document.createElement(tag);
			if (id) {
				_element.id = id;
			} else {
				_element.id = _container.id + "_jwplayer_" + element;
			}
			jwplayer.utils.css(_element, _elements[element].style);
			return _element;
		};
		
		_display.display = createElement("a", "display", _container.id);
		if (_file) {
			_display.display.setAttribute("href", jwplayer.utils.getAbsolutePath(_file));
		}
		_display.display_image = createElement("img", "display_image");
		_display.display_image.setAttribute("alt", "Click to download...");
		if (_image) {
			_display.display_image.setAttribute("src", jwplayer.utils.getAbsolutePath(_image));
		}
		//TODO: Add test to see if browser supports base64 images?
		if (true) {
			_display.display_icon = createElement("div", "display_icon");
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
		}
		
		_container.parentNode.replaceChild(_display.display, _container);
		
		var logoConfig = (_options.plugins && _options.plugins.logo) ? _options.plugins.logo : {};
		
		jwplayer.embed.embedLogo(_options.components.logo, "download", _display.display, _container.id);
		
		return _display.display;
	};
	
	jwplayer.embed.appendAttribute = function(object, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		object.appendChild(param);
	};
	
	jwplayer.embed.jsonToFlashvars = function(json) {
		var flashvars = json.netstreambasepath ? '' : 'netstreambasepath=' + escape(window.location.href) + '&';
		for (var key in json) {
			flashvars += key + '=' + escape(json[key]) + '&';
		}
		return flashvars.substring(0, flashvars.length - 1);
	};
	
	jwplayer.embed.parsePlugins = function(pluginBlock) {
		if (!pluginBlock) {
			return {};
		}
		
		var flat = {}, pluginKeys = [];
		
		for (var plugin in pluginBlock) {
			var pluginName = jwplayer.utils.getPluginName(plugin);
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (var param in pluginConfig) {
				flat[pluginName + '.' + param] = pluginConfig[param];
			}
		}
		flat.plugins = pluginKeys.join(',');
		return flat;
	};
	
	jwplayer.embed.parseComponents = function(componentBlock) {
		if (!componentBlock) {
			return {};
		}
		
		var flat = {};
		
		for (var component in componentBlock) {
			var componentConfig = componentBlock[component];
			for (var param in componentConfig) {
				flat[component + '.' + param] = componentConfig[param];
			}
		}
		
		return flat;
	};
	
	jwplayer.embed.parseConfigBlock = function(options, blockName) {
		if (options[blockName]) {
			var components = options[blockName];
			for (var name in components) {
				var component = components[name];
				if (typeof component == "string") {
					// i.e. controlbar="over"
					if (!options[name]) {
						options[name] = component;
					}
				} else {
					// i.e. controlbar.position="over"
					for (var option in component) {
						if (!options[name + '.' + option]) {
							options[name + '.' + option] = component[option];
						}
					}
				}
			}
			delete options[blockName];
		}
	};
	
	jwplayer.api.PlayerAPI.prototype.setup = function(options, players) {
		if (options && options.flashplayer && !options.players) {
			options.players = _playerDefaults();
			options.players[0].src = options.flashplayer;
			delete options.flashplayer;
		}
		if (players && !options.players) {
			if (typeof players == "string") {
				options.players = _playerDefaults();
				options.players[0].src = players;
			} else if (players instanceof Array) {
				options.players = players;
			} else if (typeof players == "object" && players.type) {
				options.players = [players];
			}
		}
		
		// Destroy original API on setup() to remove existing listeners
		var newId = this.id;
		this.remove();
		var newApi = jwplayer(newId);
		newApi.config = options;
		return (new jwplayer.embed.Embedder(newApi)).embedPlayer();
	};
	
	function noviceEmbed() {
		if (!document.body) {
			return setTimeout(noviceEmbed, 15);
		}
		var videoTags = jwplayer.utils.selectors.getElementsByTagAndClass('video', 'jwplayer');
		for (var i = 0; i < videoTags.length; i++) {
			var video = videoTags[i];
			jwplayer(video.id).setup({
				players: [{
					type: 'flash',
					src: '/jwplayer/player.swf'
				}, {
					type: 'html5'
				}]
			});
		}
	}
	
	noviceEmbed();
	
	
})(jwplayer);
