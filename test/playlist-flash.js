/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../src/utils.js"
 */
playbackFlashProxy.init({}, playbackContext);

$.get('../misc/example.xspf', function(data) {
	var xspf = new XSPF(data);
	new Playlist(xspf.containers.mp3, getOneByClass('imob-playlist'), playbackFlashProxy);
});