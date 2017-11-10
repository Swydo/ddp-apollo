# DDP-Apollo
DDP link and server for Apollo

[![Build Status](https://travis-ci.org/Swydo/ddp-apollo.svg?branch=master)](https://travis-ci.org/Swydo/ddp-apollo)
[![Greenkeeper badge](https://badges.greenkeeper.io/Swydo/ddp-apollo.svg)](https://greenkeeper.io/)

## Purpose
This package has been created to levarage the power of DDP for GraphQL queries and subscriptions. For Meteor developers there is no need to setup a separate HTTP server or websocket connection, because DDP offers all we need and has been well tested over time.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Client setup](#client-setup)
  - [Options](#options)
- [Server setup](#server-setup)
  - [Options](#options-1)
- [GraphQL subscriptions](#graphql-subscriptions)
  - [Setting up PubSub](#setting-up-pubsub)
- [Apollo Optics](#apollo-optics)
- [Sponsor](#sponsor)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
meteor add swydo:ddp-apollo
```

```
meteor npm install --save graphql
```

## Client setup
This package gives you a DDPLink for your Apollo Client.

```javascript
import ApolloClient from 'apollo-client';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
// Apollo requires a cache to be added as well
import { InMemoryCache } from 'apollo-cache-inmemory';

export const client = new ApolloClient ({
  link: new DDPLink(),
  cache: new InMemoryCache()
});
```

### Options
- `connection`: The DDP connection to use. Default `Meteor.connection`.
- `method`: The name of the method. Default `__graphql`.
- `publication`: The name of the publication. Default `__graphql-subscriptions`.

```javascript
// Pass options to the DDPLink constructor
new DDPLink({
  connection: Meteor.connection
});
```

## Server setup
The server will add a method that will be used by the DDP network interface.

```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

setup({
  schema,
  ...otherOptions
});
```

### Options
- `schema`: The GraphQL schema. Default `undefined`. Required.
- `method`: The name of the method. Default `__graphql`.
- `publication`: The name of the publication. Default `__graphql-subscriptions`.
- `disableOptics`: Disable Apollo Optics monitoring. Default `undefined`. See [Apollo Optics](#apollo-optics).

## GraphQL subscriptions
Subscription support is baked into this package. Simply add the subscriptions to your schema and resolvers and everything works.

```graphql
// schema.graphql
type Query {
  name: String
}

type Subscription {
  message: String
}

schema {
  query: Query
  subscription: Subscription
}
```

### Setting up PubSub
```sh
meteor npm install --save graphql-subscriptions
```

```javascript
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    name: () => 'bar',
  },
  Subscription: {
    message: {
      subscribe: () => pubsub.asyncIterator('SOMETHING_CHANGED'),
    },
  },
};

// Later you can publish updates like this:
pubsub.publish('SOMETHING_CHANGED', { message: 'hello world' });
```

See [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package for more setup details and other pubsub mechanisms.

## Apollo Optics
You can also use [Apollo Optics](http://www.apollodata.com/optics) with ddp-apollo.

Before passing your schema to the setup function you must first instrument it:

```javascript
import OpticsAgent from 'optics-agent';

OpticsAgent.instrumentSchema(schema);
```

That's it! Now `ddp-apollo` will take care of the rest. In case you don't want to use optics after instrumenting the schema you can disable it by passing `disableOptics: true` to the server options.

See the [Optics README](https://github.com/apollographql/optics-agent-js/blob/master/README.md) for all the setup details and options.

## Sponsor
[![Swydo](http://assets.swydo.com/img/s-wydo-logo.228x100.png)](https://swy.do)

Want to work with Meteor and GraphQL? [Join the team!](https://swy.do/jobs)
