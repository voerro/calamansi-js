class Calamansi
{
    constructor(el) {
        this.el = el;
        this.id = this.generateUniqueId();
        this.skinPath = el.attributes.skin ? el.attributes.skin.value : 'default';

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
        elements.forEach(item => {
            calamansis.push(new Calamansi(item));
        });

        return calamansis;
    }

    async init() {
        this.loadSkinCss(this.skinPath);
        const skin = await this.fetchSkin(this.skinPath);

        const wrapper = document.createElement('div');
        wrapper.classList.add('calamansi');
        wrapper.id = this.id;
        wrapper.innerHTML = skin;

        this.el.parentNode.replaceChild(wrapper, this.el);
        this.el = wrapper;

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