import Calamansi from './calamansi/Calamansi';

// Initialize all the player instances
const elements = document.querySelectorAll('v-calamansi');
window.calamansis = [];

elements.forEach(item => {
    calamansis.push(new Calamansi(item));

    // TODO: Catch the "initialized" event, emit a global (document level?) event
});
