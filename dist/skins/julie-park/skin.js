;(function () {
    if (document.querySelectorAll(`script[src="https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js"]`).length == 0) {
        var script = document.createElement('script');
        script.setAttribute('src', 'https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js');
        script.setAttribute('type', 'text/javascript');
        document.querySelector('head').appendChild(script);
    }

    var info = document.querySelector('.calamansi-skin--julie-park .info');

    document.querySelectorAll('.calamansi-skin--julie-park .toggle-playlist').forEach(function (el) {
        el.addEventListener('change', function (e) {
            info.classList.toggle('show-playlist');
        });
    });

    var controls = document.querySelector('.controls');

    if (controls.offsetWidth < 300) {
        controls.classList.add('compact');
    }
})();