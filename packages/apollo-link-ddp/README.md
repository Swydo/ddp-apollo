# Apollo Link using DDP
This is the client part of the DDP setup for Apollo. It works out of the box in a Meteor environment but is also usable with packages like `ddp.js`.

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

## Using ddp.js instead of Meteor
If you are using [asteroid](https://github.com/mondora/asteroid) or the `ddp` npm package directly, you can also use DDP-Apollo!

```javascript
const DDP = require("ddp.js");
const options = {
    endpoint: "ws://localhost:3000/websocket"
};
const connection = new DDP(options); // Or asteroid.ddp, when using Asteroid

// Support GQL subscriptions as well
const ddpObserver = new Observable((observer) => {
    connection.socket.on("message:in", message => observer.next(message));
});

new DDPLink({
  connection,
  ddpObserver,
});
```
