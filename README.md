# Calamansi.js

[![npm (scoped)](https://img.shields.io/npm/v/@voerro/calamansi-js.svg?style=flat-square)](https://www.npmjs.com/package/@voerro/calamansi-js)
[![npm](https://img.shields.io/npm/dm/@voerro/calamansi-js.svg?style=flat-square)](https://www.npmjs.com/package/@voerro/calamansi-js)
[![MIT](https://img.shields.io/github/license/AlexMordred/vue-tagsinput.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A flexible feature-rich HTML5 & Vanilla JS audio player by [Voerro](http://voerro.com)

[**Live Demo**](http://voerro.com/en/projects/calamansi-js)

## Features

- Made with pure HTML5, Vanilla JavaScript, CSS3 (no jQuery required!)
- Flexible, responsive, multipurpose
- Use one of the pre-built skins or create your own
- Create your own or edit existing skins with simple HTML, CSS and optional JS
- Works with files and audio streams
- Reads ID3 from MP3 files
- Provide your own or custom meta tags for tracks
- Multiple playlists in one player
- Multiple player instances on the same page
- Control player instances with JS via API and events

## Installation via NPM

```
npm i @voerro/calamansi-js --save-dev
```
or
```
npm i @voerro/calamansi-js --save
```

Then, require Clamansi.js in your JS file:

```javascript
require('@voerro/calamansi-js/src/calamansi');
```

And in your SCSS file:

```scss
@import '@voerro/calamansi-js/src/calamansi.scss';
```

Finally, you need to copy over the skins folder into the public folder of your project. It is done differently depending on the bundling system you use. With `laravel-mix` it is done like this:

```javascript
mix.copyDirectory('node_modules/@voerro/calamansi-js/dist/skins', 'public/skins');
```

## Manual Installation

If you're not using NPM, you can include the required files into your page manually. First download or clone this repository. Copy the files from the `dist` folder to a public folder in your project. Then insert this:

```html
<head>
    ...
    <link rel="stylesheet" href="path/to/calamansi.min.css">
    ...
</head>
<body>
    ...
    <script src="path/to/calamansi.min.js"></script>
    ...
</body>
```

<!-- ## Installation via CDN

If you're not using NPM, you can include the required files into your page manually from a CDN. For example:

```html
<head>
    ...
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@voerro/calamansi-js@1.0.0/dist/calamansi.min.css">
    ...
</head>
<body>
    ...
    <script src="https://cdn.jsdelivr.net/npm/@voerro/calamansi-js@1.0.0/dist/calamansi.min.js"></script>
    ...
</body>
```

Then manually copy over the `dist/skins` folder

**IMPORTANT:** Always grab the latest versions of the package from [JSDELIVR](https://www.jsdelivr.com/package/npm/@voerro/calamansi-js?path=dist), the ones provided in the examples above might be outdated. -->

## Usage

### Inline/In-Text Skins

Simple in-text or inline skins are meant to be used within the text and can be used for things like adding pronunciation tracks to words. Naturally, these can only play single tracks.

To start, add the following HTML:

```html
<span class="calamansi" data-skin="path/to/skins/in-text"
    data-source="path/to/track.mp3">Song Title or Whatever Text Here</span>
```

Provide the path to a specific skin folder inside the `data-skin` attribute and the path to an audio file inside the `data-source` attribute. You can put as many elements like this on the page as you want, with each element having the `calamansi` class. The text inside the `<span>` will not be removed and will be used inside the player instead (although, this might be not the case depending on the skin).

Next, to initialize all the instances of the player at once add the following JavaScript before your `</body>`:

```html
<script>
    Calamansi.autoload();
</script>
```

### Regular Skins

Regular skins, which could be pretty complex, are block elements. These skins could be responsive to various degrees depending on the skin, so you should give each skin element a wrapper defining or restricting the size of the player. An example HTML would look like this:

```html
<div style="width: 300px; height: 300px;">
    <div id="calamansi-player-1">
        Loading player...
    </div>
</div>
```

Here we restrict the size of the player to 300x300 pixels using a wrapper div element. The player element itself doesn't have any data parameters. You can have as many of these as you want, but don't forget to use a unique `id` for each player. The `Loading player...` text is what your users will see until the player is loaded. Although, some skins might keep this text.

Each instance of a player like this is initialized manually via JavaScript, which you should put before your `</body>`:

```html
<script>
    new Calamansi(document.querySelector('#calamansi-player-1'), {
        skin: 'path/to/skins/skin-folder',
        playlists: {
            'Classics': [
                {
                    source: 'music/classics/Skrjabin Etude_Op8_No12.mp3',
                },
                {
                    source: 'music/classics/Double Violin Concerto - J.S. Bach.mp3',
                },
            ],
        },
        defaultAlbumCover: '/path/to/skins/default-album-cover.png',
    });
</script>
```

In this case you always have to specify an object of playlists even if you have a single track to play. Each playlist has a name and is an array of audio sources. Keep reading to learn about the options you could pass when initializing players in this manner.

#### Regular Skin Options

Option | Default | Description
--- | --- | ---
skin |  | Path to a folder with a Calamansi.js skin
playlists |  | An object with playlists where each key is the name of the playlist. Each playlist is an array of tracks/audio sources. Besides the track source you can provide track info (although track info for mp3 files is read automatically from ID3 tags), including any number of custom fields. Bear in mind that the custom fields won't be displayed unless they are present in the skin itself.
loop | false | Enable playlist loop by default
shuffle | false | Enable playlist shuffle by default
volume | 100 | Default volume value [0-100]
preloadTrackInfo | false | Load mp3 track info for all the tracks on page load. Might produce unexpected results when there are too many players on the page or tracks in the playlists.
loadTrackInfoOnPlay | true | Load mp3 track info on track play
defaultAlbumCover |  | Path to a no-album-cover album cover image. Displayed when a track has no album cover, no track info at all, or the info is still not loaded. There's a default image inside the `skins` folder called `default-album-cover.png` for you to use if you don't want a custom image.

## API

### Calamansi Instance

To access the API you need to retreive a Calamansi object/instance. `new Calamansi()` returns a single Calamansi player object, while `Calamansi.autoload()` returns an array of all the player instances that were initialized during its call.

### Properties

Property | Description
--- | ---
audio.currentTime | Current playback time of the current track in seconds
audio.duration | Duration of the current track in seconds
audio.playbackRate | Current playback rate of the player
audio.volume | Current volume of the player
el | The player's DOM element
id | `id` of the player's DOM element

Using properties:

```javascript
var player = new Calamansi(document.querySelector('#player'), {
    skin: 'path/to/skins/skin-folder'
});

console.log(player.volume);
```

### Methods

Method | Description
--- | ---
audio.changePlaybackRate(volume) | Change the playback rate [float]
audio.changeVolume(volume) | Change the volume [0.0-1.0]
audio.load(source) | Load an audio source directly (not from a playlist)
audio.pause() | Pause the playback
audio.play() | Resume playing the current track
audio.playFromStart() | Play the current track from start
audio.seekTo() | Seek to a time in the current track (in seconds)
audio.stop() | Stop the playback
audio.unload() | Unload audio from the player
currentPlaylist() | Get the current playlist object
currentTrack() | Get the current track object
destroy() | Destroy the player instance
nextTrack() | Start playing the next track in the playlist
on(events, callback) | Subscribe to a single or multiple `events`. `events` could be a string or an array of strings.
prevTrack() | Start playing the previous track in the playlist
switchPlaylist(index) | Switch to a playlist with `index`
switchTrack(index, startPlaying = false) | Switch to a track with `index` within the current playlist. You can choose to automatically `startPlaying` the track.
toggleLoop() | Toggle playlist loop
toggleShuffle() | Toggle playlist shuffle

Using methods:

```javascript
var player = new Calamansi(document.querySelector('#player'), {
    skin: 'path/to/skins/skin-folder'
});

player.nextTrack();
```

## Events

### Single Player Events

You can add event listeners to each player instance:

```javascript
var player = new Calamansi(document.querySelector('#player'), {
    skin: 'path/to/skins/skin-folder'
});

player.on('initialized', function (player) {
    //
});
```

### Global Event Hub

You can also listen for events among all the player instances on the page. The callback function contains the player instance where the event has been triggered.

```javascript
CalamansiEvents.on('initialized', function (player) {
    //
});
```

### Events

Event | Description
--- | ---
canplaythrough | Fired when the user agent can play the media, and estimates that enough data has been loaded to play the media up to its end without having to stop for further buffering of content. This is a default `HTMLAudioElement` event.
initialized | Fired when the player is initialized and ready to be used.
loadeddata | Fired when the first frame of the media has finished loading. This is a default `HTMLAudioElement` event.
loadedmetadata | Fired when the metadata has been loaded. This is a default `HTMLAudioElement` event.
pause | Fired when the playback has been paused.
play | Fired when the playback has been started.
playlistLoaded | Fired when a playlist has been loaded.
playlistReordered | Fired when a playlist has been reordered (after the shuffle has been toggled and the process has finished).
playlistSwitched | Fired when a playlist has been switched but before it has been loaded.
ratechange | Fired when playback rate has been changed.
stop | Fired when the playback has been stopped.
timeupdate | Fired when the `audio.currentTime` property values has been changed.
trackEnded | Fired when a track has ended.
trackInfoReady | Fired when a (mp3) track (id3) info has been read.
trackSwitched | Fired when a track has been switched but before it has been loaded.
volumechange | Fired when playback volume has been changed.

## Skins

A skin determines player's appearance and functionality. Calamansi.js comes with a few available skins. In this part of the documentation we'll discuss how you can easily create your own skins. To implement the default player functionality in a skin you don't need any custom JavaScript, only pure HTML & CSS!

### Creating Your Own Skins

First of all you need to create a folder for your new skin inside the `skins` folder. Actually, you can put your skin folder wherever you want (and the same is true about the `skins` folder itself), although it is better to have all the skins in one place. Your folder name is basically your skin name. Inside the folder you need to create 3 files: `skin.html`, `skin.css` and `skin.js`. It is important to have all 3 of them in place even if you're not going to write custom CSS or JS.

As you've probably guessed, `skin.html` is for your skin's markup, `skin.css` is for styling and `skin.js` is for custom behaviors.

```
skins/
    - your-skin/
        - skin.html
        - skin.css
        - skin.js
```

### Do By Example

Do look at the code of the existing skins while reading the following sections. This way you'll have a better understanding of what is being talked about.

### Basic Concepts

Your HTML file should have a single root element with a class `calamansi-skin--{your-skin-name}`. Add the `data-no-wrapper="1"` property to it if you don't want Calamansi to wrap your element in another container.

There is a set of special Calamansi.js classes you can apply to any elements in your HTML to assign them specific roles or add specific functionality. This way you don't need to write any custom JavaScript to achieve basic functionality.

Use the main CSS class as a main selector for ALL your CSS styles. Also, prefix EACH other class you're going to add to your HTML with `clmns--`. These measures help to avoid situations where the CSS of a skin affects the CSS of the page the player is on (or of another skin) or vice versa. A typical CSS selector should look like this:

```css
.calamansi-skin--nerio .clmns--controls { ... }
```

As for JavaScript, please look at `skin.js` of the existing skins to learn how to target your specific skin.

### HTML Markup

In most cases you are free to use whatever HTML elements for whatever parts of the player you want. You just need to apply the right classes to the elements. The classes do not apply any styling but functionality and behaviors.

#### Controls

Each control element should have two classes: `clmns--control` and `clmns--control-{function}`, where `{function}` determines what role your control will have:

Class | Description
--- | ---
.clmns--control-play | Play button. Play current track from the start.
.clmns--control-resume | Play button. Resume playing the current track.
.clmns--control-pause | Pause button
.clmns--control-stop | Stop button
.clmns--control-next-track | Play next track button
.clmns--control-prev-track | Play previous track button
.clmns--control-toggle-loop | Toggle playlist loop button
.clmns--control-toggle-shuffle | Toggle playlist shuffle button

#### Current Track Info

The track info elements are used to display current track information like song title, artist name, and so on. Each element should have two classes: `clmns--track-info` and `clmns--track-info--{field}`. The `{field}` is not limited to a strict set of values since you can pass custom track info values in your playlists as discussed in the `Getting Started` section. The main classes are:

Class | Description
--- | ---
.clmns--track-info--album | Album name
.clmns--track-info--albumCover | Album cover. You can use it with `img` or a block element like `div`, in which case the image will be applied as a background.
.clmns--track-info--artist | Artist name
.clmns--track-info--artistOrFilename | Artist name or the filename/source (if artist name is not available)
.clmns--track-info--duration | Formatted track duration
.clmns--track-info--filename | Track filename or the source
.clmns--track-info--genre | Track genre
.clmns--track-info--name | A string in the "{artist} - {title}" format
.clmns--track-info--title | Track title
.clmns--track-info--titleOrFilename | Track title or the filename/source (if title is not available)
.clmns--track-info--trackNumber | Track number within its album
.clmns--track-info--url | Audio source URL
.clmns--track-info--year | Album year

#### Element Visibility

You can apply `clmns--hide-on-{event}` and `clmns--show-on-{event}` classes to any elements to hide or show them when certain events occur. For example, this is used in all the default skins to toggle visibility of the play and pause buttons. Replace `{event}` with any event from the `Events` section of this documentation.

#### Sliders

Sliders are used for the playback time/seeking bar and the volume bar. An example markup would be:

```html
<div class="clmns--slider clmns--playback-bar clmns--noselect">
    <div class="clmns--playback-progress"></div>
</div>

<div class="clmns--slider clmns--volume-bar">
    <div class="clmns--volume-value"></div>
</div>
```

The `.clmns--playback-progress` and `.clmns--volume-value` elements' width will change depending on the current playback time and volume respectively from 0 to 100%. If you want to have a vertical bar, add `clmns--slider-vertical` class to the `.clmns--slider` element.

#### Playlists

Playlists come in two flavors - tables `table` and unordered lists `ul`. They have pretty strict markup rules.

```html
<div class="clmns--playlist">
    <div class="clmns--playlist-item clmns--template">
        <div class="clmns--playlist-track-info clmns--playlist-track-info--name"></div>
        <div class="clmns--playlist-track-info clmns--playlist-track-info--duration"></div>
    </div>
</div>
```

This is an unordered option. A `ul` element will be generated inside `.clmns--playlist` element. Each track will be rendered as a `li` with a `.clmns--template`-like element inside it. The `.clmns--playlist-track-info--{field}` elements work exactly like the track info elements discussed above. Please refer there for the list of supported `{field}` values.

The `table` option has a different markup but uses the same classes. Here, a `.clmns--template`-like `tr` element will be generated for each track.

```html
<table class="clmns--playlist">
    <thead>
        <th>Title</th>
        <th>Artist</th>
        <th>Album</th>
        <th>Year</th>
        <th>Length</th>
    </thead>
    <tbody>
        <tr class="clmns--playlist-item clmns--template">
            <td class="clmns--playlist-track-info clmns--playlist-track-info--titleOrFilename"></td>
            <td class="clmns--playlist-track-info clmns--playlist-track-info--artist"></td>
            <td class="clmns--playlist-track-info clmns--playlist-track-info--album"></td>
            <td class="clmns--playlist-track-info clmns--playlist-track-info--year"></td>
            <td class="clmns--playlist-track-info clmns--playlist-track-info--duration"></td>
        </tr>
    </tbody>
</table>
```

#### Miscellaneous

Some classes that were not mentioned before:

Class | Description
--- | ---
.clmns--noselect | Applies CSS to prevent element (and its text) from being selected.
.clmns--slot--content | This is where the inner content of you player element will be put in case you want to keep it or incorporate it into the player.

## Changelog

#### v.1.0.0

- First release

## Contribution

Everyone is welcome to contribute. It would be especially cool if you could share your custom made skins.

When making a contribution, please base your branch off of `dev` and merge it into `dev` as well. Thank you!

## Support

This software is absolutely free to use and is developed in the author's free time. If you found this software useful and would like to say thank you to the author, please consider making a donation. It's not the amount, it's the gesture.

- PayPal: https://paypal.me/AlexanderZavyalov
