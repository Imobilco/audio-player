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
 */function XSPF(data) {
	/** @type {String} A human-readable title for the playlist */
	this.title = null;
	
	/** 
	 * @type {String} Human-readable name of the entity (author, authors, group, 
	 * company, etc) that authored the playlist. 
	 */
	this.creator = null;
	
	/** @type {String} A human-readable comment on the playlist */
	this.annotation = null;
	
	/** 
	 * @type {String} URI of a web page to find out more about this playlist. 
	 * Likely to be homepage of the author, and would be used to find out more 
	 * about the author and to find more playlists by the author 
	 */
	this.info = null;
	
	/** @type {String} Source URI for this playlist */
	this.location = null;
	
	/** 
	 * @type {String} Canonical ID for this playlist. Likely to be a hash or 
	 * other location-independent name. 
	 */
	this.identifier = null;
	
	/** 
	 * @type {String} URI of an image to display in the absence of 
	 * a //playlist/trackList/image element. 
	 */
	this.image = null;
	
	/** @type {Date} Creation date (not last-modified date) of the playlist */
	this.date = null;
	
	/** 
	 * @type {String} URI of a resource that describes the license under which 
	 * this playlist was released 
	 */
	this.license = null;
	
	/** @type {XSPFTrack[]} Ordered list of tracks */
	this.trackList = [];
	
	// TODO meta and links
}

/**
 * Converts text to XML document
 * @param {String} text
 * @return {Document}
 */
XSPF.toXML = function(text) {
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
};

XSPF.prototype = {
	
}

/**
 * Track entry for XSPF playlist. Should be instantiated inside XSPF() constructor
 * @param {Node} node XML node that represents track information
 * @param {XSPF} playlist Backreference to containing playlist
 */
function XSPFTrack(node, playlist) {
	
}