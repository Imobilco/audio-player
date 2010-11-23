/**
 * Creates new player HTML skin instace from <code>IPlaylistItem</code>
 * @param {IPlaylistItem} track
 * @return {Element}
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "interfaces/IPlaylist.js"
 * @include "utils.js"
 */function playerUIFactory(track) {
	var track_num = track.trackNum,
		default_title = 'Untitled track';
		
	if (!track_num) {
		// find track num from its position in playlist
		track_num = 0;
		var prev = track;
		do {
			track_num++;
		} while (prev = prev.prevTrack);
	}
	
	var div = document.createElement('div');
	
	div.innerHTML = '<div class="imob-player">' +
		'<div class="imob-player-play-button"><i class="imob-player-play-icon"></i></div>' +
		'<div class="imob-player-labels">' +
			'<span class="imob-player-track-num">' + track_num + '</span>' +
			'<span class="imob-player-track-name">' + (track.title || default_title) + '</span>' +
			'<span class="imob-player-track-last-play"></span>' +
			'<span class="imob-player-time">' + formatTime(track.duration) + '</span>' +
		'</div>' +
		'<div class="imob-player-shaft">' +
			'<div class="imob-player-playhead"></div>' +
			'<div class="imob-player-progress"></div>' +
			'<div class="imob-player-load-progress"></div>' +
			'<div class="imob-player-shaft-bar"></div>' +
		'</div>' +
		'</div>';
			
	return div.firstChild;
}