;(function () {
    var player = document.querySelector('.calamansi-skin--shayan');
    var info = document.querySelector('.calamansi-skin--shayan .info');
    var controlPanel = document.querySelector('.calamansi-skin--shayan .control-panel');

    CalamansiEvents.on('play', function (instance) {
        if (player && player.id == instance.id) {
            if (info) {
                info.classList.add('active');
            }

            if (controlPanel) {
                controlPanel.classList.add('active');
            }
        }
    });

    CalamansiEvents.on(['pause', 'stop'], function (instance) {
        if (player && player.id == instance.id) {
            if (info) {
                info.classList.remove('active');
            }

            if (controlPanel) {
                controlPanel.classList.remove('active');
            }
        }
    });
})();