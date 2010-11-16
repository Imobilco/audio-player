/**
 * Playlist interface that should be supported by different playleist formats
 * @class
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */function IPlaylist() {
	
}

IPlaylist.prototype = {
	/**
	 * List of playlist items defined as hashes where file extension is a key,
	 * e.g. <code>tracks[0]['mp3'] = new IPlaylistItem()</code>
	 * @type {IPlaylistItem[]}
	 */
	tracks: []
};

/**
 * Single item in playlist
 * @class
 */
function IPlaylistItem() {
	
}

IPlaylistItem.prototype = {
	/** URL of the track */
	location: '',
	/** Unique ID of the track */
	id: '',
	
	/** Backreference to playlist */
	playlist: new IPlaylist()
};