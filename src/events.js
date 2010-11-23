/**
 * List of dispatched events, mostly by playback context
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
 
/** Playback has begun */var EVT_PLAY = 'play',
	/** Playback is paused */
	EVT_PAUSE = 'pause',
	/**
	 * Seeking current track. 
	 * <code>evt.data</code> contains <code>position</code>, <code>duration</code>,
	 * <code>percent</code>
	 */
	EVT_SEEK = 'seek',
	
	/**
	 * Constantly dispached event when media is playing.
	 * <code>evt.data</code> contains <code>position</code>, <code>duration</code>
	 */
	EVT_PLAYING = 'playing',
	
	/**
	 * Dispatched when media source is changed
	 * <code>evt.data</code> contains new source
	 */
	EVT_SOURCE_CHANGED = 'source_changed',
	
	/**
	 * Dispatched when media volume is changed
	 * <code>evt.data</code> contains new volume
	 */
	EVT_VOLUME = 'volume',
	
	/**
	 * Dispatched when media source looping is enabled or disabled
	 * <code>evt.data</code> contains looping state (enabled/disabled)
	 */
	EVT_LOOPING_CHANGED = 'looping_changed',
	
	/**
	 * Start dragging player's playhead
	 * <code>evt.data</code> contains <code>playbackContext</code> instance
	 */
	EVT_PLAYHEAD_DRAG_START = 'playhead_drag_start',
	
	/**
	 * Dragging player's playhead
	 * <code>evt.data</code> contains <code>playbackContext</code> instance
	 */
	EVT_PLAYHEAD_DRAG_MOVE = 'playhead_drag_move',
	
	/**
	 * Stop dragging player's playhead
	 * <code>evt.data</code> contains <code>playbackContext</code> instance
	 */
	EVT_PLAYHEAD_DRAG_STOP = 'playhead_drag_stop',
	
	/**
	 * UI element that represents player has been changed
	 * <code>evt.data</code> contains <code>oldElement</code> : <code>HTMLElement</code>
	 * and <code>newElement</code> : <code>HTMLElement</code>
	 */
	EVT_CHANGE_CONTEXT_ELEMENT = 'change_ctx_elem',
	
	/**
	 * Constantly dispatches a load progress event.
	 * <code>evt.data</code> represents a single of loaded or available data
	 * as <code>start</code> (from 0.0 to 1.0) and <code>end</code> (from 0.0 to 1.0)
	 * properties 
	 */
	EVT_LOAD_PROGRESS = 'progress';