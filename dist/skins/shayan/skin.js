;(function () {
    var players = document.querySelectorAll('.calamansi-skin--shayan');

    CalamansiEvents.on('play', function (instance) {
        players.forEach(function (player) {
            if (player.id == instance.id) {
                var info = player.querySelector('.info');
                var controlPanel = player.querySelector('.control-panel');

                if (info) {
                    info.classList.add('active');
                }

                if (controlPanel) {
                    controlPanel.classList.add('active');
                }
            }
        });
    });

    CalamansiEvents.on(['pause', 'stop'], function (instance) {
        players.forEach(function (player) {
            if (player.id == instance.id) {
                var info = player.querySelector('.info');
                var controlPanel = player.querySelector('.control-panel');

                if (info) {
                    info.classList.remove('active');
                }

                if (controlPanel) {
                    controlPanel.classList.remove('active');
                }
            }
        });
    });
})();