## vNEXT

-

## 2.1.0

- Compile apollo-link-ddp browser code with babel [#300](https://github.com/Swydo/ddp-apollo/pull/300)

## 2.0.1

- Expose `createGraphQLPublication` on the server [#276](https://github.com/Swydo/ddp-apollo/pull/276)
- The client module has been marked as lazy, so if using the Meteor package, `DDPLink` will only be included in the bundle when `import`ed [#277](https://github.com/Swydo/ddp-apollo/pull/277)
- Remove `graphql` dependency from apollo-link-ddp, saving ~250kb [ca42d2cb1](https://github.com/Swydo/ddp-apollo/commit/ca42d2cb1c4a2f73755ecb542b1ee88db3b6c9ac)

## 2.0.0

- Move client code to stand-alone npm package [#207](https://github.com/Swydo/ddp-apollo/pull/207)

## 1.4.0

- Add HTTP support [#168](https://github.com/Swydo/ddp-apollo/pull/168)
- Add a DDP retry switch [#186](https://github.com/Swydo/ddp-apollo/pull/186)
- Allow custom DDP message observer [#198](https://github.com/Swydo/ddp-apollo/pull/198)
- Add `ddpConnection` to the resolver context [#268](https://github.com/Swydo/ddp-apollo/pull/268)

## 1.3.0

- Add ability to pass a client context to the server context via `ddpContext` key.
  ```js
  // client
  apolloClient.query({
      query,
      context: { ddpContext: { foo: 'bar' } }
  });

  // server
  const context = (previousContext, ddpContext) => ({
      ...previousContext,
      foo: ddpContext.foo
  });

  setup({
      schema,
      context,
  });
  ```

## 1.2.0

- Remove support for Optics, because as of 2018-01-31 it's no longer operational

## 1.1.0

- Add `context` option to server setup

## 1.0.0

- Support Apollo Client 2.0 with subscriptions
