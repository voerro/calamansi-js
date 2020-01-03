let mix = require('laravel-mix');

mix.js('src/calamansi.js', 'dist/calamansi.min.js').sass('src/calamansi.scss', 'dist/calamansi.min.css');
