# Migration guide to 1.0

## Installation
You'll need the Apollo Link package and GrahpQL for Apollo Client 2 support:
```
meteor npm install --save apollo-link graphql
```

## Client setup

### Previously
```javascript
import ApolloClient from 'apollo-client';
import { DDPNetworkInterface } from 'meteor/swydo:ddp-apollo';

export const client = new ApolloClient ({
  networkInterface: new DDPNetworkInterface()
});
```

### Now
```javascript
import ApolloClient from 'apollo-client';
import { DDPLink } from 'meteor/swydo:ddp-apollo';
// Apollo Clietn 2 requires a cache to be added as well
import { InMemoryCache } from 'apollo-cache-inmemory';

export const client = new ApolloClient ({
  link: new DDPLink(),
  cache: new InMemoryCache()
});
```

## Server setup

### Previously
```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

setup(schema, {
  ...otherOptions
});
```

### Now
```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

setup({
  schema,
  ...otherOptions
});
```

## Subscriptions
`SubscriptionsManager` from `graphql-subscriptions` has been deprecated. Support for Subscriptions is now build into this package. All you need to do is setup the PubSub mechanism:

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