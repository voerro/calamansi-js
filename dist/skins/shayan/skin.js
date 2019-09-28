class musicPlayer {
    constructor() {
        this.play = this.play.bind(this);
        this.playBtn = document.getElementById('play');
        this.playBtn.addEventListener('click', this.play);
        this.controlPanel = document.getElementById('control-panel');
        this.infoBar = document.getElementById('info');
    }

    play() {
        let controlPanelObj = this.controlPanel,
            infoBarObj = this.infoBar
        Array.from(controlPanelObj.classList).find(function (element) {
            return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
        });

        Array.from(infoBarObj.classList).find(function (element) {
            return element !== "active" ? infoBarObj.classList.add('active') : infoBarObj.classList.remove('active');
        });
    }
}

const newMusicplayer = new musicPlayer();