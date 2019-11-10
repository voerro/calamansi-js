;(function () {
    CalamansiEvents.on('play', function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--ayon')) {
            var info = player.querySelector('.clmns--info');
            var controlPanel = player.querySelector('.clmns--control-panel');

            if (info) {
                info.classList.add('clmns--active');
            }

            if (controlPanel) {
                controlPanel.classList.add('clmns--active');
            }
        }
    });

    CalamansiEvents.on(['pause', 'stop'], function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--ayon')) {
            var info = player.querySelector('.clmns--info');
            var controlPanel = player.querySelector('.clmns--control-panel');

            if (info) {
                info.classList.remove('clmns--active');
            }

            if (controlPanel) {
                controlPanel.classList.remove('clmns--active');
            }
        }
    });
})();