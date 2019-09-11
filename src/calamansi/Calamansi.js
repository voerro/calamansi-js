class Calamansi
{
    constructor(el) {
        this.initialized = false;

        this.el = el;
        this.id = this.generateUniqueId();
        this.skinPath = el.attributes.skin ? el.attributes.skin.value : 'default';

        try {
            this.options = el.attributes.options
                ? this.parseOptions(el.attributes.options.value)
                : null;
        } catch (error) {
            console.error('Could not initialize a Calamansi instance');

            return;
        }

        this.eventListeners = {
            initialized: [],
        };

        this.init();
    }

    /**
     * Automatically initialize all the player instances
     */
    static autoload() {
        const calamansis = [];
        const elements = document.querySelectorAll('v-calamansi');

        // Initialize all the player instances
        elements.forEach(el => {
            calamansis.push(new Calamansi(el));
        });

        return calamansis;
    }

    parseOptions(string) {
        try {
            string = string.replace(/'/g, '"');

            return JSON.parse(string);
        } catch (error) {
            throw error;
        }
    }

    async init() {
        this.loadSkinCss(this.skinPath);
        const skin = await this.fetchSkin(this.skinPath);

        let wrapper = document.createElement('div');
        wrapper.innerHTML = skin;
        
        if (wrapper.firstChild.dataset.noWrapper) {
            wrapper = wrapper.firstChild;
        }

        wrapper.classList.add('calamansi');
        wrapper.id = this.id;

        this.el.parentNode.replaceChild(wrapper, this.el);
        this.el = wrapper;

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
            .then(html => html);
    }

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

    /**
     * Register an event listener
     * 
     * @param {*} event 
     * @param {*} callback 
     */
    on(event, callback) {
        // Sometimes the player initialization might fail
        if (!this.initialized) {
            return;
        }

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
        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        for (let callback of this.eventListeners[event]) {
            callback(data);
        }
    }
}

export default Calamansi;