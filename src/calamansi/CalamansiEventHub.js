class CalamansiEventHub
{
    constructor() {
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
            trackInfoReady: [],
            trackSwitched: [],
        };
    }

    /**
     * Emit an event. Call all the event listeners' callbacks.
     * 
     * @param {*} event 
     * @param {*} instance
     * @param {*} data 
     */
    _emit(event, instance, data = {}) {
        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        for (let callback of this.eventListeners[event]) {
            callback(instance, data);
        }
    }

    /**
     * Register an event listener
     * 
     * @param {*} event 
     * @param {*} callback 
     */
    on(events, callback) {
        if (typeof events === 'string') {
            events = [events];
        }

        for (let event of events) {
            // Ignore inexisting event types
            if (!this.eventListeners[event]) {
                continue;
            }

            this.eventListeners[event].push(callback);
        }
    }
}

export default CalamansiEventHub;