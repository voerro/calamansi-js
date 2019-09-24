class CalamansiSkin
{
    constructor(calamansi, path) {
        this.calamansi = calamansi;
        this.path = path;

        this.el = calamansi.el;

        // State
        this.mouseDownTarget = null;
    }

    async init() {
        // Load and apply the skin
        const content = await this.load();

        // Set UI elements
        this.setUiElements(content);

        // Activate the player's controls
        this.activateControls();

        // Register event listeners
        this.addEventListeners();
    }

    async load() {
        this.loadCss(this.path);
        const skin = await this.fetchHtml(this.path);
        const content = this.el.innerHTML;

        // Prepare the DOM for the player instance using the skin's HTML
        let wrapper = document.createElement('div');
        wrapper.innerHTML = skin.trim();

        if (wrapper.firstChild.dataset.noWrapper) {
            wrapper = wrapper.firstChild;

            delete wrapper.dataset.noWrapper;
        }

        wrapper.classList.add('calamansi');
        wrapper.id = this.calamansi.id;

        // Replace the provided element with the compiled HTML
        this.el.parentNode.replaceChild(wrapper, this.el);
        this.el = wrapper;

        // Load the JS after all the new elements have been appended
        this.loadJs(this.path);

        return content;
    }

    /**
     * Append a <link> with the skin's CSS to the page if this skin's CSS has
     * not been appended yet
     * 
     * @param {*} path 
     */
    loadCss(path) {
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

    /**
     * Append a <script> with the skin's JS to the page if this skin's JS has
     * not been appended yet
     * 
     * @param {*} path 
     */
    loadJs(path) {
        const jsPath = `${path}/skin.js`;

        // If the skin's CSS has already been loaded
        if (document.querySelectorAll(`script[src="${jsPath}"]`).length > 0) {
            return;
        }

        const script = document.createElement('script');
        script.setAttribute('src', jsPath);
        script.setAttribute('type', 'text/javascript');

        document.querySelector('head').appendChild(script);
    }

    async fetchHtml(path) {
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

    setUiElements(content) {
        // Insert the element's content inside the skin's content slot
        const contentSlots = document.querySelectorAll(`#${this.el.id} .slot--content`);

        if (contentSlots && contentSlots.length > 0) {
            contentSlots.forEach(slot => {
                slot.innerHTML = content;
            });
        }

        this.updateCheckboxes();

        // Update the list of playlist
        this.updatePlaylistList();

        // Set up the playlist
        this.updatePlaylist();

        // Set the track info fields
        this.updateTrackInfo();
    }

    activateControls() {
        this.el.addEventListener('mousedown', (event) => {
            this.mouseDownTarget = event.target;
        });

        document.addEventListener('mouseup', (event) => {
            this.mouseDownTarget = null;
        });

        this.el.addEventListener('touchstart', (event) => {
            this.mouseDownTarget = event.target;
        });

        document.addEventListener('touchend', (event) => {
            this.mouseDownTarget = null;
        });

        this.el.addEventListener('click', (event) => {
            if (event.target.type !== 'checkbox') {
                event.preventDefault();
            }

            // Audio (playback) controls
            if (this.calamansi.audio) {
                if (this.containsClass(event.target, 'control-play')) {
                    // "Play" button - start playback from 00:00
                    this.calamansi.audio.playFromStart();
                } else if (this.containsClass(event.target, 'control-resume')) {
                    // "Play" button - start or resume playback
                    this.calamansi.audio.play();
                } else if (this.containsClass(event.target, 'control-pause')) {
                    // "Pause" button
                    this.calamansi.audio.pause();
                } else if (this.containsClass(event.target, 'control-stop')) {
                    // "Stop" button
                    this.calamansi.audio.stop();
                } else if (this.containsClass(event.target, 'control-next-track')) {
                    // "Next Track" button
                    this.calamansi.nextTrack();
                } else if (this.containsClass(event.target, 'control-prev-track')) {
                    // "Previoud Track" button
                    this.calamansi.prevTrack();
                } else if (this.containsClass(event.target, 'control-toggle-loop')) {
                    // "Loop" button (checkbox)
                    this.calamansi.toggleLoop();
                } else if (this.containsClass(event.target, 'control-toggle-shuffle')) {
                    // "Shuffle" button (checkbox)
                    this.calamansi.toggleShuffle();
                } else if (this.containsClass(event.target, 'playback-load') || this.containsClass(event.target, 'playback-progress')) {
                    const position = event.layerX / event.target.parentNode.offsetWidth;

                    this.calamansi.audio.seekTo(position * this.calamansi.audio.duration);
                } else if (this.containsClass(event.target, 'volume-bar') || this.containsClass(event.target, 'volume-value')) {
                    const parent = this.findElParent(event.target, 'volume-bar');

                    const position = event.layerX / parent.offsetWidth;

                    this.calamansi.audio.changeVolume(position);
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            // Audio (playback) controls
            if (this.calamansi.audio && this.mouseDownTarget) {
                if (this.containsClass(this.mouseDownTarget, 'playback-load') || this.containsClass(this.mouseDownTarget, 'playback-progress')) {
                    // Smooth seeking
                    const parent = this.mouseDownTarget.parentNode;

                    const position = (event.clientX - parent.offsetLeft) / parent.offsetWidth;

                    if (position > 1.0) {
                        position = 1;
                    }

                    this.calamansi.audio.seekTo(position * this.calamansi.audio.duration);
                } else if (this.containsClass(this.mouseDownTarget, 'volume-bar') || this.containsClass(this.mouseDownTarget, 'volume-value')) {
                    // Smooth change of the volume
                    const parent = this.findElParent(this.mouseDownTarget, 'volume-bar');

                    const position = (event.clientX - parent.offsetLeft) / parent.offsetWidth;

                    if (position > 1.0) {
                        position = 1;
                    }

                    this.calamansi.audio.changeVolume(position);
                }
            }
        });

        document.addEventListener('touchmove', (event) => {
            // Audio (playback) controls
            if (this.calamansi.audio && this.mouseDownTarget) {
                if (this.containsClass(this.mouseDownTarget, 'playback-load') || this.containsClass(this.mouseDownTarget, 'playback-progress')) {
                    // Smooth seeking
                    const parent = this.mouseDownTarget.parentNode;

                    const position = (event.touches[0].clientX - parent.offsetLeft) / parent.offsetWidth;

                    if (position > 1.0) {
                        position = 1;
                    }

                    this.calamansi.audio.seekTo(position * this.calamansi.audio.duration);
                } else if (this.containsClass(this.mouseDownTarget, 'volume-bar') || this.containsClass(this.mouseDownTarget, 'volume-value')) {
                    // Smooth change of the volume
                    const parent = this.findElParent(this.mouseDownTarget, 'volume-bar');

                    const position = (event.touches[0].clientX - parent.offsetLeft) / parent.offsetWidth;

                    if (position > 1.0) {
                        position = 1;
                    }

                    this.calamansi.audio.changeVolume(position);
                }
            }
        });

        const playbackRateSelect = this.getEl('.playback-rate');

        if (playbackRateSelect) {
            playbackRateSelect.addEventListener('change', (event) => {
                if (this.calamansi.audio) {
                    this.calamansi.audio.changePlaybackRate(parseFloat(playbackRateSelect.value));
                }
            })
        }
    }

    addEventListeners() {
        this.calamansi.on('loadedmetadata', (instance) => {
            this.updatePlaybackDuration(instance.audio.duration);
        });

        this.calamansi.on('timeupdate', (instance) => {
            this.updatePlaybackTime(instance.audio.currentTime);

            this.updatePlaybackTimeLeft(
                instance.audio.currentTime, instance.audio.duration
            );

            this.updatePlaybackProgress(
                instance.audio.currentTime, instance.audio.duration
            );
        });

        this.calamansi.on('loadingProgress', (instance) => {
            this.updateLoadingProgress(instance.audio.loadedPercent);
        });

        this.calamansi.on('volumechange', (instance) => {
            this.updateVolume(instance.audio.volume);
        });

        this.calamansi.on('trackInfoReady', (instance, track) => {
            if (instance.currentTrack().source === track.source) {
                this.updateTrackInfo();
            }

            this.updatePlaylist();
        });

        this.calamansi.on('playlistLoaded', (instance) => {
            this.updatePlaylist();
        });

        this.calamansi.on('playlistReordered', (instance) => {
            this.updatePlaylist();
        });

        this.calamansi.on('trackSwitched', (instance) => {
            this.updateTrackInfo();

            this.updatePlaylistActiveTrack();
        });
    }

    /**
     * Updating the UI
     */
    getEl(selector) {
        return document.querySelector(`#${this.el.id} ${selector}`);
    }

    getEls(selector) {
        return document.querySelectorAll(`#${this.el.id} ${selector}`);
    }

    findEl(item, selector) {
        return item.querySelector(selector);
    }

    findEls(item, selector) {
        return item.querySelectorAll(selector);
    }

    findElParent(item, className) {
        if (!item.classList) {
            return null;
        }

        if (item.classList.contains(className)) {
            return item;
        }

        if (!item.parentNode) {
            return null;
        }

        return this.findElParent(item.parentNode, className);
    }

    containsClass(el, className) {
        return el.classList.contains(className) || this.findElParent(el, className);
    }

    updatePlaybackDuration(duration) {
        const el = this.getEl('.playback-duration');

        if (el) {
            el.innerText = this.formatTime(duration);
        }
    }

    updatePlaybackTime(currentTime) {
        const el = this.getEl('.playback-time');

        if (el) {
            el.innerText = this.formatTime(currentTime);
        }
    }

    updatePlaybackTimeLeft(time, duration) {
        const el = this.getEl('.playback-time-left');

        if (el) {
            const timeLeft = duration - Math.floor(time);

            el.innerText = '-' + this.formatTime(timeLeft);
        }
    }

    updatePlaybackProgress(time, duration) {
        const el = this.getEl('.playback-progress');

        if (el) {
            const progress = (time / duration) * 100;

            el.style.width = progress + '%';
        }
    }

    updateLoadingProgress(progress) {
        const el = this.getEl('.playback-load');

        if (el) {
            el.style.width = progress + '%';
        }
    }

    updateVolume(volume) {
        const el = this.getEl('.volume-value');

        if (el) {
            el.style.width = (volume * 100) + '%';
        }
    }

    formatTime(seconds) {
        let hours = seconds > 1 ? Math.floor(seconds / 60 / 60) : 0;
        let minutes = seconds > 1 ? Math.floor(seconds / 60) : 0;

        if (minutes >= 60) {
            minutes -= hours * 60;
        }

        seconds = Math.floor(seconds);

        if (seconds >= 60) {
            seconds -= minutes * 60;
        }

        // Add trailing zeros if required
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        if (hours < 10) {
            hours = `0${hours}`;
        }

        return hours != 0
            ? `${hours}:${minutes}:${seconds}`
            : `${minutes}:${seconds}`;
    }

    updateCheckboxes() {
        let el;

        // "Loop"
        el = this.getEl('.control-toggle-loop');

        if (el) {
            el.checked = this.calamansi.options.loop;
        }

        // "Shuffle"
        el = this.getEl('.control-toggle-shuffle');

        if (el) {
            el.checked = this.calamansi.options.shuffle;
        }
    }
    
    updatePlaylistList() {
        const el = this.getEl('.playlists');

        if (!el) {
            return;
        }

        for (let child of el.children) {
            el.removeChild(child);
        }

        for (let index in this.calamansi.playlists) {
            const playlist = this.calamansi.playlists[index];

            const option = document.createElement('option');
            option.value = index;
            option.innerText = playlist.name;

            el.appendChild(option);
        }

        el.addEventListener('change', (event) => {
            this.calamansi.switchPlaylist(el.value);
        });
    }

    updatePlaylist() {
        if (!this.calamansi.currentPlaylist()) {
            return;
        }
        
        const el = this.getEl('.playlist');

        if (!el) {
            return;
        }

        if (el.nodeName.toLowerCase() === 'table') {
            this.updatePlaylistTable(el);
        } else {
            this.updatePlaylistUl(el);
        }
    }

    updatePlaylistUl(container) {
        // Remove the current list
        if (container.querySelector('ul')) {
            container.removeChild(container.querySelector('ul'))
        }

        const ul = document.createElement('ul');

        let template = this.getEl('.playlist-item.template');
        
        if (template) {
            template = template.cloneNode(true);
            template.classList.remove('template');
        }

        for (let index of this.calamansi._currentPlaylistOrder) {
            const track = this.calamansi.currentPlaylist().list[index];
            let li = document.createElement('li');

            if (template) {
                const item = template.cloneNode(true);

                for (let key in track.info) {
                    let el = this.findEl(item, `.playlist-item--${key}`);

                    if (el) {

                        switch (key) {
                            case 'albumCover':
                                // TODO: Display album cover
                                break
                            case 'duration':
                                el.innerText = this.formatTime(track.info[key]);
                                break;
                            default:
                                el.innerText = track.info[key];
                        }
                    }
                }

                if (track === this.calamansi.currentTrack()) {
                    item.classList.add('active');
                }
                
                li.appendChild(item);
            } else {
                li.innerText = track.info.name;
            }

            li.classList.add('playlist-item-li');
            li.dataset.index = this.calamansi._currentPlaylistOrder[index];

            li.addEventListener('dblclick', (event) => {
                const el = this.findElParent(event.target, 'playlist-item-li');

                this.calamansi.switchTrack(parseInt(el.dataset.index), true);
            });

            ul.appendChild(li);
        }

        container.appendChild(ul);
    }

    updatePlaylistTable(table) {        
        while (this.findEl(table, 'tbody')) {
            table.removeChild(this.findEl(table, 'tbody'));
        }

        const tbody = document.createElement('tbody');

        // let index = 0;
        for (let index of this.calamansi._currentPlaylistOrder) {
            const track = this.calamansi.currentPlaylist().list[index];
            const tr = document.createElement('tr');
            tr.classList.add('playlist-item');

            for (let th of this.findEls(table, 'th')) {
                const td = document.createElement('td');
                const key = th.classList[0];

                td.classList.add(`playlist-item--${key}`);

                if (track.info[key]) {
                    switch (key) {
                        case 'albumCover':
                            // TODO: Display album cover
                            break
                        case 'duration':
                            td.innerText = this.formatTime(track.info[key]);
                            break;
                        default:
                            td.innerText = track.info[key];
                    }
                }

                if (track === this.calamansi.currentTrack()) {
                    tr.classList.add('active');
                }

                tr.dataset.index = this.calamansi._currentPlaylistOrder[index];

                tr.addEventListener('dblclick', (event) => {
                    const el = this.findElParent(event.target, 'playlist-item');

                    this.calamansi.switchTrack(parseInt(el.dataset.index), true);
                });

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
    }

    updatePlaylistActiveTrack() {
        let active = this.getEl('.playlist-item.active');

        if (active) {
            active.classList.remove('active');

            let newActive = this.getEls('.playlist-item:not(.template)')[this.calamansi._currentTrack];

            if (newActive) {
                newActive.classList.add('active');
            }
        }
    }

    updateTrackInfo() {
        if (!this.calamansi.currentTrack() || !this.calamansi.currentTrack().info) {
            return;
        }

        const info = this.calamansi.currentTrack().info;

        for (let key in info) {
            let el = this.getEl(`.track-info--${key}`);

            if (el) {
                if (key === 'albumCover') {
                    if (el.nodeName.toLowerCase() === 'img') {
                        el.src = info[key].base64;
                    } else {
                        el.style.backgroundImage = `url('${info[key].base64}')`;
                    }

                    continue;
                }

                el.innerText = info[key];
                el.title = info[key];
            }

            // Remove albumCover src if there's a DOM element and no data
            const albumCover = this.getEl(`.track-info--albumCover`);

            if (albumCover && !info[albumCover]) {
                albumCover.src = this.calamansi.options.defaultAlbumCover;
            }
        }
    }
}

export default CalamansiSkin;