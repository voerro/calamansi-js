new Calamansi(document.getElementById('full-demo-player'), {
    skin: '../dist/skins/dummy',
    playlists: {
        'Metal': [
            {
                source: 'files/metal/02. Painters of the Tempest (Part II) Triptych Lux.mp3',
                info: {
                    custom1: 'Add any custom fields to tracks inside the playlist data. You can have as many custom fields as you want.',
                    buyUrl: 'https://artistfirst.com.au/collections/ne-obliviscaris/products/citadel-cd',
                },
            },
            {
                source: 'files/metal/04. Forget Not.mp3',
                info: {
                    buyUrl: 'https://artistfirst.com.au/collections/ne-obliviscaris/products/portal-of-i-cd',
                },
            },
            {
                source: 'files/metal/03 Intra Venus.mp3',
                info: {
                    buyUrl: 'https://artistfirst.com.au/collections/ne-obliviscaris/products/urn-cd',
                },
            },
            {
                source: 'files/metal/02 - The Second Stone.mp3',
                info: {
                    buyUrl: 'https://epicawebshop.com/music/143-the-quantum-enigma-cd-727361322229.html',
                },
            },
            {
                source: 'files/metal/03 - The Essence Of Silence.mp3',
                info: {
                    buyUrl: 'https://epicawebshop.com/music/143-the-quantum-enigma-cd-727361322229.html',
                },
            },
            {
                source: 'files/metal/06. Epica - Kingdom Of Heaven (A New Age Dawns - Part V).mp3',
                info: {
                    buyUrl: 'https://epicawebshop.com/home/1307-design-your-universe-gold-edition-2cd-pre-order-727361506209.html',
                },
            },
            {
                source: 'files/metal/01 - Bloodmeat.mp3',
                info: {
                    buyUrl: 'http://www.protestthehero.ca/records',
                },
            },
            {
                source: 'files/metal/01 - C\'est la Vie.mp3',
                info: {
                    buyUrl: 'http://www.protestthehero.ca/records',
                },
            },
            {
                source: 'files/metal/08. Mist.mp3',
                info: {
                    buyUrl: 'http://www.protestthehero.ca/records',
                },
            },
            {
                source: 'files/metal/05. Cold Embrace.mp3',
                info: {
                    buyUrl: 'https://darklunacymetal.wixsite.com/darklunacy/product-page/devoid-album',
                },
            },
            {
                source: 'files/metal/10. Fall.mp3',
                info: {
                    buyUrl: 'https://darklunacymetal.wixsite.com/darklunacy/product-page/devoid-album',
                },
            },
            {
                source: 'files/metal/07. My Dying Pathway.mp3',
                info: {
                    buyUrl: 'https://darklunacymetal.wixsite.com/darklunacy/product-page/forget-me-not-album',
                },
            },
        ],
        'Classics': [
            {
                source: 'files/classics/Rhapsody No. 2 in G Minor – Brahms.mp3',
            },
            {
                source: 'files/classics/Skrjabin Etude_Op2_No1.mp3',
            },
            {
                source: 'files/classics/Skrjabin Etude_Op8_No12.mp3',
            },
            {
                source: 'files/classics/Double Violin Concerto 1st Movement - J.S. Bach.mp3',
            },
        ],
        'Rock': [
            {
                source: 'files/rock/Forever - The Lemming Shepherds.mp3',
            },
            {
                source: 'files/rock/No Photographs - Lost European.mp3',
            },
            {
                source: 'files/rock/The Man in the House of Cards - Lost European.mp3',
            },
        ],
    },
    defaultAlbumCover: '/dist/skins/default-album-cover.png',
    soundcloudClientId: '933bc67dd9ff18eab500e8992a6b6a5f',
});