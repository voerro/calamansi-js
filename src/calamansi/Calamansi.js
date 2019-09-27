import CalamansiAudio from './CalamansiAudio';
import CalamansiSkin from './CalamansiSkin';

// import Id3Reader from './services/Id3Reader';
let jsmediatags = require('../vendor/jsmediatags.min.js');

class Calamansi
{
    constructor(el, options = {}) {
        /* DATA */
        this.options = Object.assign({
            // Default options...
            loop: false,
            shuffle: false,
            volume: 100,
            loadTrackInfo: false,
            defaultAlbumCover: '',
        }, options);

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

        this.skin = null;
        this.audio = null;
        
        this.playlists = [];
        this._currentPlaylist = null;
        this._currentTrack = null;
        this._currentPlaylistOrder = [];

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

        // Register internal event listeners
        this.registerEventListeners();

        // Initialize the skin
        this.skin = new CalamansiSkin(this, this.options.skin);
        await this.skin.init();

        // Initialization done!
        this.initialized = true;

        this.emit('initialized', this);

        // Load the first playlist with at least 1 track
        this.loadPlaylist(this.currentPlaylist());

        if (this.audio) {
            this.audio.changeVolume(this.options.volume / 100);
        }
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

                    track.info = {};
                    track.info.filename = track.source.split('/').pop();
                    track.info.name = track.info.filename;
                    track.sourceType = track.info.filename.split('.').pop();

                    playlist.list.push(track);

                    // Load track info
                    this.loadTrackInfo(track);

                    // Set the first playlist with at least 1 track as the
                    // current playlist
                    if (this._currentPlaylist === null) {
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

        if (this.options.shuffle) {
            this.shuffleCurrentPlaylist(false);
        } else {
            this.unshuffleCurrentPlaylist(false);
        }
        
        this.switchTrack(0);

        this.emit('playlistLoaded', this);
    }

    switchPlaylist(index) {
        this._currentPlaylist = index;

        // Load the first track to play
        this.loadPlaylist(this.currentPlaylist());

        this.emit('playlistSwitched', this);
    }

    loadTrack(track) {
        if (!this.audio) {
            this.audio = new CalamansiAudio(this, track.source);

            return;
        }

        this.audio.load(track.source);
    }

    switchTrack(index, startPlaying = false) {
        this._currentTrack = index;

        // Load the first track to play
        this.loadTrack(this.currentTrack());

        this.emit('trackSwitched', this);

        if (startPlaying) {
            this.audio.play();
        }
    }

    loadTrackInfo(track) {
        // Read ID3 tags for MP3
        if (this.options.loadTrackInfo && track.sourceType === 'mp3') {
            jsmediatags.read(window.location.href + track.source, {
                onSuccess: (tags) => {
                    console.log(tags);
                    track.info = Object.assign(track.info, tags.tags);

                    if (track.info.artist && track.info.title) {
                        track.info.name = `${track.info.artist} - ${track.info.title}`;
                    }

                    if (track.info.track) {
                        track.info.trackNumber = parseInt(track.info.track.split('/')[0]);
                    }

                    if (track.info.picture) {
                        let base64 = btoa(String.fromCharCode.apply(null, track.info.picture.data));

                        track.info.picture = Object.assign(track.info.picture, {
                            base64: 'data:' + track.info.picture.format + ';base64,' + base64
                        });

                        track.info.albumCover = track.info.picture;
                    }

                    this.emit('trackInfoReady', this, track);
                }
            });
        } else {
            this.emit('trackInfoReady', this, track);
        }
    }

    currentPlaylist() {
        return this.playlists[this._currentPlaylist];
    }

    currentTrack() {
        return this.currentPlaylist()
            ? this.currentPlaylist().list[this._currentPlaylistOrder[this._currentTrack]]
            : null;
    }

    nextTrack() {
        if (this._currentTrack + 1 < this.currentPlaylist().list.length) {
            this.switchTrack(this._currentTrack + 1, true);

            return true;
        } else {
            if (this.options.loop) {
                this.switchTrack(0, true);

                return true;
            }
        }

        return false;
    }

    prevTrack() {
        if (this._currentTrack - 1 >= 0) {
            this.switchTrack(this._currentTrack - 1, true);

            return true;
        } else {
            if (this.options.loop) {
                this.switchTrack(this.currentPlaylist().list.length - 1, true);

                return true;
            }
        }

        return false;
    }

    toggleLoop() {
        this.options.loop = ! this.options.loop;
    }

    toggleShuffle() {
        this.options.shuffle = ! this.options.shuffle;

        if (this.options.shuffle) {
            this.shuffleCurrentPlaylist();
        } else {
            this.unshuffleCurrentPlaylist();
        }
    }

    unshuffleCurrentPlaylist(emitEvent = true) {
        this._currentTrack = this._currentPlaylistOrder[this._currentTrack];
        
        this._currentPlaylistOrder = Object.keys(this.currentPlaylist().list)
            .map(i => parseInt(i));

        if (emitEvent) {
            this.emit('playlistReordered', this);
        }
    }

    shuffleCurrentPlaylist(emitEvent = true) {
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

        if (emitEvent) {
            this.emit('playlistReordered', this);
        }
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

        this.on('trackEnded', (instance) => {
            if (!this.nextTrack()) {
                this.emit('stop');
            }
        })
    }
}

export default Calamansi;