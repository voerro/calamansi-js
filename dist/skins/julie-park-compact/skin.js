;(function () {
    if (document.querySelectorAll(`script[src="https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js"]`).length == 0) {
        var script = document.createElement('script');
        script.setAttribute('src', 'https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js');
        script.setAttribute('type', 'text/javascript');
        document.querySelector('head').appendChild(script);
    }

    var player = document.querySelector('.calamansi-skin--julie-park-compact');

    document.querySelectorAll('.calamansi-skin--julie-park-compact .toggle-playlist').forEach(function (el) {
        el.addEventListener('change', function (e) {
            player.classList.toggle('show-playlist');
        });
    });

    var controls = document.querySelector('.controls');

    if (controls.offsetWidth < 300) {
        controls.classList.add('compact');
    }
})();