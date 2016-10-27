# DDP-Apollo
DDP network interface for Apollo using a Meteor method

## Installation

```
meteor add swydo:ddp-apollo
```

```
meteor npm install --save graphql-server-core
```

## Client setup
This package gives you a network interface for you Apollo Client.

```javascript
import ApolloClient from 'apollo-client';
import { DDPNetworkInterface } from 'meteor/swydo:ddp-apollo';

export const client = new ApolloClient ({
  networkInterface: new DDPNetworkInterface({ connection: Meteor.connection })
});
```

### Options
- `connection`: The DDP connection to use. No default.
- `method`: The name of the method. Default `/graphql`.
- `noRetry`: Don't send the requests again on reload. Default `true`. See [method documentation](https://docs.meteor.com/api/methods.html#Meteor-apply).

## Server setup
The server will add a method that will be used by the DDP network interface.

```javascript
import { schema } from './path/to/your/executable/schema';
import { setup } from 'meteor/swydo:ddp-apollo';

setup(schema);
```

### Options
- `method`: The name of the method. Default `/graphql`.
