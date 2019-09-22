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
            playlistLoaded: [],
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
    emit(event, instance, data = {}) {
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
    on(event, callback) {
        // Ignore inexisting event types
        if (!this.eventListeners[event]) {
            return;
        }

        this.eventListeners[event].push(callback);
    }
}

export default CalamansiEventHub;