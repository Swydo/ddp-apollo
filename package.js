/* eslint-disable no-var, prefer-arrow-callback */
var packages = [
  'ecmascript',
  'promise',
  'random',
];

Package.describe({
  name: 'swydo:ddp-apollo',
  version: '0.2.1',
  summary: 'DDP network interface for Apollo using a Meteor method',
  git: 'https://github.com/swydo/ddp-apollo',
  documentation: 'README.md',
});

Package.onUse(function use(api) {
  api.versionsFrom('1.3.2.4');
  api.use(packages);
  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});

Package.onTest(function test(api) {
  api.use(packages);

  api.use([
    'practicalmeteor:mocha@2.4.5_6',
    'dispatch:phantomjs-tests@=0.0.5',
    'dispatch:mocha-phantomjs',
  ]);

  api.mainModule('specs/client.spec.js', 'client');
  api.mainModule('specs/server.spec.js', 'server');
});
