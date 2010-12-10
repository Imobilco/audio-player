/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../src/utils.js"
 * @include "../src/imob_player.js"
 */
$.get('../misc/example.xspf', function(data) {
	var xspf = new XSPF(data);
	
	// force Flash usage
//	imob_player.setMedia(playbackFlashProxy);
	
	var playlist = imob_player.createPlaylist(xspf.containers, getOneByClass('imob-playlist'));
	if (!playlist) {
		console.log("Can't play any type");
	}
});