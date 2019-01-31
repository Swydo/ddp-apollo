# Apollo Link using DDP
This is the client part of the DDP setup for Apollo. It works out of the box in a Meteor environment but is also usable with packages like `asteroid`.

## Installation
```
meteor npm install --save apollo-link-ddp apollo-link graphql
```

## Setup
This packages gives you a `DDPLink` for your Apollo Client. Creating an Apollo Client is the same as with any other Apollo Link.

```javascript
import ApolloClient from 'apollo-client';
import { DDPLink } from 'apollo-link-ddp';
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
- `ddpRetry`: Retry failed DDP method calls. Default `true`. Switch off and use [apollo-link-retry](https://www.npmjs.com/package/apollo-link-retry) for more control.

```javascript
// Pass options to the DDPLink constructor
new DDPLink({
  connection: Meteor.connection
});
```

## Setup with [Asteroid](https://github.com/mondora/asteroid)

```javascript
const Asteroid = createClass();
const asteroid = new Asteroid({
    endpoint: 'ws://localhost:3000/websocket',
});

const link = new DDPLink({
    connection: asteroid,
    socket: asteroid.ddp.socket,
    subscriptionIdKey: 'id',
});
```

## Setup with [SimpleDDP](https://github.com/Gregivy/simpleddp)

```javascript
const SimpleDDP = require('simpleddp');

const ddp = new SimpleDDP({
    endpoint: 'ws://localhost:3000/websocket',
    SocketConstructor: global.WebSocket,
});

// SimpleDDP has a different API than the default DDP client
// We need to map some functions to a format which the DDP link understands
ddp.apply = ddp.call;
ddp.subscribe = (pub, ...args) => ddp.sub(pub, args);

this.link = getDDPLink({
    connection: ddp,
    socket: ddp.ddpConnection.socket,
    subscriptionIdKey: 'subid',
});
```
