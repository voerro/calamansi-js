if (document.querySelectorAll(`script[src="https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js"]`).length == 0) {
    const script = document.createElement('script');
    script.setAttribute('src', 'https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js');
    script.setAttribute('type', 'text/javascript');
    document.querySelector('head').appendChild(script);
}

var _csjpc = document.querySelector('.calamansi-skin--julie-park-compact');

document.querySelectorAll('.calamansi-skin--julie-park-compact .toggle-playlist').forEach(function (el) {
    el.addEventListener('change', function (e) {
        _csjpc.classList.toggle('show-playlist');
    });
});

var _csjpControls = document.querySelector('.controls');

if (_csjpControls.offsetWidth < 300) {
    _csjpControls.classList.add('compact');
}