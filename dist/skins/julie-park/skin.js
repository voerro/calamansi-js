const script = document.createElement('script');
script.setAttribute('src', "https://unpkg.com/simplebar@4.2.3/dist/simplebar.min.js");
script.setAttribute('type', 'text/javascript');
document.querySelector('head').appendChild(script);

var _csjpInfo = document.querySelector('.calamansi-skin--julie-park .info');

document.querySelector('.calamansi-skin--julie-park .toggle-playlist').addEventListener('change', function (e) {
    if (e.target.checked && !_csjpInfo.classList.contains('show-playlist')) {
        _csjpInfo.classList.add('show-playlist');
    } else if (!_csjpInfo.checked && _csjpInfo.classList.contains('show-playlist')) {
        _csjpInfo.classList.remove('show-playlist');
    }
});