var packages = [
  'ecmascript',
  'promise',
];

Package.describe({
  name: 'swydo:ddp-apollo',
  version: '0.0.6',
  summary: 'DDP network interface for Apollo using a Meteor method',
  git: 'https://github.com/swydo/ddp-apollo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use(packages);
  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});

Package.onTest(function(api) {
  api.use(packages);

  api.use([
    'practicalmeteor:mocha',
    'dispatch:mocha-phantomjs',
  ]);

  api.mainModule('server.spec.js', 'server');
});
