import CalamansiAudio from './CalamansiAudio';
import CalamansiSkin from './CalamansiSkin';
import TrackInfoReader from './services/TrackInfoReader';

class Calamansi
{
    constructor(el, options = {}) {
        /* DATA */
        this._options = Object.assign({
            // Default options...
            loop: false,
            shuffle: false,
            volume: 100,
            preloadTrackInfo: false,
            loadTrackInfoOnPlay: true,
            defaultAlbumCover: '',
            soundcloudClientId: '',
        }, options);

        // Make sure we have all the required options provided and the values
        // are all correct
        try {
            this._validateOptions();
        } catch (error) {
            console.error(`Calamansi intialization error: ${error}`);

            return;
        }

        /* STATE */
        this._initialized = false;

        this._trackInfoReader = new TrackInfoReader(this._options.soundcloudClientId);

        this.el = el;
        this.id = el.id ? el.id : this._generateUniqueId();

        this._eventListeners = {
            initialized: [],
            play: [],
            pause: [],
            stop: [],
            trackEnded: [],
            loadeddata: [],
            loadedmetadata: [],
            canplaythrough: [],
            loadingProgress: [],
            timeupdate: [],
            volumechange: [],
            ratechange: [],
            playlistLoaded: [],
            playlistReordered: [],
            playlistSwitched: [],
            trackInfoReady: [],
            trackSwitched: [],
        };

        this._skin = null;
        this.audio = null;
        
        this._playlists = [];
        this._currentPlaylist = null;
        this._currentTrack = null;
        this._currentPlaylistOrder = [];

        /* INITIALIZE PLAYER INSTANCE */
        this._init();
    }

    /**
     * Automatically initialize all the player instances
     * 
     * @param string className = 'calamansi'
     */
    static autoload(className = 'calamansi') {
        const calamansis = [];
        const elements = document.querySelectorAll(`.${className}`);

        // Initialize all the player instances
        elements.forEach(el => {
            calamansis.push(new Calamansi(el, this._readOptionsFromElement(el)));
        });

        return calamansis;
    }

    /**
     * Read options from a DOM element for autoloaded instances
     * 
     * @param {*} el 
     */
    static _readOptionsFromElement(el) {
        const options = {};

        options.skin = el.dataset.skin ? el.dataset.skin : null;

        if (el.dataset.source) {
            options.playlists = {
                'default': [{ source: el.dataset.source }]
            };
        }

        return options;
    }

    _validateOptions() {
        if (!this._options.skin) {
            throw 'No skin provided.';
        }
    }

    async _init() {
        // Prepare playlists/audio source, load the first track to play
        this._preparePlaylists();

        // Register internal event listeners
        this._registerEventListeners();

        // Initialize the skin
        this._skin = new CalamansiSkin(this, this._options.skin);
        await this._skin.init();

        this.el = document.getElementById(this.id);

        // Initialization done!
        this._initialized = true;
        
        this._emit('initialized', this);
        CalamansiEvents._emit('initialized', this);

        // Load the first playlist with at least 1 track
        this._loadPlaylist(this.currentPlaylist());

        if (this.audio) {
            this.audio.changeVolume(this._options.volume / 100);
        }
    }

    _generateUniqueId() {
        const id = Math.random().toString(36).substr(2, 5);

        return document.querySelectorAll(`calamansi-${id}`).length > 0
            ? this._generateUniqueId()
            : `calamansi-${id}`;
    }

    /**
     * Read playlist information from the provided options, select the first
     * playlist and track to be played
     */
    _preparePlaylists() {
        if (this._options.playlists && Object.keys(this._options.playlists).length > 0) {
            let playlistIndex = 0;

            for (let name in this._options.playlists) {
                let playlist = {
                    name: name,
                    list: []
                };
                
                if (!Array.isArray(this._options.playlists[name])) {
                    continue;
                }

                for (let track of this._options.playlists[name]) {
                    if (!track.source) {
                        continue;
                    }

                    track.info = track.info ? track.info : {};
                    track.info.url = track.source;
                    track.info.filename = this._getTrackFilename(track);
                    track.info.name = track.info.title
                        ? track.info.title
                        : track.info.filename;
                    track.info.titleOrFilename = track.info.title
                        ? track.info.title
                        : track.info.filename;
                    track.info.artistOrFilename = track.info.artist
                        ? track.info.artist
                        : track.info.filename;
                    track.sourceType = this._getTrackSourceType(track);

                    playlist.list.push(track);

                    // Load track info
                    if (this._options.preloadTrackInfo) {
                        this._loadTrackInfo(track);
                    }

                    // Set the first playlist with at least 1 track as the
                    // current playlist
                    if (this._currentPlaylist === null) {
                        this._currentPlaylist = playlistIndex;
                    }
                }
                
                this._playlists.push(playlist);

                playlistIndex++;
            }

            // If no tracks were found - set the first playlist as the current
            if (this._currentPlaylist === null) {
                this._currentPlaylist = 0;
            }
        }
    }

    _loadPlaylist(playlist) {
        if (!playlist) {
            return;
        }

        if (this._options.shuffle) {
            this._shuffleCurrentPlaylist(false);
        } else {
            this._unshuffleCurrentPlaylist(false);
        }
        
        this.switchTrack(0);

        this._emit('playlistLoaded', this);
        CalamansiEvents._emit('playlistLoaded', this);
    }

    /**
     * Switch to a playlist by index
     * 
     * @param int index
     */
    switchPlaylist(index) {
        this._currentPlaylist = index;

        this._emit('playlistSwitched', this);
        CalamansiEvents._emit('playlistSwitched', this);

        // Load the first track to play
        this._loadPlaylist(this.currentPlaylist());
    }

    _loadTrack(track) {
        if (!this.audio) {
            this.audio = new CalamansiAudio(this, track.source);

            if (this._options.loadTrackInfoOnPlay) {
                this._loadTrackInfo(track);
            }

            return;
        }

        this.audio.load(track.source);

        if (this._options.loadTrackInfoOnPlay) {
            this._loadTrackInfo(track);
        }
    }

    /**
     * Switch to a track by index
     * 
     * @param int index
     * @param boolean startPlaying = false
     */
    switchTrack(index, startPlaying = false) {
        this._currentTrack = index;

        this._emit('trackSwitched', this);
        CalamansiEvents._emit('trackSwitched', this);

        // Load the first track to play
        this._loadTrack(this.currentTrack());

        if (startPlaying) {
            this.audio.play();
        }
    }

    _getTrackFilename(track) {
        if (track.source.startsWith('https://api.soundcloud.com')) {
            return track.source;
        }

        return track.source.split('/').pop();
    }

    _getTrackSourceType(track) {
        if (track.source.startsWith('https://api.soundcloud.com')) {
            return 'soundcloud';
        }

        return track.info.filename.split('.').pop();
    }

    _loadTrackInfo(track) {
        if (track.info._loaded === true) {
            return;
        }

        this._trackInfoReader.read(track)
            .then(trackInfo => {
                if (!trackInfo._loaded) {
                    return;
                }

                track.info = Object.assign(track.info, trackInfo);

                this._emit('trackInfoReady', this, track);
                CalamansiEvents._emit('trackInfoReady', this);
            });
    }

    /**
     * Get the current playlist
     */
    currentPlaylist() {
        return this._playlists[this._currentPlaylist];
    }

    /**
     * Get the current track
     */
    currentTrack() {
        return this.currentPlaylist()
            ? this.currentPlaylist().list[this._currentPlaylistOrder[this._currentTrack]]
            : null;
    }

    /**
     * Switch to the next track
     */
    nextTrack() {
        if (this._currentTrack + 1 < this.currentPlaylist().list.length) {
            this.switchTrack(this._currentTrack + 1, true);

            return true;
        } else {
            if (this._options.loop) {
                this.switchTrack(0, true);

                return true;
            }
        }

        return false;
    }

    /**
     * Switch to the previous track
     */
    prevTrack() {
        if (this._currentTrack - 1 >= 0) {
            this.switchTrack(this._currentTrack - 1, true);

            return true;
        } else {
            if (this._options.loop) {
                this.switchTrack(this.currentPlaylist().list.length - 1, true);

                return true;
            }
        }

        return false;
    }

    /**
     * Toggle playlist loop
     */
    toggleLoop() {
        this._options.loop = ! this._options.loop;
    }

    /**
     * Toggle playlist shuffle
     */
    toggleShuffle() {
        this._options.shuffle = ! this._options.shuffle;

        if (this._options.shuffle) {
            this._shuffleCurrentPlaylist();
        } else {
            this._unshuffleCurrentPlaylist();
        }
    }

    _unshuffleCurrentPlaylist(_emitEvent = true) {
        this._currentTrack = this._currentPlaylistOrder[this._currentTrack];
        
        this._currentPlaylistOrder = Object.keys(this.currentPlaylist().list)
            .map(i => parseInt(i));

        if (_emitEvent) {
            this._emit('playlistReordered', this);
            CalamansiEvents._emit('playlistReordered', this);
        }
    }

    _shuffleCurrentPlaylist(_emitEvent = true) {
        if (this.currentPlaylist().list.length > 1) {
            this._currentPlaylistOrder = [];

            while (this._currentPlaylistOrder.length < this.currentPlaylist().list.length) {
                let order = Math.floor(Math.random() * (this.currentPlaylist().list.length));

                if (this._currentPlaylistOrder.indexOf(order) > -1) {
                    continue;
                }

                this._currentPlaylistOrder.push(order);
            }

            this._currentTrack = this._currentPlaylistOrder.indexOf(this._currentTrack);
        } else {
            this._currentPlaylistOrder = [0];
        }

        if (_emitEvent) {
            this._emit('playlistReordered', this);
            CalamansiEvents._emit('playlistReordered', this);
        }
    }

    /**
     * Destroy the player instance
     */
    destroy() {
        this.audio.unload();
        this._skin.destroy();
    }

    /**
     * Register an event listener (subscribe to an event)
     * 
     * @param string|array events
     * @param function callback 
     */
    on(events, callback) {
        if (typeof events === 'string') {
            events = [events];
        }

        for (let event of events) {
            // Ignore inexisting event types
            if (!this._eventListeners[event]) {
                continue;
            }

            this._eventListeners[event].push(callback);
        }
    }

    /**
     * _Emit an event. Call all the event listeners' callbacks.
     * 
     * @param {*} event 
     * @param {*} data 
     * @param {*} data 
     */
    _emit(event, instance, data = {}) {
        // Sometimes the player initialization might fail
        if (!this._initialized) {
            return;
        }

        // Ignore inexisting event types
        if (!this._eventListeners[event]) {
            return;
        }

        for (let callback of this._eventListeners[event]) {
            callback(instance, data);
        }

        // DOM elements visibility can be dependent on events
        document.querySelectorAll(`#${this._skin.el.id} .clmns--hide-on-${event}`).forEach(el => {
            if (el.style.display == 'none') {
                return;
            }

            el.dataset.display = el.style.display ? el.style.display : 'inline';
            el.style.display = 'none';
        });

        document.querySelectorAll(`#${this._skin.el.id} .clmns--show-on-${event}`).forEach(el => {
            el.style.display = el.dataset.display;
        });
    }

    _registerEventListeners() {
        CalamansiEvents.on('play', (instance) => {
            // Pause all players when one of the players on the page has started
            // playing
            if (instance.id != this.id) {
                if (this.audio) {
                    this.audio.pause();
                }
            }
        });

        this.on('trackEnded', (instance) => {
            if (!this.nextTrack()) {
                this._emit('stop');
                CalamansiEvents._emit('stop', this);
            }
        })
    }
}

export default Calamansi;