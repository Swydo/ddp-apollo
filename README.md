# DDP-Apollo
DDP-Apollo leverages the power of DDP for GraphQL queries and subscriptions. Meteor developers do not need an HTTP server or extra websocket connection, because DDP offers all we need and has been well tested over time.

- DDP-Apollo is one of the easiest ways to get GraphQL running for Meteor developers
- Works with the Meteor accounts packages out of the box, giving a userId in your resolvers
- Method calls and collection hooks will have `this.userId` when called within your resolvers
- Doesn’t require an HTTP server to be setup, like with express, koa or hapi
- Supports GraphQL Subscriptions out-of-the-box
- Doesn’t require an extra websocket for GraphQL Subscriptions, because DDP already has a websocket
- Already have a server setup? Use `DDPSubscriptionLink` stand-alone for just Subscriptions support. [Read more](#using-ddp-only-for-subscriptions)

# Just another Apollo Link
Because it's "just another Apollo Link":
- It works with [Apollo Dev Tools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm)
- It's easy to combine with other Apollo Links
- It's front-end agnostic

# Starter Kit
Checkout this [starter kit](https://github.com/jamiter/meteor-starter-kit) to see Meteor, Apollo, DDP and React all work together.

*Note: DDP-Apollo works with all front-ends, not just React*

[![Build Status](https://travis-ci.org/Swydo/ddp-apollo.svg?branch=master)](https://travis-ci.org/Swydo/ddp-apollo)

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
- [HTTP support](#http-support)
  - [Installation](#installation-1)
  - [Client setup](#client-setup-1)
  - [Server setup](#server-setup-1)
    - [Options](#options-2)
- [Sponsor](#sponsor)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
meteor add swydo:ddp-apollo
```

```
meteor npm install --save @apollo/clint apollo-link-ddp graphql
```

## Client setup
All client code is in the `apollo-link-ddp` npm package. It gives you a `DDPLink` for your Apollo Client. Creating an Apollo Client is the same as with any other Apollo Link.

```javascript
// Choose any cache implementation, but we'll use InMemoryCache as an example
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { DDPLink } from 'apollo-link-ddp';

export const client = new ApolloClient ({
  link: new DDPLink(),
  cache: new InMemoryCache()
});
```

### Options
- `connection`: The DDP connection to use. Default `Meteor.connection`.
- `method`: The name of the method. Default `__graphql`.
- `publication`: The name of the publication. Default `__graphql-subscriptions`.
- `ddpRetry`: Retry failed DDP method calls. Default `true`. Switch off and use [apollo-link-retry](https://www.npmjs.com/package/apollo-link-retry) for more control.
- `socket`: Optionally pass a socket to listen to for messages. This makes it easy to integrate with non-Meteor DDP clients.

```javascript
// Pass options to the DDPLink constructor
new DDPLink({
  connection: Meteor.connection
});
```

## Server setup
The server will add a method and publication that will be used by the DDP Apollo Link.

```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

setup({
  schema,
  ...otherOptions
});
```

### Options
- `schema`: The GraphQL schema. Default `undefined`. Required when no `gateway` is provided.
- `gateway`: An [Apollo Gateway](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-gateway). Default `undefined`. Required when no `schema` is provided.
- `context`: A custom context. Either an object or a function returning an object. Optional.
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

// As an async function, returning a promise with an object
const context = async (currentContext) => ({ ...currentContext, foo: await doAsyncStuff() });

setup({
  schema,
  context,
});
```

## GraphQL subscriptions
Subscription support is baked into this package. Simply add the subscriptions to your schema and resolvers and everything works.

*Note: [Apollo Gateway](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-gateway) does not yet support Subscriptions.*

```graphql
# schema.graphql
type Query {
  name: String
}

type Subscription {
  message: String
}
```

### Setting up PubSub
```sh
meteor npm install --save graphql-subscriptions
```

```javascript
import { PubSub } from 'graphql-subscriptions';

// The pubsub mechanism of your choice, for instance:
// - PubSub from graphql-subscriptions (in-memory, so not recommended for production)
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

See [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package for more setup details and other pubsub mechanisms. It also explains why the default `PubSub` isn't meant for production.

### Using DDP only for subscriptions
If you already have an HTTP server setup and you are looking to support GraphQL Subscriptions in your Meteor application, you can use the `DDPSubscriptionLink` stand-alone.

```javascript
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { DDPSubscriptionLink, isSubscription } from 'apollo-link-ddp';

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

## HTTP support
There can be reasons to use HTTP instead of a Meteor method. There is support for it built in, but it requires a little different setup than the DDP version.

### Installation
We'll need the HTTP link from Apollo and `body-parser` on top of the default dependencies:

```
meteor npm install @apollo/client body-parser
```

### Client setup
```js
import { ApolloClient, InMemoryCache } from '@apollo/client';
// Use the MeteorLink instead of the DDPLink
// It uses HTTP for queries and Meteor subscriptions (DDP) for GraphQL subscriptions
import { MeteorLink } from 'apollo-link-ddp';

export const client = new ApolloClient ({
  link: new MeteorLink(),
  cache: new InMemoryCache()
});
```

### Server setup
```js
import { schema } from './path/to/your/executable/schema';
import { setupHttpEndpoint, createGraphQLPublication } from 'meteor/swydo:ddp-apollo';

setupHttpEndpoint({
  schema,
  ...otherOptions,
});

// For subscription support (not required)
createGraphQLPublication({ schema });
```

#### Options
- `schema`: The GraphQL schema. Default `undefined`. Required when no `gateway` is provided.
- `gateway`: An [Apollo Gateway](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-gateway). Default `undefined`. Required when no `schema` is provided.
- `context`: A custom context. Either an object or a function returning an object. Optional.
- `path`: The name of the HTTP path. Default `/graphql`.
- `engine`: An Engine instance, in case you want monitoring on your HTTP endpoint. Optional.
- `authMiddleware`: Middleware to get a userId and set it on the request. Default `meteorAuthMiddleware`, using a login token.
- `jsonParser`: Custom JSON parser. Loads `body-parser` from your `node_modules` by default and uses `.json()`.

## Sponsor
[![Swydo](http://assets.swydo.com/img/s-wydo-logo.228x100.png)](https://swy.do)

Want to work with Meteor and GraphQL? [Join the team!](https://swy.do/jobs)
