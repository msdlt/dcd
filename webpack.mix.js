const mix = require('laravel-mix');
//let path = require('path'); //see: https://stackoverflow.com/questions/70473880/laravel-mix-custom-node-modules-path

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [
        //
    ])
    /*.webpackConfig({ //to allow phaser3-rex-plugins to be found
        resolve: {
            modules: [
                path.resolve(__dirname, 'node_modules')
            ]
        }
    })*/
    .copy( 'resources/assets/images', 'public/assets/images', false );
