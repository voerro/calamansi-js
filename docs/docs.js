async function openTab(tab) {
    if (document.querySelector('.nav-item.active')) {
        document.querySelector('.nav-item.active').classList.remove('active');
    }

    if (document.querySelector('.tab-content.show')) {
        document.querySelector('.tab-content.show').classList.remove('show');
    }
    
    var tabEl = document.querySelector('.nav-item[data-tab="' + tab + '"]');
    var contentEl = document.querySelector('.tab-content[data-tab="' + tab + '"]');

    if (tabEl) {
        tabEl.classList.add('active');
    }

    if (contentEl) {
        contentEl.classList.add('show');

        var response = await fetch('parts/' + tab + '.html');
        var html = await response.text();
        
        contentEl.innerHTML = html;
    }

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

openTab('getting-started');

document.querySelector('.nav-items').addEventListener('click', function (e) {
    e.preventDefault();

    if (e.target.classList.contains('nav-item') && e.target.dataset.tab) {
        openTab(e.target.dataset.tab);
    }
});