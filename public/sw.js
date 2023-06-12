'use strict';
importScripts('sw-toolbox.js');
toolbox.precache([
    '/ru',
    '/static/stylesheets/style.css',
    '/static/javascripts/mainScript.js']);
toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {networkTimeoutSeconds: 5});
