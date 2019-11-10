; (function () {
    CalamansiEvents.on('initialized', function (instance) {
        var player = instance.el;

        if (player.matches('.calamansi-skin--nerio')) {
            if (document.querySelectorAll(`script[src="https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js"]`).length == 0) {
                var script = document.createElement('script');
                script.setAttribute('src', 'https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js');
                script.setAttribute('type', 'text/javascript');
                document.querySelector('head').appendChild(script);
            }

            player.querySelectorAll('.clmns--control-toggle-playlist').forEach(function (el) {
                el.addEventListener('change', function (e) {
                    player.classList.toggle('clmns--show-playlist');
                });
            });
        }
    });
})();