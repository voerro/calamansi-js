;(function () {
    CalamansiEvents.on('initialized', function (instance) {
        var player = instance.el;

        console.log(player);

        if (player.matches('.calamansi-skin--gregh')) {
            var volumeBtn = player.querySelector('.volume-btn');

            if (!volumeBtn) {
                return;
            }

            volumeBtn.addEventListener('click', function (e) {
                volumeBtn.classList.toggle('open');
            });
        }
    });

    // document.addEventListener("DOMContentLoaded", function () {
    //     var players = document.querySelectorAll('.calamansi-skin--gregh');

    //     console.log(players);

    //     players.forEach(function (player) {
    //         var volumeBtn = player.querySelector('.volume-btn');

    //         if (!volumeBtn) {
    //             return;
    //         }

    //         volumeBtn.addEventListener('click', function (e) {
    //             volumeBtn.classList.toggle('open');
    //         });
    //     });
    // });
})();