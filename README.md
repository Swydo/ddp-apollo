# DDP-Apollo
DDP-Apollo has been created to leverage the power of DDP for GraphQL queries and subscriptions. For Meteor developers there is no real need for an HTTP server or extra websocket connection, because DDP offers all we need and has been well tested over time.

- DDP-Apollo is one of the easiest ways to get GraphQL running for Meteor developers
- Works with the Meteor accounts packages out of the box, giving a userId in your resolvers
- Doesn’t require an HTTP server to be setup, like with express, koa or hapi
- Supports GraphQL Subscriptions out-of-the-box
- Doesn’t require an extra websocket for GraphQL Subscriptions, because DDP already has a websocket
- Already have a server setup? Use `DDPSubscriptionLink` stand-alone for just Subscriptions support. [Read more](#using-ddp-only-for-subscriptions)

Because it's "just another Apollo Link":
- It works with [Apollo Dev Tools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm)
- It's easy to combine with other Apollo Links
- It's front-end agnostic

Checkout this [starter kit](https://github.com/jamiter/meteor-starter-kit) to see Meteor, Apollo, DDP and React all work together.

*Note: DDP-Apollo works with all front-ends, not just React*

[![Build Status](https://travis-ci.org/Swydo/ddp-apollo.svg?branch=master)](https://travis-ci.org/Swydo/ddp-apollo)
[![Greenkeeper badge](https://badges.greenkeeper.io/Swydo/ddp-apollo.svg)](https://greenkeeper.io/)

## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Client setup](#client-setup)
  - [Options](#options)
- [Server setup](#server-setup)
  - [Options](#options-1)
  - [Custom context](#custom-context)
- [GraphQL subscriptions](#graphql-subscriptions)
  - [Setting up PubSub](#setting-up-pubsub)
  - [Using DDP only for subscriptions](#using-ddp-only-for-subscriptions)
- [Rate limiting GraphQL calls](#rate-limiting-graphql-calls)
- [Sponsor](#sponsor)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
meteor add swydo:ddp-apollo
```

```
meteor npm install --save graphql apollo-link apollo-client apollo-cache-inmemory
```

## Client setup
This package gives you a `DDPLink` for your Apollo Client.

```javascript
import ApolloClient from 'apollo-client';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
// Choose any cache implementation, but we'll use InMemoryCache as an example
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
The server will add a method that will be used by the DDP Apollo Link.

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
- `context`: A customer context. Either an object or a function returning an object. Optional.
- `method`: The name of the method. Default `__graphql`.
- `publication`: The name of the publication. Default `__graphql-subscriptions`.

### Custom context
To modify or overrule the default context, you can pass a `context` object or function to the setup:

```js
// As an object:
const context = {
  foo: 'bar'
}

// As a function, returning an object:
const context = (currentContext) => ({ ...currentContext, foo: 'bar' });

setup({
  schema,
  context,
});
```

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

// The pubsub mechanism of your choice, for instance:
// - PubSub from graphql-subscriptions (not recommended for production)
// - RedisPubSub from graphql-redis-subscriptions
// - MQTTPubSub from graphql-mqtt-subscriptions
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

### Using DDP only for subscriptions
If you already have an HTTP server setup and you are looking to support GraphQL Subscriptions in your Meteor application, you can use the `DDPSubscriptionLink` stand-alone.

```javascript
import { ApolloClient } from 'apollo-client';
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { DDPSubscriptionLink, isSubscription } from 'meteor/swydo:ddp-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';

const httpLink = new HttpLink({ uri: "/graphql" });
const subscriptionLink = new DDPSubscriptionLink();

const link = split(
  isSubscription,
  subscriptionLink,
  httpLink,
);

export const client = new ApolloClient ({
  link,
  cache: new InMemoryCache()
});
```

## Rate limiting GraphQL calls
Meteor supports rate limiting for DDP calls. This means you can rate limit DDP-Apollo as well!

```sh
meteor add ddp-rate-limiter
```

```js
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

// Define a rule that matches graphql method calls.
const graphQLMethodCalls = {
  type: 'method',
  name: '__graphql'
};

// Add the rule, allowing up to 5 messages every 1000 milliseconds.
DDPRateLimiter.addRule(graphQLMethodCalls, 5, 1000);
```

See [DDP Rate Limit documentation](https://docs.meteor.com/api/methods.html#ddpratelimiter).

## Sponsor
[![Swydo](http://assets.swydo.com/img/s-wydo-logo.228x100.png)](https://swy.do)

Want to work with Meteor and GraphQL? [Join the team!](https://swy.do/jobs)
