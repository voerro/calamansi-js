;(function () {
    CalamansiEvents.on('play', function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--shayan')) {
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

    CalamansiEvents.on(['pause', 'stop'], function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--shayan')) {
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
})();