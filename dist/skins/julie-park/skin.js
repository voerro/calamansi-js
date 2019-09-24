var _csjpControls = document.querySelector('.calamansi-skin--julie-park .info');

document.querySelector('.calamansi-skin--julie-park').addEventListener('mouseover', function () {
    if (!_csjpControls.classList.contains('up')) {
        _csjpControls.classList.add('up');
    }
});

document.querySelector('.calamansi-skin--julie-park').addEventListener('mouseout', function () {
    if (_csjpControls.classList.contains('up')) {
        _csjpControls.classList.remove('up');
    }
});