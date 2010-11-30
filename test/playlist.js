/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../src/utils.js"
 */
var audio = new Audio;
//var audio = document.getElementById('test');
audio.loop = false;
//audio.muted = true;
audio.volume = 0.1;
playbackProxy.init(audio, playbackContext);

function canPlay(type) {
	var r = audio.canPlayType(type);
	return r && r != 'no';
}

$.get('../misc/example.xspf', function(data) {
	var xspf = new XSPF(data);
	var format;
	if (canPlay('audio/mpeg'))
		format = 'mp3';
	else if (canPlay('audio/ogg'))
		format = 'ogg';
	
	if (format)
		new Playlist(xspf.containers[format], getOneByClass('imob-playlist'), playbackProxy);
	else 
		console.log("Can't play any type");
});