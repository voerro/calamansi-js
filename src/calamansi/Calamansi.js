import CalamansiAudio from './CalamansiAudio';
import CalamansiSkin from './CalamansiSkin';

import Id3Reader from './services/Id3Reader';

class Calamansi
{
    constructor(el, options = {}) {
        /* DATA */
        this.options = Object.assign(options, {
            // Default options...
        });

        // Make sure we have all the required options provided and the values
        // are all correct
        try {
            this.validateOptions();
        } catch (error) {
            console.error(`Calamansi intialization error: ${error}`);

            return;
        }

        /* STATE */
        this.initialized = false;

        this.el = el;
        this.id = el.id ? el.id : this.generateUniqueId();

        this.eventListeners = {
            initialized: [],
            play: [],
            pause: [],
            stop: [],
            ended: [],
            loadeddata: [],
            loadedmetadata: [],
            canplaythrough: [],
            loadingProgress: [],
            timeupdate: [],
            volumechange: [],
            trackInfoReady: [],
            trackSwitched: [],
        };

        this.skin = null;
        this.audio = null;
        
        this.playlists = [];
        this._currentPlaylist = null;
        this._currentTrack = null;

        /* INITIALIZE PLAYER INSTANCE */
        this.init();
    }

    /**
     * Automatically initialize all the player instances
     */
    static autoload(className = 'calamansi') {
        const calamansis = [];
        const elements = document.querySelectorAll(`.${className}`);

        // Initialize all the player instances
        elements.forEach(el => {
            calamansis.push(new Calamansi(el, this.readOptionsFromElement(el)));
        });

        return calamansis;
    }

    /**
     * Read options from a DOM element for autoloaded instances
     * 
     * @param {*} el 
     */
    static readOptionsFromElement(el) {
        const options = {};

        options.skin = el.dataset.skin ? el.dataset.skin : null;

        if (el.dataset.source) {
            options.playlists = {
                'default': [{ source: el.dataset.source }]
            };
        }

        return options;
    }

    validateOptions() {
        if (!this.options.skin) {
            throw 'No skin provided.';
        }
    }

    async init() {
        // Prepare playlists/audio source, load the first track to play
        this.preparePlaylists();

        // Load the first playlist with at least 1 track
        this.loadPlaylist(this.currentPlaylist());

        // Register internal event listeners
        this.registerEventListeners();

        // Initialize the skin
        this.skin = new CalamansiSkin(this, this.options.skin);
        await this.skin.init();

        // Initialization done!
        this.initialized = true;

        this.emit('initialized', this);
    }

    generateUniqueId() {
        const id = Math.random().toString(36).substr(2, 5);

        return document.querySelectorAll(`calamansi-${id}`).length > 0
            ? this.generateUniqueId()
            : `calamansi-${id}`;
    }

    /**
     * Read playlist information from the provided options, select the first
     * playlist and track to be played
     */
    preparePlaylists() {
        if (this.options.playlists && Object.keys(this.options.playlists).length > 0) {
            let playlistIndex = 0;

            for (let name in this.options.playlists) {
                let playlist = {
                    name: name,
                    list: []
                };
                
                if (!Array.isArray(this.options.playlists[name])) {
                    continue;
                }

                for (let track of this.options.playlists[name]) {
                    if (!track.source) {
                        continue;
                    }

                    track.filename = track.source.split('/').pop();
                    track.sourceType = track.filename.split('.').pop();
                    track.info = {};

                    playlist.list.push(track);

                    // Load track info
                    // TODO: Loading track info should be optional. In-text
                    // player probably won't need that, so let's save our
                    // browser from making unnecessary requests
                    this.loadTrackInfo(track);

                    // Set the first playlist with at least 1 track as the
                    // current playlist
                    if (!this._currentPlaylist) {
                        this._currentPlaylist = playlistIndex;
                    }
                }
                
                this.playlists.push(playlist);

                playlistIndex++;
            }

            // If no tracks were found - set the first playlist as the current
            if (this._currentPlaylist === null) {
                this._currentPlaylist = 0;
            }
        }
    }

    loadPlaylist(playlist) {
        if (!playlist) {
            return;
        }
        
        this.switchTrack(0);
    }

    loadTrack(track) {
        this.audio = new CalamansiAudio(this, track.source);
    }

    switchTrack(index) {
        this._currentTrack = index;

        // Load the first track to play
        this.loadTrack(this.currentTrack());

        this.emit('trackSwitched', this);
    }

    loadTrackInfo(track) {
        if (track.sourceType === 'mp3') {
            (new Id3Reader(track.source)).getAllTags().then(tags => {
                track.info = tags;

                this.emit('trackInfoReady', this, track);
            });
        }
    }

    currentPlaylist() {
        return this.playlists[this._currentPlaylist];
    }

    currentTrack() {
        return this.currentPlaylist()
            ? this.currentPlaylist().list[this._currentTrack]
            : null;
    }

    /**
     * Register an event listener
     * 
     * @param {*} event 
     * @param {*} callback 
     */
    on(event, callback) {
        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        this.eventListeners[event].push(callback);
    }

    /**
     * Emit an event. Call all the event listeners' callbacks.
     * 
     * @param {*} event 
     * @param {*} data 
     * @param {*} data 
     */
    emit(event, instance, data = {}) {
        // Sometimes the player initialization might fail
        if (!this.initialized) {
            return;
        }

        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        for (let callback of this.eventListeners[event]) {
            callback(instance, data);
        }

        // DOM elements visibility can be dependent on events
        document.querySelectorAll(`#${this.skin.el.id} .hide-on-${event}`).forEach(el => {
            if (el.style.display == 'none') {
                return;
            }

            el.dataset.display = el.style.display ? el.style.display : 'inline';
            el.style.display = 'none';
        });

        document.querySelectorAll(`#${this.skin.el.id} .show-on-${event}`).forEach(el => {
            el.style.display = el.dataset.display;
        });
    }

    registerEventListeners() {
        CalamansiEvents.on('play', (instance) => {
            // Pause all players when one of the players on the page has started
            // playing
            if (instance.id != this.id) {
                if (this.audio) {
                    this.audio.pause();
                }
            }
        });
    }
}

export default Calamansi;