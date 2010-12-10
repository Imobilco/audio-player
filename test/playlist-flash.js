/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../src/utils.js"
 */
playbackFlashProxy.init({
	swf_url: '../src/lib/jwplayer/player.swf',
	provider: 'http'
}, playbackContext);

$.get('../misc/example.xspf', function(data) {
	var xspf = new XSPF(data);
	new Playlist(xspf.containers.flv, getOneByClass('imob-playlist'), playbackFlashProxy);
});