# DDP-Apollo
DDP network interface for Apollo using a Meteor method

[![Build Status](https://travis-ci.org/Swydo/ddp-apollo.svg?branch=master)](https://travis-ci.org/Swydo/ddp-apollo)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Client setup](#client-setup)
  - [Options](#options)
- [Server setup](#server-setup)
  - [Options](#options-1)
- [GraphQL subscriptions](#graphql-subscriptions)
- [Apollo Optics](#apollo-optics)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
meteor add swydo:ddp-apollo
```

```
meteor npm install --save graphql-server-core graphql
```

## Client setup
This package gives you a network interface for you Apollo Client.

```javascript
import ApolloClient from 'apollo-client';
import { DDPNetworkInterface } from 'meteor/swydo:ddp-apollo';

export const client = new ApolloClient ({
  networkInterface: new DDPNetworkInterface()
});
```

### Options
- `connection`: The DDP connection to use. Default `Meteor.connection`.
- `method`: The name of the method. Default `__graphql`.
- `noRetry`: Don't send the requests again on reload. Default `true`. See [method documentation](https://docs.meteor.com/api/methods.html#Meteor-apply).

## Server setup
The server will add a method that will be used by the DDP network interface.

```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

const options = {}; // See below for options

setup(schema, options);
```

### Options
- `method`: The name of the method. Default `__graphql`.
- `disableOptics`: Disable Apollo Optics monitoring. Default `undefined`. See [Apollo Optics](#apollo-optics).
- `subscriptionManager`: A GraphQL subscription manager. No default. See [GraphQL subscriptions](#graphql-subscriptions).

## GraphQL subscriptions
```sh
meteor npm install --save graphql-subscriptions
```

To support GraphQL subscriptions, pass a subscription manager:

```javascript
import { PubSub, SubscriptionManager } from 'graphql-subscriptions';

const pubsub = new PubSub();

const subscriptionManager = new SubscriptionManager({
  schema,
  pubsub
});

setup(schema, {
  subscriptionManager
});
```
See [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package for setup details.

`client.subscribe(request, handle)` and `client.unsubsribe(id)` are now operational!

## Apollo Optics
You can also use [Apollo Optics](http://www.apollodata.com/optics) with ddp-apollo.

Before passing your schema to the setup function you must first instrument it:

```javascript
import OpticsAgent from 'optics-agent';

OpticsAgent.instrumentSchema(schema);
```

That's it! Now `ddp-apollo` will take care of the rest. In case you don't want to use optics after instrumenting the schema you can disable it by passing `disableOptics: true` to the server options.

See the [Optics README](https://github.com/apollographql/optics-agent-js/blob/master/README.md) for all the setup details and options.
