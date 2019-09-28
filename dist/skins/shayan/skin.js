;(function () {
    var info = document.querySelector('.calamansi-skin--shayan .info');
    var controlPanel = document.querySelector('.calamansi-skin--shayan .control-panel');

    document.querySelectorAll('.calamansi-skin--shayan .play').forEach(function (el) {
        el.addEventListener('click', function (e) {
            if (info) {
                info.classList.add('active');
            }

            if (controlPanel) {
                controlPanel.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.calamansi-skin--shayan .pause').forEach(function (el) {
        el.addEventListener('click', function (e) {
            if (info) {
                info.classList.remove('active');
            }

            if (controlPanel) {
                controlPanel.classList.remove('active');
            }
        });
    });
})();