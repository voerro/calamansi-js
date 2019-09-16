class CalamansiAudio
{
    constructor(calamansi, source) {
        this.calamansi = calamansi;
        this.audio = new Audio(source);

        // Metadata
        this.duration = 0;
        this.currentTime = 0;
        
        this.addEventListeners();
    }

    addEventListeners() {
        this.audio.addEventListener('loadedmetadata', (event) => {
            this.duration = this.audio.duration;

            this.calamansi.emit('loadedmetadata', this.calamansi);
            CalamansiEvents.emit('loadedmetadata', this.calamansi);
        });

        this.audio.addEventListener('loadeddata', (event) => {
            this.setCurrentTime(this.audio.currentTime);

            this.calamansi.emit('loadeddata', this.calamansi);
            CalamansiEvents.emit('loadeddata', this.calamansi);
        });

        this.audio.addEventListener('timeupdate', (event) => {
            this.currentTime = this.audio.currentTime;

            this.calamansi.emit('timeupdate', this.calamansi);
            CalamansiEvents.emit('timeupdate', this.calamansi);
        });

        this.audio.addEventListener('ended', (event) => {
            this.setCurrentTime(0);

            this.calamansi.emit('ended', this.calamansi);
            CalamansiEvents.emit('ended', this.calamansi);
        });
    }

    playFromStart() {
        this.audio.load();
        this.audio.play();

        this.calamansi.emit('play', this.calamansi);
        CalamansiEvents.emit('play', this.calamansi);
    }

    play() {
        this.audio.play();

        this.calamansi.emit('play', this.calamansi);
        CalamansiEvents.emit('play', this.calamansi);
    }

    pause() {
        this.audio.pause();

        this.calamansi.emit('pause', this.calamansi);
        CalamansiEvents.emit('pause', this.calamansi);
    }

    stop() {
        this.audio.pause();
        this.audio.load();

        this.calamansi.emit('stop', this.calamansi);
        CalamansiEvents.emit('stop', this.calamansi);
    }

    setCurrentTime(time) {
        this.currentTime = time;

        this.calamansi.emit('timeupdate', this.calamansi);
        CalamansiEvents.emit('timeupdate', this.calamansi);
    }
}

export default CalamansiAudio;