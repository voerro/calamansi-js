;(function () {
    CalamansiEvents.on('initialized', function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--basic')) {
            var volumeBtn = player.querySelector('.volume-btn');

            if (!volumeBtn) {
                return;
            }

            volumeBtn.addEventListener('click', function (e) {
                volumeBtn.classList.toggle('open');
            });
        }
    });
})();