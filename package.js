/* eslint-disable no-var, prefer-arrow-callback */
var packages = [
  'ecmascript',
  'promise',
  'webapp',
  'random',
];

Package.describe({
  name: 'swydo:ddp-apollo',
  version: '4.0.0',
  summary: 'DDP link and server for Apollo',
  git: 'https://github.com/swydo/ddp-apollo',
  documentation: 'README.md',
});

Package.onUse(function use(api) {
  api.versionsFrom('1.3.2.4');
  api.use(packages);
  api.mainModule('client.js', 'client', { lazy: true });
  api.mainModule('server.js', 'server');
});

Package.onTest(function test(api) {
  api.use(packages);

  api.use([
    'meteortesting:mocha',
    'accounts-base',
  ]);

  api.mainModule('specs/client.js', 'client');
  api.mainModule('specs/server.js', 'server');
});
