import CalamansiAudio from './CalamansiAudio';

class Calamansi
{
    constructor(el, options = {}) {
        /* DATA */
        this.options = Object.assign(options, {
            // Default options...
            multitrack: false,
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
            ended: [],
        };

        this.audio = null;

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
        options.source = el.dataset.source ? el.dataset.source : null;

        return options;
    }

    validateOptions() {
        if (!this.options.skin) {
            throw 'No skin provided.';
        }

        if (!this.options.multitrack && !this.options.source) {
            throw 'No audio source provided.';
        }
    }

    async init() {
        this.loadSkinCss(this.options.skin);
        const skin = await this.fetchSkin(this.options.skin);
        const content = this.el.innerHTML;

        // Prepare the DOM for the player instance using the skin's HTML
        let wrapper = document.createElement('div');
        wrapper.innerHTML = skin.trim();
        
        if (wrapper.firstChild.dataset.noWrapper) {
            wrapper = wrapper.firstChild;

            delete wrapper.dataset.noWrapper;
        }

        wrapper.classList.add('calamansi');
        wrapper.id = this.id;

        // Replace the provided element with the compiled HTML
        this.el.parentNode.replaceChild(wrapper, this.el);
        this.el = wrapper;

        // Insert the element's content inside the skin's content slot
        const contentSlots = document.querySelectorAll(`#${this.el.id} .slot--content`);

        if (contentSlots && contentSlots.length > 0) {
            contentSlots.forEach(slot => {
                slot.innerHTML = content;
            });
        }

        // Load the audio
        this.loadAudio(this.options.source);

        // Activate the player's controls
        this.activateControls();

        // Register internal event listeners
        this.registerEventListeners();

        // Initialization done!
        this.initialized = true;

        this.emit('initialized', this);
    }
    
    async fetchSkin(path) {
        return fetch(`${path}/skin.html`)
            .then(data => {
                if (data.status != 200) {
                    throw `Skin at path "${path}" not found!`;
                }

                return data.text();
            })
            .then(html => {
                html = html.trim();

                // Remove all the new lines
                while (html.search("\n") >= 0) {
                    html = html.replace(/\n/, '');
                }

                // Remove all the double spaces
                while (html.search('  ') >= 0) {
                    html = html.replace(/  /, '');
                }

                return html;
            });
    }

    /**
     * Append a <link> with the skin's CSS to the page if this skin's CSS has
     * not been appended yet
     * 
     * @param {*} path 
     */
    loadSkinCss(path) {
        const cssPath = `${path}/skin.css`;

        // If the skin's CSS has already been loaded
        if (document.querySelectorAll(`link[href="${cssPath}"]`).length > 0) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;

        document.querySelector('head').appendChild(link);
    }

    generateUniqueId() {
        const id = Math.random().toString(36).substr(2, 5);

        return document.querySelectorAll(`calamansi-${id}`).length > 0
            ? this.generateUniqueId()
            : `calamansi-${id}`;
    }

    loadAudio(source) {
        this.audio = new CalamansiAudio(this, source);
    }

    activateControls() {
        this.el.addEventListener('click', (event) => {
            event.preventDefault();

            if (event.target.classList.contains('control-play')) {
                // "Play" button - start playback from 00:00
                this.audio.playFromStart();
            } else if (event.target.classList.contains('control-resume')) {
                // "Play" button - start or resume playback
                this.audio.play();
            } else if (event.target.classList.contains('control-pause')) {
                // "Pause" button
                this.audio.pause();
            }
        });
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
     */
    emit(event, data) {
        // Sometimes the player initialization might fail
        if (!this.initialized) {
            return;
        }

        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        for (let callback of this.eventListeners[event]) {
            callback(data);
        }

        // DOM elements visibility can be dependent on events
        document.querySelectorAll(`#${this.el.id} .hide-on-${event}`).forEach(el => {
            if (el.style.display == 'none') {
                return;
            }

            el.dataset.display = el.style.display ? el.style.display : 'inline';
            el.style.display = 'none';
        });

        document.querySelectorAll(`#${this.el.id} .show-on-${event}`).forEach(el => {
            el.style.display = el.dataset.display;
        });
    }

    registerEventListeners() {
        CalamansiEvents.on('play', (instance) => {
            // Pause all players when one of the players on the page has started
            // playing
            if (instance.id != this.id) {
                this.audio.pause();
            }
        });
    }
}

export default Calamansi;