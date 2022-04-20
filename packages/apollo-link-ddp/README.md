# Apollo Link using DDP
This is the client part of the DDP setup for Apollo. It works out of the box in a Meteor environment but is also usable with packages like `asteroid`.

## Installation
```
meteor npm install --save apollo-link-ddp apollo-link graphql
```

## Setup
This packages gives you a `DDPLink` for your Apollo Client. Creating an Apollo Client is the same as with any other Apollo Link.

```javascript
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { DDPLink } from '@swydo/apollo-link-ddp';

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
DDP-Apollo works with SimpleDDP version 2 and up.

```javascript
const SimpleDDP = require('simpleddp');

const connection = new SimpleDDP({
    endpoint: 'ws://localhost:3000/websocket',
    SocketConstructor: global.WebSocket,
});

this.link = new DDPLink({
    connection: connection,
    socket: connection.ddpConnection.socket,
});
```
