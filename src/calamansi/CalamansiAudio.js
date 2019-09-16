class CalamansiAudio
{
    constructor(calamansi, source) {
        this.calamansi = calamansi;
        this.audio = new Audio(source);

        this.addEventListeners();
    }

    addEventListeners() {
        this.audio.addEventListener('ended', (event) => {
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
}

export default CalamansiAudio;