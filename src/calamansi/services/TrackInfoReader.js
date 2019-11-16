let jsmediatags = require('../../vendor/jsmediatags.min.js');

class TrackInfoReader {
    constructor(soundcloudClientId) {
        this.soundcloudClientId = soundcloudClientId;
    }

    read(track) {
        switch (track.sourceType) {
            case 'mp3':
                return this.readId3(track);
            case 'soundcloud':
                return this.readSoundcloud(track);
        }
    }

    readId3(track) {
        return new Promise((resolve, reject) => {
            let url;

            if (track.source.startsWith('http')) {
                url = track.source;
            } else if (track.source.startsWith('/')) {
                url = window.location.origin + track.source;
            } else {
                url = window.location.origin + window.location.pathname + track.source;
            }

            jsmediatags.read(url, {
                onSuccess: (tags) => {
                    let trackInfo = tags.tags;

                    if (trackInfo.artist && trackInfo.title) {
                        trackInfo.name = `${trackInfo.artist} - ${trackInfo.title}`;
                    }

                    if (trackInfo.title) {
                        trackInfo.titleOrFilename = trackInfo.title;
                    }

                    if (trackInfo.artist) {
                        trackInfo.artistOrFilename = trackInfo.artist;
                    }

                    if (trackInfo.track) {
                        trackInfo.trackNumber = parseInt(trackInfo.track.split('/')[0]);
                    }

                    if (trackInfo.picture) {
                        let base64 = btoa(String.fromCharCode.apply(null, trackInfo.picture.data));

                        trackInfo.picture = Object.assign(trackInfo.picture, {
                            base64: 'data:' + trackInfo.picture.format + ';base64,' + base64
                        });

                        trackInfo.albumCover = trackInfo.picture;
                    }

                    if (tags.tags.TYER || tags.tags.TDRC) {
                        trackInfo.year = tags.tags.TYER ? parseInt(tags.tags.TYER.data) : (
                            tags.tags.TDRC ? parseInt(tags.tags.TDRC.data) : null
                        )
                    }

                    trackInfo._loaded = true;

                    resolve(trackInfo);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    }
    
    readSoundcloud(track) {
        return new Promise((resolve, reject) => {
            // const response = fetch('https://api.soundcloud.com/resolve.json?url=https%3A%2F%2Fsoundcloud.com%2Fmsmrsounds%2Fms-mr-hurricane-chvrches-remix&client_id=' + this.soundcloudClientId)

            // reject(response);
            // jsmediatags.read(window.location.origin + window.location.pathname + track.source, {
            //     onSuccess: (tags) => {
            //         let trackInfo = tags.tags;

            //         if (trackInfo.artist && trackInfo.title) {
            //             trackInfo.name = `${trackInfo.artist} - ${trackInfo.title}`;
            //         }

            //         if (trackInfo.title) {
            //             trackInfo.titleOrFilename = trackInfo.title;
            //         }

            //         if (trackInfo.artist) {
            //             trackInfo.artistOrFilename = trackInfo.artist;
            //         }

            //         if (trackInfo.track) {
            //             trackInfo.trackNumber = parseInt(trackInfo.track.split('/')[0]);
            //         }

            //         if (trackInfo.picture) {
            //             let base64 = btoa(String.fromCharCode.apply(null, trackInfo.picture.data));

            //             trackInfo.picture = Object.assign(trackInfo.picture, {
            //                 base64: 'data:' + trackInfo.picture.format + ';base64,' + base64
            //             });

            //             trackInfo.albumCover = trackInfo.picture;
            //         }

            //         if (tags.tags.TYER || tags.tags.TDRC) {
            //             trackInfo.year = tags.tags.TYER ? parseInt(tags.tags.TYER.data) : (
            //                 tags.tags.TDRC ? parseInt(tags.tags.TDRC.data) : null
            //             )
            //         }

            //         trackInfo._loaded = true;

            //         resolve(trackInfo);
            //     },
            //     onError: (error) => {
            //         reject(error);
            //     }
            // });
        });
    }
}

export default TrackInfoReader;