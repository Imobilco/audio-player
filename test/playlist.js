/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../src/utils.js"
 */
var audio = new Audio;
audio.muted = true;
audio.volume = 0;
playbackProxy.init(audio, playbackContext);

$.get('../misc/example.xspf', function(data) {
	var xspf = new XSPF(data);
	var playlist = new Playlist(xspf.containers.mp3, getOneByClass('imob-playlist'), playbackProxy);
});