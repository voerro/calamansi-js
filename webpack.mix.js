let mix = require('laravel-mix');

mix.js('src/app.js', 'dist/calamansi.min.js').sass('src/app.scss', 'dist/calamansi.min.css');
