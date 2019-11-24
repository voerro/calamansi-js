class CalamansiSkin
{
    constructor(calamansi, path) {
        this.calamansi = calamansi;
        this.path = path;
        this.content = '';

        this.el = calamansi.el;

        // State
        this.mouseDownTarget = null;
    }

    async init() {
        // Load and apply the skin
        this.content = await this.load();

        // Set UI elements
        this.setUiElements();

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
        // Wait for it to load and execute
        await this.loadJs(this.path);

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
        return new Promise((resolve, reject) => {
            const jsPath = `${path}/skin.js`;

            // If the skin's JS has already been loaded
            let script = document.querySelectorAll(`script[src="${jsPath}"]`);

            if (script.length > 0 && script[0].dataset.loaded) {
                // Script already exists and is loaded
                resolve();
            } else if (script.length > 0) {
                // Script already exists but hasn't been loaded - try again later
                setTimeout(() => {
                    resolve(this.loadJs(path));
                }, 100);
            } else {
                // Script doesn't exist
                script = document.createElement('script');

                script.onload = () => {
                    script.dataset.loaded = '1';

                    resolve();
                }

                script.setAttribute('src', jsPath);
                document.querySelector('head').appendChild(script);
            }
        });
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

    setUiElements() {
        // Insert the element's content inside the skin's content slot
        const contentSlots = document.querySelectorAll(`#${this.el.id} .clmns--slot--content`);

        if (contentSlots && contentSlots.length > 0) {
            contentSlots.forEach(slot => {
                slot.innerHTML = this.content;
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
            if (event.target.type !== 'checkbox' && !event.target.classList.contains('clmns--link')) {
                event.preventDefault();
            }

            // Audio (playback) controls
            if (this.calamansi.audio) {
                if (this.containsClass(event.target, 'clmns--control-play')) {
                    // "Play" button - start playback from 00:00
                    this.calamansi.audio.playFromStart();
                } else if (this.containsClass(event.target, 'clmns--control-resume')) {
                    // "Play" button - start or resume playback
                    this.calamansi.audio.play();
                } else if (this.containsClass(event.target, 'clmns--control-pause')) {
                    // "Pause" button
                    this.calamansi.audio.pause();
                } else if (this.containsClass(event.target, 'clmns--control-stop')) {
                    // "Stop" button
                    this.calamansi.audio.stop();
                } else if (this.containsClass(event.target, 'clmns--control-next-track')) {
                    // "Next Track" button
                    this.calamansi.nextTrack();
                } else if (this.containsClass(event.target, 'clmns--control-prev-track')) {
                    // "Previoud Track" button
                    this.calamansi.prevTrack();
                } else if (this.containsClass(event.target, 'clmns--control-toggle-loop')) {
                    // "Loop" button (checkbox)
                    this.calamansi.toggleLoop();
                } else if (this.containsClass(event.target, 'clmns--control-toggle-shuffle')) {
                    // "Shuffle" button (checkbox)
                    this.calamansi.toggleShuffle();
                } else if (this.containsClass(event.target, 'clmns--slider')) {
                    const parent = this.findElParent(event.target, 'clmns--slider');

                    let position;

                    if (parent.classList.contains('clmns--slider-vertical')) {
                        position = 1 - ((event.clientY - parent.getBoundingClientRect().y) / parent.clientHeight);
                    } else {
                        position = (event.clientX - parent.getBoundingClientRect().x) / parent.clientWidth;
                    }

                    this.onSliderPositionChanged(parent, position);
                }
            }
        });

        document.addEventListener('mousemove', (event) => {
            // Audio (playback) controls
            if (this.calamansi.audio && this.mouseDownTarget) {
                if (this.containsClass(this.mouseDownTarget, 'clmns--slider')) {
                    // Smooth seeking
                    const parent = this.findElParent(this.mouseDownTarget, 'clmns--slider');

                    let position;

                    if (parent.classList.contains('clmns--slider-vertical')) {
                        position = 1 - ((event.clientY - parent.getBoundingClientRect().y) / parent.clientHeight);
                    } else {
                        position = (event.clientX - parent.getBoundingClientRect().x) / parent.clientWidth;
                    }

                    if (position > 1.0) {
                        position = 1;
                    } else if (position < 0) {
                        position = 0;
                    }

                    this.onSliderPositionChanged(parent, position);
                }
            }
        });

        document.addEventListener('touchmove', (event) => {
            // Audio (playback) controls
            if (this.calamansi.audio && this.mouseDownTarget) {
                if (this.containsClass(this.mouseDownTarget, 'clmns--slider')) {
                    // Smooth seeking
                    const parent = this.findElParent(this.mouseDownTarget, 'clmns--slider');

                    let position;

                    if (parent.classList.contains('clmns--slider-vertical')) {
                        position = 1 - ((event.touches[0].clientY - parent.getBoundingClientRect().y) / parent.clientHeight);
                    } else {
                        position = (event.touches[0].clientX - parent.getBoundingClientRect().x) / parent.clientWidth;
                    }

                    if (position > 1.0) {
                        position = 1;
                    } else if (position < 0) {
                        position = 0;
                    }

                    this.onSliderPositionChanged(parent, position);
                }
            }
        });

        this.getEls('.clmns--playback-rate').forEach((el) => {
            el.addEventListener('change', (event) => {
                if (this.calamansi.audio) {
                    this.calamansi.audio.changePlaybackRate(parseFloat(el.value));
                }
            })
        });
    }

    addEventListeners() {
        this.calamansi.on('loadedmetadata', (instance) => {
            this.updatePlaybackDuration(instance.audio.duration);
            this.updatePlaylist();
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
        return this.el.querySelector(`${selector}`);
    }

    getEls(selector) {
        return this.el.querySelectorAll(`#${this.el.id} ${selector}`);
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

    onSliderPositionChanged(el, position) {
        if (el.classList.contains('clmns--playback-bar')) {
            this.calamansi.audio.seekTo(position * this.calamansi.audio.duration);
        } else if (el.classList.contains('clmns--volume-bar')) {
            this.calamansi.audio.changeVolume(position);
        }
    }

    updatePlaybackDuration(duration) {
        this.getEls('.clmns--playback-duration').forEach((el) => {
            el.innerText = this.formatTime(duration);
        });
    }

    updatePlaybackTime(currentTime) {
        this.getEls('.clmns--playback-time').forEach((el) => {
            el.innerText = this.formatTime(currentTime);
        });
    }

    updatePlaybackTimeLeft(time, duration) {
        this.getEls('.clmns--playback-time-left').forEach((el) => {
            const timeLeft = duration - Math.floor(time);

            el.innerText = '-' + this.formatTime(timeLeft);
        });
    }

    updatePlaybackProgress(time, duration) {
        const progress = (time / duration) * 100;
 
        this.getEls('.clmns--playback-progress').forEach((el) => {
            let parent = this.findElParent(el, 'clmns--slider');

            if (!parent) {
                return;
            }

            el.style[parent.classList.contains('clmns--slider-vertical') ? 'height' : 'width'] = progress + '%';
        });

        this.getEls('.clmns--playback-bar').forEach((el) => {
            el.title = `${this.formatTime(this.calamansi.audio.currentTime)} / ${this.formatTime(this.calamansi.audio.duration)}`;
        });
    }

    updateLoadingProgress(progress) {
        this.getEls('.clmns--playback-load').forEach((el) => {
            el.style.width = progress + '%';
        });
    }

    updateVolume(volume) {
        const els = this.getEls('.clmns--volume-value');

        els.forEach((el) => {
            let parent = this.findElParent(el, 'clmns--slider');

            if (!parent) {
                return;
            } 

            el.style[parent.classList.contains('clmns--slider-vertical') ? 'height' : 'width'] = (volume * 100) + '%';
        });
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
        this.getEls('.clmns--control-toggle-loop').forEach((el) => {
            el.checked = this.calamansi._options.loop;
        });

        // "Shuffle"
        this.getEls('.clmns--control-toggle-shuffle').forEach((el) => {
            el.checked = this.calamansi._options.shuffle;
        });
    }
    
    updatePlaylistList() {
        const el = this.getEl('.clmns--playlists');

        if (!el) {
            return;
        }

        for (let child of el.children) {
            el.removeChild(child);
        }

        for (let index in this.calamansi._playlists) {
            const playlist = this.calamansi._playlists[index];

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
        
        this.getEls('.clmns--playlist').forEach((el) => {
            if (el.nodeName.toLowerCase() === 'table') {
                this.updatePlaylistTable(el);
            } else {
                this.updatePlaylistUl(el);
            }
        });
    }

    updatePlaylistUl(container) {
        // Remove the current list
        if (container.querySelector('ul')) {
            container.removeChild(container.querySelector('ul'))
        }

        const ul = document.createElement('ul');

        let template = this.findEl(container, '.clmns--playlist-item.clmns--template');
        
        if (template) {
            template = template.cloneNode(true);
            template.classList.remove('clmns--template');
        }

        let index = 0;
        for (let i of this.calamansi._currentPlaylistOrder) {
            const track = this.calamansi.currentPlaylist().list[i];
            const info = track.info;
            let li = document.createElement('li');

            if (template) {
                const item = template.cloneNode(true);

                this.updateFields(item, 'clmns--playlist-track-info', info);

                if (track === this.calamansi.currentTrack()) {
                    item.classList.add('clmns--active');
                }
                
                li.appendChild(item);
            } else {
                li.innerText = track.info.name;
                li.title = track.info.name;
            }

            li.classList.add('clmns--playlist-item-li');
            li.dataset.index = index;

            li.addEventListener('click', (event) => {
                if (event.target.classList.contains('clmns--link')) {
                    return;
                }

                const el = this.findElParent(event.target, 'clmns--playlist-item-li');

                this.calamansi.switchTrack(parseInt(el.dataset.index), true);
            });

            ul.appendChild(li);

            index++;
        }

        container.appendChild(ul);
    }

    updatePlaylistTable(table) {
        // TODO: tbody - remove all <tr> children
        const tbody = this.findEl(table, 'tbody');

        if (!tbody) {
            console.error('.clmns--playlist element should contain <tbody> with a template row!');

            return;
        }

        for (let el of this.findEls(tbody, 'tr')) {
            if (!el.classList.contains('clmns--template')) {
                tbody.removeChild(el);
            }
        }

        let template = this.findEl(tbody, '.clmns--playlist-item.clmns--template');

        if (!template) {
            console.error('.clmns--playlist element should contain a row template!');

            return;
        }

        let index = 0;
        for (let i of this.calamansi._currentPlaylistOrder) {
            const track = this.calamansi.currentPlaylist().list[i];
            const info = track.info;

            let tr = template.cloneNode(true);
            tr.classList.remove('clmns--template');

            this.updateFields(tr, 'clmns--playlist-track-info', info);

            if (track === this.calamansi.currentTrack()) {
                tr.classList.add('clmns--active');
            }

            tr.dataset.index = index;

            tr.addEventListener('click', (event) => {
                if (event.target.classList.contains('clmns--link')) {
                    return;
                }

                const el = this.findElParent(event.target, 'clmns--playlist-item');

                this.calamansi.switchTrack(parseInt(el.dataset.index), true);
            });

            tbody.appendChild(tr);

            index++;
        }

        table.appendChild(tbody);
    }

    updatePlaylistActiveTrack() {
        this.getEls('.clmns--playlist-item.clmns--active').forEach((active) => {
            active.classList.remove('clmns--active');

            let newActive = this.getEls('.clmns--playlist-item:not(.clmns--template)')[this.calamansi._currentTrack];

            if (newActive) {
                newActive.classList.add('clmns--active');
            }
        });
    }

    updateTrackInfo() {
        if (!this.calamansi.currentTrack() || !this.calamansi.currentTrack().info) {
            return;
        }

        const info = this.calamansi.currentTrack().info;

        this.updateFields(this.el, 'clmns--track-info', info);
    }

    updateFields(parent, className, values) {
        this.findEls(parent, `.${className}`).forEach((el) => {
            let key = null;

            for (let i = 0; i < el.classList.length; i++) {
                if (new RegExp(`${className}--.*`).test(el.classList[i])) {
                    key = el.classList[i].split('--')[2];

                    break;
                }
            }

            if (!key) {
                return;
            }

            if (el.classList.contains('clmns--link')) {
                el.setAttribute('href', values[key] ? values[key] : '#');
                el.style.visibility = values[key] ? 'visible' : 'collapse';

                return;
            }

            switch (key) {
                case 'albumCover':
                    if (el.nodeName.toLowerCase() === 'img') {
                        el.src = values[key]
                            ? values[key].base64
                            : this.calamansi._options.defaultAlbumCover;
                    } else {
                        el.style.backgroundImage = `url('${values[key] ? values[key].base64 : this.calamansi._options.defaultAlbumCover}')`;
                    }
                    break;
                case 'duration':
                    el.innerHTML = values[key] ? this.formatTime(values[key]) : '&nbsp;';
                    el.title = values[key] ? this.formatTime(values[key]) : '';
                    break;
                default:
                    el.innerHTML = values[key] ? values[key] : '&nbsp;';
                    el.title = values[key] ? values[key] : '';
            }
        });
    }

    destroy() {
        this.el.className = '';
        this.el.innerHTML = this.content;
    }
}

export default CalamansiSkin;