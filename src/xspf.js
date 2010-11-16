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
 * @inherits IPlaylist
 * 
 * @example
 * var playlist = new XSPF('http://mysite.com/playlist.xspf');
 * alert(playlist.title);
 * 
 * @param {String|Document} data Content of the playlist.
 * @include "IPlaylist.js"
 */
var XSPF = (function(){
	var playlist_fields = ['title', 'creator', 'annotation', 'info', 'identifier', 'image', 'date', 'location'],
		track_fields = ['title', 'creator', 'annotation', 'info', 'image', 'album', 'trackNum', 'duration'],
		track_multi_fields = ['location', 'identifier'];
		
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
			re_date = /^(\d{4})\-(\d{2})\-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[\+\-](\d{2}):(\d{2}))?$/;
			
		if (m = date_str.match(re_date)) {
			result.setUTCFullYear(toInt(m[1]));
			result.setUTCMonth(toInt(m[2]) - 1);
			result.setUTCDate(toInt(m[3]));
			
			var hh = toInt(m[4]), 
				mm = toInt(m[5]),
				ss = toInt(m[6]);
				
			switch ((m[8] || ' ').charAt(0)) {
				case '-':
					hh += toInt(m[9]);
					mm += toInt(m[10]);
					break;
				case '+':
					hh += toInt(m[9]);
					mm += toInt(m[10]);
					break;
			}
			
			result.setUTCHours(hh, mm, ss, parseFloat(m[7] || 0));
			return result;
		}
	}
	
	/**
	 * @class
	 * @param {String|Document} data Content of the playlist.
	 */
	function XSPFPlaylist(data) {
		if (typeof data == 'string')
			data = toXML(data);
			
		if (data) {
			var children = processNode(data.documentElement, playlist_fields, this);
			if (this.date)
				this.date = parseDate(this.date);
			
			if (children.trackList) {
				this.trackList = [];
				this.tracks = [];
				
				var re_ext = /\.(\w+)$/,
					tracks = children.trackList.getElementsByTagName('track');
					
				for (var i = 0, il = tracks.length; i < il; i++) {
					var t = new XSPFTrack(tracks[i], this);
					this.trackList.push(t);
					
					// add some sugar
					var track_obj = {};
					for (var j = 0, jl = t.location.length; j < jl; j++) {
						var m_ext = t.location[j].match(re_ext);
						if (m_ext) {
							track_obj[m_ext[1]] = {
								location: t.location[j],
								id: t.identifier[j] || null,
								playlist: this
							};
						}
					}
					
					this.tracks.push(track_obj);
				}
			}
		}
	}
	
	/**
	 * Track entry for XSPF playlist. Should be instantiated inside XSPF() constructor
	 * @class
	 * @param {Element} node XML node that represents track information
	 * @param {XSPF} playlist Backreference to containing playlist
	 */
	function XSPFTrack(node, playlist) {
		var children = processNode(node, track_fields, this);
		
		this.playlist = playlist;
		
		// do some postprocessing
		if (this.trackNum) this.trackNum = toInt(this.trackNum);
		if (this.duration) this.duration = toInt(this.duration);
		
		// find all multifields
		var tags, name;
		for (var i = 0, il = track_multi_fields.length; i < il; i++) {
			name = track_multi_fields[i];
			tags = node.getElementsByTagName(name);
			this[name] = [];
			for (var j = 0, jl = tags.length; j < jl; j++) {
				this[name].push(tags[j].firstChild.nodeValue);
			}
		}
	}
	
	/**
	 * @class
	 * @param {String|Document} data Content of the playlist.
	 */
	return XSPFPlaylist;
})();
