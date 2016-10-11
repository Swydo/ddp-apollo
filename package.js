Package.describe({
  name: 'swydo:ddp-apollo',
  version: '0.0.2',
  summary: 'DDP network interface for Apollo using a Meteor method',
  git: 'https://github.com/swydo/ddp-apollo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');
  api.use('ecmascript');
  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('tinytest');
//   api.use('swydo:ddp-apollo');
//   api.mainModule('ddp-apollo-tests.js');
// });
