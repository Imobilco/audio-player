/**
 * JavaScript parser of XSPF: the XML format for sharing playlists.
 * When parsed, the playlist infomation is availble through getter methods
 * like <code>getTitle()</code> or <code>getTrackList()</code>.
 * 
 * Also supports additional extension for pointing to alternative format location
 * (like 'ogg') via http://imobilco.ru/playlist namespace 
 * @link http://xspf.xiph.org/
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @class
 * 
 * @example
 * var playlist = new XSPF('http://mysite.com/playlist.xspf');
 * alert(playlist.title);
 * 
 * @param {String|Document} data Content of the playlist.
 */
var XSPF = (function(){
	var playlist_fields = ['title', 'creator', 'annotation', 'info', 'location', 'identifier', 'image', 'date'],
		track_fields = ['location', 'identifier', 'title', 'creator', 'annotation', 'info', 'image', 'album', 'trackNum', 'duration'];
		
	function toXML(text) {
		var xmldoc = null;
		try {
			if (window.ActiveXObject) { // IE
				xmldoc = new ActiveXObject('Microsoft.XMLDOM');
				xmldoc.async = false;
				xmldoc.loadXML(text);
			} else if (window.DOMParser) { // Все остальные
				var xmldoc = (new DOMParser()).parseFromString(text, 'text/xml');
			}
			
			if (!xmldoc || !xmldoc.documentElement
					|| xmldoc.documentElement.nodeName == 'parsererror'
					|| xmldoc.getElementsByTagName('parsererror').length) {
				return null;
			}
		} catch (error) {
			return null;
		}
		
		return xmldoc;
	}
		
		
	/**
	 * Processes DOM node, copying nodes value defined in <code>fields</code>
	 * array into <code>target</code> object as properties
	 * @param {Node} node DOM node to process
	 * @param {Array} fields List of DOM nodes to copy as fields
	 * @param {Object} target Object to copy fields to
	 * @return {Node[]} List of child nodes 
	 */
	function processNode(node, fields, target) {
		// copy all child nodes
		var children = {}, n, field;
		for (var i = 0, il = node.childNodes.length; i < il; i++) {
			/** @type {Node} */
			n = node.childNodes[i];
			if (n.nodeType == 1) {
				children[n.nodeName] = n;
			}
		}
		
		for (var j = 0, jl = fields.length; j < jl; j++) {
			field = fields[j];
			target[field] = (field in children) 
				? children[field].firstChild.nodeValue 
				: null;
		}
		
		return children;
	}
	
	function toInt(str) {
		return parseInt(str, 10);
	}
	
	
	/**
	 * Parses date string in XML dateTime format
	 * @param {String} date_str Date string
	 * @return {Date}
	 */
	function parseDate(date_str) {
		var m, result = new Date,
			re_date = /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[\+\-]\d{2}:\d{2}))/;
		if (m = date_str.match(re_date)) {
			result.setFullYear(toInt(m[0]));
			result.setMonth(toInt(m[1]) - 1);
			result.setDate(toInt(m[2]) - 1);
		}
	}
	
	/**
	 * Track entry for XSPF playlist. Should be instantiated inside XSPF() constructor
	 * @class
	 * @param {Node} node XML node that represents track information
	 * @param {XSPF} playlist Backreference to containing playlist
	 */
	function XSPFTrack(node, playlist) {
		
	}
	
	/**
	 * @param {String|Document} data Content of the playlist.
	 */
	return function(data) {
		if (typeof data == 'string')
			data = toXML(data);
			
		if (data) {
			var children = processNode(data.documentElement, playlist_fields, this);
			
		}
	}
})();
